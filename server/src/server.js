const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
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

app.set('io', io);

// Socket.io connection handlers
io.on('connection', (socket) => {
  // Join personal room by user ID for instant 1-to-1 notifications & messages
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  socket.on('typing', ({ senderId, recipientId }) => {
    io.to(recipientId).emit('user_typing', { senderId });
  });

  socket.on('stop_typing', ({ senderId, recipientId }) => {
    io.to(recipientId).emit('user_stop_typing', { senderId });
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
