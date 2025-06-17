import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { ClientToServerEvents, ServerToClientEvents } from '@geo-pin-quest/shared';

// Import handlers
import { setupRoomHandlers, activeRooms, activePlayers, socketToPlayer } from './handlers/room';
import { setupGameHandlers } from './handlers/game';

// Environment configuration
const PORT = process.env.MULTIPLAYER_SERVER_PORT || 3001;
const DATABASE_PATH = process.env.DATABASE_PATH || './data/multiplayer.db';
const MAX_ROOMS = parseInt(process.env.MAX_ROOMS || '1000');
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// Rate limiting configuration
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_REQUESTS || '50'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000,
});

// Create Express app
const app = express();
const server = createServer(app);

// Configure CORS for Socket.io
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT || '5000'),
  pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL || '10000'),
});

// Apply middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    activeRooms: io.sockets.adapter.rooms.size
  });
});

// Socket.io connection handling
io.on('connection', async (socket) => {
  const clientIP = socket.handshake.address;
  
  try {
    // Apply rate limiting
    await rateLimiter.consume(clientIP);
    
    console.log(`🎮 Player connected: ${socket.id} from ${clientIP}`);
    
    // Set up event handlers
    setupRoomHandlers(socket, io);
    setupGameHandlers(socket, io, activeRooms, activePlayers, socketToPlayer);
    
    socket.on('disconnect', (reason) => {
      console.log(`🚪 Player disconnected: ${socket.id}, reason: ${reason}`);
    });
    
  } catch (rejRes) {
    console.log(`⚠️ Rate limit exceeded for ${clientIP}`);
    socket.emit('room-full', { error: 'Rate limit exceeded. Please try again later.' });
    socket.disconnect();
  }
});

// Memory cleanup for completed games
setInterval(() => {
  const cleanupInterval = parseInt(process.env.MEMORY_CLEANUP_INTERVAL || '300000');
  console.log('🧹 Running memory cleanup...');
  // TODO: Implement cleanup logic in game handlers
}, parseInt(process.env.MEMORY_CLEANUP_INTERVAL || '300000'));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Geo Pin Quest Multiplayer Server started`);
  console.log(`📡 Socket.io server listening on port ${PORT}`);
  console.log(`🗃️ Database path: ${DATABASE_PATH}`);
  console.log(`🔒 CORS origin: ${CORS_ORIGIN}`);
  console.log(`🏠 Max rooms: ${MAX_ROOMS}`);
});

export { io };
