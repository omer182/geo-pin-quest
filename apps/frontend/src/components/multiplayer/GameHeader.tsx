import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Trophy, Target } from 'lucide-react';
import type { Player, GameState } from '@geo-pin-quest/shared';
import type { CurrentPlayer, GameStateExtended } from '@/stores/multiplayerStore';

interface GameHeaderProps {
  game: GameStateExtended;
  currentPlayer: CurrentPlayer;
  opponent: Player | null;
}

export function GameHeader({ game, currentPlayer, opponent }: GameHeaderProps) {
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const currentPlayerScore = game.roundResults.reduce((total, result) => {
    return total + (currentPlayer.isHost ? result.hostScore : result.opponentScore);
  }, 0);

  const opponentScore = game.roundResults.reduce((total, result) => {
    return total + (currentPlayer.isHost ? result.opponentScore : result.hostScore);
  }, 0);

  const progressPercentage = (game.currentRound / game.totalRounds) * 100;

  return (
    <div className="bg-white border-b py-2">
      <div className="container mx-auto px-4">
        {/* Simple header with round info and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Round {game.currentRound} of {game.totalRounds}</span>
            </div>
            <Progress value={progressPercentage} className="w-24 h-2" />
          </div>
          
          <div className="flex items-center gap-6">
            {/* Current Player Score */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                  {getPlayerInitials(currentPlayer.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{currentPlayerScore}</span>
              <Trophy className="h-3 w-3 text-yellow-500" />
            </div>
            
            <span className="text-sm text-muted-foreground">vs</span>
            
            {/* Opponent Score */}
            {opponent ? (
              <div className="flex items-center gap-2">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className="text-sm font-medium">{opponentScore}</span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                    {getPlayerInitials(opponent.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex items-center gap-2 opacity-50">
                <Trophy className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-400">0</span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gray-100 text-gray-500 text-xs">
                    ?
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          
          <Badge variant="outline" className="border-green-300 text-green-700">
            {game.phase === 'playing' ? 'Playing' : 
             game.phase === 'round-results' ? 'Round Results' :
             game.phase === 'game-over' ? 'Game Over' : 'In Lobby'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
