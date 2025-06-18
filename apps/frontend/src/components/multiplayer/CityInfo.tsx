import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Globe } from 'lucide-react';

interface CityInfoProps {
  className?: string;
}

export const CityInfo: React.FC<CityInfoProps> = ({ className }) => {
  const currentCity = useMultiplayerStore((state) => state.game?.currentCity);
  const gamePhase = useMultiplayerStore((state) => state.game?.phase);
  const difficulty = useMultiplayerStore((state) => state.room.current?.difficulty);

  // Only show city info during results phase
  if (gamePhase !== 'round-results' && gamePhase !== 'game-over' || !currentCity) {
    return null;
  }

  const getDifficultyColor = (diff: number) => {
    switch (diff) {
      case 1:
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-blue-200 text-blue-900';
      case 4:
      case 5: return 'bg-blue-300 text-blue-900';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getDifficultyLabel = (diff: number) => {
    switch (diff) {
      case 1: return 'Very Easy';
      case 2: return 'Easy';
      case 3: return 'Medium';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  return (
    <Card className={`max-w-md bg-white/95 backdrop-blur-sm shadow-lg border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* City Name and Country */}
          <div>
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              {currentCity.name}
            </h3>
            <p className="text-blue-600 flex items-center mt-1">
              <Globe className="w-4 h-4 mr-2" />
              {currentCity.country}
            </p>
          </div>

          {/* City Details */}
          <div className="space-y-2">
            {/* Remove population and region since they're not in the City type */}
            {difficulty && (
              <div className="flex items-center">
                <span className="text-sm text-blue-600 mr-2">Difficulty:</span>
                <Badge className={getDifficultyColor(difficulty)}>
                  {getDifficultyLabel(difficulty)}
                </Badge>
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="text-xs text-blue-500 border-t border-blue-200 pt-2">
            <span>
              {currentCity.lat.toFixed(4)}, {currentCity.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
