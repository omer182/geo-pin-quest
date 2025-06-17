import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Trophy, Clock, Target, Users, MapPin } from 'lucide-react';
import type { Room } from '@geo-pin-quest/shared';

interface RoomSettingsProps {
  room: Room;
  className?: string;
}

export function RoomSettings({ room, className }: RoomSettingsProps) {
  const difficultyLabels = {
    1: { label: 'Very Easy', icon: '🌟', color: 'bg-green-100 text-green-800', description: 'Well-known cities' },
    2: { label: 'Easy', icon: '⭐', color: 'bg-blue-100 text-blue-800', description: 'Major cities worldwide' },
    3: { label: 'Medium', icon: '🎯', color: 'bg-yellow-100 text-yellow-800', description: 'Mix of cities' },
    4: { label: 'Hard', icon: '🔥', color: 'bg-orange-100 text-orange-800', description: 'Challenging locations' },
    5: { label: 'Expert', icon: '💎', color: 'bg-purple-100 text-purple-800', description: 'Obscure places' },
  };

  const currentDifficulty = difficultyLabels[room.difficulty as keyof typeof difficultyLabels];
  const estimatedMinTime = Math.ceil(room.roundLimit * 1.5);
  const estimatedMaxTime = room.roundLimit * 2;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Difficulty</span>
            </div>
            <Badge className={currentDifficulty.color}>
              <span className="mr-1">{currentDifficulty.icon}</span>
              {currentDifficulty.label}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rounds</span>
            </div>
            <span className="text-sm font-medium">{room.roundLimit}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time per Round</span>
            </div>
            <span className="text-sm font-medium">30 seconds</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Game Mode</span>
            </div>
            <Badge variant="outline">1v1 Battle</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Max Players</span>
            </div>
            <span className="text-sm font-medium">2</span>
          </div>
        </div>

        <Separator />

        {/* Game Info */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">DIFFICULTY INFO</p>
            <p className="text-sm">{currentDifficulty.description}</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">ESTIMATED TIME</p>
            <p className="text-sm">{estimatedMinTime} - {estimatedMaxTime} minutes</p>
          </div>
          
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">SCORING</p>
            <p className="text-sm">Distance-based points with time bonus</p>
          </div>
        </div>

        <Separator />

        {/* Room Status */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">ROOM STATUS</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              room.status === 'waiting' ? 'bg-yellow-500' : 
              room.status === 'playing' ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-sm capitalize">{room.status}</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Created: {new Date(room.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
