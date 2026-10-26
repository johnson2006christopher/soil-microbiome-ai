const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');
const { generateSimulatedReading } = require('../services/simulator');

const router = express.Router();

// GET /api/devices?farmId=
router.get('/', auth, async (req, res, next) => {
  try {
    const { farmId } = req.query;
    const where = { userId: req.user.userId, ...(farmId ? { farmId } : {}) };
    const devices = await prisma.sensorDevice.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(devices);
  } catch (err) { next(err); }
});

// POST /api/devices
router.post('/', auth, async (req, res, next) => {
  try {
    const { farmId, deviceName, deviceSerial, deviceType, firmwareVersion } = req.body;
    if (!farmId || !deviceName || !deviceSerial) {
      return res.status(400).json({ error: 'farmId, deviceName, and deviceSerial are required' });
    }

    const farm = await prisma.farm.findFirst({ where: { id: farmId, userId: req.user.userId } });
    if (!farm) return res.status(403).json({ error: 'Access denied' });

    const device = await prisma.sensorDevice.create({
      data: { userId: req.user.userId, farmId, deviceName, deviceSerial, deviceType, firmwareVersion },
    });
    res.status(201).json(device);
  } catch (err) { next(err); }
});

// PUT /api/devices/:id
router.put('/:id', auth, async (req, res, next) => {
  try {
    const existing = await prisma.sensorDevice.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Device not found' });

    // Whitelist allowed fields to prevent mass-assignment attacks
    const { deviceName, deviceType, firmwareVersion, batteryLevel } = req.body;
    const device = await prisma.sensorDevice.update({
      where: { id: req.params.id },
      data: { deviceName, deviceType, firmwareVersion, batteryLevel },
    });
    res.json(device);
  } catch (err) { next(err); }
});

// DELETE /api/devices/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const existing = await prisma.sensorDevice.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Device not found' });

    await prisma.sensorDevice.delete({ where: { id: req.params.id } });
    res.json({ message: 'Device deleted' });
  } catch (err) { next(err); }
});

// POST /api/devices/:deviceSerial/ingest — device-token auth
// Devices must send header: X-Device-Token: <DEVICE_INGEST_SECRET>
router.post('/:deviceSerial/ingest', async (req, res, next) => {
  try {
    const ingestSecret = process.env.DEVICE_INGEST_SECRET || 'device-ingest-secret-change-in-production';
    const provided = req.headers['x-device-token'];
    if (!provided || provided !== ingestSecret) {
      return res.status(401).json({ error: 'Missing or invalid device token' });
    }

    // Rate-limit: max 1 reading per second per device (simple in-memory)
    const { deviceSerial } = req.params;
    const now = Date.now();
    const lastIngest = req.app.locals._ingestTimestamps || {};
    if (lastIngest[deviceSerial] && now - lastIngest[deviceSerial] < 1000) {
      return res.status(429).json({ error: 'Too many requests. Max 1 reading per second.' });
    }
    lastIngest[deviceSerial] = now;
    req.app.locals._ingestTimestamps = lastIngest;

    const device = await prisma.sensorDevice.findUnique({ where: { deviceSerial } });
    if (!device) {
      return res.status(404).json({ error: `Device '${deviceSerial}' not registered` });
    }

    const payload = req.body;
    const reading = await prisma.soilReading.create({
      data: {
        farmId: device.farmId,
        deviceId: device.id,
        source: 'SENSOR',
        soilMoisture: parseFloat(payload.soilMoisture) || 0,
        soilTemperature: parseFloat(payload.soilTemperature) || 0,
        soilPh: parseFloat(payload.soilPh) || 0,
        electricalConductivity: parseFloat(payload.electricalConductivity) || 0,
        organicMatter: parseFloat(payload.organicMatter) || 0,
        nitrogenPpm: parseFloat(payload.nitrogenPpm) || 0,
        phosphorusPpm: parseFloat(payload.phosphorusPpm) || 0,
        potassiumPpm: parseFloat(payload.potassiumPpm) || 0,
        bulkDensity: payload.bulkDensity ? parseFloat(payload.bulkDensity) : null,
        calciumPpm: payload.calciumPpm ? parseFloat(payload.calciumPpm) : null,
        magnesiumPpm: payload.magnesiumPpm ? parseFloat(payload.magnesiumPpm) : null,
        sulfurPpm: payload.sulfurPpm ? parseFloat(payload.sulfurPpm) : null,
        microbialDiversityIndex: payload.microbialDiversityIndex ? parseFloat(payload.microbialDiversityIndex) : null,
        nitrogenFixingBacteriaRatio: payload.nitrogenFixingBacteriaRatio ? parseFloat(payload.nitrogenFixingBacteriaRatio) : null,
        mycorrhizalFungiPresence: Boolean(payload.mycorrhizalFungiPresence),
        pathogenicFungiRatio: payload.pathogenicFungiRatio ? parseFloat(payload.pathogenicFungiRatio) : null,
        bacterialCountCfu: payload.bacterialCountCfu ? parseFloat(payload.bacterialCountCfu) : null,
        rainfallMm: payload.rainfallMm ? parseFloat(payload.rainfallMm) : null,
        ambientTemperature: payload.ambientTemperature ? parseFloat(payload.ambientTemperature) : null,
        humidity: payload.humidity ? parseFloat(payload.humidity) : null,
        fertilizerKgPerHa: payload.fertilizerKgPerHa ? parseFloat(payload.fertilizerKgPerHa) : null,
        previousYieldTons: payload.previousYieldTons ? parseFloat(payload.previousYieldTons) : null,
        growingSeasonDays: payload.growingSeasonDays ? parseInt(payload.growingSeasonDays) : null,
      },
    });

    await prisma.sensorDevice.update({
      where: { id: device.id },
      data: { isOnline: true, lastReadingAt: new Date() },
    });

    // Emit socket.io event to the farm's room
    const io = req.app.get('io');
    if (io) {
      io.to(device.farmId).emit('sensor_reading', reading);
    }

    res.json({ success: true, readingId: reading.id });
  } catch (err) { next(err); }
});

// GET /api/devices/:id/simulate — generate fake reading for form pre-fill
router.get('/:id/simulate', auth, async (req, res, next) => {
  try {
    const device = await prisma.sensorDevice.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });

    const simulated = generateSimulatedReading();

    res.json({ deviceId: device.id, deviceSerial: device.deviceSerial, simulatedReading: simulated });
  } catch (err) { next(err); }
});

// POST /api/devices/:id/simulate-reading — store a SIMULATED reading and push it live
router.post('/:id/simulate-reading', auth, async (req, res, next) => {
  try {
    const device = await prisma.sensorDevice.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!device) return res.status(404).json({ error: 'Device not found' });

    const reading = await prisma.soilReading.create({
      data: { farmId: device.farmId, deviceId: device.id, source: 'SIMULATED', ...generateSimulatedReading() },
    });
    await prisma.sensorDevice.update({
      where: { id: device.id },
      data: { isOnline: true, lastReadingAt: new Date() },
    });

    const io = req.app.get('io');
    if (io) io.to(device.farmId).emit('sensor_reading', reading);

    res.status(201).json(reading);
  } catch (err) { next(err); }
});

module.exports = router;
