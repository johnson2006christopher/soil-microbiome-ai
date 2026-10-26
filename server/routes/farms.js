const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/farms
router.get('/', async (req, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { userId: req.user.userId },
      include: {
        _count: { select: { soilReadings: true, imageAnalyses: true } },
        yieldPredictions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { predictedYieldTons: true, yieldCategory: true, createdAt: true },
        },
        devices: { select: { id: true, isOnline: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(farms);
  } catch (err) { next(err); }
});

// POST /api/farms
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = parseFarmInput(req.body);
    if (error) return res.status(400).json({ error });

    const farm = await prisma.farm.create({ data: { userId: req.user.userId, ...data } });
    res.status(201).json(farm);
  } catch (err) { next(err); }
});

const CROP_TYPES = ['TOMATO', 'CORN', 'MIXED'];

// Validate and coerce farm form input (numbers arrive as strings from forms)
function parseFarmInput(body) {
  const { name, location, region, cropType } = body;
  const toNumber = (v) => (v === undefined || v === null || v === '' ? null : parseFloat(v));
  const data = {
    name: typeof name === 'string' ? name.trim() : name,
    location: typeof location === 'string' ? location.trim() : location,
    region: region || null,
    sizeHa: toNumber(body.sizeHa),
    gpsLat: toNumber(body.gpsLat),
    gpsLng: toNumber(body.gpsLng),
    cropType: cropType || 'TOMATO',
  };
  if (!data.name || !data.location) return { error: 'Farm name and location are required' };
  if (!CROP_TYPES.includes(data.cropType)) return { error: 'Crop type must be TOMATO, CORN or MIXED' };
  if (data.sizeHa !== null && (isNaN(data.sizeHa) || data.sizeHa <= 0)) return { error: 'Farm size must be a positive number' };
  if (data.gpsLat !== null && (isNaN(data.gpsLat) || Math.abs(data.gpsLat) > 90)) return { error: 'Latitude must be between -90 and 90' };
  if (data.gpsLng !== null && (isNaN(data.gpsLng) || Math.abs(data.gpsLng) > 180)) return { error: 'Longitude must be between -180 and 180' };
  return { data };
}

// GET /api/farms/:id
router.get('/:id', async (req, res, next) => {
  try {
    const farm = await prisma.farm.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: {
        yieldPredictions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { recommendations: true },
        },
        imageAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { recommendations: true },
        },
        devices: true,
        _count: { select: { soilReadings: true } },
      },
    });
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    res.json(farm);
  } catch (err) { next(err); }
});

// PUT /api/farms/:id
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.farm.findFirst({ where: { id: req.params.id, userId: req.user.userId } });
    if (!existing) return res.status(404).json({ error: 'Farm not found' });

    const { data, error } = parseFarmInput(req.body);
    if (error) return res.status(400).json({ error });

    const farm = await prisma.farm.update({ where: { id: req.params.id }, data });
    res.json(farm);
  } catch (err) { next(err); }
});

// DELETE /api/farms/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.farm.findFirst({ where: { id: req.params.id, userId: req.user.userId } });
    if (!existing) return res.status(404).json({ error: 'Farm not found' });

    await prisma.farm.delete({ where: { id: req.params.id } });
    res.json({ message: 'Farm deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
