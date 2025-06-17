import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, User, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import type { Player } from '@geo-pin-quest/shared';
import type { CurrentPlayer } from '@/stores/multiplayerStore';

interface PlayerListProps {
  currentPlayer: CurrentPlayer;
  opponent: Player | null;
  showStatus?: boolean;
  showScores?: boolean;
  className?: string;
}

export function PlayerList({ 
  currentPlayer, 
  opponent, 
  showStatus = false, 
  showScores = false,
  className 
}: PlayerListProps) {
  
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusIcon = (player: Player | CurrentPlayer) => {
    if ('connectionStatus' in player) {
      // This is an opponent Player object
      if (player.connectionStatus === 'disconnected') {
        return <WifiOff className="h-3 w-3 text-red-500" />;
      }
      if (player.isReady) {
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      }
    }
    return <Clock className="h-3 w-3 text-yellow-500" />;
  };

  const getStatusText = (player: Player | CurrentPlayer) => {
    if ('connectionStatus' in player) {
      // This is an opponent Player object
      if (player.connectionStatus === 'disconnected') {
        return 'Disconnected';
      }
      if (player.isReady) {
        return 'Ready';
      }
    }
    return 'In lobby';
  };

  const getStatusColor = (player: Player | CurrentPlayer) => {
    if ('connectionStatus' in player) {
      // This is an opponent Player object
      if (player.connectionStatus === 'disconnected') {
        return 'bg-red-100 text-red-800';
      }
      if (player.isReady) {
        return 'bg-green-100 text-green-800';
      }
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className={`space-y-3 ${className}`}>        {/* Current Player */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                    {getPlayerInitials(currentPlayer.name)}
                  </AvatarFallback>
                </Avatar>
                {currentPlayer.isHost && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                    <Crown className="h-3 w-3 text-yellow-800" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {currentPlayer.name}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                  {currentPlayer.isHost && (
                    <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                      Host
                    </Badge>
                  )}
                </div>
                
                {showStatus && (
                  <div className="flex items-center gap-1 mt-1">
                    <Wifi className="h-3 w-3 text-green-500" />
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Connected
                    </Badge>
                  </div>
                )}
                
                {showScores && 'totalScore' in currentPlayer && (
                  <p className="text-sm text-muted-foreground">
                    Score: {currentPlayer.totalScore} points
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opponent */}
        {opponent ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
                      {getPlayerInitials(opponent.name)}
                    </AvatarFallback>
                  </Avatar>
                  {opponent.isHost && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                      <Crown className="h-3 w-3 text-yellow-800" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {opponent.name}
                    </p>
                    {opponent.isHost && (
                      <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                        Host
                      </Badge>
                    )}
                  </div>
                  
                  {showStatus && (
                    <div className="flex items-center gap-1 mt-1">
                      {getStatusIcon(opponent)}
                      <Badge className={`${getStatusColor(opponent)} text-xs`}>
                        {getStatusText(opponent)}
                      </Badge>
                    </div>
                  )}
                  
                  {showScores && (
                    <p className="text-sm text-muted-foreground">
                      Score: {opponent.totalScore} points
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 opacity-60">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-100 text-gray-500">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-medium text-gray-500">Waiting for opponent...</p>
                <p className="text-sm text-gray-400">
                  Share the room code to invite a friend
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
