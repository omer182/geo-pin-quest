# Multiplayer Feature Design Document

## Overview
This document outlines the design and implementation plan for adding real-time multiplayer functionality to Geo Pin Quest, transforming it from a single-player geography game into a competitive multiplayer experience.

## Core Multiplayer Features

### 1. Real-Time 1v1 Rooms
- **Room Creation**: Players can create private rooms with custom settings
- **Room Joining**: Join rooms via shareable links or room codes
- **Room Capacity**: Exactly 2 players per room (1v1 mode only)
- **Room Settings**: Configurable difficulty levels (1-5) and round limits

### 2. Game Mode: 1v1 Competitive

#### Core Gameplay
- Two players compete head-to-head in real-time
- Both players guess the same cities simultaneously
- Round-based structure with configurable round limits (default: 5 rounds)
- Real-time score comparison and progress tracking

#### Room Creation Flow
1. Player clicks "Multiplayer" in main menu
2. Selects "Create Room"
3. Chooses difficulty level (1-5, using existing city data)
4. Optionally sets round limit (default: 5)
5. Room created with unique ID, shareable link generated
6. Host waits in lobby for opponent to join

#### Room Joining Flow
1. Player receives room link or enters room code
2. Enters display name for the session
3. Joins room lobby and sees host information
4. Host starts game when both players are ready

#### Gameplay Flow
**Round Loop (repeats for set number of rounds):**
1. New city displayed simultaneously to both players
2. Both players place their guesses on the map
3. Round ends when both players submit OR timer expires
4. Results revealed: both guesses shown, distances calculated, scores awarded
5. Running score totals updated and displayed
6. Brief pause before next round begins

**Game End:**
1. Final scores comparison displayed
2. Winner announcement with celebration
3. "Play Again?" voting system
4. If both players vote yes: new game starts with same settings

### 3. Real-Time Features
- **Live Score Updates**: See opponent's score update in real-time during gameplay
- **Simultaneous Guess Visualization**: Show both players' pin placements when round ends
- **Game State Synchronization**: Both players see identical game state and timing
- **Connection Status**: Visual indicators for player connection status
- **Reconnection Handling**: Graceful handling of temporary disconnections

## Technical Architecture

### Backend Infrastructure

#### WebSocket Server (Node.js + Socket.io)
```
/multiplayer-server/
├── src/
│   ├── server.ts          # Main server setup
│   ├── handlers/
│   │   ├── room.ts        # Room management
│   │   ├── game.ts        # Game logic
│   │   └── chat.ts        # Chat functionality
│   ├── models/
│   │   ├── Room.ts        # Room data structure
│   │   ├── Player.ts      # Player data structure
│   │   └── Game.ts        # Game state management
│   └── utils/
│       ├── gameLogic.ts   # Shared game calculations
│       └── validation.ts  # Input validation
├── package.json
└── Dockerfile
```

#### Database Schema (SQLite for Raspberry Pi 5)
```sql
-- Game history table for completed 1v1 matches
CREATE TABLE game_history (
    id TEXT PRIMARY KEY, -- UUID as TEXT
    host_player_id TEXT NOT NULL,
    host_player_name TEXT NOT NULL,
    opponent_player_id TEXT NOT NULL,
    opponent_player_name TEXT NOT NULL,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    total_rounds INTEGER NOT NULL,
    host_final_score INTEGER NOT NULL,
    opponent_final_score INTEGER NOT NULL,
    winner_id TEXT, -- NULL for ties
    game_duration_seconds INTEGER,
    started_at INTEGER NOT NULL, -- Unix timestamp
    ended_at INTEGER NOT NULL, -- Unix timestamp
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Player statistics for 1v1 performance
CREATE TABLE player_stats (
    player_id TEXT PRIMARY KEY,
    username TEXT,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    games_tied INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0,
    favorite_difficulty INTEGER DEFAULT 3,
    last_played_at INTEGER, -- Unix timestamp
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Round details for game analysis (optional - can be disabled for minimal storage)
CREATE TABLE round_history (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL REFERENCES game_history(id),
    round_number INTEGER NOT NULL,
    city_name TEXT NOT NULL,
    city_country TEXT NOT NULL,
    city_lat REAL NOT NULL,
    city_lng REAL NOT NULL,
    host_guess_lat REAL NOT NULL,
    host_guess_lng REAL NOT NULL,
    host_distance_km REAL NOT NULL,
    host_score INTEGER NOT NULL,
    opponent_guess_lat REAL NOT NULL,
    opponent_guess_lng REAL NOT NULL,
    opponent_distance_km REAL NOT NULL,
    opponent_score INTEGER NOT NULL,
    completed_at INTEGER NOT NULL -- Unix timestamp
);

-- Indexes for performance on Raspberry Pi 5
CREATE INDEX idx_game_history_players ON game_history(host_player_id, opponent_player_id);
CREATE INDEX idx_game_history_date ON game_history(ended_at);
CREATE INDEX idx_player_stats_username ON player_stats(username);
CREATE INDEX idx_round_history_game ON round_history(game_id);
```

