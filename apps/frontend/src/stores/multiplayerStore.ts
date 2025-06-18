import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  Room, 
  Player, 
  GameState, 
  City, 
  RoundResult 
} from '@geo-pin-quest/shared';
import { ConnectionStatus } from '../services/websocket';
import { dev } from '../config/environment';

/**
 * Current player information
 */
export interface CurrentPlayer {
  id: string;
  name: string;
  isHost: boolean;
}

/**
 * Connection state
 */
export interface ConnectionState {
  status: ConnectionStatus;
  error: string | null;
  lastConnectedAt: Date | null;
  reconnectAttempts: number;
}

/**
 * Room state
 */
export interface RoomState {
  current: Room | null;
  shareableLink: string | null;
  isJoining: boolean;
  isCreating: boolean;
  joinError: string | null;
  createError: string | null;
}

/**
 * Game state
 */
export interface GameStateExtended extends Omit<GameState, 'hostGuess' | 'opponentGuess'> {
  isSubmittingGuess: boolean;
  hasSubmittedGuess: boolean;
  opponentHasGuessed: boolean;
  timeRemaining: number;
  isTimerActive: boolean;
  currentGuess: { lat: number; lng: number } | null; // Player's current guess before submission
}

/**
 * UI state
 */
export interface UIState {
  activeView: 'lobby' | 'create-room' | 'join-room' | 'room-lobby' | 'game' | 'results';
  showConnectionStatus: boolean;
  showRoomCode: boolean;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: Date;
    autoHide: boolean;
  }>;
}

/**
 * Complete multiplayer store state
 */
export interface MultiplayerState {
  // Connection
  connection: ConnectionState;
  
  // Players
  currentPlayer: CurrentPlayer | null;
  opponent: Player | null;
  
  // Room
  room: RoomState;
  
  // Game
  game: GameStateExtended | null;
  
  // UI
  ui: UIState;
  
  // Actions
  actions: {
    // Connection actions
    setConnectionStatus: (status: ConnectionStatus) => void;
    setConnectionError: (error: string | null) => void;
    clearConnectionError: () => void;
    
    // Player actions
    setCurrentPlayer: (player: CurrentPlayer) => void;
    setOpponent: (opponent: Player | null) => void;
    clearPlayers: () => void;
    
    // Room actions
    setRoom: (room: Room | null) => void;
    setShareableLink: (link: string | null) => void;
    setRoomLoading: (type: 'joining' | 'creating', loading: boolean) => void;
    setRoomError: (type: 'join' | 'create', error: string | null) => void;
    clearRoom: () => void;
    
    // Game actions
    setGameState: (gameState: GameState) => void;
    updateGamePhase: (phase: GameState['phase']) => void;
    setCurrentCity: (city: City | null) => void;
    setTimeRemaining: (time: number) => void;
    setTimerActive: (active: boolean) => void;
    setCurrentGuess: (guess: { lat: number; lng: number } | null) => void;
    setGuessSubmitted: (submitted: boolean) => void;
    setOpponentGuessed: (guessed: boolean) => void;
    addRoundResult: (result: RoundResult) => void;
    setWinner: (winner: string | null) => void;
    clearGame: () => void;
    
    // UI actions
    setActiveView: (view: UIState['activeView']) => void;
    showConnectionStatus: (show: boolean) => void;
    showRoomCode: (show: boolean) => void;
    addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    
    // Reset actions
    resetStore: () => void;
  };
}

/**
 * Initial state
 */
const initialState = {
  connection: {
    status: ConnectionStatus.DISCONNECTED,
    error: null,
    lastConnectedAt: null,
    reconnectAttempts: 0,
  },
  currentPlayer: null,
  opponent: null,
  room: {
    current: null,
    shareableLink: null,
    isJoining: false,
    isCreating: false,
    joinError: null,
    createError: null,
  },
  game: null,
  ui: {
    activeView: 'lobby' as const,
    showConnectionStatus: false,
    showRoomCode: false,
    notifications: [],
  },
};

/**
 * Create the multiplayer store
 */
