import React from 'react';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { Zap, Target, Flame } from 'lucide-react';

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

interface DifficultyOptionProps {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const DifficultyOption: React.FC<DifficultyOptionProps> = ({
  value,
  label,
  description,
  icon,
  color
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-blue-200 hover:bg-blue-50/50 cursor-pointer">
      <RadioGroupItem value={value} id={value} />
      <div className="flex-1">
        <Label htmlFor={value} className="flex items-center cursor-pointer">
          <div className={`p-2 rounded-full mr-3 ${color}`}>
            {icon}
          </div>
          <div>
            <div className="font-medium text-blue-900">{label}</div>
            <div className="text-sm text-blue-600">{description}</div>
          </div>
        </Label>
      </div>
    </div>
  );
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  const difficulties: DifficultyOptionProps[] = [
    {
      value: 'easy',
      label: 'Easy',
      description: 'Major cities and capitals - perfect for beginners',
      icon: <Zap className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-100'
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'Regional cities and towns - balanced challenge',
      icon: <Target className="w-4 h-4 text-blue-700" />,
      color: 'bg-blue-200'
    },
    {
      value: 'hard',
      label: 'Hard',
      description: 'Obscure locations and villages - for experts',
      icon: <Flame className="w-4 h-4 text-blue-800" />,
      color: 'bg-blue-300'
    }
  ];

  return (
    <div className={className}>
      <div className="mb-3">
        <Label className="text-base font-medium text-blue-900">
          Difficulty Level
        </Label>
        <p className="text-sm text-blue-600 mt-1">
          Choose the difficulty level for the geography challenge
        </p>
      </div>
      
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="space-y-2"
      >
        {difficulties.map((difficulty) => (
          <DifficultyOption
            key={difficulty.value}
            {...difficulty}
          />
        ))}
      </RadioGroup>

      {/* Difficulty Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Scoring System:</p>
            <ul className="text-xs space-y-1">
              <li>• Closer guesses earn more points</li>
              <li>• Higher difficulty levels have bonus multipliers</li>
              <li>• Perfect guesses (within 1km) get maximum points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
