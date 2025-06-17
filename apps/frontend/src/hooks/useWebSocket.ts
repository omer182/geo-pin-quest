import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  webSocketService, 
  ConnectionStatus, 
  type WebSocketServiceEvents 
} from '../services/websocket';
import { dev } from '../config/environment';

/**
 * Hook for managing WebSocket connection
 */
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    webSocketService.getConnectionStatus()
  );
  const [error, setError] = useState<string | null>(null);
  const isConnecting = useRef(false);

  // Connect to WebSocket server
  const connect = useCallback(async () => {
    if (isConnecting.current) {
      dev.log('Connection already in progress');
      return;
    }

    try {
      isConnecting.current = true;
      setError(null);
      await webSocketService.connect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setError(errorMessage);
      dev.error('Failed to connect:', errorMessage);
    } finally {
      isConnecting.current = false;
    }
  }, []);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setError(null);
  }, []);

  // Auto-connect and set up listeners
  useEffect(() => {
    // Connection status listener
    const handleConnectionStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status);
    };

    // Error listener
    const handleConnectionError = (errorMessage: string) => {
      setError(errorMessage);
    };

    // Set up listeners
    webSocketService.on('connection-status-changed', handleConnectionStatusChange);
    webSocketService.on('connection-error', handleConnectionError);

    // Auto-connect if not connected
    if (!webSocketService.isConnected()) {
      connect();
    }

    // Cleanup
    return () => {
      webSocketService.off('connection-status-changed', handleConnectionStatusChange);
      webSocketService.off('connection-error', handleConnectionError);
    };
  }, [connect]);

  return {
    connectionStatus,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    isConnecting: connectionStatus === ConnectionStatus.CONNECTING,
    isReconnecting: connectionStatus === ConnectionStatus.RECONNECTING,
    error,
    connect,
    disconnect,
  };
}

/**
 * Hook for listening to specific WebSocket events
 */
export function useWebSocketEvent<K extends keyof WebSocketServiceEvents>(
  event: K,
  handler: WebSocketServiceEvents[K],
  deps: React.DependencyList = []
) {
  useEffect(() => {
    webSocketService.on(event, handler);
    
    return () => {
      webSocketService.off(event, handler);
    };
  }, deps);
}

/**
 * Hook for room management
 */
export function useRoom() {
  const { isConnected } = useWebSocket();

  const createRoom = useCallback((difficulty: number, roundLimit: number) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.createRoom(difficulty, roundLimit);
  }, [isConnected]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.joinRoom(roomCode, playerName);
  }, [isConnected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.leaveRoom(roomId);
  }, [isConnected]);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    isConnected,
  };
}

/**
 * Hook for game actions
 */
export function useGame() {
  const { isConnected } = useWebSocket();

  const startGame = useCallback((roomId: string) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.startGame(roomId);
  }, [isConnected]);

  const submitGuess = useCallback((lat: number, lng: number) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.submitGuess(lat, lng);
  }, [isConnected]);

  const setPlayerReady = useCallback((playerId: string) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.setPlayerReady(playerId);
  }, [isConnected]);

  const votePlayAgain = useCallback((vote: boolean) => {
    if (!isConnected) {
      throw new Error('Not connected to server');
    }
    webSocketService.votePlayAgain(vote);
  }, [isConnected]);

  return {
    startGame,
    submitGuess,
    setPlayerReady,
    votePlayAgain,
    isConnected,
  };
}

/**
 * Hook for managing connection lifecycle
 */
export function useConnectionLifecycle() {
  const { connectionStatus, error } = useWebSocket();

  // Auto-reconnect when app regains focus or comes online
  useEffect(() => {
    const handleFocus = () => {
      if (!webSocketService.isConnected()) {
        dev.log('App regained focus, attempting to reconnect...');
        webSocketService.connect().catch(error => {
          dev.error('Failed to reconnect on focus:', error);
        });
      }
    };

    const handleOnline = () => {
      if (!webSocketService.isConnected()) {
        dev.log('Browser came online, attempting to reconnect...');
        webSocketService.connect().catch(error => {
          dev.error('Failed to reconnect on online:', error);
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return {
    connectionStatus,
    error,
    isOnline: navigator.onLine,
  };
}
