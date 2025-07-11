import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Map from '@/components/Map';
import GameOver from '@/components/GameOver';
import LevelComplete from '@/components/LevelComplete';
import { WorldMapBackground, Globe3D, FloatingElements } from '@/components/BackgroundElements';
import { getRandomCitiesFromLevel } from '@/data/cities';
import { getDistance, calculateScore, canAdvanceToNextLevel, getMinimumPointsForLevel } from '@/lib/geo';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapPin, Check, Star, Trophy } from 'lucide-react';

type GameState = 'START' | 'PLAYING' | 'RESULT' | 'LEVEL_COMPLETE' | 'GAME_OVER';
type LatLng = { lat: number; lng: number; };

const TURNS_PER_LEVEL = 5;

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [lastGuessResult, setLastGuessResult] = useState<{ distance: number, score: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<LatLng | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [cityCardCentered, setCityCardCentered] = useState(true);
  
  const isMobile = useIsMobile();
  const isTablet = !isMobile && window.innerWidth <= 1024;
  
  const cities = useMemo(() => getRandomCitiesFromLevel(currentLevel, TURNS_PER_LEVEL), [currentLevel]);
  const currentCity = cities[currentTurn];
  
  // Calculate progress within current level (2000 points per level)
  const pointsNeededForCurrentLevel = getMinimumPointsForLevel(currentLevel);
  const pointsNeededForNextLevel = getMinimumPointsForLevel(currentLevel + 1);
  const progressInLevel = Math.max(0, totalScore - pointsNeededForCurrentLevel);
  const progressPercentage = Math.min(100, (progressInLevel / 2000) * 100);
  const pointsToNextLevel = Math.max(0, pointsNeededForNextLevel - totalScore);

  const resetMap = useCallback(() => {
    setSelectedPin(null);
  }, []);

  // Handle city card transition animation
  useEffect(() => {
    if (gameState === 'PLAYING') {
      // Start with card centered
      setCityCardCentered(true);
      
      // After 2 seconds, transition to top-right position
      const timer = setTimeout(() => {
        setCityCardCentered(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameState]);

  const handleStartGame = () => {
    setCurrentLevel(1);
    setCurrentTurn(0);
    setTotalScore(0);
    setLevelScore(0);
    setLastGuessResult(null);
    setSelectedPin(null);
    setLeveledUp(false);
    setCityCardCentered(true);
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
    setCityCardCentered(true);
    
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
      setCityCardCentered(true);
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
      <div className="relative h-screen w-screen overflow-hidden">
        {/* Beautiful animated background */}
        <div className="game-start-background absolute inset-0">
          <WorldMapBackground />
          <Globe3D />
        </div>
        
        {/* Dark gradient overlay for better text readability on dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"></div>
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-center space-y-8 p-8 animate-fade-up">
            <div className="space-y-4">
              <h1 className="text-7xl font-bold text-white drop-shadow-2xl">
                🌍 Geo Pin Quest
              </h1>
              <p className="text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg font-medium">
                Test your geography knowledge by pinning cities around the world!
              </p>
              <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
                Discover 250+ cities across 5 challenging difficulty levels
              </p>
            </div>
            
            <div className="space-y-6 animate-fade-in-delayed">
              <Button 
                onClick={handleStartGame} 
                size="lg" 
                className="btn-adventure text-xl px-12 py-6 font-semibold"
              >
                🎯 Start Adventure
                <MapPin className="ml-3 h-6 w-6" />
              </Button>
              
              <div className="flex flex-wrap justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <span>Interactive Maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏆</span>
                  <span>Score & Levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span>Precision Challenge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating corner elements */}
        <FloatingElements />
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
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'}
        onPinDrop={handlePinDrop} 
        isInteractive={gameState === 'PLAYING'}
        selectedPin={selectedPin}
        result={gameState === 'RESULT' ? { 
          guess: selectedPin!, 
          actual: { lat: currentCity.lat, lng: currentCity.lng },
          cityName: currentCity.name
        } : undefined}
      />

      {/* Top navigation bar with points (left) and city card placeholder (right) */}
      <div className="absolute top-4 left-4 right-4 animate-fade-in">
        <div className="flex items-start justify-between">
          {/* Points display - left side */}
          <Card className={`shadow-lg bg-white/95 backdrop-blur-sm ${isMobile ? 'mobile-card-responsive' : isTablet ? 'tablet-card-responsive' : 'min-w-[182px]'} touch-optimization`}>
            <CardContent className={`${isMobile ? 'mobile-spacing' : 'p-3'}`}>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Turn {currentTurn + 1}/{TURNS_PER_LEVEL}</p>
                  <p className="text-sm font-semibold">{totalScore} pts</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">Level {currentLevel}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pointsToNextLevel > 0 ? `${pointsToNextLevel} to advance` : 'Level Complete! 🎉'}
                  </span>
                </div>
              </div>
              
              <div className="mt-2">
                <Progress 
                  value={progressPercentage} 
                  className="h-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Empty placeholder to maintain layout */}
          <div className="min-w-[182px]"></div>
        </div>
      </div>

      {/* City card with smooth transition animation */}
      <div 
        className={`fixed z-30 transition-all duration-1000 ease-out ${
          cityCardCentered 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : 'top-4 right-4'
        }`}
        style={{
          transform: cityCardCentered 
            ? 'translate(-50%, -50%) scale(1.3)' 
            : 'scale(1)'
        }}
      >
        <Card className={`shadow-2xl bg-blue-50/95 backdrop-blur-sm ${isMobile ? 'mobile-card-responsive' : isTablet ? 'tablet-card-responsive' : 'w-[182px]'} ${isMobile ? 'h-[60px]' : 'h-[72px]'} touch-optimization`}>
          <CardContent className={`${isMobile ? 'mobile-spacing' : 'p-3'} h-full flex flex-col justify-center`}>
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Locate this city:</p>
                <p className="text-sm font-semibold leading-tight overflow-hidden text-ellipsis">{currentCity?.name}, {currentCity?.country}</p>
              </div>
            </div>
            
            <div className="mt-2">
              <Progress 
                value={0} 
                className="h-1 opacity-0"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {gameState === 'PLAYING' && selectedPin && (
        <div className="absolute bottom-4 left-0 right-0 animate-fade-up">
          <div className="flex justify-center">
            <div className={isMobile ? 'mobile-card-responsive' : isTablet ? 'tablet-card-responsive' : 'min-w-[182px]'}>
              <Button onClick={handleConfirmGuess} className={`w-full ${isMobile ? 'text-base py-4 px-6' : 'text-lg py-6 px-8'} shadow-2xl mobile-touch-target touch-optimization`}>
                <Check className={`mr-2 ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} /> Confirm Guess
              </Button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'RESULT' && lastGuessResult && (
        <div className="absolute bottom-4 left-0 right-0 animate-fade-up">
          <div className="flex justify-center">
            <Card className={`${isMobile ? 'mobile-card-responsive' : isTablet ? 'tablet-card-responsive' : 'min-w-[182px]'} shadow-2xl bg-white/95 backdrop-blur-sm touch-optimization`}>
              <CardContent className={`${isMobile ? 'mobile-spacing' : 'p-3'}`}>
                <div className="text-center">
                 <p className="text-xs font-semibold">You were {Math.round(lastGuessResult.distance)}km off!</p>
                 <p className="text-lg font-bold text-green-600 my-1">+{lastGuessResult.score} points</p>
                 
                 <Button onClick={handleNextTurn} className="w-full text-xs py-1.5 mt-1">
                   {currentTurn === TURNS_PER_LEVEL - 1 ? 'Complete Level' : 'Next Turn'}
                 </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
