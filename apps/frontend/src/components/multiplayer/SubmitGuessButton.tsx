import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { useGame } from '../../hooks/useWebSocket';
import { Button } from '../ui/button';
import { MapPin, Loader2 } from 'lucide-react';

interface SubmitGuessButtonProps {
  currentGuess: { lat: number; lng: number } | null;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
}

export const SubmitGuessButton: React.FC<SubmitGuessButtonProps> = ({ 
  currentGuess, 
  onSubmit, 
  disabled = false,
  className 
}) => {
  const game = useMultiplayerStore((state) => state.game);

  if (!game) {
    return null;
  }

  const hasGuess = currentGuess !== null;
  const hasSubmitted = game.hasSubmittedGuess;
  const isSubmitting = game.isSubmittingGuess;

  const handleSubmit = () => {
    if (!hasGuess || hasSubmitted || disabled) return;
    onSubmit();
  };

  if (!hasGuess) {
    return (
      <Button 
        disabled 
        size="lg" 
        className={`min-w-32 ${className}`}
      >
        <MapPin className="w-4 h-4 mr-2" />
        Place Your Guess
      </Button>
    );
  }

  if (hasSubmitted) {
    return (
      <Button 
        disabled 
        variant="secondary" 
        size="lg" 
        className={`min-w-32 ${className}`}
      >
        <MapPin className="w-4 h-4 mr-2" />
        Guess Submitted
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleSubmit} 
      disabled={isSubmitting || disabled}
      size="lg" 
      className={`min-w-32 bg-green-600 hover:bg-green-700 ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <MapPin className="w-4 h-4 mr-2" />
          Submit Guess
        </>
      )}
    </Button>
  );
};
