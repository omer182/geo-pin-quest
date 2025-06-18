import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Target, Trophy } from 'lucide-react';

interface GuessComparisonProps {
  className?: string;
}

interface PlayerResultProps {
  playerId: string;
  playerName: string;
  distance: number;
  score: number;
  isCurrentPlayer: boolean;
  rank: number;
}

const PlayerResult: React.FC<PlayerResultProps> = ({
  playerId,
  playerName,
  distance,
  score,
  isCurrentPlayer,
  rank
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <div className={`p-3 rounded-lg border ${isCurrentPlayer ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge className={getRankColor(rank)}>
            {getRankIcon(rank)}
            <span className="ml-1">#{rank}</span>
          </Badge>
          <div>
            <p className={`font-medium ${isCurrentPlayer ? 'text-blue-900' : 'text-gray-900'}`}>
              {playerName}
              {isCurrentPlayer && <span className="text-blue-600 ml-1">(You)</span>}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{formatDistance(distance)} away</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">+{score}</p>
          <p className="text-xs text-gray-500">points</p>
        </div>
      </div>
    </div>
  );
};

export const GuessComparison: React.FC<GuessComparisonProps> = ({ className }) => {
  const currentPlayer = useMultiplayerStore((state) => state.currentPlayer);
  const opponent = useMultiplayerStore((state) => state.opponent);
  const roundResults = useMultiplayerStore((state) => state.game?.roundResults);
  const gamePhase = useMultiplayerStore((state) => state.game?.phase);

  // Only show during results phase
  if (gamePhase !== 'round-results' || !roundResults || roundResults.length === 0 || !currentPlayer) {
    return null;
  }

  const currentRoundResults = roundResults[roundResults.length - 1];
  if (!currentRoundResults) {
    return null;
  }

  // Create player results from the round data
  const playerResults = [
    {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      distance: currentPlayer.isHost ? currentRoundResults.hostGuess.distance : currentRoundResults.opponentGuess.distance,
      score: currentPlayer.isHost ? currentRoundResults.hostScore : currentRoundResults.opponentScore,
      isCurrentPlayer: true
    }
  ];

  if (opponent) {
    playerResults.push({
      playerId: opponent.id,
      playerName: opponent.name,
      distance: currentPlayer.isHost ? currentRoundResults.opponentGuess.distance : currentRoundResults.hostGuess.distance,
      score: currentPlayer.isHost ? currentRoundResults.opponentScore : currentRoundResults.hostScore,
      isCurrentPlayer: false
    });
  }

  // Sort by score (descending) and add rank
  const sortedResults = playerResults
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({
      ...result,
      rank: index + 1
    }));

  // Update ranks after sorting
  sortedResults.forEach((result, index) => {
    result.rank = index + 1;
  });

  return (
    <Card className={`max-w-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-center">
          Round {currentRoundResults.roundNumber} Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedResults.map((result) => (
          <PlayerResult
            key={result.playerId}
            playerId={result.playerId}
            playerName={result.playerName}
            distance={result.distance}
            score={result.score}
            isCurrentPlayer={result.isCurrentPlayer}
            rank={result.rank}
          />
        ))}
      </CardContent>
    </Card>
  );
};
