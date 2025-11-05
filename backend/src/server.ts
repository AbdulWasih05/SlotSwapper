import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes (to be implemented)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SlotSwapper API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      swaps: '/api/swappable-slots, /api/swap-request, /api/swap-requests, /api/swap-response'
    }
  });
});

// TODO: Import and use routes
// import authRoutes from './routes/auth.js';
// import eventRoutes from './routes/events.js';
// import swapRoutes from './routes/swaps.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/events', eventRoutes);
// app.use('/api', swapRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join user to their personal room for targeted notifications
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes (attach to app)
app.set('io', io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   SlotSwapper Backend Server          ║
║   Port: ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   Time: ${new Date().toISOString()}    ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, io };
