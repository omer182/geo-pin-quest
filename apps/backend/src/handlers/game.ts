import { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Room, Player, GameState, Guess, City } from '@geo-pin-quest/shared';
import { GameManager } from '../models/Game';
import { getRandomCityByDifficulty } from '../utils/cities';
import { validateGuessSubmission, validatePosition, isValidSocketId } from '../utils/validation';

// In-memory storage for active games and timers
const activeGames = new Map<string, GameManager>();
const roundTimers = new Map<string, NodeJS.Timeout>();

// Game configuration
const ROUND_TIME_LIMIT = 30000; // 30 seconds per round
const RESULTS_DISPLAY_TIME = 5000; // 5 seconds to show results
const GAME_CLEANUP_DELAY = 300000; // 5 minutes cleanup delay

interface GameHandlers {
  startGame: (socket: Socket<ClientToServerEvents, ServerToClientEvents>, roomId: string) => void;
  submitGuess: (socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: { lat: number; lng: number; timestamp: number }) => void;
  playerReady: (socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: { playerId: string }) => void;
  playAgainVote: (socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: { vote: boolean }) => void;
}

export function createGameHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  activeRooms: Map<string, Room>,
  activePlayers: Map<string, Player>,
  socketToPlayer: Map<string, string>
): GameHandlers {

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Calculate score based on distance (max 5000 points)
  function calculateScore(distance: number): number {
    const maxDistance = 20000; // 20,000 km maximum distance for scoring
    const maxScore = 5000;
    
    if (distance >= maxDistance) return 0;
    return Math.round(maxScore * (1 - distance / maxDistance));
  }

  // Get player's room ID from socket
  function getPlayerRoomId(socketId: string): string | null {
    const playerId = socketToPlayer.get(socketId);
    if (!playerId) return null;

    // Find room containing this player
    for (const [roomId, room] of activeRooms) {
      if (room.hostId === playerId || room.opponentId === playerId) {
        return roomId;
      }
    }
    return null;
  }

  // Start a new game
  function startGame(socket: Socket<ClientToServerEvents, ServerToClientEvents>, roomId: string): void {
    const room = activeRooms.get(roomId);
    if (!room) {
      socket.emit('room-full', { error: 'Room not found' });
      return;
    }

    // Check if we have exactly 2 players
    if (!room.opponentId) {
      socket.emit('room-full', { error: 'Need exactly 2 players to start the game' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('room-full', { error: 'Game already in progress' });
      return;
    }

    // Create new game manager
    const gameManager = new GameManager(roomId, room.difficulty, room.roundLimit);
    activeGames.set(roomId, gameManager);

    // Start the first round
    const firstCity = gameManager.startGame();

    // Update room status
    room.status = 'playing';
    room.currentRound = 1;
    room.updatedAt = new Date();
    activeRooms.set(roomId, room);

    // Get game state
    const gameState = gameManager.getGameState();

    console.log(`🎮 Game started in room ${roomId}`);

    // Notify all players in the room
    io.to(roomId).emit('game-started', { gameState });
    io.to(roomId).emit('round-started', { 
      city: firstCity, 
      roundNumber: gameState.currentRound, 
      timeLimit: gameState.roundTimeLimit 
    });

    // Set round timer
    const timer = setTimeout(() => {
      finishRound(roomId);
    }, ROUND_TIME_LIMIT);
    
    roundTimers.set(roomId, timer);
  }

  // Submit a guess for the current round
  function submitGuess(socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: { lat: number; lng: number; timestamp: number }): void {
    const roomId = getPlayerRoomId(socket.id);
    const playerId = socketToPlayer.get(socket.id);
    
    if (!roomId || !playerId) {
      socket.emit('room-full', { error: 'Invalid room or player' });
      return;
    }

    const room = activeRooms.get(roomId);
    const gameManager = activeGames.get(roomId);
    
    if (!room || !gameManager) {
      socket.emit('room-full', { error: 'Game not found' });
      return;
    }

    if (gameManager.getPhase() !== 'playing') {
      socket.emit('room-full', { error: 'Game is not in playing phase' });
      return;
    }

    // Validate guess coordinates
    if (Math.abs(data.lat) > 90 || Math.abs(data.lng) > 180) {
      socket.emit('room-full', { error: 'Invalid coordinates' });
      return;
    }

    const guess: Guess = {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date(data.timestamp),
      distance: 0, // Will be calculated during round completion
      score: 0     // Will be calculated during round completion
    };

    const isHost = playerId === room.hostId;
    const success = gameManager.submitGuess(playerId, isHost, guess);

    if (!success) {
      socket.emit('room-full', { error: 'Already submitted guess for this round' });
      return;
    }

    console.log(`📍 Player ${playerId} submitted guess in room ${roomId}`);

    // Notify player that guess was submitted
    socket.emit('guess-received', { playerId, hasGuessed: true });

    // Notify other players that this player has submitted (without revealing the guess)
    socket.to(roomId).emit('guess-received', { playerId, hasGuessed: true });

    // Check if both players have submitted their guesses
    if (gameManager.bothPlayersSubmitted()) {
      // Clear the round timer
      const timer = roundTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        roundTimers.delete(roomId);
      }
      
      // Finish round immediately
      finishRound(roomId);
    }
  }

  // Finish the current round and calculate results
  function finishRound(roomId: string): void {
    const gameManager = activeGames.get(roomId);
    const room = activeRooms.get(roomId);
    
    if (!gameManager || !room) return;

    try {
      // Calculate round results
      const roundResult = gameManager.finishRound();
      
      console.log(`📊 Round ${roundResult.roundNumber} finished in room ${roomId}`);

      // Send round results to all players
      io.to(roomId).emit('round-ended', { 
        result: roundResult, 
        gameState: gameManager.getGameState() 
      });

      // Auto-advance after showing results
      setTimeout(() => {
        if (gameManager.getCurrentRound() >= gameManager.getTotalRounds()) {
          endGame(roomId);
        } else {
          startNextRound(roomId);
        }
      }, RESULTS_DISPLAY_TIME);

    } catch (error) {
      console.error('❌ Error finishing round:', error);
      io.to(roomId).emit('room-full', { error: 'Error calculating round results' });
    }
  }

  // Start the next round
  function startNextRound(roomId: string): void {
    const gameManager = activeGames.get(roomId);
    const room = activeRooms.get(roomId);
    
    if (!gameManager || !room) return;

    const nextCity = gameManager.advanceGame();
    
    if (!nextCity) {
      // Game should end
      endGame(roomId);
      return;
    }

    // Update room
    room.currentRound = gameManager.getCurrentRound();
    room.updatedAt = new Date();
    activeRooms.set(roomId, room);

    console.log(`🔄 Round ${gameManager.getCurrentRound()} started in room ${roomId}`);

    // Notify all players
    io.to(roomId).emit('round-started', {
      city: nextCity,
      roundNumber: gameManager.getCurrentRound(),
      timeLimit: gameManager.getGameState().roundTimeLimit
    });

    // Set round timer
    const timer = setTimeout(() => {
      finishRound(roomId);
    }, ROUND_TIME_LIMIT);
    
    roundTimers.set(roomId, timer);
  }

  // End the game and determine winner
  function endGame(roomId: string): void {
    const gameManager = activeGames.get(roomId);
    const room = activeRooms.get(roomId);
    
    if (!gameManager || !room) return;

    // End the game
    gameManager.endGame();
    const gameState = gameManager.getGameState();

    // Update room status
    room.status = 'finished';
    room.updatedAt = new Date();
    activeRooms.set(roomId, room);

    // Calculate final scores
    const hostTotalScore = gameState.roundResults.reduce((sum, result) => sum + result.hostScore, 0);
    const opponentTotalScore = gameState.roundResults.reduce((sum, result) => sum + result.opponentScore, 0);

    // Get winner player object
    let winner: Player | null = null;
    if (gameState.winner === 'host') {
      winner = activePlayers.get(room.hostId) || null;
    } else if (gameState.winner === 'opponent' && room.opponentId) {
      winner = activePlayers.get(room.opponentId) || null;
    }

    console.log(`🏆 Game ended in room ${roomId}, winner: ${gameState.winner || 'tie'}`);

    // Send game over event
    io.to(roomId).emit('game-ended', {
      winner,
      finalScores: {
        host: hostTotalScore,
        opponent: opponentTotalScore
      }
    });

    // Clear any remaining timers
    const timer = roundTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roundTimers.delete(roomId);
    }

    // Schedule cleanup
    setTimeout(() => {
      activeGames.delete(roomId);
      console.log(`🧹 Cleaned up game data for room ${roomId}`);
    }, GAME_CLEANUP_DELAY);
  }

  // Handle player ready status
  function playerReady(socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: { playerId: string }): void {
    const playerId = socketToPlayer.get(socket.id);
    const player = activePlayers.get(playerId || '');
    
    if (!player || playerId !== data.playerId) {
      socket.emit('room-full', { error: 'Invalid player' });
      return;
    }

    player.isReady = true;
    activePlayers.set(playerId!, player);

    console.log(`✅ Player ${playerId} is ready`);

    // Find the room and notify other players
    for (const [roomId, room] of activeRooms) {
      if (room.hostId === playerId || room.opponentId === playerId) {
        io.to(roomId).emit('player-joined', { opponent: player });
        break;
      }
    }
  }

  // Handle play again voting
  function playAgainVote(socket: Socket<ClientToServerEvents, ServerToClientEvents>, data: { vote: boolean }): void {
    const roomId = getPlayerRoomId(socket.id);
    const playerId = socketToPlayer.get(socket.id);
    
    if (!roomId || !playerId) {
      socket.emit('room-full', { error: 'Invalid room or player' });
      return;
    }

    const room = activeRooms.get(roomId);
    const gameManager = activeGames.get(roomId);
    const player = activePlayers.get(playerId);
    
    if (!room || !gameManager || !player) {
      socket.emit('room-full', { error: 'Game not found' });
      return;
    }

    if (!gameManager.isComplete()) {
      socket.emit('room-full', { error: 'Game is not finished' });
      return;
    }

    const isHost = playerId === room.hostId;
    gameManager.votePlayAgain(isHost, data.vote);

    console.log(`🗳️ Player ${playerId} voted ${data.vote ? 'YES' : 'NO'} for play again`);

    // Notify all players about the vote
    io.to(roomId).emit('play-again-vote', {
      playerId,
      vote: data.vote
    });

    // Check if voting is complete
    if (gameManager.playAgainVotingComplete()) {
      if (gameManager.bothVotedPlayAgain()) {
        // Reset game for new round
        gameManager.resetGame();
        
        // Reset room status
        room.status = 'waiting';
        room.currentRound = 0;
        room.updatedAt = new Date();
        activeRooms.set(roomId, room);

        console.log(`🔄 New game starting in room ${roomId}`);
        
        io.to(roomId).emit('new-game-starting', { 
          gameState: gameManager.getGameState() 
        });
        
        // Auto-start the new game after a short delay
        setTimeout(() => {
          startGame(socket, roomId);
        }, 2000);
      } else {
        io.to(roomId).emit('room-full', { 
          error: 'Not all players want to play again' 
        });
      }
    }
  }

  return {
    startGame,
    submitGuess,
    playerReady,
    playAgainVote
  };
}

// Setup function for server integration
export function setupGameHandlers(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  activeRooms: Map<string, Room>,
  activePlayers: Map<string, Player>,
  socketToPlayer: Map<string, string>
): void {
  const gameHandlers = createGameHandlers(io, activeRooms, activePlayers, socketToPlayer);

  // Set up Socket.io event listeners for game events
  socket.on('start-game', (data: { roomId: string }) => {
    gameHandlers.startGame(socket, data.roomId);
  });

  socket.on('player-guess', (data: { lat: number; lng: number; timestamp: number }) => {
    gameHandlers.submitGuess(socket, data);
  });

  socket.on('player-ready', (data: { playerId: string }) => {
    gameHandlers.playerReady(socket, data);
  });

  socket.on('play-again-vote', (data: { vote: boolean }) => {
    gameHandlers.playAgainVote(socket, data);
  });
}

// Export the active storage for room handlers to access
export { activeGames, roundTimers };
