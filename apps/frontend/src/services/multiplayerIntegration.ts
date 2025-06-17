import { useEffect } from 'react';
import { useMultiplayerStore, multiplayerSelectors } from '../stores/multiplayerStore';
import { webSocketService, ConnectionStatus } from '../services/websocket';
import type { Room, Player, GameState, City, RoundResult } from '@geo-pin-quest/shared';
import { dev } from '../config/environment';

/**
 * WebSocket integration service that syncs WebSocket events with the Zustand store
 */
export class WebSocketIntegration {
  private isSetup = false;

  /**
   * Set up WebSocket event listeners and sync with store
   */
  setup() {
    if (this.isSetup) {
      dev.warn('WebSocket integration already set up');
      return;
    }

    const store = useMultiplayerStore.getState();

    // Connection events
    webSocketService.on('connection-status-changed', (status: ConnectionStatus) => {
      store.actions.setConnectionStatus(status);
      
      // Show connection status notification for important changes
      if (status === ConnectionStatus.CONNECTED) {
        store.actions.addNotification({
          type: 'success',
          message: 'Connected to game server',
          autoHide: true,
        });
      } else if (status === ConnectionStatus.RECONNECTING) {
        store.actions.addNotification({
          type: 'warning',
          message: 'Reconnecting to game server...',
          autoHide: false,
        });
      } else if (status === ConnectionStatus.ERROR) {
        store.actions.addNotification({
          type: 'error',
          message: 'Connection to game server failed',
          autoHide: false,
        });
      }
    });

    webSocketService.on('connection-error', (error: string) => {
      store.actions.setConnectionError(error);
      store.actions.addNotification({
        type: 'error',
        message: `Connection error: ${error}`,
        autoHide: false,
      });
    });

    // Room events
    webSocketService.on('room-created', ({ room, shareableLink }) => {
      dev.log('Room created event received:', { room, shareableLink });
      
      store.actions.setRoom(room);
      store.actions.setShareableLink(shareableLink);
      store.actions.setRoomLoading('creating', false);
      store.actions.setRoomError('create', null);
      
      // Set current player as host
      store.actions.setCurrentPlayer({
        id: room.hostId,
        name: `Host ${room.hostId.slice(0, 6)}`, // Temporary name
        isHost: true,
      });
      
      // Navigate to room lobby
      store.actions.setActiveView('room-lobby');
      store.actions.showRoomCode(true);
      
      store.actions.addNotification({
        type: 'success',
        message: `Room ${room.id} created successfully!`,
        autoHide: true,
      });
    });

    webSocketService.on('room-joined', ({ room, isHost }) => {
      dev.log('Room joined event received:', { room, isHost });
      
      store.actions.setRoom(room);
      store.actions.setRoomLoading('joining', false);
      store.actions.setRoomError('join', null);
      
      // Set current player
      const playerId = isHost ? room.hostId : room.opponentId!;
      store.actions.setCurrentPlayer({
        id: playerId,
        name: isHost ? 'Host' : 'Opponent',
        isHost,
      });
      
      // Navigate to room lobby
      store.actions.setActiveView('room-lobby');
      
      store.actions.addNotification({
        type: 'success',
        message: `Joined room ${room.id}`,
        autoHide: true,
      });
    });

    webSocketService.on('player-joined', ({ opponent }) => {
      dev.log('Player joined event received:', opponent);
      
      store.actions.setOpponent(opponent);
      
      store.actions.addNotification({
        type: 'info',
        message: `${opponent.name} joined the room`,
        autoHide: true,
      });
    });

    webSocketService.on('player-left', ({ playerId }) => {
      dev.log('Player left event received:', playerId);
      
      const currentState = store.getState();
      
      // If opponent left, clear opponent
      if (currentState.opponent?.id === playerId) {
        store.actions.setOpponent(null);
        store.actions.addNotification({
          type: 'warning',
          message: 'Your opponent left the room',
          autoHide: true,
        });
      }
      
      // If in game, show disconnection message
      if (currentState.game && currentState.game.phase !== 'lobby') {
        store.actions.addNotification({
          type: 'error',
          message: 'Game interrupted - player disconnected',
          autoHide: false,
        });
      }
    });

    webSocketService.on('room-full', ({ error }) => {
      dev.log('Room full event received:', error);
      
      store.actions.setRoomLoading('joining', false);
      store.actions.setRoomError('join', error);
      
      store.actions.addNotification({
        type: 'error',
        message: error,
        autoHide: true,
      });
    });

    // Game events
    webSocketService.on('game-started', ({ gameState }) => {
      dev.log('Game started event received:', gameState);
      
      store.actions.setGameState(gameState);
      store.actions.setActiveView('game');
      
      store.actions.addNotification({
        type: 'success',
        message: 'Game started! Get ready for the first round.',
        autoHide: true,
      });
    });

    webSocketService.on('round-started', ({ city, roundNumber, timeLimit }) => {
      dev.log('Round started event received:', { city, roundNumber, timeLimit });
      
      const currentState = store.getState();
      if (currentState.game) {
        store.actions.setCurrentCity(city);
        store.actions.setTimeRemaining(timeLimit);
        store.actions.setTimerActive(true);
        store.actions.setGuessSubmitted(false);
        store.actions.setOpponentGuessed(false);
        store.actions.updateGamePhase('playing');
        
        store.actions.addNotification({
          type: 'info',
          message: `Round ${roundNumber} started! Find ${city.name}, ${city.country}`,
          autoHide: true,
        });
      }
    });

    webSocketService.on('guess-received', ({ playerId, hasGuessed }) => {
      dev.log('Guess received event:', { playerId, hasGuessed });
      
      const currentState = store.getState();
      
      // If it's the opponent's guess
      if (currentState.opponent?.id === playerId) {
        store.actions.setOpponentGuessed(hasGuessed);
        
        if (hasGuessed) {
          store.actions.addNotification({
            type: 'info',
            message: 'Your opponent has made their guess!',
            autoHide: true,
          });
        }
      }
    });

    webSocketService.on('round-ended', ({ result, gameState }) => {
      dev.log('Round ended event received:', { result, gameState });
      
      store.actions.addRoundResult(result);
      store.actions.setGameState(gameState);
      store.actions.updateGamePhase('round-results');
      store.actions.setTimerActive(false);
      
      // Determine winner of the round
      const isHostWinner = result.hostScore > result.opponentScore;
      const isTie = result.hostScore === result.opponentScore;
      const currentState = store.getState();
      const isCurrentPlayerHost = currentState.currentPlayer?.isHost;
      
      let message = '';
      if (isTie) {
        message = "It's a tie this round!";
      } else if ((isHostWinner && isCurrentPlayerHost) || (!isHostWinner && !isCurrentPlayerHost)) {
        message = 'You won this round! 🎉';
      } else {
        message = 'Your opponent won this round';
      }
      
      store.actions.addNotification({
        type: isTie ? 'info' : ((isHostWinner && isCurrentPlayerHost) || (!isHostWinner && !isCurrentPlayerHost)) ? 'success' : 'warning',
        message,
        autoHide: true,
      });
    });

    webSocketService.on('game-ended', ({ winner, finalScores }) => {
      dev.log('Game ended event received:', { winner, finalScores });
      
      store.actions.updateGamePhase('game-over');
      store.actions.setWinner(winner?.id || null);
      store.actions.setTimerActive(false);
      store.actions.setActiveView('results');
      
      const currentState = store.getState();
      const isCurrentPlayerWinner = winner?.id === currentState.currentPlayer?.id;
      
      let message = '';
      if (!winner) {
        message = "Game ended in a tie!";
      } else if (isCurrentPlayerWinner) {
        message = 'Congratulations! You won the game! 🎉';
      } else {
        message = 'Game over. Better luck next time!';
      }
      
      store.actions.addNotification({
        type: !winner ? 'info' : isCurrentPlayerWinner ? 'success' : 'warning',
        message,
        autoHide: false,
      });
    });

    webSocketService.on('opponent-disconnected', ({ message }) => {
      dev.log('Opponent disconnected event received:', message);
      
      store.actions.addNotification({
        type: 'warning',
        message,
        autoHide: false,
      });
    });

    webSocketService.on('opponent-reconnected', ({ message }) => {
      dev.log('Opponent reconnected event received:', message);
      
      store.actions.addNotification({
        type: 'success',
        message,
        autoHide: true,
      });
    });

    webSocketService.on('play-again-vote', ({ playerId, vote }) => {
      dev.log('Play again vote event received:', { playerId, vote });
      
      const currentState = store.getState();
      const voterName = currentState.currentPlayer?.id === playerId ? 'You' : 'Your opponent';
      
      store.actions.addNotification({
        type: 'info',
        message: `${voterName} ${vote ? 'voted to play again' : 'declined to play again'}`,
        autoHide: true,
      });
    });

    webSocketService.on('new-game-starting', ({ gameState }) => {
      dev.log('New game starting event received:', gameState);
      
      store.actions.setGameState(gameState);
      store.actions.setActiveView('game');
      store.actions.clearNotifications();
      
      store.actions.addNotification({
        type: 'success',
        message: 'New game starting!',
        autoHide: true,
      });
    });

    this.isSetup = true;
    dev.log('✅ WebSocket integration set up successfully');
  }

