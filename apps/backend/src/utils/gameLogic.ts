import { Room, Player, RoundResult, Guess, City } from '@geo-pin-quest/shared';

// Shared game calculation utilities used by both frontend and backend

/**
 * Calculate distance between two geographic points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

/**
 * Calculate score based on distance from correct location
 * @param distance Distance in kilometers from correct location
 * @returns Score between 0 and 5000
 */
export function calculateScore(distance: number): number {
  const maxDistance = 20000; // 20,000 km maximum distance for scoring
  const maxScore = 5000;
  
  if (distance >= maxDistance) return 0;
  return Math.round(maxScore * (1 - distance / maxDistance));
}

/**
 * Calculate accuracy percentage based on distance
 * @param distance Distance in kilometers from correct location
 * @returns Accuracy percentage (0-100)
 */
export function calculateAccuracy(distance: number): number {
  const maxDistance = 20000; // Maximum meaningful distance
  if (distance >= maxDistance) return 0;
  return Math.round((1 - distance / maxDistance) * 100);
}

/**
 * Determine if a guess is considered "excellent" (within 50km)
 * @param distance Distance in kilometers
 * @returns True if excellent guess
 */
export function isExcellentGuess(distance: number): boolean {
  return distance <= 50;
}

/**
 * Determine if a guess is considered "good" (within 200km)
 * @param distance Distance in kilometers
 * @returns True if good guess
 */
export function isGoodGuess(distance: number): boolean {
  return distance <= 200;
}

/**
 * Determine if a guess is considered "fair" (within 1000km)
 * @param distance Distance in kilometers
 * @returns True if fair guess
 */
export function isFairGuess(distance: number): boolean {
  return distance <= 1000;
}

/**
 * Get a descriptive label for guess quality based on distance
 * @param distance Distance in kilometers
 * @returns Quality label
 */
export function getGuessQuality(distance: number): 'Perfect' | 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (distance <= 1) return 'Perfect';
  if (distance <= 50) return 'Excellent';
  if (distance <= 200) return 'Good';
  if (distance <= 1000) return 'Fair';
  return 'Poor';
}

/**
 * Calculate time bonus for quick submissions
 * @param submissionTime Time in seconds when guess was submitted
 * @param roundTimeLimit Total time limit for the round in seconds
 * @returns Bonus score (0-500)
 */
export function calculateTimeBonus(submissionTime: number, roundTimeLimit: number = 30): number {
  if (submissionTime >= roundTimeLimit) return 0;
  
  const timeRatio = submissionTime / roundTimeLimit;
  const maxBonus = 500;
  
  // Linear bonus calculation - faster submissions get higher bonus
  return Math.round(maxBonus * (1 - timeRatio));
}

/**
 * Calculate total score including time bonus
 * @param distance Distance in kilometers
 * @param submissionTime Time in seconds when guess was submitted
 * @param roundTimeLimit Total time limit for the round in seconds
 * @returns Total score including bonus
 */
export function calculateTotalScore(
  distance: number, 
  submissionTime: number = 30, 
  roundTimeLimit: number = 30
): number {
  const baseScore = calculateScore(distance);
  const timeBonus = calculateTimeBonus(submissionTime, roundTimeLimit);
  return baseScore + timeBonus;
}

/**
 * Validate geographic coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns True if coordinates are valid
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 100) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

/**
 * Format score for display with commas
 * @param score Score value
 * @returns Formatted score string
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Check if two players have the same score (for tie detection)
 * @param score1 First player's score
 * @param score2 Second player's score
 * @param tolerance Tolerance for score comparison (default: 0)
 * @returns True if scores are tied
 */
export function areScoresTied(score1: number, score2: number, tolerance: number = 0): boolean {
  return Math.abs(score1 - score2) <= tolerance;
}

/**
 * Calculate average distance for a player across multiple rounds
 * @param roundResults Array of round results
 * @param playerId Player ID to calculate for
 * @returns Average distance in kilometers
 */
export function calculateAverageDistance(roundResults: RoundResult[], playerId: string): number {
  const playerGuesses = roundResults
    .map(result => {
      if (result.hostGuess && playerId === 'host') return result.hostGuess.distance;
      if (result.opponentGuess && playerId === 'opponent') return result.opponentGuess.distance;
      return null;
    })
    .filter((distance): distance is number => distance !== null);

  if (playerGuesses.length === 0) return 0;
  
  return playerGuesses.reduce((sum, distance) => sum + distance, 0) / playerGuesses.length;
}

/**
 * Calculate overall accuracy for a player across multiple rounds
 * @param roundResults Array of round results
 * @param playerId Player ID to calculate for
 * @returns Overall accuracy percentage
 */
export function calculateOverallAccuracy(roundResults: RoundResult[], playerId: string): number {
  const averageDistance = calculateAverageDistance(roundResults, playerId);
  return calculateAccuracy(averageDistance);
}
