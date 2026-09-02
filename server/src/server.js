const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);

const getAllowedOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
  ];
  if (process.env.CLIENT_URL) {
    defaults.push(...process.env.CLIENT_URL.split(',').map((u) => u.trim()));
  }
  if (process.env.FRONTEND_URL) {
    defaults.push(...process.env.FRONTEND_URL.split(',').map((u) => u.trim()));
  }
  return defaults;
};

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const allowed = getAllowedOrigins();
  if (
    allowed.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    process.env.NODE_ENV === 'development'
  ) {
    return callback(null, true);
  }
  return callback(null, true);
};

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

const jwt = require('jsonwebtoken');

// Socket.io JWT Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerlink_super_secret_jwt_key_2026');
      socket.userId = decoded.id;
    } catch (err) {
      console.warn('[Socket Auth]:', err.message);
    }
  }
  next();
});

app.set('io', io);

// Socket.io connection handlers
io.on('connection', (socket) => {
  const effectiveUserId = socket.userId || socket.handshake.query?.userId;
  if (effectiveUserId) {
    const uid = effectiveUserId.toString();
    socket.join(`user:${uid}`);
    socket.join(uid);
    console.log(`[Socket] Authenticated user joined rooms: user:${uid}, ${uid}`);
  }

  // Join personal room by user ID for instant 1-to-1 notifications & messages
  socket.on('join', (userId) => {
    if (userId) {
      const uid = userId.toString();
      socket.join(`user:${uid}`);
      socket.join(uid);
      console.log(`[Socket] User explicitly joined rooms: user:${uid}, ${uid}`);
    }
  });

  socket.on('typing', ({ senderId, recipientId }) => {
    if (recipientId) {
      io.to(`user:${recipientId.toString()}`).emit('user_typing', { senderId });
      io.to(recipientId.toString()).emit('user_typing', { senderId });
    }
  });

  socket.on('stop_typing', ({ senderId, recipientId }) => {
    if (recipientId) {
      io.to(`user:${recipientId.toString()}`).emit('user_stop_typing', { senderId });
      io.to(recipientId.toString()).emit('user_stop_typing', { senderId });
    }
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// Middleware
app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/users', require('./routes/searchRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'CareerLink API',
    time: new Date().toISOString(),
  });
});

// Serve static React production build (Single-Service Render Deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientDistPath)) {
  console.log(`[CareerLink Server] Serving static client build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    // Never hijack API or socket.io routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return res.status(404).json({ success: false, message: `API endpoint ${req.method} ${req.path} not found` });
    }
    if (fs.existsSync(indexHtmlPath)) {
      return res.sendFile(indexHtmlPath);
    }
    next();
  });
} else {
  console.log('[CareerLink Server] client/dist not detected - running in standalone API mode');
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  const { checkAndSeed } = require('./seeds/autoSeed');
  await checkAndSeed();
  server.listen(PORT, () => {
    console.log(`[CareerLink Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, server };
