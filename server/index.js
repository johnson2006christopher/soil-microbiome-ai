require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const rateLimit = require('express-rate-limit');

// ── Startup validation ────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable is not set. Server will not start.');
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('[SECURITY] JWT_SECRET is shorter than 32 characters. Use a long random string in production.');
}

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────
// In dev, accept any origin (e.g. Cloudflare Tunnel hostnames change every run).
const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true' || process.env.NODE_ENV !== 'production';
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map(s => s.trim());
const io = new Server(server, {
  cors: { origin: allowAllOrigins ? true : allowedOrigins, credentials: true },
});

io.on('connection', (socket) => {
  const { farmId, token } = socket.handshake.query;

  // Verify JWT before allowing farm room subscription
  if (farmId) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      socket.join(farmId);
      console.log(`Socket ${socket.id} joined farm room: ${farmId}`);
    } catch {
      console.warn(`Socket ${socket.id} rejected: invalid/missing token for farm ${farmId}`);
      socket.disconnect(true);
      return;
    }
  }

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (allowAllOrigins || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Behind Railway / Cloudflare proxies: use the client IP from X-Forwarded-For,
// otherwise every visitor shares one rate-limit bucket
app.set('trust proxy', 1);

// Rate limiting — global API throttle
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/soil-readings', require('./routes/soilReadings'));
app.use('/api/image', require('./routes/imageAnalysis'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));

// Root — health check required by Render
app.get('/', (req, res) => res.json({ status: 'ok', service: 'soil-api' }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Global Error Handler ──────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(`[ERROR] ${_req.method} ${_req.path}:`, err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large (max 10 MB)' });
  }
  if (err.message?.includes('not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'This record already exists.' });
  }
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Some values are invalid. Please check the form and try again.' });
  }
  const status = err.status || 500;
  // Never leak internals (stack, paths, DB errors) to the client on server errors
  const message = status < 500 ? err.message : 'Something went wrong on our side. Please try again.';
  res.status(status).json({ error: message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🌱 Soil Microbiome Server running on port ${PORT}`);
  console.log(`   ML Engine: ${process.env.ML_ENGINE_URL || 'http://localhost:8000'}`);
  console.log(`   Client:    ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});

module.exports = { app, io };
