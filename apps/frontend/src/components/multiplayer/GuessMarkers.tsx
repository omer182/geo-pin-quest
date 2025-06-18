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
  const currentPlayer = useMultiplayerStore((state) => state.currentPlayer);
  const opponent = useMultiplayerStore((state) => state.opponent);
  const gamePhase = useMultiplayerStore((state) => state.game?.phase);
  const roundResults = useMultiplayerStore((state) => state.game?.roundResults);

  // Show markers only during results phase
  if (gamePhase !== 'round-results' || !roundResults || roundResults.length === 0 || !currentPlayer) {
    return null;
  }

  const currentRoundResults = roundResults[roundResults.length - 1];
  if (!currentRoundResults) {
    return null;
  }

  const markers = [];

  // Add current player's marker
  const currentPlayerGuess = currentPlayer.isHost ? currentRoundResults.hostGuess : currentRoundResults.opponentGuess;
  const currentPlayerScore = currentPlayer.isHost ? currentRoundResults.hostScore : currentRoundResults.opponentScore;
  
  markers.push({
    playerId: currentPlayer.id,
    playerName: currentPlayer.name,
    guess: currentPlayerGuess,
    distance: currentPlayerGuess.distance,
    score: currentPlayerScore,
    isCurrentPlayer: true
  });

  // Add opponent's marker if exists
  if (opponent) {
    const opponentGuess = currentPlayer.isHost ? currentRoundResults.opponentGuess : currentRoundResults.hostGuess;
    const opponentScore = currentPlayer.isHost ? currentRoundResults.opponentScore : currentRoundResults.hostScore;
    
    markers.push({
      playerId: opponent.id,
      playerName: opponent.name,
      guess: opponentGuess,
      distance: opponentGuess.distance,
      score: opponentScore,
      isCurrentPlayer: false
    });
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {markers.map((marker) => (
        <GuessMarker
          key={marker.playerId}
          lat={marker.guess.lat}
          lng={marker.guess.lng}
          playerId={marker.playerId}
          playerName={marker.playerName}
          isCurrentPlayer={marker.isCurrentPlayer}
          distance={marker.distance}
          score={marker.score}
        />
      ))}
    </div>
  );
};