export const useMultiplayerStore = create<MultiplayerState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    actions: {
      // Connection actions
      setConnectionStatus: (status: ConnectionStatus) => {
        set((state) => ({
          connection: {
            ...state.connection,
            status,
            lastConnectedAt: status === ConnectionStatus.CONNECTED ? new Date() : state.connection.lastConnectedAt,
            reconnectAttempts: status === ConnectionStatus.CONNECTED ? 0 : state.connection.reconnectAttempts,
          },
        }));
        
        if (status === ConnectionStatus.CONNECTED) {
          get().actions.clearConnectionError();
        }
      },
      
      setConnectionError: (error: string | null) => {
        set((state) => ({
          connection: {
            ...state.connection,
            error,
            reconnectAttempts: error ? state.connection.reconnectAttempts + 1 : state.connection.reconnectAttempts,
          },
        }));
      },
      
      clearConnectionError: () => {
        set((state) => ({
          connection: { ...state.connection, error: null },
        }));
      },
      
      // Player actions
      setCurrentPlayer: (player: CurrentPlayer) => {
        set({ currentPlayer: player });
        dev.log('Current player set:', player);
      },
      
      setOpponent: (opponent: Player | null) => {
        set({ opponent });
        dev.log('Opponent set:', opponent);
      },
      
      clearPlayers: () => {
        set({ currentPlayer: null, opponent: null });
      },
      
      // Room actions
      setRoom: (room: Room | null) => {
        set((state) => ({
          room: { ...state.room, current: room },
        }));
        dev.log('Room set:', room);
      },
      
      setShareableLink: (link: string | null) => {
        set((state) => ({
          room: { ...state.room, shareableLink: link },
        }));
      },
      
      setRoomLoading: (type: 'joining' | 'creating', loading: boolean) => {
        set((state) => ({
          room: {
            ...state.room,
            [type === 'joining' ? 'isJoining' : 'isCreating']: loading,
          },
        }));
      },
      
      setRoomError: (type: 'join' | 'create', error: string | null) => {
        set((state) => ({
          room: {
            ...state.room,
            [type === 'join' ? 'joinError' : 'createError']: error,
          },
        }));
      },
      
      clearRoom: () => {
        set((state) => ({
          room: { ...initialState.room },
        }));
      },
      
      // Game actions
      setGameState: (gameState: GameState) => {
        set({
          game: {
            ...gameState,
            isSubmittingGuess: false,
            hasSubmittedGuess: false,
            opponentHasGuessed: false,
            timeRemaining: gameState.roundTimeLimit,
            isTimerActive: gameState.phase === 'playing',
            currentGuess: null, // Reset current guess when game state changes
          },
        });
        dev.log('Game state set:', gameState);
      },
      
      updateGamePhase: (phase: GameState['phase']) => {
        set((state) => ({
          game: state.game ? {
            ...state.game,
            phase,
            isTimerActive: phase === 'playing',
          } : null,
        }));
      },
      
      setCurrentCity: (city: City | null) => {
        set((state) => ({
          game: state.game ? { ...state.game, currentCity: city } : null,
        }));
      },
      
      setTimeRemaining: (time: number) => {
        set((state) => ({
          game: state.game ? { ...state.game, timeRemaining: time } : null,
        }));
      },
      
      setTimerActive: (active: boolean) => {
        set((state) => ({
          game: state.game ? { ...state.game, isTimerActive: active } : null,
        }));
      },
      
      setCurrentGuess: (guess: { lat: number; lng: number } | null) => {
        set((state) => ({
          game: state.game ? { ...state.game, currentGuess: guess } : null,
        }));
      },
      
      setGuessSubmitted: (submitted: boolean) => {
        set((state) => ({
          game: state.game ? { 
            ...state.game, 
            hasSubmittedGuess: submitted,
            isSubmittingGuess: false,
          } : null,
        }));
      },
      
      setOpponentGuessed: (guessed: boolean) => {
        set((state) => ({
          game: state.game ? { ...state.game, opponentHasGuessed: guessed } : null,
        }));
      },
      
      addRoundResult: (result: RoundResult) => {
        set((state) => ({
          game: state.game ? {
            ...state.game,
            roundResults: [...state.game.roundResults, result],
          } : null,
        }));
      },
      
      setWinner: (winner: string | null) => {
        set((state) => ({
          game: state.game ? { ...state.game, winner } : null,
        }));
      },
      
      clearGame: () => {
        set({ game: null });
      },
      
      // UI actions
      setActiveView: (view: UIState['activeView']) => {
        set((state) => ({
          ui: { ...state.ui, activeView: view },
        }));
        dev.log('Active view changed to:', view);
      },
      
      showConnectionStatus: (show: boolean) => {
        set((state) => ({
          ui: { ...state.ui, showConnectionStatus: show },
        }));
      },
      
      showRoomCode: (show: boolean) => {
        set((state) => ({
          ui: { ...state.ui, showRoomCode: show },
        }));
      },
      
      addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = {
          ...notification,
          id,
          timestamp: new Date(),
        };
        
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, newNotification],
          },
        }));
        
        // Auto-remove notification after delay
        if (notification.autoHide) {
          setTimeout(() => {
            get().actions.removeNotification(id);
          }, notification.type === 'error' ? 8000 : 5000);
        }
      },
      
      removeNotification: (id: string) => {
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== id),
          },
        }));
      },
      
      clearNotifications: () => {
        set((state) => ({
          ui: { ...state.ui, notifications: [] },
        }));
      },
      
      // Reset actions
      resetStore: () => {
        set(initialState);
        dev.log('Store reset to initial state');
      },
    },
  }))
);

