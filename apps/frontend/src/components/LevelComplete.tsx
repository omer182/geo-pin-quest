import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, ArrowRight, Star } from 'lucide-react';

interface LevelCompleteProps {
  currentLevel: number;
  totalScore: number;
  onContinue: () => void;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({ 
  currentLevel, 
  totalScore, 
  onContinue 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="w-16 h-16 text-yellow-500" />
              <Star className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Level {currentLevel} Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-lg">Congratulations! 🎉</p>
            <p className="text-sm text-muted-foreground">
              Total Score: <span className="font-bold text-primary">{totalScore} points</span>
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
            <p className="text-sm font-medium text-green-700 mb-2">
              🚀 Ready for Level {currentLevel + 1}?
            </p>
            <p className="text-xs text-muted-foreground">
              The cities will be more challenging, but the rewards are greater!
            </p>
          </div>
          
          <Button 
            onClick={onContinue} 
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            size="lg"
          >
            Continue to Level {currentLevel + 1}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelComplete;
