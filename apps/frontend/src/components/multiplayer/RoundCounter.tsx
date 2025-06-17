import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Badge } from '../ui/badge';

interface RoundCounterProps {
  className?: string;
}

export const RoundCounter: React.FC<RoundCounterProps> = ({ className }) => {
  const game = useMultiplayerStore((state) => state.game);

  if (!game || !game.currentRound || !game.totalRounds) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`text-sm font-medium bg-blue-100 text-blue-800 border-blue-200 ${className}`}
    >
      Round {game.currentRound} of {game.totalRounds}
    </Badge>
  );
};
