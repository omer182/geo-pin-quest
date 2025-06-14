import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '@/components/Map';
import { CITIES } from '@/data/cities';
import { getDistance, calculateScore } from '@/lib/geo';
import { MapPin, Check, Star } from 'lucide-react';

type GameState = 'START' | 'PLAYING' | 'RESULT' | 'END';
type LatLng = { lat: number; lng: number; };

const Index = () => {
  // --- IMPORTANT ---
  // PASTE YOUR GOOGLE MAPS API KEY HERE
  const [googleMapsApiKey] = useState('YOUR_GOOGLE_MAPS_API_KEY_HERE');
  
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [lastGuessResult, setLastGuessResult] = useState<{ distance: number, score: number } | null>(null);
  const [selectedPin, setSelectedPin] = useState<LatLng | null>(null);
  
  const cities = useMemo(() => CITIES, []);
  const currentCity = cities[currentTurn];
  
  const handleStartGame = () => {
    setCurrentTurn(0);
    setTotalScore(0);
    setLastGuessResult(null);
    setSelectedPin(null);
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
    setLastGuessResult({ distance, score });
    setGameState('RESULT');
  };

  const handleNextTurn = () => {
    setSelectedPin(null);
    setLastGuessResult(null);
    if (currentTurn < cities.length - 1) {
      setCurrentTurn(prev => prev + 1);
      setGameState('PLAYING');
    } else {
      setGameState('END');
    }
  };

  if (gameState === 'START') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 animate-fade-up bg-cover bg-center" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(https://images.unsplash.com/photo-1572023023478-85750568d4a0?q=80&w=2070)'}}>
        <h1 className="text-6xl font-bold text-gray-800 drop-shadow-lg">City Pin</h1>
        <p className="text-xl text-gray-600 mt-2 mb-8">How well do you know the world?</p>
        <Button onClick={handleStartGame} size="lg" className="text-lg">
          Play Game
          <MapPin className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (gameState === 'END') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 animate-fade-up">
        <Star className="w-24 h-24 text-accent mb-4" />
        <h1 className="text-5xl font-bold">Game Over!</h1>
        <p className="text-2xl mt-4">Your final score is:</p>
        <p className="text-6xl font-bold text-primary my-4">{totalScore}</p>
        <Button onClick={handleStartGame} size="lg">
          Play Again
        </Button>
      </div>
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
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Turn {currentTurn + 1}/{cities.length}</p>
              <p className="text-lg font-semibold">{totalScore} pts</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Find this city:</p>
              <p className="text-lg font-bold">{currentCity.name}, {currentCity.country}</p>
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
              {currentTurn === cities.length - 1 ? 'Finish Game' : 'Next Turn'}
            </Button>
           </div>
         </Card>
      )}
    </div>
  );
};

export default Index;
