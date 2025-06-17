import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  Users, 
  Target,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  Trophy,
  Crown,
  Check
} from 'lucide-react';
import Map from '@/components/Map';
import { useMultiplayerStore, multiplayerSelectors } from '@/stores/multiplayerStore';
import { multiplayerActions } from '@/services/multiplayerIntegration';
import { useToast } from '@/hooks/use-toast';

type LatLng = { lat: number; lng: number };

export function MultiplayerGame() {
  const { toast } = useToast();
  const [selectedPin, setSelectedPin] = useState<LatLng | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityCardCentered, setCityCardCentered] = useState(true);
  
  const { 
    game, 
    currentPlayer, 
    opponent,
    actions 
  } = useMultiplayerStore();
  
  const canSubmitGuess = multiplayerSelectors.canSubmitGuess(useMultiplayerStore.getState());
  const isPlaying = multiplayerSelectors.isPlaying(useMultiplayerStore.getState());

  // Helper function to get player initials
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Calculate scores
  const currentPlayerScore = game?.roundResults.reduce((total, result) => {
    return total + (currentPlayer?.isHost ? result.hostScore : result.opponentScore);
  }, 0) || 0;

  const opponentScore = game?.roundResults.reduce((total, result) => {
    return total + (currentPlayer?.isHost ? result.opponentScore : result.hostScore);
  }, 0) || 0;

  useEffect(() => {
    // Set active view to game
    actions.setActiveView('game');
  }, [actions]);

  // City card animation effect (matching singleplayer)
  useEffect(() => {
    if (game?.phase === 'playing' && game?.currentCity) {
      // Start with card centered
      setCityCardCentered(true);
      
      // After 2 seconds, transition to top-right position
      const timer = setTimeout(() => {
        setCityCardCentered(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [game?.currentRound, game?.phase, game?.currentCity]);

  // Timer countdown effect
  useEffect(() => {
    if (!game || !game.isTimerActive || game.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      const newTime = game.timeRemaining - 1;
      actions.setTimeRemaining(newTime);
      
      if (newTime <= 0) {
        actions.setTimerActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, actions]);

  const handlePinDrop = (latLng: LatLng) => {
    setSelectedPin(latLng);
  };

  const handleSubmitGuess = async () => {
    if (!selectedPin || !canSubmitGuess) return;
    
    setIsSubmitting(true);
    try {
      await multiplayerActions.submitGuess(selectedPin.lat, selectedPin.lng);
      
      toast({
        title: "Guess submitted!",
        description: "Waiting for your opponent to make their guess.",
      });
    } catch (error) {
      toast({
        title: "Error submitting guess",
        description: error instanceof Error ? error.message : "Unable to submit your guess.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetMap = () => {
    setSelectedPin(null);
  };

  if (!game || !currentPlayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading game...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show different content based on game phase
  if (game.phase === 'lobby') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparing game...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (game.phase === 'round-results') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Showing round results...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (game.phase === 'game-over') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Game finished! Showing final results...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main playing phase - Match singleplayer design exactly
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Map
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE'}
        onPinDrop={handlePinDrop}
        isInteractive={game.phase === 'playing'}
        selectedPin={selectedPin}
      />

      {/* Top navigation bar with scores (left) and timer (right) - Matching singleplayer */}
      <div className="absolute top-4 left-4 right-4 animate-fade-in">
        <div className="flex items-start justify-between">
          {/* Score display - left side (matching points card from singleplayer) */}
          <Card className="shadow-lg bg-white/95 backdrop-blur-sm min-w-[182px]">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {/* Current Player Info */}
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-semibold">
                      {getPlayerInitials(currentPlayer.name)}
                    </AvatarFallback>
                  </Avatar>
                  {currentPlayer.isHost && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                      <Crown className="h-2 w-2 text-yellow-800" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Round {game.currentRound}/{game.totalRounds}</p>
                  <p className="text-sm font-semibold">{currentPlayerScore} pts</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">vs {opponent?.name || 'Opponent'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {opponentScore} pts
                  </span>
                </div>
              </div>
              
              <div className="mt-2">
                <Progress 
                  value={(game.currentRound / game.totalRounds) * 100} 
                  className="h-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Timer card - right side for balance */}
          <Card className="shadow-lg bg-white/95 backdrop-blur-sm min-w-[182px]">
            <CardContent className="p-3">
              <div className="flex items-center justify-center gap-2">
                <Clock className={`h-4 w-4 ${
                  game.timeRemaining <= 10 ? 'text-red-500' : 'text-blue-600'
                }`} />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                  <p className={`text-sm font-bold ${
                    game.timeRemaining <= 10 ? 'text-red-500' : 'text-gray-900'
                  }`}>
                    {game.timeRemaining}s
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* City card with smooth transition animation (exactly matching singleplayer) */}
      {game.currentCity && (
        <div 
          className={`fixed z-30 transition-all duration-1000 ease-out ${
            cityCardCentered 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'top-20 left-1/2 -translate-x-1/2'
          }`}
          style={{
            transform: cityCardCentered 
              ? 'translate(-50%, -50%) scale(1.3)' 
              : 'translate(-50%, 0) scale(1)'
          }}
        >
          <Card className="shadow-2xl bg-blue-50/95 backdrop-blur-sm w-[182px] h-[72px]">
            <CardContent className="p-3 h-full flex flex-col justify-center">
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Locate this city:</p>
                  <p className="text-sm font-semibold leading-tight overflow-hidden text-ellipsis">
                    {game.currentCity.name}, {game.currentCity.country}
                  </p>
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
      )}

      {/* Opponent status card - positioned to not interfere with main cards */}
      {opponent && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                    {getPlayerInitials(opponent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <span className="font-medium">{opponent.name}</span>
                  {game.opponentHasGuessed ? (
                    <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="h-2 w-2 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                      <Clock className="h-2 w-2 mr-1" />
                      Guessing
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom button area (matching singleplayer pattern) */}
      {game.phase === 'playing' && selectedPin && (
        <div className="absolute bottom-4 left-0 right-0 animate-fade-up">
          <div className="flex justify-center">
            <div className="min-w-[182px]">
              <Button 
                onClick={handleSubmitGuess} 
                disabled={!canSubmitGuess || isSubmitting}
                className="w-full text-lg py-6 px-8 shadow-2xl"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <Check className="mr-2 h-6 w-6" />
                )}
                {game.hasSubmittedGuess ? 'Submitted' : 'Confirm Guess'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status message when guess is submitted */}
      {game.hasSubmittedGuess && (
        <div className="absolute bottom-4 left-0 right-0 animate-fade-up">
          <div className="flex justify-center">
            <Card className="min-w-[182px] shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="text-center">
                  <p className="text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Guess submitted!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waiting for {opponent?.name || 'opponent'}...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
