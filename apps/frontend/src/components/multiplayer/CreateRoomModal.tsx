import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Users, Settings, Trophy } from 'lucide-react';
import { useMultiplayerStore, multiplayerSelectors } from '@/stores/multiplayerStore';
import { multiplayerActions } from '@/services/multiplayerIntegration';

interface CreateRoomModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateRoomModal({ children, open, onOpenChange }: CreateRoomModalProps) {
  const [difficulty, setDifficulty] = useState<number>(3);
  const [roundLimit, setRoundLimit] = useState<number>(5);
  
  const { room, connection } = useMultiplayerStore();
  const isConnected = multiplayerSelectors.isConnected(useMultiplayerStore.getState());
  const isCreating = room.isCreating;
  const createError = room.createError;

  const handleCreateRoom = async () => {
    if (!isConnected) {
      return;
    }

    try {
      await multiplayerActions.createRoom(difficulty, roundLimit);
      // Modal will close automatically when room is created via store update
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const difficultyLabels = {
    1: { label: 'Very Easy', description: 'Well-known cities and landmarks', icon: '🌟' },
    2: { label: 'Easy', description: 'Major cities worldwide', icon: '⭐' },
    3: { label: 'Medium', description: 'Mix of major and smaller cities', icon: '🎯' },
    4: { label: 'Hard', description: 'Challenging locations', icon: '🔥' },
    5: { label: 'Expert', description: 'Obscure and difficult places', icon: '💎' },
  };

  const roundOptions = [
    { value: 3, label: '3 Rounds', description: 'Quick match' },
    { value: 5, label: '5 Rounds', description: 'Standard game' },
    { value: 7, label: '7 Rounds', description: 'Extended match' },
    { value: 10, label: '10 Rounds', description: 'Marathon game' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5 text-blue-600" />
            Create Multiplayer Room
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Connection Status */}
          {!isConnected && (
            <Card className="border-blue-200 bg-blue-50/95 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Connecting to multiplayer server...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {createError && (
            <Card className="border-blue-300 bg-blue-100/95 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-900">{createError}</p>
              </CardContent>
            </Card>
          )}

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Settings className="h-4 w-4" />
              Difficulty Level
            </Label>
            <Select value={difficulty.toString()} onValueChange={(value) => setDifficulty(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(difficultyLabels).map(([level, info]) => (
                  <SelectItem key={level} value={level}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{info.icon}</span>
                      <div>
                        <div className="font-medium">{info.label}</div>
                        <div className="text-xs text-muted-foreground">{info.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Round Limit Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <Trophy className="h-4 w-4" />
              Number of Rounds
            </Label>
            <Select value={roundLimit.toString()} onValueChange={(value) => setRoundLimit(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Card */}
          <Card className="bg-blue-50/95 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900">Game Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Difficulty:</span>
                <span className="font-medium text-blue-900">
                  {difficultyLabels[difficulty as keyof typeof difficultyLabels].icon}{' '}
                  {difficultyLabels[difficulty as keyof typeof difficultyLabels].label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Rounds:</span>
                <span className="font-medium text-blue-900">{roundLimit} rounds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Players:</span>
                <span className="font-medium text-blue-900">1v1 Multiplayer</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Estimated time:</span>
                <span className="font-medium text-blue-900">{Math.ceil(roundLimit * 1.5)} - {roundLimit * 2} minutes</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange?.(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateRoom}
              disabled={!isConnected || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Room'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
