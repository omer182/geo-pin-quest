export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateScore(distance: number): number {
  // New scoring system: 0-1000 points based on proximity
  if (distance <= 25) return 1000;      // Perfect guess: 1000 points
  if (distance <= 50) return 900;       // Excellent: 900 points
  if (distance <= 100) return 800;      // Very good: 800 points
  if (distance <= 200) return 700;      // Good: 700 points
  if (distance <= 400) return 600;      // Decent: 600 points
  if (distance <= 600) return 500;      // Average: 500 points
  if (distance <= 800) return 400;      // Below average: 400 points
  if (distance <= 1000) return 300;     // Poor: 300 points
  if (distance <= 1500) return 200;     // Bad: 200 points
  if (distance <= 2000) return 100;     // Very bad: 100 points
  return 50;                            // Terrible: 50 points
}

export function calculateLevel(totalScore: number): number {
  return Math.floor(totalScore / 3000) + 1;
}

export function getPointsForNextLevel(totalScore: number): number {
  const currentLevel = calculateLevel(totalScore);
  return currentLevel * 3000;
}

export function getLevelProgress(totalScore: number): { 
  currentLevel: number;
  pointsInCurrentLevel: number;
  pointsNeededForNext: number;
  progressPercentage: number;
} {
  const currentLevel = calculateLevel(totalScore);
  const pointsForCurrentLevel = (currentLevel - 1) * 3000;
  const pointsForNextLevel = currentLevel * 3000;
  const pointsInCurrentLevel = totalScore - pointsForCurrentLevel;
  const pointsNeededForNext = pointsForNextLevel - totalScore;
  const progressPercentage = (pointsInCurrentLevel / 3000) * 100;
  
  return {
    currentLevel,
    pointsInCurrentLevel,
    pointsNeededForNext,
    progressPercentage
  };
}

// Check if player has enough points to advance to next level after 5 turns
export function canAdvanceToNextLevel(totalScore: number, targetLevel: number): boolean {
  // Each level requires 3000 points to advance
  // Level 1 -> Level 2: need 3000+ total points
  // Level 2 -> Level 3: need 6000+ total points
  // Level 3 -> Level 4: need 9000+ total points
  // Level 4 -> Level 5: need 12000+ total points
  const requiredPoints = (targetLevel - 1) * 3000;
  return totalScore >= requiredPoints;
}

// Calculate minimum points needed for a level (for game over check)
export function getMinimumPointsForLevel(level: number): number {
  // Level 1 starts at 0 points
  // Level 2 starts at 3000 points
  // Level 3 starts at 6000 points
  // Level 4 starts at 9000 points
  // Level 5 starts at 12000 points
  return (level - 1) * 3000;
}