### Frontend Integration

#### WebSocket Client Integration
```typescript
// src/services/multiplayerService.ts
import { io, Socket } from 'socket.io-client';

export class MultiplayerService {
    private socket: Socket;
    
    connect(playerId: string, playerName: string) {
        this.socket = io(MULTIPLAYER_SERVER_URL, {
            auth: { playerId, playerName }
        });
        
        this.setupEventListeners();
    }
    
    createRoom(difficulty: number, roundLimit: number = 5) {
        this.socket.emit('create-room', { difficulty, roundLimit });
    }
    
    joinRoom(roomCode: string, playerName: string) {
        this.socket.emit('join-room', { roomCode, playerName });
    }
    
    startGame() {
        this.socket.emit('start-game');
    }
    
    makeGuess(lat: number, lng: number) {
        this.socket.emit('player-guess', { lat, lng });
    }
    
    votePlayAgain(vote: boolean) {
        this.socket.emit('play-again-vote', vote);
    }
    
    private setupEventListeners() {
        this.socket.on('room-created', this.handleRoomCreated);
        this.socket.on('player-joined', this.handlePlayerJoined);
        this.socket.on('game-started', this.handleGameStarted);
        this.socket.on('round-started', this.handleRoundStarted);
        this.socket.on('guess-received', this.handleGuessReceived);
        this.socket.on('round-ended', this.handleRoundEnded);
        this.socket.on('game-ended', this.handleGameEnded);
        this.socket.on('play-again-result', this.handlePlayAgainResult);
    }
}
```

#### State Management (Zustand Store)
```typescript
// src/stores/multiplayerStore.ts
interface MultiplayerState {
    // Connection state
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected';
    
    // Room state
    currentRoom: Room | null;
    isHost: boolean;
    opponent: Player | null;
    
    // Game state
    gamePhase: 'lobby' | 'playing' | 'round-results' | 'game-over';
    currentRound: number;
    totalRounds: number;
    currentCity: City | null;
    
    // Player data
    myScore: number;
    opponentScore: number;
    myGuess: { lat: number; lng: number } | null;
    opponentGuess: { lat: number; lng: number } | null;
    
    // Round results
    lastRoundResult: RoundResult | null;
    
    // Play again voting
    playAgainVotes: { host: boolean | null; opponent: boolean | null };
    
    // Actions
    setRoom: (room: Room) => void;
    setOpponent: (opponent: Player) => void;
    updateGameState: (state: Partial<GameState>) => void;
    setMyGuess: (guess: { lat: number; lng: number }) => void;
    setRoundResult: (result: RoundResult) => void;
    resetGame: () => void;
}

interface Room {
    id: string;
    hostId: string;
    difficulty: number;
    roundLimit: number;
    shareableLink: string;
}

interface Player {
    id: string;
    name: string;
    isReady: boolean;
}

interface City {
    name: string;
    country: string;
    lat: number;
    lng: number;
}

interface RoundResult {
    city: City;
    hostGuess: { lat: number; lng: number; distance: number; score: number };
    opponentGuess: { lat: number; lng: number; distance: number; score: number };
    roundNumber: number;
}
```

