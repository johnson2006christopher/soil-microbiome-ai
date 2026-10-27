const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');
const { generateSimulatedReading } = require('../services/simulator');

const router = express.Router();

function signToken(userId, role, tokenVersion) {
  return jwt.sign(
    { userId, role: role || 'user', tv: tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, farmLocation, farmSizeHa } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        farmLocation: farmLocation || null,
        farmSizeHa: farmSizeHa ? parseFloat(farmSizeHa) : null,
        farms: {
          create: {
            name: `${name}'s Farm`,
            location: farmLocation || 'Unknown',
            sizeHa: farmSizeHa ? parseFloat(farmSizeHa) : null,
            cropType: 'TOMATO',
          },
        },
      },
      select: { id: true, name: true, email: true, role: true, tokenVersion: true, farmLocation: true, farmSizeHa: true, createdAt: true },
    });

    const token = signToken(user.id, user.role, user.tokenVersion);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user.id, user.role, user.tokenVersion);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/demo — private guest account so public visitors don't share data.
// Comes with one farm, a simulated device and simulated readings (labelled SIMULATED).
// Generous enough for a venue where many visitors share one Wi-Fi address
const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many demo accounts from this network. Please try again later.' },
});

router.post('/demo', demoLimiter, async (req, res, next) => {
  try {
    const suffix = crypto.randomBytes(4).toString('hex');
    const password = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const user = await prisma.user.create({
      data: {
        name: 'Guest Farmer',
        email: `guest-${suffix}@guest.soilai.local`,
        password,
        farmLocation: 'Arusha, Tanzania',
        farms: {
          create: { name: 'Demo Tomato Farm', location: 'Arusha, Tanzania', region: 'Arusha', sizeHa: 2, cropType: 'TOMATO' },
        },
      },
      include: { farms: true },
    });

    const farm = user.farms[0];
    const device = await prisma.sensorDevice.create({
      data: {
        userId: user.id, farmId: farm.id, deviceName: 'Simulated Field Sensor',
        deviceSerial: `SIM-${suffix.toUpperCase()}`, deviceType: 'SIMULATED',
        isOnline: true, firmwareVersion: '1.0.0', lastReadingAt: new Date(),
      },
    });
    // Twelve weekly readings so trends and predictions work immediately
    await prisma.soilReading.createMany({
      data: Array.from({ length: 12 }, (_, i) => ({
        farmId: farm.id, deviceId: device.id, source: 'SIMULATED',
        readingAt: new Date(Date.now() - (11 - i) * WEEK_MS),
        ...generateSimulatedReading(),
      })),
    });

    const token = signToken(user.id, user.role, user.tokenVersion);
    const { password: _, farms: __, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', auth, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { tokenVersion: { increment: 1 } },
    });
    res.json({ message: 'Logged out. All sessions invalidated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
