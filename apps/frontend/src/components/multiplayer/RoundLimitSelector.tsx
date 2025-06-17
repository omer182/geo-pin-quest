import React from 'react';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { Clock, Zap, Target, Trophy } from 'lucide-react';

interface RoundLimitSelectorProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

interface RoundOptionProps {
  value: number;
  label: string;
  description: string;
  estimatedTime: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

const RoundOption: React.FC<RoundOptionProps> = ({
  value,
  label,
  description,
  estimatedTime,
  icon,
  color,
  badge
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-blue-200 hover:bg-blue-50/50 cursor-pointer">
      <RadioGroupItem value={value.toString()} id={value.toString()} />
      <div className="flex-1">
        <Label htmlFor={value.toString()} className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${color}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-blue-900">{label}</span>
                {badge && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    {badge}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-blue-600">{description}</div>
            </div>
          </div>
          <div className="text-right text-sm text-blue-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {estimatedTime}
          </div>
        </Label>
      </div>
    </div>
  );
};

export const RoundLimitSelector: React.FC<RoundLimitSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const roundOptions: RoundOptionProps[] = [
    {
      value: 3,
      label: '3 Rounds',
      description: 'Quick game for a fast challenge',
      estimatedTime: '5-8 min',
      icon: <Zap className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-100',
      badge: 'Quick'
    },
    {
      value: 5,
      label: '5 Rounds',
      description: 'Balanced game length - most popular',
      estimatedTime: '8-12 min',
      icon: <Target className="w-4 h-4 text-blue-700" />,
      color: 'bg-blue-200',
      badge: 'Popular'
    },
    {
      value: 7,
      label: '7 Rounds',
      description: 'Extended game for serious competition',
      estimatedTime: '12-18 min',
      icon: <Trophy className="w-4 h-4 text-blue-800" />,
      color: 'bg-blue-300'
    },
    {
      value: 10,
      label: '10 Rounds',
      description: 'Marathon mode for geography masters',
      estimatedTime: '18-25 min',
      icon: <Trophy className="w-4 h-4 text-blue-900" />,
      color: 'bg-blue-400',
      badge: 'Marathon'
    }
  ];

  const handleValueChange = (stringValue: string) => {
    const numValue = parseInt(stringValue, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className={className}>
      <div className="mb-3">
        <Label className="text-base font-medium text-blue-900">
          Number of Rounds
        </Label>
        <p className="text-sm text-blue-600 mt-1">
          Choose how many cities you want to guess in this game
        </p>
      </div>
      
      <RadioGroup
        value={value.toString()}
        onValueChange={handleValueChange}
        disabled={disabled}
        className="space-y-2"
      >
        {roundOptions.map((option) => (
          <RoundOption
            key={option.value}
            {...option}
          />
        ))}
      </RadioGroup>

      {/* Game Length Info */}
      <div className="mt-4 p-3 bg-blue-50/95 backdrop-blur-sm rounded-lg border border-blue-200 shadow-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Game Timing:</p>
            <ul className="text-xs space-y-1">
              <li>• Each round has a 60-second time limit</li>
              <li>• Additional time for reviewing results</li>
              <li>• Players can submit guesses early to speed up</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected round info */}
      <div className="mt-3 text-center">
        <Badge variant="outline" className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200">
          {value} rounds selected
          {value === 5 && <span className="ml-1">⭐ Recommended</span>}
        </Badge>
      </div>
    </div>
  );
};
