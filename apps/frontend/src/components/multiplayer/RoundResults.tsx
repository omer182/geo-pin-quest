import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Target, 
  Clock, 
  MapPin, 
  TrendingUp,
  Award,
  RotateCcw,
  Home
} from 'lucide-react';
import { useMultiplayerStore, multiplayerSelectors } from '@/stores/multiplayerStore';
import { multiplayerActions } from '@/services/multiplayerIntegration';
import { useToast } from '@/hooks/use-toast';
import { ScoreComparison } from './ScoreComparison';
import { PlayerList } from './PlayerList';
import type { RoundResult } from '@geo-pin-quest/shared';

interface RoundResultsProps {
  result: RoundResult;
  onContinue: () => void;
}

export function RoundResults({ result, onContinue }: RoundResultsProps) {
  const { toast } = useToast();
  const { currentPlayer, opponent, game } = useMultiplayerStore();
  const isHost = multiplayerSelectors.isHost(useMultiplayerStore.getState());

  if (!currentPlayer || !game) {
    return null;
  }

  const currentPlayerScore = currentPlayer.isHost ? result.hostScore : result.opponentScore;
  const opponentScore = currentPlayer.isHost ? result.opponentScore : result.hostScore;
  const currentPlayerGuess = currentPlayer.isHost ? result.hostGuess : result.opponentGuess;
  const opponentGuess = currentPlayer.isHost ? result.opponentGuess : result.hostGuess;
  const currentPlayerDistance = currentPlayerGuess.distance;
  const opponentDistance = opponentGuess.distance;

  const isWinner = currentPlayerScore > opponentScore;
  const isTie = currentPlayerScore === opponentScore;

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 100) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  const getAccuracyRating = (distance: number) => {
    if (distance < 10) return { rating: 'Excellent', color: 'text-green-600', icon: '🎯' };
    if (distance < 50) return { rating: 'Great', color: 'text-blue-600', icon: '👍' };
    if (distance < 200) return { rating: 'Good', color: 'text-yellow-600', icon: '👌' };
    if (distance < 500) return { rating: 'Fair', color: 'text-orange-600', icon: '📍' };
    return { rating: 'Needs Work', color: 'text-red-600', icon: '🎯' };
  };

  const currentAccuracy = getAccuracyRating(currentPlayerDistance);
  const opponentAccuracy = getAccuracyRating(opponentDistance);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Round Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6" />
              Round {result.roundNumber} Results
            </CardTitle>
            {result.city && (
              <p className="text-muted-foreground">
                {result.city.name}, {result.city.country}
              </p>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results Summary */}
          <div className="space-y-6">
            {/* Winner Announcement */}
            <Card className={`border-2 ${
              isWinner ? 'border-green-200 bg-green-50' : 
              isTie ? 'border-yellow-200 bg-yellow-50' : 
              'border-red-200 bg-red-50'
            }`}>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-2">
                  {isWinner ? '🎉' : isTie ? '🤝' : '😅'}
                </div>
                <h3 className={`text-xl font-bold ${
                  isWinner ? 'text-green-800' : 
                  isTie ? 'text-yellow-800' : 
                  'text-red-800'
                }`}>
                  {isWinner ? 'You Won This Round!' : 
                   isTie ? 'It\'s a Tie!' : 
                   'Your Opponent Won'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isWinner ? 'Great geographical knowledge!' : 
                   isTie ? 'Both players were equally accurate' : 
                   'Better luck next round!'}
                </p>
              </CardContent>
            </Card>

            {/* Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Round Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Your Score */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">{currentPlayer.name} (You)</p>
                      <p className="text-sm text-muted-foreground">
                        Distance: {formatDistance(currentPlayerDistance)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                        {currentPlayerScore}
                      </Badge>
                      <p className={`text-xs ${currentAccuracy.color} font-medium`}>
                        {currentAccuracy.icon} {currentAccuracy.rating}
                      </p>
                    </div>
                  </div>

                  {/* Opponent Score */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">{opponent?.name || 'Opponent'}</p>
                      <p className="text-sm text-muted-foreground">
                        Distance: {formatDistance(opponentDistance)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-purple-100 text-purple-800 text-lg px-3 py-1">
                        {opponentScore}
                      </Badge>
                      <p className={`text-xs ${opponentAccuracy.color} font-medium`}>
                        {opponentAccuracy.icon} {opponentAccuracy.rating}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* City Information */}
            {result.city && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    City Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-medium">{result.city.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-medium">{result.city.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <Badge variant="outline">Level {result.city.difficulty}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-sm font-mono">
                        {result.city.lat.toFixed(3)}, {result.city.lng.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Overall Game Progress */}
          <div className="space-y-6">
            {/* Game Progress */}
            <ScoreComparison
              currentPlayer={currentPlayer}
              opponent={opponent}
              roundResults={game.roundResults}
              showRoundBreakdown={true}
            />

            {/* Next Round Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Game Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Round:</span>
                    <span className="font-medium">
                      {game.currentRound} of {game.totalRounds}
                    </span>
                  </div>
                  
                  {game.currentRound < game.totalRounds && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Round {game.currentRound + 1} coming up!
                      </p>
                      <p className="text-xs text-blue-700">
                        Get ready for the next geography challenge
                      </p>
                    </div>
                  )}
                  
                  {game.currentRound >= game.totalRounds && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        Final round complete!
                      </p>
                      <p className="text-xs text-green-700">
                        Game results will be shown next
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Button */}
        <Card>
          <CardContent className="pt-6 text-center">
            <Button 
              onClick={onContinue}
              size="lg"
              className="w-full max-w-md"
            >
              {game.currentRound < game.totalRounds ? (
                <>
                  <Target className="mr-2 h-5 w-5" />
                  Continue to Next Round
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-5 w-5" />
                  View Final Results
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
