# Implementation Plan: Multiplayer 1v1 Feature

## Dependencies

- [ ] Add `socket.io-client` for WebSocket client connection
- [ ] Add `zustand` for multiplayer state management
- [ ] Add `nanoid` for generating unique room codes
- [ ] Add UUID generation utility for player IDs

## Backend Infrastructure

- [ ] Create `multiplayer-server/` directory in project root
- [ ] Set up `multiplayer-server/package.json` with Socket.io dependencies
- [ ] Create `multiplayer-server/src/server.ts` main server setup
- [ ] Create `multiplayer-server/src/handlers/room.ts` room management handlers
- [ ] Create `multiplayer-server/src/handlers/game.ts` game logic handlers
- [ ] Create `multiplayer-server/src/models/Room.ts` room data structure
- [ ] Create `multiplayer-server/src/models/Player.ts` player data structure  
- [ ] Create `multiplayer-server/src/models/Game.ts` game state management
- [ ] Create `multiplayer-server/src/utils/gameLogic.ts` shared game calculations
- [ ] Create `multiplayer-server/src/utils/validation.ts` input validation
- [ ] Create `multiplayer-server/Dockerfile` for containerization
- [ ] Create `multiplayer-server/docker-compose.yml` for development

## Database Schema

- [ ] Create database migration for `rooms` table
- [ ] Create database migration for `game_sessions` table  
- [ ] Create database migration for `player_stats` table
- [ ] Add database connection configuration to multiplayer server
- [ ] Implement database models matching schema design

## Frontend Services

- [ ] Create `src/services/multiplayerService.ts` WebSocket client integration
- [ ] Create `src/services/roomService.ts` room management API calls
- [ ] Add environment variable `VITE_MULTIPLAYER_SERVER_URL` configuration
- [ ] Implement connection management and error handling
- [ ] Add WebSocket event listeners and handlers

## State Management

- [ ] Create `src/stores/multiplayerStore.ts` Zustand store
- [ ] Implement connection state management
- [ ] Implement room state management  
- [ ] Implement game state synchronization
- [ ] Add player data and score tracking
- [ ] Implement round results and voting state

## UI Components - Room Management

- [ ] Create `src/components/multiplayer/` directory
- [ ] Create `src/components/multiplayer/CreateRoomModal.tsx` 
- [ ] Create `src/components/multiplayer/JoinRoomModal.tsx`
- [ ] Create `src/components/multiplayer/RoomLobby.tsx`
- [ ] Create `src/components/multiplayer/RoomInfo.tsx`
- [ ] Create `src/components/multiplayer/PlayerList.tsx`
- [ ] Create `src/components/multiplayer/RoomSettings.tsx`
- [ ] Create `src/components/multiplayer/ShareableLink.tsx`
- [ ] Create `src/components/multiplayer/DifficultySelector.tsx`
- [ ] Create `src/components/multiplayer/RoundLimitSelector.tsx`

## UI Components - Game Interface

- [ ] Create `src/components/multiplayer/MultiplayerGame.tsx`
- [ ] Create `src/components/multiplayer/GameHeader.tsx`
- [ ] Create `src/components/multiplayer/RoundCounter.tsx`
- [ ] Create `src/components/multiplayer/ScoreComparison.tsx`
- [ ] Create `src/components/multiplayer/OpponentStatus.tsx`
- [ ] Create `src/components/multiplayer/GameFooter.tsx`
- [ ] Create `src/components/multiplayer/SubmitGuessButton.tsx`
- [ ] Create `src/components/multiplayer/WaitingIndicator.tsx`
- [ ] Create `src/components/multiplayer/GuessMarkers.tsx`

## UI Components - Game Results

- [ ] Create `src/components/multiplayer/RoundResults.tsx`
- [ ] Create `src/components/multiplayer/CityInfo.tsx`
- [ ] Create `src/components/multiplayer/GuessComparison.tsx`
- [ ] Create `src/components/multiplayer/ScoreUpdate.tsx`
- [ ] Create `src/components/multiplayer/GameOver.tsx`
- [ ] Create `src/components/multiplayer/WinnerAnnouncement.tsx`
- [ ] Create `src/components/multiplayer/FinalScores.tsx`
- [ ] Create `src/components/multiplayer/PlayAgainVoting.tsx`

## Routing & Navigation

- [ ] Add multiplayer routes to `src/App.tsx`
- [ ] Create `/multiplayer/create` route for room creation
- [ ] Create `/multiplayer/join/:roomId` route for joining rooms
- [ ] Create `/multiplayer/lobby/:roomId` route for room lobby
- [ ] Create `/multiplayer/game/:roomId` route for active games
- [ ] Add "Multiplayer" button to main menu in `src/pages/Index.tsx`

## Map Integration

- [ ] Extend `src/components/Map.tsx` for multiplayer support
- [ ] Add opponent guess marker rendering
- [ ] Implement simultaneous guess visualization
- [ ] Add connection status overlay on map
- [ ] Ensure existing vibrant country coloring works in multiplayer

## Game Logic Integration

- [ ] Extend `src/lib/geo.ts` for multiplayer calculations
- [ ] Add shared scoring logic between client and server
- [ ] Implement round timing and synchronization
- [ ] Add play-again game state reset functionality
- [ ] Ensure city selection works with difficulty levels from `src/data/cities.ts`

## Real-Time Features

- [ ] Implement live score updates during gameplay
- [ ] Add real-time connection status indicators
- [ ] Implement graceful disconnection/reconnection handling
- [ ] Add game state synchronization between players
- [ ] Implement timeout handling for inactive players

## Security & Validation

- [ ] Add input validation for room codes and player names
- [ ] Implement rate limiting on guess submissions
- [ ] Add server-side validation of all game actions
- [ ] Implement geographic bounds checking for guesses
- [ ] Add anti-cheat measures for timing and scoring

## Testing

- [ ] Add unit tests for `multiplayerService.ts`
- [ ] Add unit tests for `multiplayerStore.ts` 
- [ ] Add component tests for key multiplayer UI components
- [ ] Add integration tests for WebSocket event handling
- [ ] Add end-to-end tests for complete multiplayer flow

## Configuration & Deployment

- [ ] Add multiplayer server environment variables
- [ ] Update main `Dockerfile` to include multiplayer server option
- [ ] Create separate Docker container for multiplayer server
- [ ] Update `docker-compose.yml` for full stack deployment
- [ ] Add nginx configuration for WebSocket proxy

## Documentation

- [ ] Update `README.md` with multiplayer setup instructions
- [ ] Add multiplayer server deployment guide
- [ ] Document WebSocket event specifications
- [ ] Add troubleshooting guide for common multiplayer issues
- [ ] Update `docs/overview.md` with multiplayer architecture

## Error Handling

- [ ] Implement graceful fallbacks when multiplayer server unavailable
- [ ] Add error boundaries for multiplayer components
- [ ] Implement user-friendly error messages for connection issues
- [ ] Add retry logic for failed WebSocket connections
- [ ] Handle edge cases for player disconnections during games
