import { Room as SharedRoom, Player as SharedPlayer, GameState, City, Guess, RoundResult } from '@geo-pin-quest/shared';

// Extended Room interface for backend with game state
export interface ExtendedRoom extends SharedRoom {
  game?: ExtendedGameState;
  players: SharedPlayer[]; // Helper property to get both host and opponent
}

// Extended GameState interface for backend game management
export interface ExtendedGameState extends GameState {
  guesses: { [playerId: string]: Guess };
  roundEndTime: number | null;
  scores: { [playerId: string]: number };
  gamePlayAgainVotes: { [playerId: string]: boolean | null };
}

// Room class for managing room state
export class RoomManager {
  private room: ExtendedRoom;
  private activeGuesses: Map<string, Guess> = new Map();
  
  constructor(baseRoom: SharedRoom) {
    this.room = {
      ...baseRoom,
      players: [], // Will be populated by getPlayers()
      game: {
        phase: 'lobby',
        currentRound: 0,
        totalRounds: baseRoom.roundLimit,
        currentCity: null,
        roundStartTime: null,
        roundTimeLimit: 30, // seconds
        hostGuess: null,
        opponentGuess: null,
        roundResults: [],
        winner: null,
        playAgainVotes: {
          host: null,
          opponent: null
        },
        guesses: {},
        roundEndTime: null,
        scores: {},
        gamePlayAgainVotes: {}
      }
    };
  }

  // Get all players in the room
  getPlayers(activePlayers: Map<string, SharedPlayer>): SharedPlayer[] {
    const players: SharedPlayer[] = [];
    
    const host = activePlayers.get(this.room.hostId);
    if (host) players.push(host);
    
    if (this.room.opponentId) {
      const opponent = activePlayers.get(this.room.opponentId);
      if (opponent) players.push(opponent);
    }
    
    return players;
  }

  // Get room with current players
  getRoomWithPlayers(activePlayers: Map<string, SharedPlayer>): ExtendedRoom {
    return {
      ...this.room,
      players: this.getPlayers(activePlayers)
    };
  }

  // Initialize game state
  initializeGame(activePlayers: Map<string, SharedPlayer>): void {
    const players = this.getPlayers(activePlayers);
    
    // Initialize scores and votes for all players
    players.forEach(player => {
      if (this.room.game) {
        this.room.game.scores[player.id] = 0;
        this.room.game.gamePlayAgainVotes[player.id] = null;
      }
    });

    // Update room status
    this.room.status = 'playing';
    this.room.updatedAt = new Date();
    
    if (this.room.game) {
      this.room.game.phase = 'playing';
      this.room.game.currentRound = 1;
    }
  }

  // Start a new round
  startRound(city: City): void {
    if (!this.room.game) return;

    this.room.game.currentCity = city;
    this.room.game.roundStartTime = new Date();
    this.room.game.roundEndTime = Date.now() + (this.room.game.roundTimeLimit * 1000);
    this.room.game.hostGuess = null;
    this.room.game.opponentGuess = null;
    this.room.game.guesses = {};
    this.activeGuesses.clear();
  }

  // Submit a guess for a player
  submitGuess(playerId: string, guess: Guess): boolean {
    if (!this.room.game || this.room.game.phase !== 'playing') {
      return false;
    }

    // Check if player already submitted
    if (this.activeGuesses.has(playerId)) {
      return false;
    }

    // Store the guess
    this.activeGuesses.set(playerId, guess);
    this.room.game.guesses[playerId] = guess;

    // Update the specific guess in game state
    if (playerId === this.room.hostId) {
      this.room.game.hostGuess = guess;
    } else if (playerId === this.room.opponentId) {
      this.room.game.opponentGuess = guess;
    }

    return true;
  }

  // Check if all players have submitted guesses
  allPlayersSubmitted(activePlayers: Map<string, SharedPlayer>): boolean {
    const players = this.getPlayers(activePlayers);
    return players.every(player => this.activeGuesses.has(player.id));
  }

