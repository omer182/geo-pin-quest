import React, { useEffect, useState } from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreUpdateProps {
  className?: string;
  autoHide?: boolean;
  hideDelay?: number;
}

interface ScoreChangeProps {
  playerId: string;
  playerName: string;
  previousScore: number;
  newScore: number;
  scoreChange: number;
  isCurrentPlayer: boolean;
}

const ScoreChange: React.FC<ScoreChangeProps> = ({
  playerId,
  playerName,
  previousScore,
  newScore,
  scoreChange,
  isCurrentPlayer
}) => {
  const getChangeIcon = () => {
    if (scoreChange > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (scoreChange < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = () => {
    if (scoreChange > 0) return 'text-green-600';
    if (scoreChange < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBadgeColor = () => {
    if (scoreChange > 0) return 'bg-green-100 text-green-800';
    if (scoreChange < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded ${isCurrentPlayer ? 'bg-blue-50' : ''}`}>
      <div className="flex items-center space-x-2">
        <span className={`font-medium ${isCurrentPlayer ? 'text-blue-900' : 'text-gray-900'}`}>
          {playerName}
          {isCurrentPlayer && <span className="text-blue-600 ml-1">(You)</span>}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{previousScore}</span>
        <div className="flex items-center">
          {getChangeIcon()}
        </div>
        <span className="font-bold">{newScore}</span>
        <Badge className={getBadgeColor()}>
          {scoreChange > 0 ? '+' : ''}{scoreChange}
        </Badge>
      </div>
    </div>
  );
};

export const ScoreUpdate: React.FC<ScoreUpdateProps> = ({ 
  className, 
  autoHide = true, 
  hideDelay = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const currentPlayer = useMultiplayerStore((state) => state.currentPlayer);
  const opponent = useMultiplayerStore((state) => state.opponent);
  const roundResults = useMultiplayerStore((state) => state.game?.roundResults);
  const gamePhase = useMultiplayerStore((state) => state.game?.phase);

  useEffect(() => {
    if (autoHide && hideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay]);

  // Reset visibility when new round results come in
  useEffect(() => {
    setIsVisible(true);
  }, [roundResults?.length]);

  // Only show during results phase
  if (!isVisible || gamePhase !== 'round-results' || !roundResults || roundResults.length === 0 || !currentPlayer) {
    return null;
  }

  const currentRoundResults = roundResults[roundResults.length - 1];
  const previousRoundResults = roundResults.length > 1 ? roundResults[roundResults.length - 2] : null;

  // Calculate score changes for current player
  const currentPlayerPreviousScore = previousRoundResults ? 
    (currentPlayer.isHost ? previousRoundResults.hostScore : previousRoundResults.opponentScore) : 0;
  const currentPlayerNewScore = currentPlayer.isHost ? currentRoundResults.hostScore : currentRoundResults.opponentScore;
  const currentPlayerChange = currentPlayerNewScore - currentPlayerPreviousScore;

  // Calculate score changes for players
  const scoreChanges = [
    {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      previousScore: currentPlayerPreviousScore,
      newScore: currentPlayerNewScore,
      scoreChange: currentPlayerChange,
      isCurrentPlayer: true
    }
  ];

  // Add opponent if exists
  if (opponent) {
    const opponentPreviousScore = previousRoundResults ? 
      (currentPlayer.isHost ? previousRoundResults.opponentScore : previousRoundResults.hostScore) : 0;
    const opponentNewScore = currentPlayer.isHost ? currentRoundResults.opponentScore : currentRoundResults.hostScore;
    const opponentChange = opponentNewScore - opponentPreviousScore;
    
    scoreChanges.push({
      playerId: opponent.id,
      playerName: opponent.name,
      previousScore: opponentPreviousScore,
      newScore: opponentNewScore,
      scoreChange: opponentChange,
      isCurrentPlayer: false
    });
  }

  return (
    <Card className={`max-w-md animate-in slide-in-from-top ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 text-center mb-3">
            Score Update
          </h3>
          {scoreChanges.map((change) => (
            <ScoreChange
              key={change.playerId}
              {...change}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