  /**
   * Clean up WebSocket event listeners
   */
  cleanup() {
    if (!this.isSetup) return;

    webSocketService.removeAllListeners();
    this.isSetup = false;
    dev.log('🧹 WebSocket integration cleaned up');
  }

  /**
   * Check if integration is set up
   */
  isInitialized() {
    return this.isSetup;
  }
}

// Create singleton instance
export const webSocketIntegration = new WebSocketIntegration();

/**
 * React hook for initializing WebSocket integration
 */
export function useWebSocketIntegration() {
  useEffect(() => {
    // Set up integration
    webSocketIntegration.setup();

    // Cleanup on unmount
    return () => {
      webSocketIntegration.cleanup();
    };
  }, []);

  // Return current integration status
  return {
    isInitialized: webSocketIntegration.isInitialized(),
  };
}

/**
 * Multiplayer actions that combine WebSocket service calls with store updates
 */
export const multiplayerActions = {
  /**
   * Create a new room
   */
  async createRoom(difficulty: number, roundLimit: number) {
    const store = useMultiplayerStore.getState();
    
    if (!multiplayerSelectors.isConnected(store)) {
      throw new Error('Not connected to server');
    }
    
    store.actions.setRoomLoading('creating', true);
    store.actions.setRoomError('create', null);
    
    try {
      webSocketService.createRoom(difficulty, roundLimit);
      dev.log('Room creation request sent');
    } catch (error) {
      store.actions.setRoomLoading('creating', false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      store.actions.setRoomError('create', errorMessage);
      throw error;
    }
  },

  /**
   * Join an existing room
   */
  async joinRoom(roomCode: string, playerName: string) {
    const store = useMultiplayerStore.getState();
    
    if (!multiplayerSelectors.isConnected(store)) {
      throw new Error('Not connected to server');
    }
    
    store.actions.setRoomLoading('joining', true);
    store.actions.setRoomError('join', null);
    
    try {
      webSocketService.joinRoom(roomCode, playerName);
      dev.log('Room join request sent');
    } catch (error) {
      store.actions.setRoomLoading('joining', false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
      store.actions.setRoomError('join', errorMessage);
      throw error;
    }
  },

  /**
   * Leave current room
   */
  async leaveRoom() {
    const store = useMultiplayerStore.getState();
    
    if (!store.room.current) {
      dev.warn('No room to leave');
      return;
    }
    
    try {
      webSocketService.leaveRoom(store.room.current.id);
      
      // Clear room and game state
      store.actions.clearRoom();
      store.actions.clearGame();
      store.actions.clearPlayers();
      store.actions.setActiveView('lobby');
      
      dev.log('Left room successfully');
    } catch (error) {
      dev.error('Failed to leave room:', error);
      throw error;
    }
  },

  /**
   * Start the game (host only)
   */
  async startGame() {
    const store = useMultiplayerStore.getState();
    
    if (!multiplayerSelectors.canStartGame(store)) {
      throw new Error('Cannot start game - check room status and players');
    }
    
    try {
      webSocketService.startGame(store.room.current!.id);
      dev.log('Game start request sent');
    } catch (error) {
      dev.error('Failed to start game:', error);
      throw error;
    }
  },

  /**
   * Submit a guess
   */
  async submitGuess(lat: number, lng: number) {
    const store = useMultiplayerStore.getState();
    
    if (!multiplayerSelectors.canSubmitGuess(store)) {
      throw new Error('Cannot submit guess at this time');
    }
    
    // Update UI state immediately
    store.actions.setGuessSubmitted(true);
    
    try {
      webSocketService.submitGuess(lat, lng);
      dev.log('Guess submitted:', { lat, lng });
    } catch (error) {
      // Revert UI state on error
      store.actions.setGuessSubmitted(false);
      dev.error('Failed to submit guess:', error);
      throw error;
    }
  },

  /**
   * Vote to play again
   */
  async votePlayAgain(vote: boolean) {
    const store = useMultiplayerStore.getState();
    
    if (!multiplayerSelectors.isGameOver(store)) {
      throw new Error('Game is not over');
    }
    
    try {
      webSocketService.votePlayAgain(vote);
      dev.log('Play again vote sent:', vote);
    } catch (error) {
      dev.error('Failed to vote play again:', error);
      throw error;
    }
  },
};
