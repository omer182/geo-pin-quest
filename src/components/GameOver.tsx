import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RotateCcw } from 'lucide-react';

interface GameOverProps {
  totalScore: number;
  currentLevel: number;
  pointsNeeded: number;
  onTryAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  totalScore, 
  currentLevel, 
  pointsNeeded, 
  onTryAgain 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="max-w-md mx-4 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-lg">You scored <span className="font-bold text-primary">{totalScore} points</span></p>
            <p className="text-sm text-muted-foreground">
              You needed <span className="font-bold">{pointsNeeded} points</span> to advance to Level {currentLevel + 1}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Don't give up! Try again and aim for better accuracy to advance to the next level.
            </p>
            <Button 
              onClick={onTryAgain} 
              className="w-full"
              size="lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Try Again from Level 1
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOver;
