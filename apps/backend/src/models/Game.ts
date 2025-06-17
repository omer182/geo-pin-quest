import { GameState, City, Guess, RoundResult } from '@geo-pin-quest/shared';
import { getRandomCityByDifficulty } from '../utils/cities';

// Game manager class for handling game logic
export class GameManager {
  private gameState: GameState;
  private roomId: string;
  private difficulty: number;
  private roundTimeLimit: number = 30; // seconds

  constructor(roomId: string, difficulty: number, totalRounds: number) {
    this.roomId = roomId;
    this.difficulty = difficulty;
    this.gameState = {
      phase: 'lobby',
      currentRound: 0,
      totalRounds,
      currentCity: null,
      roundStartTime: null,
      roundTimeLimit: this.roundTimeLimit,
      hostGuess: null,
      opponentGuess: null,
      roundResults: [],
      winner: null,
      playAgainVotes: {
        host: null,
        opponent: null
      }
    };
  }

  // Start a new game
  startGame(): City {
    this.gameState.phase = 'playing';
    this.gameState.currentRound = 1;
    return this.startNewRound();
  }

  // Start a new round
  startNewRound(): City {
    const city = getRandomCityByDifficulty(this.difficulty);
    
    this.gameState.currentCity = city;
    this.gameState.roundStartTime = new Date();
    this.gameState.hostGuess = null;
    this.gameState.opponentGuess = null;

    return city;
  }

  // Submit a guess for a player
  submitGuess(playerId: string, isHost: boolean, guess: Guess): boolean {
    if (this.gameState.phase !== 'playing') {
      return false;
    }

    // Check if player already submitted
    if (isHost && this.gameState.hostGuess) {
      return false;
    }
    if (!isHost && this.gameState.opponentGuess) {
      return false;
    }

    // Store the guess
    if (isHost) {
      this.gameState.hostGuess = guess;
    } else {
      this.gameState.opponentGuess = guess;
    }

    return true;
  }

  // Check if both players have submitted guesses
  bothPlayersSubmitted(): boolean {
    return this.gameState.hostGuess !== null && this.gameState.opponentGuess !== null;
  }

  // Finish the current round and calculate results
  finishRound(): RoundResult {
    if (!this.gameState.currentCity) {
      throw new Error('No current city to finish round');
    }

    const city = this.gameState.currentCity;
    let hostScore = 0;
    let opponentScore = 0;

    // Calculate scores
    if (this.gameState.hostGuess) {
      const distance = this.calculateDistance(
        this.gameState.hostGuess.lat,
        this.gameState.hostGuess.lng,
        city.lat,
        city.lng
      );
      hostScore = this.calculateScore(distance);
      this.gameState.hostGuess.distance = distance;
      this.gameState.hostGuess.score = hostScore;
    }

    if (this.gameState.opponentGuess) {
      const distance = this.calculateDistance(
        this.gameState.opponentGuess.lat,
        this.gameState.opponentGuess.lng,
        city.lat,
        city.lng
      );
      opponentScore = this.calculateScore(distance);
      this.gameState.opponentGuess.distance = distance;
      this.gameState.opponentGuess.score = opponentScore;
    }

    // Create round result
    const roundResult: RoundResult = {
      roundNumber: this.gameState.currentRound,
      city,
      hostGuess: this.gameState.hostGuess || { lat: 0, lng: 0, timestamp: new Date(), distance: 0, score: 0 },
      opponentGuess: this.gameState.opponentGuess || { lat: 0, lng: 0, timestamp: new Date(), distance: 0, score: 0 },
      hostScore,
      opponentScore,
      completedAt: new Date()
    };

    // Add to results
    this.gameState.roundResults.push(roundResult);
    this.gameState.phase = 'round-results';

    return roundResult;
  }

  // Advance to next round or end game
  advanceGame(): City | null {
    if (this.gameState.currentRound >= this.gameState.totalRounds) {
      return this.endGame();
    }

    this.gameState.currentRound++;
    return this.startNewRound();
  }

  // End the game and determine winner
  endGame(): null {
    // Calculate total scores
    const hostTotalScore = this.gameState.roundResults.reduce((sum, result) => sum + result.hostScore, 0);
    const opponentTotalScore = this.gameState.roundResults.reduce((sum, result) => sum + result.opponentScore, 0);

    // Determine winner
    if (hostTotalScore > opponentTotalScore) {
      this.gameState.winner = 'host';
    } else if (opponentTotalScore > hostTotalScore) {
      this.gameState.winner = 'opponent';
    } else {
      this.gameState.winner = null; // Tie
    }

    this.gameState.phase = 'game-over';
    return null;
  }

  // Vote for play again
  votePlayAgain(isHost: boolean, vote: boolean): void {
    if (isHost) {
      this.gameState.playAgainVotes.host = vote;
    } else {
      this.gameState.playAgainVotes.opponent = vote;
    }
  }

  // Check if both players want to play again
  bothVotedPlayAgain(): boolean {
    return this.gameState.playAgainVotes.host === true && 
           this.gameState.playAgainVotes.opponent === true;
  }

  // Check if play again voting is complete
  playAgainVotingComplete(): boolean {
    return this.gameState.playAgainVotes.host !== null && 
           this.gameState.playAgainVotes.opponent !== null;
  }

  // Reset game for play again
  resetGame(): void {
    this.gameState = {
      phase: 'lobby',
      currentRound: 0,
      totalRounds: this.gameState.totalRounds,
      currentCity: null,
      roundStartTime: null,
      roundTimeLimit: this.roundTimeLimit,
      hostGuess: null,
      opponentGuess: null,
      roundResults: [],
      winner: null,
      playAgainVotes: {
        host: null,
        opponent: null
      }
    };
  }

  // Get current game state
  getGameState(): GameState {
    return { ...this.gameState };
  }

  // Get current phase
  getPhase(): string {
    return this.gameState.phase;
  }

  // Get current round number
  getCurrentRound(): number {
    return this.gameState.currentRound;
  }

  // Get total rounds
  getTotalRounds(): number {
    return this.gameState.totalRounds;
  }

  // Check if game is in progress
  isInProgress(): boolean {
    return this.gameState.phase === 'playing' || this.gameState.phase === 'round-results';
  }

  // Check if game is complete
  isComplete(): boolean {
    return this.gameState.phase === 'game-over';
  }

  // Get round end time (for frontend timer)
  getRoundEndTime(): number | null {
    if (!this.gameState.roundStartTime) return null;
    return this.gameState.roundStartTime.getTime() + (this.roundTimeLimit * 1000);
  }

  // Private helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  private calculateScore(distance: number): number {
    const maxDistance = 20000; // 20,000 km maximum distance for scoring
    const maxScore = 5000;
    
    if (distance >= maxDistance) return 0;
    return Math.round(maxScore * (1 - distance / maxDistance));
  }
}
