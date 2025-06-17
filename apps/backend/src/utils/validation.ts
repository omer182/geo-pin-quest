// Using inline types since they're not exported from shared package
type Position = { lat: number; lng: number };
type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Validation utilities for input sanitization and validation
 */

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationResult {
  constructor(
    public isValid: boolean,
    public errors: ValidationError[] = []
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true);
  }

  static failure(errors: ValidationError[]): ValidationResult {
    return new ValidationResult(false, errors);
  }

  static singleError(field: string, message: string): ValidationResult {
    return new ValidationResult(false, [{ field, message }]);
  }
}

/**
 * Validates player name for room joining/creation
 */
export function validatePlayerName(name: unknown): ValidationResult {
  if (typeof name !== 'string') {
    return ValidationResult.singleError('playerName', 'Player name must be a string');
  }

  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return ValidationResult.singleError('playerName', 'Player name cannot be empty');
  }

  if (trimmed.length < 2) {
    return ValidationResult.singleError('playerName', 'Player name must be at least 2 characters long');
  }

  if (trimmed.length > 20) {
    return ValidationResult.singleError('playerName', 'Player name cannot exceed 20 characters');
  }

  // Allow alphanumeric characters, spaces, hyphens, and underscores
  const nameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  if (!nameRegex.test(trimmed)) {
    return ValidationResult.singleError('playerName', 'Player name can only contain letters, numbers, spaces, hyphens, and underscores');
  }

  return ValidationResult.success();
}

/**
 * Validates room code format
 */
export function validateRoomCode(code: unknown): ValidationResult {
  if (typeof code !== 'string') {
    return ValidationResult.singleError('roomCode', 'Room code must be a string');
  }

  const trimmed = code.trim().toUpperCase();
  
  if (trimmed.length !== 8) {
    return ValidationResult.singleError('roomCode', 'Room code must be exactly 8 characters long');
  }

  // Room codes should be alphanumeric (uppercase)
  const codeRegex = /^[A-Z0-9]{8}$/;
  if (!codeRegex.test(trimmed)) {
    return ValidationResult.singleError('roomCode', 'Room code must contain only uppercase letters and numbers');
  }

  return ValidationResult.success();
}

/**
 * Validates difficulty level
 */
export function validateDifficulty(difficulty: unknown): ValidationResult {
  if (typeof difficulty !== 'number') {
    return ValidationResult.singleError('difficulty', 'Difficulty must be a number');
  }

  if (!Number.isInteger(difficulty)) {
    return ValidationResult.singleError('difficulty', 'Difficulty must be an integer');
  }

  if (difficulty < 1 || difficulty > 5) {
    return ValidationResult.singleError('difficulty', 'Difficulty must be between 1 and 5');
  }

  return ValidationResult.success();
}

/**
 * Validates position coordinates
 */
export function validatePosition(position: unknown): ValidationResult {
  if (!position || typeof position !== 'object') {
    return ValidationResult.singleError('position', 'Position must be an object');
  }

  const pos = position as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // Validate latitude
  if (typeof pos.lat !== 'number') {
    errors.push({ field: 'position.lat', message: 'Latitude must be a number' });
  } else if (pos.lat < -90 || pos.lat > 90) {
    errors.push({ field: 'position.lat', message: 'Latitude must be between -90 and 90' });
  }

  // Validate longitude
  if (typeof pos.lng !== 'number') {
    errors.push({ field: 'position.lng', message: 'Longitude must be a number' });
  } else if (pos.lng < -180 || pos.lng > 180) {
    errors.push({ field: 'position.lng', message: 'Longitude must be between -180 and 180' });
  }

  return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
}

/**
 * Validates rounds count for game settings
 */
export function validateRounds(rounds: unknown): ValidationResult {
  if (typeof rounds !== 'number') {
    return ValidationResult.singleError('roundLimit', 'Round limit must be a number');
  }

  if (!Number.isInteger(rounds)) {
    return ValidationResult.singleError('roundLimit', 'Round limit must be an integer');
  }

  if (rounds < 1 || rounds > 10) {
    return ValidationResult.singleError('roundLimit', 'Round limit must be between 1 and 10');
  }

  return ValidationResult.success();
}