  // Finish the current round and calculate results
  finishRound(activePlayers: Map<string, SharedPlayer>): RoundResult | null {
    if (!this.room.game || !this.room.game.currentCity) return null;

    const players = this.getPlayers(activePlayers);
    const city = this.room.game.currentCity;
    
    // Calculate scores for host and opponent
    let hostScore = 0;
    let opponentScore = 0;
    let hostGuess: Guess | null = null;
    let opponentGuess: Guess | null = null;

    const hostPlayer = players.find(p => p.id === this.room.hostId);
    const opponentPlayer = players.find(p => p.id === this.room.opponentId);

    if (hostPlayer) {
      hostGuess = this.activeGuesses.get(hostPlayer.id) || null;
      if (hostGuess) {
        const distance = this.calculateDistance(hostGuess.lat, hostGuess.lng, city.lat, city.lng);
        hostScore = this.calculateScore(distance);
        hostGuess.distance = distance;
        hostGuess.score = hostScore;
      }
    }

    if (opponentPlayer) {
      opponentGuess = this.activeGuesses.get(opponentPlayer.id) || null;
      if (opponentGuess) {
        const distance = this.calculateDistance(opponentGuess.lat, opponentGuess.lng, city.lat, city.lng);
        opponentScore = this.calculateScore(distance);
        opponentGuess.distance = distance;
        opponentGuess.score = opponentScore;
      }
    }

    // Create round result
    const roundResult: RoundResult = {
      roundNumber: this.room.game.currentRound,
      city,
      hostGuess: hostGuess || { lat: 0, lng: 0, timestamp: new Date(), distance: 0, score: 0 },
      opponentGuess: opponentGuess || { lat: 0, lng: 0, timestamp: new Date(), distance: 0, score: 0 },
      hostScore,
      opponentScore,
      completedAt: new Date()
    };

    // Update total scores
    if (this.room.hostId) {
      this.room.game.scores[this.room.hostId] = (this.room.game.scores[this.room.hostId] || 0) + hostScore;
    }
    if (this.room.opponentId) {
      this.room.game.scores[this.room.opponentId] = (this.room.game.scores[this.room.opponentId] || 0) + opponentScore;
    }

    // Add to round results
    this.room.game.roundResults.push(roundResult);

    // Update game phase
    this.room.game.phase = 'round-results';

    return roundResult;
  }

  // Check if game is complete
  isGameComplete(): boolean {
    return this.room.game ? this.room.game.currentRound >= this.room.game.totalRounds : false;
  }

  // End the game and determine winner
  endGame(activePlayers: Map<string, SharedPlayer>): void {
    if (!this.room.game) return;

    const players = this.getPlayers(activePlayers);
    let winner: string | null = null;

    // Determine winner based on total scores
    const hostScore = this.room.game.scores[this.room.hostId] || 0;
    const opponentScore = this.room.game.scores[this.room.opponentId || ''] || 0;

    if (hostScore > opponentScore) {
      winner = this.room.hostId;
    } else if (opponentScore > hostScore) {
      winner = this.room.opponentId || null;
    }
    // If scores are equal, winner remains null (tie)

    this.room.game.winner = winner;
    this.room.game.phase = 'game-over';
    this.room.status = 'finished';
    this.room.updatedAt = new Date();
  }

  // Vote for play again
  votePlayAgain(playerId: string, vote: boolean): void {
    if (!this.room.game) return;

    this.room.game.gamePlayAgainVotes[playerId] = vote;

    // Also update the structured votes
    if (playerId === this.room.hostId) {
      this.room.game.playAgainVotes.host = vote;
    } else if (playerId === this.room.opponentId) {
      this.room.game.playAgainVotes.opponent = vote;
    }
  }

  // Check if all players voted for play again
  canPlayAgain(activePlayers: Map<string, SharedPlayer>): boolean {
    if (!this.room.game) return false;

    const players = this.getPlayers(activePlayers);
    const allVoted = players.every(player => 
      this.room.game!.gamePlayAgainVotes[player.id] !== null
    );
    
    if (!allVoted) return false;

    const allVotedYes = players.every(player => 
      this.room.game!.gamePlayAgainVotes[player.id] === true
    );

    return allVotedYes;
  }

  // Reset game for play again
  resetGame(): void {
    if (!this.room.game) return;

    this.room.game.phase = 'lobby';
    this.room.game.currentRound = 0;
    this.room.game.currentCity = null;
    this.room.game.roundStartTime = null;
    this.room.game.roundEndTime = null;
    this.room.game.hostGuess = null;
    this.room.game.opponentGuess = null;
    this.room.game.roundResults = [];
    this.room.game.winner = null;
    this.room.game.guesses = {};
    this.room.game.gamePlayAgainVotes = {};
    this.room.game.playAgainVotes = { host: null, opponent: null };

    // Reset scores
    Object.keys(this.room.game.scores).forEach(playerId => {
      this.room.game!.scores[playerId] = 0;
    });

    this.room.status = 'waiting';
    this.room.currentRound = 0;
    this.room.updatedAt = new Date();
    this.activeGuesses.clear();
  }

  // Get the room data
  getRoom(): ExtendedRoom {
    return this.room;
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
