import { nanoid } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique 8-character room code
 */
export function generateRoomCode(): string {
  return nanoid(8).toUpperCase();
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return uuidv4();
}

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return uuidv4();
}

/**
 * Validate room code format
 */
export function isValidRoomCode(roomCode: string): boolean {
  return typeof roomCode === 'string' && roomCode.length === 8 && /^[A-Z0-9]+$/.test(roomCode);
}

/**
 * Validate player name
 */
export function isValidPlayerName(playerName: string): boolean {
  return typeof playerName === 'string' && 
         playerName.trim().length >= 2 && 
         playerName.trim().length <= 50 &&
         /^[a-zA-Z0-9\s\-_]+$/.test(playerName.trim());
}

/**
 * Validate latitude and longitude coordinates
 */
export function isValidLatLng(lat: number, lng: number): boolean {
  return typeof lat === 'number' && 
         typeof lng === 'number' &&
         lat >= -90 && 
         lat <= 90 && 
         lng >= -180 && 
         lng <= 180;
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate score based on distance (0-1000 points)
 */
export function calculateScore(distance: number): number {
  if (distance === 0) return 1000;
  if (distance >= 20000) return 0;
  
  // Exponential decay scoring for better precision rewards
  const score = Math.round(1000 * Math.exp(-distance / 2000));
  return Math.max(0, Math.min(1000, score));
}
