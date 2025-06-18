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
  const currentPlayer = useMultiplayerStore((state) => state.currentPlayer);
  const opponent = useMultiplayerStore((state) => state.opponent);
  const currentPlayerId = useMultiplayerStore((state) => state.currentPlayer?.id);
  const roundResults = useMultiplayerStore((state) => state.game?.roundResults);
  const gamePhase = useMultiplayerStore((state) => state.game?.phase);
  const currentRound = useMultiplayerStore((state) => state.game?.currentRound);
  const maxRounds = useMultiplayerStore((state) => state.room.current?.roundLimit);

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
  const isGameOver = currentRound === maxRounds && gamePhase === 'round-results';

  // Find the winner(s) - could be tied
  let winners: Array<{ playerId: string; playerName: string; score: number; isCurrentPlayer: boolean }> = [];

  if (isGameOver) {
    // Game winner - highest total score across all rounds
    const currentPlayerTotal = roundResults.reduce((total, result) => {
      return total + (currentPlayer?.isHost ? result.hostScore : result.opponentScore);
    }, 0);
    
    const opponentTotal = roundResults.reduce((total, result) => {
      return total + (currentPlayer?.isHost ? result.opponentScore : result.hostScore);
    }, 0);

    // Determine winner(s)
    if (currentPlayerTotal > opponentTotal) {
      winners = [{
        playerId: currentPlayer?.id || '',
        playerName: currentPlayer?.name || 'You',
        score: currentPlayerTotal,
        isCurrentPlayer: true
      }];
    } else if (opponentTotal > currentPlayerTotal) {
      winners = [{
        playerId: opponent?.id || 'opponent',
        playerName: opponent?.name || 'Opponent',
        score: opponentTotal,
        isCurrentPlayer: false
      }];
    } else {
      // Tie
      winners = [
        {
          playerId: currentPlayer?.id || '',
          playerName: currentPlayer?.name || 'You',
          score: currentPlayerTotal,
          isCurrentPlayer: true
        },
        {
          playerId: opponent?.id || 'opponent',
          playerName: opponent?.name || 'Opponent',
          score: opponentTotal,
          isCurrentPlayer: false
        }
      ];
    }
  } else {
    // Round winner - highest score for current round
    const currentPlayerScore = currentPlayer?.isHost ? currentRoundResults.hostScore : currentRoundResults.opponentScore;
    const opponentScore = currentPlayer?.isHost ? currentRoundResults.opponentScore : currentRoundResults.hostScore;

    if (currentPlayerScore > opponentScore) {
      winners = [{
        playerId: currentPlayer?.id || '',
        playerName: currentPlayer?.name || 'You',
        score: currentPlayerScore,
        isCurrentPlayer: true
      }];
    } else if (opponentScore > currentPlayerScore) {
      winners = [{
        playerId: opponent?.id || 'opponent',
        playerName: opponent?.name || 'Opponent',
        score: opponentScore,
        isCurrentPlayer: false
      }];
    } else {
      // Tie
      winners = [
        {
          playerId: currentPlayer?.id || '',
          playerName: currentPlayer?.name || 'You',
          score: currentPlayerScore,
          isCurrentPlayer: true
        },
        {
          playerId: opponent?.id || 'opponent',
          playerName: opponent?.name || 'Opponent',
          score: opponentScore,
          isCurrentPlayer: false
        }
      ];
    }
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
