import { io, Socket } from 'socket.io-client';
import type { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  Room, 
  Player, 
  GameState,
  City,
  RoundResult
} from '@geo-pin-quest/shared';
import { config, dev } from '../config/environment';

/**
 * Connection status enumeration
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

/**
 * WebSocket service event types
 */
export interface WebSocketServiceEvents {
  // Connection events
  'connection-status-changed': (status: ConnectionStatus) => void;
  'connection-error': (error: string) => void;
  
  // Room events
  'room-created': (data: { room: Room; shareableLink: string }) => void;
  'room-joined': (data: { room: Room; isHost: boolean }) => void;
  'player-joined': (data: { opponent: Player }) => void;
  'player-left': (data: { playerId: string }) => void;
  'room-full': (data: { error: string }) => void;
  
  // Game events
  'game-started': (data: { gameState: GameState }) => void;
  'round-started': (data: { city: City; roundNumber: number; timeLimit: number }) => void;
  'guess-received': (data: { playerId: string; hasGuessed: boolean }) => void;
  'round-ended': (data: { result: RoundResult; gameState: GameState }) => void;
  'game-ended': (data: { winner: Player | null; finalScores: { host: number; opponent: number } }) => void;
  'opponent-disconnected': (data: { message: string }) => void;
  'opponent-reconnected': (data: { message: string }) => void;
  'play-again-vote': (data: { playerId: string; vote: boolean }) => void;
  'new-game-starting': (data: { gameState: GameState }) => void;
}

/**
 * WebSocket service for multiplayer functionality
 */
