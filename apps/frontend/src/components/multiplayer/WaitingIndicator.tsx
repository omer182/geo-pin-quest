import React from 'react';
import { Loader2, Clock, Users, Wifi } from 'lucide-react';

interface WaitingIndicatorProps {
  message?: string;
  submessage?: string;
  type?: 'loading' | 'waiting' | 'connecting';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WaitingIndicator({ 
  message = "Please wait...", 
  submessage,
  type = 'loading',
  size = 'md',
  className 
}: WaitingIndicatorProps) {
  
  const getIcon = () => {
    switch (type) {
      case 'waiting':
        return <Clock className={`${getSizeClass()} text-blue-500 animate-pulse`} />;
      case 'connecting':
        return <Wifi className={`${getSizeClass()} text-blue-500 animate-pulse`} />;
      case 'loading':
      default:
        return <Loader2 className={`${getSizeClass()} text-blue-500 animate-spin`} />;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-8 w-8';
      case 'md':
      default:
        return 'h-6 w-6';
    }
  };

  const getTextSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-base';
    }
  };

  const getContainerClass = () => {
    switch (size) {
      case 'sm':
        return 'gap-2 p-3';
      case 'lg':
        return 'gap-4 p-8';
      case 'md':
      default:
        return 'gap-3 p-6';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${getContainerClass()} ${className}`}>
      <div className="flex items-center justify-center">
        {getIcon()}
      </div>
      
      <div className="space-y-1">
        <p className={`font-medium text-gray-700 ${getTextSizeClass()}`}>
          {message}
        </p>
        
        {submessage && (
          <p className={`text-gray-500 ${size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {submessage}
          </p>
        )}
      </div>
    </div>
  );
}

// Preset waiting indicators for common scenarios
export const MultiplayerWaitingIndicators = {
  ConnectingToServer: () => (
    <WaitingIndicator
      type="connecting"
      message="Connecting to multiplayer server..."
      submessage="This should only take a moment"
    />
  ),
  
  WaitingForOpponent: () => (
    <WaitingIndicator
      type="waiting"
      message="Waiting for opponent..."
      submessage="Share the room code with a friend to start playing"
    />
  ),
  
  WaitingForHost: () => (
    <WaitingIndicator
      type="waiting"
      message="Waiting for host to start the game..."
      submessage="The room host will begin when ready"
    />
  ),
  
  LoadingGame: () => (
    <WaitingIndicator
      type="loading"
      message="Loading game..."
      submessage="Preparing your geography challenge"
    />
  ),
  
  WaitingForGuesses: () => (
    <WaitingIndicator
      type="waiting"
      message="Waiting for both players to submit guesses..."
      submessage="Round will end when everyone has guessed"
    />
  ),
  
  CalculatingResults: () => (
    <WaitingIndicator
      type="loading"
      message="Calculating round results..."
      submessage="Scoring your geographical knowledge"
    />
  ),
  
  PreparingNextRound: () => (
    <WaitingIndicator
      type="loading"
      message="Preparing next round..."
      submessage="Get ready for the next city"
    />
  ),
  
  GameEnding: () => (
    <WaitingIndicator
      type="loading"
      message="Game completed!"
      submessage="Preparing final results"
    />
  ),
  
  OpponentReconnecting: () => (
    <WaitingIndicator
      type="connecting"
      message="Opponent reconnecting..."
      submessage="Game will resume when they're back online"
    />
  ),
};