### UI Components

#### Room Management
```typescript
// src/components/multiplayer/RoomLobby.tsx
export function RoomLobby() {
    return (
        <div className="room-lobby">
            <RoomInfo /> {/* Room ID, difficulty, round limit */}
            <PlayerList /> {/* Host and opponent info */}
            <RoomSettings /> {/* Difficulty and round settings for host */}
            <ShareableLink /> {/* Link for opponent to join */}
            <StartGameButton /> {/* Only visible to host when opponent joined */}
        </div>
    );
}

// src/components/multiplayer/CreateRoomModal.tsx
export function CreateRoomModal() {
    return (
        <Modal>
            <DifficultySelector min={1} max={5} />
            <RoundLimitSelector defaultValue={5} />
            <CreateButton />
        </Modal>
    );
}

// src/components/multiplayer/JoinRoomModal.tsx
export function JoinRoomModal() {
    return (
        <Modal>
            <RoomCodeInput />
            <PlayerNameInput />
            <JoinButton />
        </Modal>
    );
}
```

#### In-Game Multiplayer UI
```typescript
// src/components/multiplayer/MultiplayerGame.tsx
export function MultiplayerGame() {
    return (
        <div className="multiplayer-game">
            <GameHeader>
                <RoundCounter current={currentRound} total={totalRounds} />
                <ScoreComparison myScore={myScore} opponentScore={opponentScore} />
                <OpponentStatus /> {/* Connection and guess status */}
            </GameHeader>
            
            <Map>
                <CityMarker city={currentCity} />
                <GuessMarkers 
                    myGuess={myGuess} 
                    opponentGuess={opponentGuess} 
                    showOpponent={roundEnded} 
                />
            </Map>
            
            <GameFooter>
                <SubmitGuessButton disabled={!myGuess || roundEnded} />
                <WaitingIndicator visible={myGuess && !opponentGuess} />
            </GameFooter>
        </div>
    );
}

// src/components/multiplayer/RoundResults.tsx
export function RoundResults({ result }: { result: RoundResult }) {
    return (
        <Modal>
            <CityInfo city={result.city} />
            <GuessComparison 
                hostGuess={result.hostGuess}
                opponentGuess={result.opponentGuess}
            />
            <ScoreUpdate />
            <NextRoundButton />
        </Modal>
    );
}

// src/components/multiplayer/GameOver.tsx
export function GameOver({ winner, finalScores }: GameOverProps) {
    return (
        <Modal>
            <WinnerAnnouncement winner={winner} />
            <FinalScores scores={finalScores} />
            <PlayAgainVoting />
            <ExitToMenuButton />
        </Modal>
    );
}
```

## Data Models

### Room Model
```typescript
interface Room {
    id: string; // 8-character unique room code
    hostId: string;
    opponentId?: string;
    difficulty: number; // 1-5 difficulty level
    roundLimit: number; // Default: 5
    status: 'waiting' | 'playing' | 'finished';
    currentRound: number;
    shareableLink: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Player {
    id: string; // Unique player identifier
    name: string; // Display name for the session
    isHost: boolean;
    isReady: boolean;
    connectionStatus: 'connected' | 'disconnected';
    scores: number[]; // Score for each round
    totalScore: number;
}

interface GameState {
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

interface City {
    name: string;
    country: string;
    lat: number;
    lng: number;
    difficulty: number; // 1-5
}

interface Guess {
    lat: number;
    lng: number;
    timestamp: Date;
    distance: number; // calculated distance in km
    score: number; // calculated score based on distance
}

interface RoundResult {
    roundNumber: number;
    city: City;
    hostGuess: Guess;
    opponentGuess: Guess;
    hostScore: number;
    opponentScore: number;
    completedAt: Date;
}
```
}
```

## Real-Time Events

### Socket.io Events

#### Client → Server
```typescript
// Room management
'create-room' → { difficulty: number, roundLimit: number }
'join-room' → { roomCode: string, playerName: string }
'leave-room' → { roomId: string }
'start-game' → { roomId: string }

