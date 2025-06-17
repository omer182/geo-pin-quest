// Shared types for multiplayer functionality
export interface Room {
  id: string; // 8-character unique room code
  hostId: string;
  opponentId?: string | undefined;
  difficulty: number; // 1-5 difficulty level
  roundLimit: number; // Default: 5
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  shareableLink: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string; // Unique player identifier
  name: string; // Display name for the session
  isHost: boolean;
  isReady: boolean;
  connectionStatus: 'connected' | 'disconnected';
  scores: number[]; // Score for each round
  totalScore: number;
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'round-results' | 'game-over';
  currentRound: number;
  totalRounds: number;
  currentCity: City | null;
  roundStartTime: Date | null;
  roundTimeLimit: number; // seconds
  hostGuess: Guess | null;
  opponentGuess: Guess | null;
  roundResults: RoundResult[];
  winner: string | null; // playerId of winner
  playAgainVotes: {
    host: boolean | null;
    opponent: boolean | null;
  };
}

export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  difficulty: number; // 1-5
}

export interface Guess {
  lat: number;
  lng: number;
  timestamp: Date;
  distance: number; // calculated distance in km
  score: number; // calculated score based on distance
}

export interface RoundResult {
  roundNumber: number;
  city: City;
  hostGuess: Guess;
  opponentGuess: Guess;
  hostScore: number;
  opponentScore: number;
  completedAt: Date;
}

// Socket.io event types
export interface ClientToServerEvents {
  'create-room': (data: { difficulty: number; roundLimit: number }) => void;
  'join-room': (data: { roomCode: string; playerName: string }) => void;
  'leave-room': (data: { roomId: string }) => void;
  'start-game': (data: { roomId: string }) => void;
  'player-guess': (data: { lat: number; lng: number; timestamp: number }) => void;
  'player-ready': (data: { playerId: string }) => void;
  'play-again-vote': (data: { vote: boolean }) => void;
}

export interface ServerToClientEvents {
  'room-created': (data: { room: Room; shareableLink: string }) => void;
  'room-joined': (data: { room: Room; isHost: boolean }) => void;
  'player-joined': (data: { opponent: Player }) => void;
  'player-left': (data: { playerId: string }) => void;
  'room-full': (data: { error: string }) => void;
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
