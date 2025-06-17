# Implementation Plan: Multiplayer 1v1 Feature (Monorepo Structure)

## 📊 Progress Summary
**✅ COMPLETED**: Backend Infrastructure, Database Schema, Shared Types, Frontend Services, State Management, UI Components  
**🔄 IN PROGRESS**: Routing & Navigation  
**⏳ PENDING**: Map Integration, Testing, Deployment  

**Current Status**: All 25 UI components implemented and building successfully. Game flow uses individual component state for guesses rather than global store. Ready for routing integration and map enhancements.

**Build Status**: ✅ All packages compile without TypeScript errors

## ✅ Dependencies (COMPLETED)
- [x] Add `socket.io-client` for WebSocket client connection
- [x] Add `zustand` for multiplayer state management  
- [x] Add `nanoid` for generating unique room codes
- [x] Add `uuid` for player IDs
- [x] Set up monorepo workspace structure with `apps/frontend`, `apps/backend`, `shared`

## ✅ Group 1: Shared Package Setup (COMPLETED)
- [x] Create shared types in `shared/src/types.ts`
- [x] Create shared utilities in `shared/src/utils.ts`
- [x] Build shared package for consumption by frontend and backend

## ✅ Group 2: Backend Infrastructure (COMPLETED)
- [x] Create `apps/backend/src/server.ts` main server setup
- [x] Create `apps/backend/src/handlers/room.ts` room management handlers
- [x] Create `apps/backend/src/handlers/game.ts` game logic handlers
- [x] Create `apps/backend/src/models/Room.ts` room data structure
- [x] Create `apps/backend/src/models/Player.ts` player data structure  
- [x] Create `apps/backend/src/models/Game.ts` game state management
- [x] Create `apps/backend/src/utils/cities.ts` cities data and difficulty mapping
- [x] Create `apps/backend/src/utils/gameLogic.ts` shared game calculations
- [x] Create `apps/backend/src/utils/validation.ts` input validation

## ✅ Group 3: Database Schema (COMPLETED)
- [x] Create `apps/backend/src/database/connection.ts` database connection and schema
- [x] Create database initialization script for game_history, player_stats, round_history tables
- [x] Add database models matching schema design
- [x] Install SQLite dependencies (sqlite, sqlite3)

## ✅ Group 4: Frontend Services (COMPLETED)
- [x] Create `apps/frontend/src/services/websocket.ts` WebSocket client service
- [x] Create `apps/frontend/src/config/environment.ts` environment configuration
- [x] Create `apps/frontend/src/hooks/useWebSocket.ts` React hooks for WebSocket integration
- [x] Implement connection management, reconnection logic, and error handling
- [x] Add WebSocket event listeners and handlers for all multiplayer events
- [x] Install Socket.io client dependencies

## ✅ Group 5: State Management (COMPLETED)
- [x] Create `apps/frontend/src/stores/multiplayerStore.ts` Zustand store
- [x] Create `apps/frontend/src/services/multiplayerIntegration.ts` WebSocket-Store integration
- [x] Implement connection state management
- [x] Implement room state management  
- [x] Implement game state synchronization
- [x] Add player data and score tracking
- [x] Implement round results and voting state
- [x] Add UI state management with notifications
- [x] Install Zustand dependencies

## ✅ Group 6: UI Components (COMPLETED)
- [x] Create `src/components/multiplayer/` directory
- [x] Create `src/components/multiplayer/CreateRoomModal.tsx` 
- [x] Create `src/components/multiplayer/JoinRoomModal.tsx`
- [x] Create `src/components/multiplayer/RoomLobby.tsx`
- [x] Create `src/components/multiplayer/PlayerList.tsx`
- [x] Create `src/components/multiplayer/RoomSettings.tsx`
- [x] Create `src/components/multiplayer/ShareableLink.tsx`
- [x] Create `src/components/multiplayer/DifficultySelector.tsx`
- [x] Create `src/components/multiplayer/RoundLimitSelector.tsx`
- [x] Create `src/components/multiplayer/MultiplayerGame.tsx`
- [x] Create `src/components/multiplayer/GameHeader.tsx`
- [x] Create `src/components/multiplayer/RoundCounter.tsx`
- [x] Create `src/components/multiplayer/ScoreComparison.tsx`
- [x] Create `src/components/multiplayer/OpponentStatus.tsx`
- [x] Create `src/components/multiplayer/GameFooter.tsx` (utility component)
- [x] Create `src/components/multiplayer/SubmitGuessButton.tsx` (prop-based)
- [x] Create `src/components/multiplayer/WaitingIndicator.tsx`
- [x] Create `src/components/multiplayer/GuessMarkers.tsx`
- [x] Create `src/components/multiplayer/RoundResults.tsx`
- [x] Create `src/components/multiplayer/CityInfo.tsx`
- [x] Create `src/components/multiplayer/GuessComparison.tsx`
- [x] Create `src/components/multiplayer/ScoreUpdate.tsx`
- [x] Create `src/components/multiplayer/GameOver.tsx`
- [x] Create `src/components/multiplayer/WinnerAnnouncement.tsx`
- [x] Create `src/components/multiplayer/FinalScores.tsx`
- [x] Create `src/components/multiplayer/PlayAgainVoting.tsx`

**Architecture Note**: Game state uses individual component state for temporary guesses rather than global store. The store only tracks submitted guesses and game phases, following proper turn-based multiplayer patterns.

## 🔄 Group 7: Routing & Navigation (IN PROGRESS)

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