// Gameplay
'player-guess' → { lat: number, lng: number, timestamp: number }
'player-ready' → { playerId: string }

// Post-game
'play-again-vote' → { vote: boolean }
```

#### Server → Client
```typescript
// Room updates
'room-created' → { room: Room, shareableLink: string }
'room-joined' → { room: Room, isHost: boolean }
'player-joined' → { opponent: Player }
'player-left' → { playerId: string }
'room-full' → { error: string }

// Game events
'game-started' → { gameState: GameState }
'round-started' → { city: City, roundNumber: number, timeLimit: number }
'guess-received' → { playerId: string, hasGuessed: boolean }
'round-ended' → { result: RoundResult, gameState: GameState }
'game-ended' → { winner: Player, finalScores: { host: number, opponent: number } }

// Real-time updates
'opponent-disconnected' → { message: string }
'opponent-reconnected' → { message: string }
'play-again-vote' → { playerId: string, vote: boolean }
'new-game-starting' → { gameState: GameState }
```

## Security & Validation

### Anti-Cheat Measures
- Server-side validation of all guesses and timing
- Rate limiting on guess submissions (one per round)
- Timestamp validation to prevent time manipulation
- Geographic bounds checking for valid coordinates
- Distance and score calculation verification on server

### Input Validation
```typescript
// Guess validation for 1v1 games
function validateGuess(guess: GuessData, gameState: GameState): boolean {
    return (
        isValidLatLng(guess.lat, guess.lng) &&
        isWithinRoundTimeLimit(guess.timestamp, gameState.roundStartTime) &&
        !hasPlayerAlreadyGuessed(guess.playerId, gameState.currentRound) &&
        isGameInGuessingPhase(gameState.phase)
    );
}

// Room joining validation
function validateRoomJoin(roomCode: string, playerName: string): boolean {
    return (
        isValidRoomCode(roomCode) &&
        isValidPlayerName(playerName) &&
        isRoomNotFull(roomCode) &&
        isRoomInLobbyPhase(roomCode)
    );
}
```

### Authentication & Authorization
- Unique session tokens for each player
- Room access control (only 2 players per room)
- Host privileges validation
- Rate limiting per IP address

## Performance Considerations

### In-Memory Architecture Benefits
- **Ultra-fast gameplay**: 0.1ms response times for real-time moves
- **Minimal RAM usage**: ~5-10MB for active game sessions
- **No I/O bottlenecks**: Zero disk writes during active gameplay
- **Raspberry Pi 5 optimized**: ARM64 native performance

### Scalability
- Lightweight 1v1 rooms reduce server load
- In-memory game state for instant access
- SQLite for lightweight statistics storage
- Efficient WebSocket connection management

### Real-Time Optimization
- Debounced map interactions during guessing
- Efficient state synchronization between 2 players
- Minimal data transmission (only essential game data)
- Client-side prediction for smooth interactions

### Memory Management
- Automatic cleanup of completed games
- Configurable memory limits for active sessions
- Periodic garbage collection of stale rooms
- Statistics written to SQLite only on game completion

### Connection Management
- Graceful handling of disconnections
- Automatic reconnection attempts
- Game state lost on server restart (by design)
- Timeout handling for inactive players

## Implementation Phases

### Phase 1: Core 1v1 Infrastructure (2-3 weeks)
- [ ] Set up WebSocket server with Socket.io
- [ ] Implement room creation and joining (2 players max)
- [ ] Create 1v1 data models and database schema
- [ ] Build room lobby UI with difficulty selection

### Phase 2: 1v1 Gameplay (3-4 weeks)
- [ ] Implement simultaneous guess submission
- [ ] Add real-time score updates and comparison
- [ ] Create in-game UI with opponent status
- [ ] Build round results display with both guesses

### Phase 3: Game Flow & Polish (2-3 weeks)
- [ ] Implement complete round loop system
- [ ] Add game end with winner announcement
- [ ] Create "Play Again" voting system
- [ ] Add connection status indicators

### Phase 4: Enhancement & Testing (2-3 weeks)
- [ ] Implement reconnection handling
- [ ] Add player statistics tracking
- [ ] Performance optimization for 1v1 matches
- [ ] Comprehensive testing and bug fixes

### Phase 5: Deployment & Launch (1-2 weeks)
- [ ] Production deployment configuration
- [ ] Security hardening and validation
- [ ] Documentation and user guides
- [ ] Launch and monitoring setup

## Configuration & Deployment

### Environment Variables
```bash
# Server configuration
MULTIPLAYER_SERVER_PORT=3001
DATABASE_PATH=./data/multiplayer.db    # SQLite database file
REDIS_URL=redis://localhost:6379      # Optional: for session storage

