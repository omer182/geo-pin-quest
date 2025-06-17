import { Player as SharedPlayer } from '@geo-pin-quest/shared';

// Extended Player interface for backend with additional state
export interface ExtendedPlayer extends SharedPlayer {
  socketId: string;
  lastActivity: Date;
  roomId?: string | undefined;
}

// Player manager class for handling player state
export class PlayerManager {
  private player: ExtendedPlayer;

  constructor(basePlayer: SharedPlayer, socketId: string) {
    this.player = {
      ...basePlayer,
      socketId,
      lastActivity: new Date(),
      roomId: undefined
    };
  }

  // Update player activity timestamp
  updateActivity(): void {
    this.player.lastActivity = new Date();
  }

  // Set room ID for the player
  setRoom(roomId: string): void {
    this.player.roomId = roomId;
  }

  // Remove player from room
  leaveRoom(): void {
    this.player.roomId = undefined;
  }

  // Update connection status
  setConnectionStatus(status: 'connected' | 'disconnected'): void {
    this.player.connectionStatus = status;
    this.updateActivity();
  }

  // Update ready status
  setReady(ready: boolean): void {
    this.player.isReady = ready;
    this.updateActivity();
  }

  // Update player name
  setName(name: string): void {
    if (name && name.trim().length > 0 && name.length <= 20) {
      this.player.name = name.trim();
      this.updateActivity();
    }
  }

  // Add score for a round
  addScore(score: number): void {
    this.player.scores.push(score);
    this.player.totalScore = this.player.scores.reduce((sum, s) => sum + s, 0);
    this.updateActivity();
  }

  // Reset scores
  resetScores(): void {
    this.player.scores = [];
    this.player.totalScore = 0;
    this.updateActivity();
  }

  // Check if player has been inactive
  isInactive(timeoutMs: number = 300000): boolean { // 5 minutes default
    return Date.now() - this.player.lastActivity.getTime() > timeoutMs;
  }

  // Get player data
  getPlayer(): ExtendedPlayer {
    return this.player;
  }

  // Get player data without extended properties (for client)
  getClientPlayer(): SharedPlayer {
    return {
      id: this.player.id,
      name: this.player.name,
      isHost: this.player.isHost,
      isReady: this.player.isReady,
      connectionStatus: this.player.connectionStatus,
      scores: this.player.scores,
      totalScore: this.player.totalScore
    };
  }
}
