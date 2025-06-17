import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { MapPin, User } from 'lucide-react';

interface GuessMarkersProps {
  className?: string;
}

interface MarkerProps {
  lat: number;
  lng: number;
  playerId: string;
  playerName: string;
  isCurrentPlayer: boolean;
  distance?: number;
  score?: number;
}

const GuessMarker: React.FC<MarkerProps> = ({ 
  playerId, 
  playerName, 
  isCurrentPlayer, 
  distance, 
  score 
}) => {
  const markerColor = isCurrentPlayer ? 'bg-blue-600' : 'bg-red-600';
  const textColor = isCurrentPlayer ? 'text-blue-600' : 'text-red-600';

  return (
    <div className="relative">
      {/* Map Pin Marker */}
      <div className={`w-8 h-8 rounded-full ${markerColor} flex items-center justify-center shadow-lg border-2 border-white`}>
        <MapPin className="w-4 h-4 text-white fill-current" />
      </div>
      
      {/* Player Info Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-lg border text-xs whitespace-nowrap z-10">
        <div className={`font-medium ${textColor}`}>
          <User className="w-3 h-3 inline mr-1" />
          {playerName}
        </div>
        {distance !== undefined && (
          <div className="text-gray-600">
            {distance < 1000 
              ? `${Math.round(distance)}m away`
              : `${(distance / 1000).toFixed(1)}km away`
            }
          </div>
        )}
        {score !== undefined && (
          <div className="text-green-600 font-medium">
            +{score} points
          </div>
        )}
      </div>
    </div>
  );
};

export const GuessMarkers: React.FC<GuessMarkersProps> = ({ className }) => {
  const currentPlayerId = useMultiplayerStore((state) => state.room.playerId);
  const players = useMultiplayerStore((state) => state.room.players);
  const gameState = useMultiplayerStore((state) => state.game.state);
  const currentRoundData = useMultiplayerStore((state) => state.game.currentRoundData);
  const roundResults = useMultiplayerStore((state) => state.game.roundResults);

  // Show markers only after guessing phase or during results
  if (gameState !== 'results' && gameState !== 'round_ended') {
    return null;
  }

  const playerGuesses = currentRoundData?.guesses || {};
  const currentRoundResults = roundResults?.[roundResults.length - 1];

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {Object.entries(playerGuesses).map(([playerId, guess]) => {
        const player = players.find(p => p.id === playerId);
        if (!player || !guess) return null;

        const playerResult = currentRoundResults?.results.find(r => r.playerId === playerId);
        
        return (
          <GuessMarker
            key={playerId}
            lat={guess.lat}
            lng={guess.lng}
            playerId={playerId}
            playerName={player.name}
            isCurrentPlayer={playerId === currentPlayerId}
            distance={playerResult?.distance}
            score={playerResult?.score}
          />
        );
      })}
    </div>
  );
};