# 1v1 Game settings
MAX_ROOMS=1000
ROOM_TIMEOUT_MS=1800000  # 30 minutes
ROUND_TIMEOUT_MS=60000   # 60 seconds per round
MAX_ROUNDS_PER_GAME=10

# In-memory game optimization for Raspberry Pi 5
MEMORY_CLEANUP_INTERVAL=300000  # Clean completed games every 5 minutes
MAX_COMPLETED_GAMES_IN_MEMORY=100  # Keep recent games for quick stats

# Security
JWT_SECRET=your-secret-key
RATE_LIMIT_REQUESTS=50    # Lower limit for 1v1 focused gameplay
RATE_LIMIT_WINDOW_MS=60000

# WebSocket settings
WEBSOCKET_PING_TIMEOUT=5000
WEBSOCKET_PING_INTERVAL=10000
```

### Docker Deployment
```dockerfile
# Dockerfile.multiplayer
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY multiplayer-server/package*.json ./
RUN npm ci --only=production

# Copy application code
COPY multiplayer-server/dist ./dist

# Expose port and start server
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Docker Compose Integration
```yaml
# Add to existing docker-compose.yml
services:
  multiplayer-server:
    build:
      context: .
      dockerfile: Dockerfile.multiplayer
    ports:
      - "3001:3001"
    environment:
      - DATABASE_PATH=/app/data/multiplayer.db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data  # Persist SQLite database
    depends_on:
      - redis
    networks:
      - geo-pin-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - geo-pin-network
```

## Testing Strategy

### Unit Tests
- 1v1 game logic validation
- Distance calculation accuracy
- Score computation for 2 players
- Room management with 2-player limit
- Round progression and timing

### Integration Tests
- WebSocket event handling between 2 clients
- Database operations for 1v1 sessions
- Real-time synchronization testing
- Disconnection and reconnection scenarios

### End-to-End Tests
- Complete 1v1 game flow testing
- Room creation and joining process
- Simultaneous guess submission
- Play Again functionality
- Cross-browser compatibility for 2 players

### Load Testing
- Concurrent 1v1 room capacity
- WebSocket connection efficiency
- Database performance with multiple rooms
- Memory usage with many concurrent games

## Future Enhancements

### Immediate Next Features (Post-1v1 Launch)
- **Friend Invites**: Direct friend invitation system
- **Player Profiles**: Basic statistics and game history
- **Difficulty Progression**: Unlock higher difficulties based on performance
- **Quick Match**: Automatic pairing with random opponents

### Medium-term Additions
- **Tournaments**: 1v1 bracket tournaments
- **Leaderboards**: Regional and global 1v1 rankings
- **Custom Regions**: Focus games on specific continents/countries
- **Replay System**: Watch previous game replays

### Long-term Vision
- **Mobile App**: Native iOS/Android support
- **Voice Chat**: Optional voice communication
- **Spectator Mode**: Watch other 1v1 matches
- **Team Mode**: 2v2 competitions

## Conclusion

This 1v1-focused multiplayer implementation provides a solid foundation for Geo Pin Quest's competitive multiplayer features. By concentrating on the core 1v1 experience first, we can:

1. **Deliver a polished experience** with focused gameplay mechanics
2. **Minimize complexity** while maintaining engaging competition
3. **Establish robust infrastructure** that can scale to additional game modes
4. **Gather user feedback** to inform future feature development

The real-time 1v1 gameplay, combined with the existing geography challenge mechanics, will create an engaging competitive experience that encourages repeated play and skill development in geography knowledge.
