import type { Socket, Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Room, Player } from '@geo-pin-quest/shared';
import { generateRoomCode, generatePlayerId } from '@geo-pin-quest/shared';
import { 
  validateRoomCreation, 
  validateRoomJoin, 
  sanitizePlayerName, 
  sanitizeRoomCode,
  isValidSocketId,
  validateDifficulty,
  validateRounds
} from '../utils/validation';

// In-memory storage for active rooms and players
const activeRooms = new Map<string, Room>();
const activePlayers = new Map<string, Player>();
const socketToPlayer = new Map<string, string>(); // socketId -> playerId
const playerToSocket = new Map<string, string>(); // playerId -> socketId

export function setupRoomHandlers(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>
) {
  
  // Create a new room
  socket.on('create-room', ({ difficulty, roundLimit }) => {
    try {
      // Validate input
      if (difficulty < 1 || difficulty > 5) {
        socket.emit('room-full', { error: 'Invalid difficulty level. Must be between 1 and 5.' });
        return;
      }
      
      if (roundLimit < 1 || roundLimit > 10) {
        socket.emit('room-full', { error: 'Invalid round limit. Must be between 1 and 10.' });
        return;
      }

      // Check if player is already in a room
      const existingPlayerId = socketToPlayer.get(socket.id);
      if (existingPlayerId && activePlayers.has(existingPlayerId)) {
        socket.emit('room-full', { error: 'You are already in a room.' });
        return;
      }

      // Generate room and player IDs
      const roomId = generateRoomCode();
      const playerId = generatePlayerId();
      
      // Create room
      const room: Room = {
        id: roomId,
        hostId: playerId,
        difficulty,
        roundLimit,
        status: 'waiting',
        currentRound: 0,
        shareableLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/multiplayer/join/${roomId}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create host player
      const hostPlayer: Player = {
        id: playerId,
        name: `Player ${playerId.slice(0, 6)}`, // Temporary name
        isHost: true,
        isReady: true,
        connectionStatus: 'connected',
        scores: [],
        totalScore: 0
      };

      // Store in memory
      activeRooms.set(roomId, room);
      activePlayers.set(playerId, hostPlayer);
      socketToPlayer.set(socket.id, playerId);
      playerToSocket.set(playerId, socket.id);

      // Join socket room for real-time updates
      socket.join(roomId);

      console.log(`🏠 Room created: ${roomId} by player ${playerId}`);
      
      // Notify client
      socket.emit('room-created', { room, shareableLink: room.shareableLink });
      
    } catch (error) {
      console.error('❌ Error creating room:', error);
      socket.emit('room-full', { error: 'Failed to create room. Please try again.' });
    }
  });

  // Join an existing room
  socket.on('join-room', ({ roomCode, playerName }) => {
    try {
      // Validate input
      if (!roomCode || roomCode.length !== 8) {
        socket.emit('room-full', { error: 'Invalid room code.' });
        return;
      }

      if (!playerName || playerName.trim().length === 0 || playerName.length > 20) {
        socket.emit('room-full', { error: 'Player name must be between 1 and 20 characters.' });
        return;
      }

      // Check if room exists
      const room = activeRooms.get(roomCode.toUpperCase());
      if (!room) {
        socket.emit('room-full', { error: 'Room not found.' });
        return;
      }

      // Check if room is full
      if (room.opponentId) {
        socket.emit('room-full', { error: 'Room is full.' });
        return;
      }

      // Check if room is already in game
      if (room.status !== 'waiting') {
        socket.emit('room-full', { error: 'Game is already in progress.' });
        return;
      }

      // Check if player is already in a room
      const existingPlayerId = socketToPlayer.get(socket.id);
      if (existingPlayerId && activePlayers.has(existingPlayerId)) {
        socket.emit('room-full', { error: 'You are already in a room.' });
        return;
      }

      // Generate player ID
      const playerId = generatePlayerId();
      
      // Create opponent player
      const opponentPlayer: Player = {
        id: playerId,
        name: playerName.trim(),
        isHost: false,
        isReady: false,
        connectionStatus: 'connected',
        scores: [],
        totalScore: 0
      };

      // Update room
      room.opponentId = playerId;
      room.updatedAt = new Date();

      // Store player
      activePlayers.set(playerId, opponentPlayer);
      socketToPlayer.set(socket.id, playerId);
      playerToSocket.set(playerId, socket.id);

      // Join socket room
      socket.join(roomCode.toUpperCase());

      console.log(`👥 Player ${playerId} (${playerName}) joined room ${roomCode}`);

      // Get host player for notification
      const hostPlayer = activePlayers.get(room.hostId);
      
      // Notify the new player
      socket.emit('room-joined', { room, isHost: false });
      
      // Notify the host
      if (hostPlayer) {
        const hostSocketId = playerToSocket.get(room.hostId);
        if (hostSocketId) {
          io.to(hostSocketId).emit('player-joined', { opponent: opponentPlayer });
        }
      }
      
    } catch (error) {
      console.error('❌ Error joining room:', error);
      socket.emit('room-full', { error: 'Failed to join room. Please try again.' });
    }
  });

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    handlePlayerLeave(socket, roomId);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const playerId = socketToPlayer.get(socket.id);
    if (playerId) {
      const player = activePlayers.get(playerId);
      if (player) {
        // Find the room this player was in
        for (const [roomId, room] of activeRooms.entries()) {
          if (room.hostId === playerId || room.opponentId === playerId) {
            handlePlayerLeave(socket, roomId, true);
            break;
          }
        }
      }
    }
  });
}

function handlePlayerLeave(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>, 
  roomId: string, 
  isDisconnect: boolean = false
) {
  try {
    const playerId = socketToPlayer.get(socket.id);
    if (!playerId) return;

    const room = activeRooms.get(roomId);
    if (!room) return;

    const player = activePlayers.get(playerId);
    if (!player) return;

    console.log(`👋 Player ${playerId} ${isDisconnect ? 'disconnected from' : 'left'} room ${roomId}`);

    // If host leaves, close the room
    if (room.hostId === playerId) {
      // Notify opponent if exists
      if (room.opponentId) {
        const opponentSocketId = playerToSocket.get(room.opponentId);
        if (opponentSocketId) {
          socket.to(opponentSocketId).emit('player-left', { playerId: room.hostId });
        }
        // Clean up opponent
        activePlayers.delete(room.opponentId);
        const opponentSocketId2 = playerToSocket.get(room.opponentId);
        if (opponentSocketId2) {
          socketToPlayer.delete(opponentSocketId2);
        }
        playerToSocket.delete(room.opponentId);
      }
      
      // Clean up room
      activeRooms.delete(roomId);
    } 
    // If opponent leaves, update room
    else if (room.opponentId === playerId) {
      room.opponentId = undefined;
      room.status = 'waiting';
      room.updatedAt = new Date();
      
      // Notify host
      const hostSocketId = playerToSocket.get(room.hostId);
      if (hostSocketId) {
        socket.to(hostSocketId).emit('player-left', { playerId });
      }
    }

    // Clean up player
    activePlayers.delete(playerId);
    socketToPlayer.delete(socket.id);
    playerToSocket.delete(playerId);
    
    // Leave socket room
    socket.leave(roomId);
    
  } catch (error) {
    console.error('❌ Error handling player leave:', error);
  }
}

// Export for cleanup and monitoring
export { activeRooms, activePlayers, socketToPlayer, playerToSocket };
