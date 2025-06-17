import React from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Globe, Users } from 'lucide-react';

interface CityInfoProps {
  className?: string;
}

export const CityInfo: React.FC<CityInfoProps> = ({ className }) => {
  const currentCity = useMultiplayerStore((state) => state.game.currentCity);
  const gameState = useMultiplayerStore((state) => state.game.state);
  const difficulty = useMultiplayerStore((state) => state.room.settings?.difficulty);

  // Only show city info during results phase
  if (gameState !== 'results' && gameState !== 'round_ended' || !currentCity) {
    return null;
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-blue-200 text-blue-900';
      case 'hard': return 'bg-blue-300 text-blue-900';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatPopulation = (population?: number) => {
    if (!population) return 'Unknown';
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    }
    if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`;
    }
    return population.toLocaleString();
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
            {currentCity.population && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>Population: {formatPopulation(currentCity.population)}</span>
              </div>
            )}

            {currentCity.region && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Region:</span> {currentCity.region}
              </div>
            )}

            {difficulty && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Difficulty:</span>
                <Badge className={getDifficultyColor(difficulty)}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Badge>
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <span>
              {currentCity.lat.toFixed(4)}, {currentCity.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
