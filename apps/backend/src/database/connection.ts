import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Database interfaces matching the schema design
export interface GameHistoryRecord {
  id: number;
  room_id: string;
  host_player_id: string;
  opponent_player_id: string;
  difficulty: number;
  total_rounds: number;
  host_total_score: number;
  opponent_total_score: number;
  winner_player_id: string | null;
  started_at: string;
  completed_at: string;
}

export interface PlayerStatsRecord {
  id: number;
  player_id: string;
  player_name: string;
  games_played: number;
  games_won: number;
  total_score: number;
  best_round_score: number;
  average_accuracy: number;
  last_played: string;
  created_at: string;
}

export interface RoundHistoryRecord {
  id: number;
  game_id: number;
  round_number: number;
  city_name: string;
  city_country: string;
  city_lat: number;
  city_lng: number;
  host_guess_lat: number | null;
  host_guess_lng: number | null;
  host_distance: number | null;
  host_score: number;
  opponent_guess_lat: number | null;
  opponent_guess_lng: number | null;
  opponent_distance: number | null;
  opponent_score: number;
  round_completed_at: string;
}

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

// Initialize database connection
export async function initializeDatabase(dbPath: string = './data/multiplayer.db'): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`📊 Connected to SQLite database: ${dbPath}`);
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Create tables
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Create database tables
async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  console.log('📋 Creating database tables...');

  // Game history table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS game_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      host_player_id TEXT NOT NULL,
      opponent_player_id TEXT NOT NULL,
      difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
      total_rounds INTEGER NOT NULL,
      host_total_score INTEGER NOT NULL DEFAULT 0,
      opponent_total_score INTEGER NOT NULL DEFAULT 0,
      winner_player_id TEXT,
      started_at DATETIME NOT NULL,
      completed_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Player statistics table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS player_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT NOT NULL UNIQUE,
      player_name TEXT NOT NULL,
      games_played INTEGER NOT NULL DEFAULT 0,
      games_won INTEGER NOT NULL DEFAULT 0,
      total_score INTEGER NOT NULL DEFAULT 0,
      best_round_score INTEGER NOT NULL DEFAULT 0,
      average_accuracy REAL NOT NULL DEFAULT 0.0,
      last_played DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Round history table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS round_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      round_number INTEGER NOT NULL,
      city_name TEXT NOT NULL,
      city_country TEXT NOT NULL,
      city_lat REAL NOT NULL,
      city_lng REAL NOT NULL,
      host_guess_lat REAL,
      host_guess_lng REAL,
      host_distance REAL,
      host_score INTEGER NOT NULL DEFAULT 0,
      opponent_guess_lat REAL,
      opponent_guess_lng REAL,
      opponent_distance REAL,
      opponent_score INTEGER NOT NULL DEFAULT 0,
      round_completed_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES game_history (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_game_history_room_id ON game_history (room_id);
    CREATE INDEX IF NOT EXISTS idx_game_history_players ON game_history (host_player_id, opponent_player_id);
    CREATE INDEX IF NOT EXISTS idx_game_history_completed ON game_history (completed_at);
    CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats (player_id);
    CREATE INDEX IF NOT EXISTS idx_player_stats_games_won ON player_stats (games_won DESC);
    CREATE INDEX IF NOT EXISTS idx_round_history_game_id ON round_history (game_id);
    CREATE INDEX IF NOT EXISTS idx_round_history_round_number ON round_history (game_id, round_number);
  `);

  console.log('✅ Database tables created successfully');
}

// Get database connection
export function getDatabase(): Database<sqlite3.Database, sqlite3.Statement> {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

// Close database connection
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('📊 Database connection closed');
  }
}

// Save game result to database
export async function saveGameResult(
  roomId: string,
  hostPlayerId: string,
  opponentPlayerId: string,
  difficulty: number,
  totalRounds: number,
  hostTotalScore: number,
  opponentTotalScore: number,
  winnerPlayerId: string | null,
  startedAt: Date,
  completedAt: Date,
  roundResults: any[]
): Promise<number> {
  const database = getDatabase();
  
  try {
    await database.run('BEGIN TRANSACTION');

    // Insert game record
    const gameResult = await database.run(`
      INSERT INTO game_history (
        room_id, host_player_id, opponent_player_id, difficulty, 
        total_rounds, host_total_score, opponent_total_score, 
        winner_player_id, started_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      roomId, hostPlayerId, opponentPlayerId, difficulty,
      totalRounds, hostTotalScore, opponentTotalScore,
      winnerPlayerId, startedAt.toISOString(), completedAt.toISOString()
    ]);

    const gameId = gameResult.lastID!;

    // Insert round records
    for (const round of roundResults) {
      await database.run(`
        INSERT INTO round_history (
          game_id, round_number, city_name, city_country, city_lat, city_lng,
          host_guess_lat, host_guess_lng, host_distance, host_score,
          opponent_guess_lat, opponent_guess_lng, opponent_distance, opponent_score,
          round_completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        gameId, round.roundNumber, round.city.name, round.city.country,
        round.city.lat, round.city.lng,
        round.hostGuess?.lat, round.hostGuess?.lng, round.hostGuess?.distance, round.hostScore,
        round.opponentGuess?.lat, round.opponentGuess?.lng, round.opponentGuess?.distance, round.opponentScore,
        round.completedAt.toISOString()
      ]);
    }

    await database.run('COMMIT');
    console.log(`💾 Game ${gameId} saved to database`);
    
    return gameId;
  } catch (error) {
    await database.run('ROLLBACK');
    console.error('❌ Failed to save game result:', error);
    throw error;
  }
}

// Update player statistics
export async function updatePlayerStats(
  playerId: string,
  playerName: string,
  isWinner: boolean,
  totalScore: number,
  bestRoundScore: number,
  averageAccuracy: number
): Promise<void> {
  const database = getDatabase();
  
  try {
    // Check if player exists
    const existingPlayer = await database.get(
      'SELECT * FROM player_stats WHERE player_id = ?',
      [playerId]
    );

    if (existingPlayer) {
      // Update existing player
      await database.run(`
        UPDATE player_stats SET
          player_name = ?,
          games_played = games_played + 1,
          games_won = games_won + ?,
          total_score = total_score + ?,
          best_round_score = MAX(best_round_score, ?),
          average_accuracy = (average_accuracy * games_played + ?) / (games_played + 1),
          last_played = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE player_id = ?
      `, [playerName, isWinner ? 1 : 0, totalScore, bestRoundScore, averageAccuracy, playerId]);
    } else {
      // Create new player
      await database.run(`
        INSERT INTO player_stats (
          player_id, player_name, games_played, games_won,
          total_score, best_round_score, average_accuracy, last_played
        ) VALUES (?, ?, 1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [playerId, playerName, isWinner ? 1 : 0, totalScore, bestRoundScore, averageAccuracy]);
    }

    console.log(`📈 Player stats updated for ${playerId}`);
  } catch (error) {
    console.error('❌ Failed to update player stats:', error);
    throw error;
  }
}

