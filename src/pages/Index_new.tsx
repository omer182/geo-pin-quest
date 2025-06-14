import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Map from '@/components/Map';
import GameOver from '@/components/GameOver';
import LevelComplete from '@/components/LevelComplete';
import { getRandomCitiesFromLevel } from '@/data/cities';
import { getDistance, calculateScore, canAdvanceToNextLevel, getMinimumPointsForLevel } from '@/lib/geo';
import { MapPin, Check, Star, Trophy } from 'lucide-react';

type GameState = 'START' | 'PLAYING' | 'RESULT' | 'LEVEL_COMPLETE' | 'GAME_OVER';
type LatLng = { lat: number; lng: number; };

const TURNS_PER_LEVEL = 5;

const Index = () => {
  const [googleMapsApiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [lastGuessResult, setLastGuessResult] = useState<{ distance: number, score: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<LatLng | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  
  const cities = useMemo(() => getRandomCitiesFromLevel(currentLevel, TURNS_PER_LEVEL), [currentLevel]);
  const currentCity = cities[currentTurn];
  
  // Calculate progress within current level (300 points per level)
  const pointsNeededForCurrentLevel = getMinimumPointsForLevel(currentLevel);
  const pointsNeededForNextLevel = getMinimumPointsForLevel(currentLevel + 1);
  const progressInLevel = Math.max(0, totalScore - pointsNeededForCurrentLevel + 300);
  const progressPercentage = Math.min(100, (progressInLevel / 300) * 100);
  const pointsToNextLevel = Math.max(0, pointsNeededForNextLevel - totalScore);

  const resetMap = useCallback(() => {
    setSelectedPin(null);
  }, []);

  const handleStartGame = () => {
    setCurrentLevel(1);
    setCurrentTurn(0);
    setTotalScore(0);
    setLevelScore(0);
    setLastGuessResult(null);
    setSelectedPin(null);
    setLeveledUp(false);
    setGameState('PLAYING');
  };

  const handlePinDrop = (latLng: LatLng) => {
    setSelectedPin(latLng);
  };

  const handleConfirmGuess = () => {
    if (!selectedPin) return;
    const distance = getDistance(selectedPin.lat, selectedPin.lng, currentCity.lat, currentCity.lng);
    const score = calculateScore(distance);
    
    setTotalScore(prev => prev + score);
    setLevelScore(prev => prev + score);
    setLastGuessResult({ distance, score });
    setGameState('RESULT');
  };

  const handleNextTurn = () => {
    resetMap();
    setLastGuessResult(null);
    setLeveledUp(false);
    
    if (currentTurn < TURNS_PER_LEVEL - 1) {
      // Continue to next turn in current level
      setCurrentTurn(prev => prev + 1);
      setGameState('PLAYING');
    } else {
      // End of level - check if player can advance
      if (canAdvanceToNextLevel(totalScore, currentLevel + 1)) {
        // Player advances to next level
        if (currentLevel < 5) {
          setGameState('LEVEL_COMPLETE');
        } else {
          // Player completed all levels
          setGameState('LEVEL_COMPLETE');
        }
      } else {
        // Player failed to advance - game over
        setGameState('GAME_OVER');
      }
    }
  };

  const handleContinueToNextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(prev => prev + 1);
      setCurrentTurn(0);
      setLevelScore(0);
      setSelectedPin(null);
      setLastGuessResult(null);
      setGameState('PLAYING');
    } else {
      // No more levels, show victory screen
      setGameState('START');
    }
  };

  const handleTryAgain = () => {
    handleStartGame();
  };

  if (gameState === 'START') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 animate-fade-up bg-cover bg-center" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(https://images.unsplash.com/photo-1572023023478-85750568d4a0?q=80&w=2070)'}}>
        <h1 className="text-6xl font-bold text-gray-800 drop-shadow-lg">Geo Pin Quest</h1>
        <p className="text-xl text-gray-600 mt-2 mb-4">Test your geography knowledge across 5 challenging levels!</p>
        <div className="text-sm text-gray-500 mb-8 max-w-md">
          <p>• Each level has 5 cities to find</p>
          <p>• Score 300+ points per level to advance</p>
          <p>• Cities get harder as you progress</p>
        </div>
        <Button onClick={handleStartGame} size="lg" className="text-lg">
          Start Level 1
          <MapPin className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (gameState === 'LEVEL_COMPLETE') {
    return (
      <LevelComplete
        currentLevel={currentLevel}
        totalScore={totalScore}
        onContinue={handleContinueToNextLevel}
      />
    );
  }

  if (gameState === 'GAME_OVER') {
    return (
      <GameOver
        totalScore={totalScore}
        currentLevel={currentLevel}
        pointsNeeded={pointsNeededForNextLevel}
        onTryAgain={handleTryAgain}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Map 
        googleMapsApiKey={googleMapsApiKey}
        onPinDrop={handlePinDrop} 
        isInteractive={gameState === 'PLAYING'}
        selectedPin={selectedPin}
        result={gameState === 'RESULT' ? { guess: selectedPin!, actual: { lat: currentCity.lat, lng: currentCity.lng } } : undefined}
      />

      <div className="absolute top-4 left-4 right-4 animate-fade-in">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Turn {currentTurn + 1}/{TURNS_PER_LEVEL}</p>
                <p className="text-lg font-semibold">{totalScore} pts</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Find this city:</p>
                <p className="text-lg font-bold">{currentCity?.name}, {currentCity?.country}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Level {currentLevel}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {pointsToNextLevel} pts to advance
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {gameState === 'PLAYING' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 animate-fade-up">
          <Button onClick={handleConfirmGuess} disabled={!selectedPin} className="w-full text-lg py-6 shadow-2xl">
            <Check className="mr-2 h-6 w-6" /> Confirm Guess
          </Button>
        </div>
      )}

      {gameState === 'RESULT' && lastGuessResult && (
         <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 py-4 animate-fade-up shadow-2xl">
           <div className="text-center">
            <p className="text-lg font-bold">You were {Math.round(lastGuessResult.distance)}km off!</p>
            <p className="text-2xl font-bold text-success my-2">+{lastGuessResult.score} points</p>
            
            <Button onClick={handleNextTurn} className="w-full">
              {currentTurn === TURNS_PER_LEVEL - 1 ? 'Complete Level' : 'Next Turn'}
            </Button>
           </div>
         </Card>
      )}
    </div>
  );
};

export default Index;