/**
 * Validates time limit in seconds
 */
export function validateTimeLimit(timeLimit: unknown): ValidationResult {
  if (typeof timeLimit !== 'number') {
    return ValidationResult.singleError('timeLimit', 'Time limit must be a number');
  }

  if (!Number.isInteger(timeLimit)) {
    return ValidationResult.singleError('timeLimit', 'Time limit must be an integer');
  }

  if (timeLimit < 10 || timeLimit > 300) {
    return ValidationResult.singleError('timeLimit', 'Time limit must be between 10 and 300 seconds');
  }

  return ValidationResult.success();
}

/**
 * Validates complete room creation data
 */
export function validateRoomCreation(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return ValidationResult.singleError('data', 'Room creation data must be an object');
  }

  const roomData = data as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // Validate difficulty
  const difficultyValidation = validateDifficulty(roomData.difficulty);
  if (!difficultyValidation.isValid) {
    errors.push(...difficultyValidation.errors);
  }

  // Validate roundLimit
  const roundsValidation = validateRounds(roomData.roundLimit);
  if (!roundsValidation.isValid) {
    errors.push(...roundsValidation.errors);
  }

  return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
}

/**
 * Validates room joining data
 */
export function validateRoomJoin(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return ValidationResult.singleError('data', 'Room join data must be an object');
  }

  const joinData = data as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // Validate player name
  const nameValidation = validatePlayerName(joinData.playerName);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  }

  // Validate room code
  const codeValidation = validateRoomCode(joinData.roomCode);
  if (!codeValidation.isValid) {
    errors.push(...codeValidation.errors);
  }

  return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
}

/**
 * Validates guess submission data
 */
export function validateGuessSubmission(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return ValidationResult.singleError('data', 'Guess submission data must be an object');
  }

  const guessData = data as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // Validate position
  const positionValidation = validatePosition(guessData.position);
  if (!positionValidation.isValid) {
    errors.push(...positionValidation.errors);
  }

  // Validate time taken (optional)
  if (guessData.timeTaken !== undefined) {
    if (typeof guessData.timeTaken !== 'number') {
      errors.push({ field: 'timeTaken', message: 'Time taken must be a number' });
    } else if (guessData.timeTaken < 0) {
      errors.push({ field: 'timeTaken', message: 'Time taken cannot be negative' });
    }
  }

  return errors.length > 0 ? ValidationResult.failure(errors) : ValidationResult.success();
}

/**
 * Sanitizes and normalizes a player name
 */
export function sanitizePlayerName(name: string): string {
  return name.trim().substring(0, 20);
}

/**
 * Sanitizes and normalizes a room code
 */
export function sanitizeRoomCode(code: string): string {
  return code.trim().toUpperCase().substring(0, 8);
}

/**
 * Checks if a string is a valid socket ID format
 */
export function isValidSocketId(id: unknown): boolean {
  return typeof id === 'string' && id.length > 0 && id.length < 100;
}

/**
 * Validates that a value is a non-empty string
 */
export function validateNonEmptyString(value: unknown, fieldName: string): ValidationResult {
  if (typeof value !== 'string') {
    return ValidationResult.singleError(fieldName, `${fieldName} must be a string`);
  }

  if (value.trim().length === 0) {
    return ValidationResult.singleError(fieldName, `${fieldName} cannot be empty`);
  }

  return ValidationResult.success();
}

/**
 * Validates multiple fields and combines results
 */
export function validateMultiple(...validations: ValidationResult[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  
  for (const validation of validations) {
    if (!validation.isValid) {
      allErrors.push(...validation.errors);
    }
  }

  return allErrors.length > 0 ? ValidationResult.failure(allErrors) : ValidationResult.success();
}
