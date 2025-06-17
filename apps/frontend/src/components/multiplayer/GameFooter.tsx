import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Button } from '../ui/button';
import { SubmitGuessButton } from './SubmitGuessButton';
import { RoundCounter } from './RoundCounter';
import { useRoom } from '../../hooks/useWebSocket';

interface GameFooterProps {
  currentGuess?: { lat: number; lng: number } | null;
  onSubmitGuess?: () => void;
  className?: string;
}

export const GameFooter: React.FC<GameFooterProps> = ({ 
  currentGuess = null, 
  onSubmitGuess,
  className 
}) => {
  const game = useMultiplayerStore((state) => state.game);
  const room = useMultiplayerStore((state) => state.room);
  const { leaveRoom } = useRoom();

  const handleLeaveGame = () => {
    if (confirm('Are you sure you want to leave the game? This will end the game for all players.')) {
      if (room.current?.id) {
        leaveRoom(room.current.id);
      }
    }
  };

  if (!game) {
    return null;
  }

  return (
    <div className={`bg-blue-50/95 backdrop-blur-sm border-t border-blue-200 shadow-lg p-4 ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left side - Round counter */}
        <div className="flex items-center space-x-4">
          <RoundCounter />
        </div>

        {/* Center - Submit button (when applicable) */}
        <div className="flex-1 flex justify-center">
          {game.phase === 'playing' && onSubmitGuess && (
            <SubmitGuessButton 
              currentGuess={currentGuess}
              onSubmit={onSubmitGuess}
            />
          )}
        </div>

        {/* Right side - Leave game */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveGame}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
};
