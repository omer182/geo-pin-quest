import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  Wifi, 
  WifiOff, 
  User,
  Crown,
  Target
} from 'lucide-react';
import type { Player } from '@geo-pin-quest/shared';

interface OpponentStatusProps {
  opponent: Player;
  hasGuessed?: boolean;
  showScore?: boolean;
  compact?: boolean;
  className?: string;
}

export function OpponentStatus({ 
  opponent, 
  hasGuessed = false, 
  showScore = false,
  compact = false,
  className 
}: OpponentStatusProps) {
  
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getConnectionIcon = () => {
    if (opponent.connectionStatus === 'disconnected') {
      return <WifiOff className="h-3 w-3 text-red-500" />;
    }
    return <Wifi className="h-3 w-3 text-green-500" />;
  };

  const getConnectionColor = () => {
    if (opponent.connectionStatus === 'disconnected') {
      return 'border-red-200 bg-red-50';
    }
    return 'border-green-200 bg-green-50';
  };

  const getStatusIcon = () => {
    if (opponent.connectionStatus === 'disconnected') {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    if (hasGuessed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (opponent.connectionStatus === 'disconnected') {
      return 'Disconnected';
    }
    if (hasGuessed) {
      return 'Submitted guess';
    }
    return 'Thinking...';
  };

  const getStatusColor = () => {
    if (opponent.connectionStatus === 'disconnected') {
      return 'bg-red-100 text-red-800';
    }
    if (hasGuessed) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  if (compact) {
    return (
      <Card className={`${getConnectionColor()} ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-purple-100 text-purple-800 text-xs font-semibold">
                  {getPlayerInitials(opponent.name)}
                </AvatarFallback>
              </Avatar>
              {opponent.isHost && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                  <Crown className="h-2 w-2 text-yellow-800" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{opponent.name}</p>
            </div>
            
            <div className="flex items-center gap-1">
              {getStatusIcon()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getConnectionColor()} ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-800 text-sm font-semibold">
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
                <p className="font-medium truncate">{opponent.name}</p>
                {opponent.isHost && (
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                    Host
                  </Badge>
                )}
              </div>
              
              {showScore && (
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {opponent.totalScore} points
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-xs text-muted-foreground">
                {opponent.connectionStatus === 'connected' ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <Badge className={`${getStatusColor()} text-xs`}>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </div>
            </Badge>
          </div>

          {/* Additional info for disconnected state */}
          {opponent.connectionStatus === 'disconnected' && (
            <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
              Your opponent has lost connection. They may rejoin shortly.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