export class WebSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private eventListeners: Map<keyof WebSocketServiceEvents, Set<(...args: unknown[]) => void>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private isManualDisconnect = false;

  constructor() {
    this.setupConnectionListeners();
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected === true;
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      dev.log('Already connected to WebSocket server');
      return;
    }

    try {
      this.isManualDisconnect = false;
      this.setConnectionStatus(ConnectionStatus.CONNECTING);
      
      dev.log('Connecting to WebSocket server at:', config.wsUrl);
      
      this.socket = io(config.wsUrl, {
        autoConnect: true,
        reconnection: false, // We'll handle reconnection manually
        timeout: 10000,
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
      });

      // Set up event listeners
      this.setupSocketListeners();
      
      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
    } catch (error) {
      dev.error('Failed to connect to WebSocket server:', error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
      this.emit('connection-error', error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    this.clearReconnectTimer();
    
    if (this.socket) {
      dev.log('Disconnecting from WebSocket server');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Create a room
   */
  createRoom(difficulty: number, roundLimit: number): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Creating room with difficulty:', difficulty, 'rounds:', roundLimit);
    this.socket!.emit('create-room', { difficulty, roundLimit });
  }

  /**
   * Join a room
   */
  joinRoom(roomCode: string, playerName: string): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Joining room:', roomCode, 'as:', playerName);
    this.socket!.emit('join-room', { roomCode, playerName });
  }

  /**
   * Leave current room
   */
  leaveRoom(roomId: string): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Leaving room:', roomId);
    this.socket!.emit('leave-room', { roomId });
  }

  /**
   * Start game
   */
  startGame(roomId: string): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Starting game in room:', roomId);
    this.socket!.emit('start-game', { roomId });
  }

  /**
   * Submit a player guess
   */
  submitGuess(lat: number, lng: number): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Submitting guess:', { lat, lng });
    this.socket!.emit('player-guess', { lat, lng, timestamp: Date.now() });
  }

  /**
   * Mark player as ready
   */
  setPlayerReady(playerId: string): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Setting player ready:', playerId);
    this.socket!.emit('player-ready', { playerId });
  }

  /**
   * Vote for play again
   */
  votePlayAgain(vote: boolean): void {
    if (!this.isConnected()) {
      throw new Error('Not connected to server');
    }
    
    dev.log('Voting play again:', vote);
    this.socket!.emit('play-again-vote', { vote });
  }

  /**
   * Add event listener
   */
  on<K extends keyof WebSocketServiceEvents>(
    event: K,
    listener: WebSocketServiceEvents[K]
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof WebSocketServiceEvents>(
    event: K,
    listener: WebSocketServiceEvents[K]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners<K extends keyof WebSocketServiceEvents>(event?: K): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Emit event to listeners
   */
  private emit<K extends keyof WebSocketServiceEvents>(
    event: K,
    ...args: Parameters<WebSocketServiceEvents[K]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          dev.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Set connection status and emit event
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      dev.log('Connection status changed to:', status);
      this.emit('connection-status-changed', status);
    }
  }

  /**
   * Set up socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      dev.log('✅ Connected to WebSocket server');
      this.setConnectionStatus(ConnectionStatus.CONNECTED);
      this.reconnectAttempts = 0;
      this.clearReconnectTimer();
    });

    this.socket.on('disconnect', (reason) => {
      dev.log('❌ Disconnected from WebSocket server:', reason);
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
      
      // Auto-reconnect unless it was a manual disconnect
      if (!this.isManualDisconnect && reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      dev.error('❌ Connection error:', error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
      this.emit('connection-error', error.message);
      
      // Schedule reconnect on connection error
      if (!this.isManualDisconnect) {
        this.scheduleReconnect();
      }
    });

    // Game events - forward to service listeners
    this.socket.on('room-created', (data) => {
      dev.log('🏠 Room created:', data);
      this.emit('room-created', data);
    });

    this.socket.on('room-joined', (data) => {
      dev.log('👥 Room joined:', data);
      this.emit('room-joined', data);
    });

    this.socket.on('player-joined', (data) => {
      dev.log('👤 Player joined:', data);
      this.emit('player-joined', data);
    });

    this.socket.on('player-left', (data) => {
      dev.log('👋 Player left:', data);
      this.emit('player-left', data);
    });

    this.socket.on('room-full', (data) => {
      dev.log('🚫 Room full:', data);
      this.emit('room-full', data);
    });

    this.socket.on('game-started', (data) => {
      dev.log('🎮 Game started:', data);
      this.emit('game-started', data);
    });

    this.socket.on('round-started', (data) => {
      dev.log('⏱️ Round started:', data);
      this.emit('round-started', data);
    });

    this.socket.on('guess-received', (data) => {
      dev.log('🎯 Guess received:', data);
      this.emit('guess-received', data);
    });

    this.socket.on('round-ended', (data) => {
      dev.log('🏁 Round ended:', data);
      this.emit('round-ended', data);
    });

    this.socket.on('game-ended', (data) => {
      dev.log('🎉 Game ended:', data);
      this.emit('game-ended', data);
    });

    this.socket.on('opponent-disconnected', (data) => {
      dev.log('⚡ Opponent disconnected:', data);
      this.emit('opponent-disconnected', data);
    });

    this.socket.on('opponent-reconnected', (data) => {
      dev.log('🔌 Opponent reconnected:', data);
      this.emit('opponent-reconnected', data);
    });

    this.socket.on('play-again-vote', (data) => {
      dev.log('🗳️ Play again vote:', data);
      this.emit('play-again-vote', data);
    });

    this.socket.on('new-game-starting', (data) => {
      dev.log('🔄 New game starting:', data);
      this.emit('new-game-starting', data);
    });
  }

  /**
   * Set up general connection listeners
   */
  private setupConnectionListeners(): void {
    // Handle browser online/offline events
    window.addEventListener('online', () => {
      dev.log('Browser came online, attempting to reconnect...');
      if (!this.isConnected() && !this.isManualDisconnect) {
        this.connect().catch(error => {
          dev.error('Failed to reconnect after coming online:', error);
        });
      }
    });

    window.addEventListener('offline', () => {
      dev.log('Browser went offline');
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isConnected() && !this.isManualDisconnect) {
        dev.log('Page became visible, checking connection...');
        this.connect().catch(error => {
          dev.error('Failed to reconnect after page became visible:', error);
        });
      }
    });
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= config.maxReconnectAttempts) {
      dev.log('Max reconnect attempts reached, giving up');
      this.setConnectionStatus(ConnectionStatus.ERROR);
      this.emit('connection-error', 'Max reconnection attempts exceeded');
      return;
    }

    this.clearReconnectTimer();
    this.setConnectionStatus(ConnectionStatus.RECONNECTING);
    
    const delay = config.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Exponential backoff
    this.reconnectAttempts++;
    
    dev.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = window.setTimeout(() => {
      if (!this.isManualDisconnect) {
        this.connect().catch(error => {
          dev.error('Reconnection attempt failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
    this.clearReconnectTimer();
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Export for use in React hooks
export default webSocketService;