// Get player statistics
export async function getPlayerStats(playerId: string): Promise<PlayerStatsRecord | null> {
  const database = getDatabase();
  
  try {
    const stats = await database.get(
      'SELECT * FROM player_stats WHERE player_id = ?',
      [playerId]
    );
    
    return stats || null;
  } catch (error) {
    console.error('❌ Failed to get player stats:', error);
    return null;
  }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 10): Promise<PlayerStatsRecord[]> {
  const database = getDatabase();
  
  try {
    const leaderboard = await database.all(`
      SELECT * FROM player_stats 
      WHERE games_played > 0 
      ORDER BY games_won DESC, total_score DESC, average_accuracy DESC 
      LIMIT ?
    `, [limit]);
    
    return leaderboard;
  } catch (error) {
    console.error('❌ Failed to get leaderboard:', error);
    return [];
  }
}

// Get game history for a player
export async function getPlayerGameHistory(playerId: string, limit: number = 20): Promise<GameHistoryRecord[]> {
  const database = getDatabase();
  
  try {
    const history = await database.all(`
      SELECT * FROM game_history 
      WHERE host_player_id = ? OR opponent_player_id = ?
      ORDER BY completed_at DESC 
      LIMIT ?
    `, [playerId, playerId, limit]);
    
    return history;
  } catch (error) {
    console.error('❌ Failed to get player game history:', error);
    return [];
  }
}
