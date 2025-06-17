import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import type { Player, RoundResult } from '@geo-pin-quest/shared';
import type { CurrentPlayer } from '@/stores/multiplayerStore';

interface ScoreComparisonProps {
  currentPlayer: CurrentPlayer;
  opponent: Player | null;
  roundResults: RoundResult[];
  showRoundBreakdown?: boolean;
  className?: string;
}

export function ScoreComparison({ 
  currentPlayer, 
  opponent, 
  roundResults, 
  showRoundBreakdown = false,
  className 
}: ScoreComparisonProps) {
  
  const currentPlayerTotal = roundResults.reduce((total, result) => {
    return total + (currentPlayer.isHost ? result.hostScore : result.opponentScore);
  }, 0);

  const opponentTotal = roundResults.reduce((total, result) => {
    return total + (currentPlayer.isHost ? result.opponentScore : result.hostScore);
  }, 0);

  const maxScore = Math.max(currentPlayerTotal, opponentTotal, 1);
  const currentPlayerPercentage = (currentPlayerTotal / maxScore) * 100;
  const opponentPercentage = (opponentTotal / maxScore) * 100;

  const currentPlayerWins = roundResults.filter(result => {
    const currentScore = currentPlayer.isHost ? result.hostScore : result.opponentScore;
    const opponentScore = currentPlayer.isHost ? result.opponentScore : result.hostScore;
    return currentScore > opponentScore;
  }).length;

  const opponentWins = roundResults.filter(result => {
    const currentScore = currentPlayer.isHost ? result.hostScore : result.opponentScore;
    const opponentScore = currentPlayer.isHost ? result.opponentScore : result.hostScore;
    return opponentScore > currentScore;
  }).length;

  const ties = roundResults.length - currentPlayerWins - opponentWins;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Score Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Scores */}
        <div className="space-y-4">
          {/* Current Player */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{currentPlayer.name} (You)</span>
              <Badge className="bg-blue-100 text-blue-800">
                {currentPlayerTotal} pts
              </Badge>
            </div>
            <Progress value={currentPlayerPercentage} className="h-2" />
          </div>

          {/* Opponent */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {opponent?.name || 'Opponent'}
              </span>
              <Badge className="bg-purple-100 text-purple-800">
                {opponentTotal} pts
              </Badge>
            </div>
            <Progress 
              value={opponentPercentage} 
              className="h-2"
            />
          </div>
        </div>

        {/* Round Wins */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Award className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-800">{currentPlayerWins}</span>
            </div>
            <p className="text-xs text-green-700">Your wins</p>
          </div>
          
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="font-bold text-gray-800">{ties}</span>
            </div>
            <p className="text-xs text-gray-700">Ties</p>
          </div>
          
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Award className="h-4 w-4 text-red-600" />
              <span className="font-bold text-red-800">{opponentWins}</span>
            </div>
            <p className="text-xs text-red-700">Their wins</p>
          </div>
        </div>

        {/* Round Breakdown */}
        {showRoundBreakdown && roundResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Round by Round
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {roundResults.map((result, index) => {
                const currentScore = currentPlayer.isHost ? result.hostScore : result.opponentScore;
                const opponentScore = currentPlayer.isHost ? result.opponentScore : result.hostScore;
                const isWin = currentScore > opponentScore;
                const isTie = currentScore === opponentScore;
                
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">Round {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        isWin ? 'text-green-600' : isTie ? 'text-gray-600' : 'text-red-600'
                      }`}>
                        {currentScore}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className={`font-bold ${
                        !isWin && !isTie ? 'text-green-600' : isTie ? 'text-gray-600' : 'text-red-600'
                      }`}>
                        {opponentScore}
                      </span>
                      {isWin && <Badge className="bg-green-100 text-green-800 text-xs">W</Badge>}
                      {isTie && <Badge className="bg-gray-100 text-gray-800 text-xs">T</Badge>}
                      {!isWin && !isTie && <Badge className="bg-red-100 text-red-800 text-xs">L</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leader indicator */}
        {roundResults.length > 0 && (
          <div className="text-center">
            {currentPlayerTotal > opponentTotal ? (
              <Badge className="bg-green-100 text-green-800">
                🎉 You're leading by {currentPlayerTotal - opponentTotal} points!
              </Badge>
            ) : currentPlayerTotal < opponentTotal ? (
              <Badge className="bg-red-100 text-red-800">
                📈 Behind by {opponentTotal - currentPlayerTotal} points
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">
                🤝 It's a tie!
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
