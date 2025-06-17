import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface FinalScoresProps {
  className?: string;
}

interface PlayerFinalScoreProps {
  playerId: string;
  playerName: string;
  totalScore: number;
  isCurrentPlayer: boolean;
  rank: number;
  isWinner: boolean;
}

const PlayerFinalScore: React.FC<PlayerFinalScoreProps> = ({
  playerId,
  playerName,
  totalScore,
  isCurrentPlayer,
  rank,
  isWinner
}) => {
  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-blue-600" />;
      case 2: return <Medal className="w-5 h-5 text-blue-500" />;
      case 3: return <Award className="w-5 h-5 text-blue-400" />;
      default: return <Trophy className="w-5 h-5 text-blue-300" />;
    }
  };

  const getRankBadge = () => {
    switch (rank) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-300';
      case 2: return 'bg-blue-50 text-blue-700 border-blue-200';
      case 3: return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  const getRankText = () => {
    switch (rank) {
      case 1: return '1st Place';
      case 2: return '2nd Place';
      case 3: return '3rd Place';
      default: return `${rank}th Place`;
    }
  };

  const getCardBorder = () => {
    if (rank === 1) return 'border-blue-400 bg-blue-50/95 backdrop-blur-sm shadow-lg';
    if (isCurrentPlayer) return 'border-blue-300 bg-blue-50/95 backdrop-blur-sm shadow-lg';
    return 'border-blue-200 bg-white/95 backdrop-blur-sm shadow-lg';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getCardBorder()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getRankIcon()}
          <div>
            <p className={`font-bold text-lg ${isCurrentPlayer ? 'text-blue-900' : 'text-gray-900'}`}>
              {playerName}
              {isCurrentPlayer && <span className="text-blue-600 ml-1">(You)</span>}
            </p>
            <Badge className={getRankBadge()}>
              {getRankText()}
            </Badge>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {totalScore}
          </p>
          <p className="text-sm text-blue-500">points</p>
        </div>
      </div>

      {rank === 1 && (
        <div className="mt-3 text-center">
          <Badge className="bg-blue-200 text-blue-800">
            🏆 Champion
          </Badge>
        </div>
      )}
    </div>
  );
};

export const FinalScores: React.FC<FinalScoresProps> = ({ className }) => {
  const players = useMultiplayerStore((state) => state.room.players);
  const currentPlayerId = useMultiplayerStore((state) => state.room.playerId);
  const roundResults = useMultiplayerStore((state) => state.game.roundResults);
  const gameState = useMultiplayerStore((state) => state.game.state);
  const currentRound = useMultiplayerStore((state) => state.game.currentRound);
  const maxRounds = useMultiplayerStore((state) => state.room.settings?.maxRounds);

  // Only show when game is completed
  const isGameOver = currentRound === maxRounds && gameState === 'game_ended';
  
  if (!isGameOver || !roundResults || roundResults.length === 0) {
    return null;
  }

  const finalRoundResults = roundResults[roundResults.length - 1];
  
  // Create final scores with rankings
  const finalScores = finalRoundResults.results
    .map(result => {
      const player = players.find(p => p.id === result.playerId);
      return {
        playerId: result.playerId,
        playerName: player?.name || 'Unknown Player',
        totalScore: result.totalScore,
        isCurrentPlayer: result.playerId === currentPlayerId
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore) // Sort by score descending
    .map((score, index) => ({
      ...score,
      rank: index + 1,
      isWinner: index === 0
    }));

  const maxScore = Math.max(...finalScores.map(s => s.totalScore));
  const winners = finalScores.filter(s => s.totalScore === maxScore);

  return (
    <Card className={`max-w-2xl ${className}`}>
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold flex items-center justify-center">
          <Trophy className="w-6 h-6 mr-2" />
          Final Results
        </CardTitle>
        {winners.length > 1 ? (
          <p className="text-blue-100">
            {winners.length}-way tie for first place!
          </p>
        ) : (
          <p className="text-blue-100">
            Congratulations to the winner!
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {finalScores.map((score) => (
            <PlayerFinalScore
              key={score.playerId}
              {...score}
            />
          ))}
        </div>

        {/* Game Statistics */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
            <div>
              <p className="font-medium">{maxRounds}</p>
              <p>Rounds Played</p>
            </div>
            <div>
              <p className="font-medium">{players.length}</p>
              <p>Players</p>
            </div>
            <div>
              <p className="font-medium">{maxScore}</p>
              <p>Highest Score</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