/**
 * Selectors for common state access patterns
 */
export const multiplayerSelectors = {
  // Connection selectors
  isConnected: (state: MultiplayerState) => state.connection.status === ConnectionStatus.CONNECTED,
  isConnecting: (state: MultiplayerState) => state.connection.status === ConnectionStatus.CONNECTING,
  isReconnecting: (state: MultiplayerState) => state.connection.status === ConnectionStatus.RECONNECTING,
  hasConnectionError: (state: MultiplayerState) => !!state.connection.error,
  
  // Room selectors
  hasRoom: (state: MultiplayerState) => !!state.room.current,
  isHost: (state: MultiplayerState) => state.currentPlayer?.isHost === true,
  hasOpponent: (state: MultiplayerState) => !!state.opponent,
  canStartGame: (state: MultiplayerState) => 
    state.currentPlayer?.isHost === true && 
    !!state.opponent && 
    state.room.current?.status === 'waiting',
  
  // Game selectors
  hasActiveGame: (state: MultiplayerState) => !!state.game,
  isPlaying: (state: MultiplayerState) => state.game?.phase === 'playing',
  isRoundResults: (state: MultiplayerState) => state.game?.phase === 'round-results',
  isGameOver: (state: MultiplayerState) => state.game?.phase === 'game-over',
  canSubmitGuess: (state: MultiplayerState) => 
    state.game?.phase === 'playing' && 
    !state.game.hasSubmittedGuess && 
    state.game.timeRemaining > 0,
  
  // UI selectors
  hasNotifications: (state: MultiplayerState) => state.ui.notifications.length > 0,
  isInMultiplayerFlow: (state: MultiplayerState) => 
    ['create-room', 'join-room', 'room-lobby', 'game', 'results'].includes(state.ui.activeView),
};

/**
 * Store subscription helpers
 */
export const subscribeToConnection = (callback: (status: ConnectionStatus) => void) => {
  return useMultiplayerStore.subscribe(
    (state) => state.connection.status,
    callback
  );
};

export const subscribeToGamePhase = (callback: (phase: GameState['phase'] | null) => void) => {
  return useMultiplayerStore.subscribe(
    (state) => state.game?.phase || null,
    callback
  );
};

export const subscribeToTimeRemaining = (callback: (time: number) => void) => {
  return useMultiplayerStore.subscribe(
    (state) => state.game?.timeRemaining || 0,
    callback
  );
};
