import React, { useEffect, useState } from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Crown, Star, Medal } from 'lucide-react';

interface WinnerAnnouncementProps {
  className?: string;
  autoHide?: boolean;
  hideDelay?: number;
}

interface WinnerDisplayProps {
  playerId: string;
  playerName: string;
  score: number;
  isCurrentPlayer: boolean;
  type: 'round' | 'game';
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({
  playerId,
  playerName,
  score,
  isCurrentPlayer,
  type
}) => {
  const getIcon = () => {
    if (type === 'game') {
      return <Crown className="w-8 h-8 text-yellow-500" />;
    }
    return <Trophy className="w-6 h-6 text-yellow-600" />;
  };

  const getTitle = () => {
    if (type === 'game') {
      return isCurrentPlayer ? 'You Win!' : `${playerName} Wins!`;
    }
    return isCurrentPlayer ? 'Round Winner!' : `${playerName} Wins Round!`;
  };

  const getBgGradient = () => {
    if (type === 'game') {
      return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    }
    return 'bg-gradient-to-r from-blue-400 to-purple-500';
  };

  return (
    <div className={`p-6 rounded-lg text-white text-center ${getBgGradient()}`}>
      <div className="flex justify-center mb-3">
        {getIcon()}
      </div>
      
      <h2 className="text-xl font-bold mb-2">
        {getTitle()}
      </h2>
      
      <div className="flex items-center justify-center space-x-2">
        <Star className="w-4 h-4" />
        <span className="text-lg font-semibold">{score} points</span>
        <Star className="w-4 h-4" />
      </div>

      {type === 'game' && (
        <div className="mt-3 flex justify-center">
          <Badge className="bg-white/20 text-white border-white/30">
            <Medal className="w-3 h-3 mr-1" />
            Game Champion
          </Badge>
        </div>
      )}
    </div>
  );
};

export const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = ({ 
  className, 
  autoHide = true, 
  hideDelay = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const players = useMultiplayerStore((state) => state.room.players);
  const currentPlayerId = useMultiplayerStore((state) => state.room.playerId);
  const roundResults = useMultiplayerStore((state) => state.game.roundResults);
  const gameState = useMultiplayerStore((state) => state.game.state);
  const currentRound = useMultiplayerStore((state) => state.game.currentRound);
  const maxRounds = useMultiplayerStore((state) => state.room.settings?.maxRounds);

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
  if (!isVisible || gameState !== 'results' || !roundResults || roundResults.length === 0) {
    return null;
  }

  const currentRoundResults = roundResults[roundResults.length - 1];
  const isGameOver = currentRound === maxRounds && gameState === 'results';

  // Find the winner(s) - could be tied
  let winners: Array<{ playerId: string; playerName: string; score: number; isCurrentPlayer: boolean }> = [];

  if (isGameOver) {
    // Game winner - highest total score
    const maxTotalScore = Math.max(...currentRoundResults.results.map(r => r.totalScore));
    winners = currentRoundResults.results
      .filter(r => r.totalScore === maxTotalScore)
      .map(r => {
        const player = players.find(p => p.id === r.playerId);
        return {
          playerId: r.playerId,
          playerName: player?.name || 'Unknown Player',
          score: r.totalScore,
          isCurrentPlayer: r.playerId === currentPlayerId
        };
      });
  } else {
    // Round winner - highest round score
    const maxRoundScore = Math.max(...currentRoundResults.results.map(r => r.score));
    winners = currentRoundResults.results
      .filter(r => r.score === maxRoundScore)
      .map(r => {
        const player = players.find(p => p.id === r.playerId);
        return {
          playerId: r.playerId,
          playerName: player?.name || 'Unknown Player',
          score: r.score,
          isCurrentPlayer: r.playerId === currentPlayerId
        };
      });
  }

  if (winners.length === 0) {
    return null;
  }

  // Handle ties
  if (winners.length > 1) {
    const winnerNames = winners.map(w => w.playerName).join(', ');
    const hasCurrentPlayer = winners.some(w => w.isCurrentPlayer);
    
    return (
      <Card className={`max-w-md animate-in zoom-in ${className}`}>
        <CardContent className="p-0">
          <div className="p-6 rounded-lg text-center bg-gradient-to-r from-purple-400 to-pink-500 text-white">
            <div className="flex justify-center mb-3">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            
            <h2 className="text-xl font-bold mb-2">
              {isGameOver ? "It's a Tie!" : "Round Tie!"}
            </h2>
            
            <p className="text-sm mb-2">
              {hasCurrentPlayer ? 'You tied with: ' : 'Tied between: '}
              {winnerNames}
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="text-lg font-semibold">{winners[0].score} points each</span>
              <Star className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Single winner
  const winner = winners[0];
  
  return (
    <Card className={`max-w-md animate-in zoom-in ${className}`}>
      <CardContent className="p-0">
        <WinnerDisplay
          playerId={winner.playerId}
          playerName={winner.playerName}
          score={winner.score}
          isCurrentPlayer={winner.isCurrentPlayer}
          type={isGameOver ? 'game' : 'round'}
        />
      </CardContent>
    </Card>
  );
};
