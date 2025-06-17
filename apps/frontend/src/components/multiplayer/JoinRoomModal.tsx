import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, User, AlertCircle } from 'lucide-react';
import { useMultiplayerStore, multiplayerSelectors } from '@/stores/multiplayerStore';
import { multiplayerActions } from '@/services/multiplayerIntegration';

interface JoinRoomModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialRoomCode?: string; // For when joining via URL
}

export function JoinRoomModal({ children, open, onOpenChange, initialRoomCode }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [playerName, setPlayerName] = useState('');
  const [errors, setErrors] = useState<{ roomCode?: string; playerName?: string }>({});
  
  const { room, connection } = useMultiplayerStore();
  const isConnected = multiplayerSelectors.isConnected(useMultiplayerStore.getState());
  const isJoining = room.isJoining;
  const joinError = room.joinError;

  const validateInputs = () => {
    const newErrors: { roomCode?: string; playerName?: string } = {};
    
    if (!roomCode.trim()) {
      newErrors.roomCode = 'Room code is required';
    } else if (roomCode.trim().length !== 8) {
      newErrors.roomCode = 'Room code must be 8 characters';
    } else if (!/^[A-Z0-9]+$/i.test(roomCode.trim())) {
      newErrors.roomCode = 'Room code must contain only letters and numbers';
    }
    
    if (!playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (playerName.trim().length < 2) {
      newErrors.playerName = 'Player name must be at least 2 characters';
    } else if (playerName.trim().length > 20) {
      newErrors.playerName = 'Player name must be 20 characters or less';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(playerName.trim())) {
      newErrors.playerName = 'Player name can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinRoom = async () => {
    if (!isConnected || !validateInputs()) {
      return;
    }

    try {
      await multiplayerActions.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
      // Modal will close automatically when room is joined via store update
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleRoomCodeChange = (value: string) => {
    // Auto-format to uppercase and limit to 8 characters
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setRoomCode(formatted);
    
    // Clear room code error when user starts typing
    if (errors.roomCode) {
      setErrors(prev => ({ ...prev, roomCode: undefined }));
    }
  };

  const handlePlayerNameChange = (value: string) => {
    setPlayerName(value.slice(0, 20)); // Limit to 20 characters
    
    // Clear player name error when user starts typing
    if (errors.playerName) {
      setErrors(prev => ({ ...prev, playerName: undefined }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining && isConnected) {
      handleJoinRoom();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5 text-blue-600" />
            Join Multiplayer Room
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
          {joinError && (
            <Card className="border-blue-300 bg-blue-100/95 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{joinError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Room Code Input */}
          <div className="space-y-2">
            <Label htmlFor="roomCode" className="text-base font-semibold">
              Room Code
            </Label>
            <Input
              id="roomCode"
              placeholder="Enter 8-character room code"
              value={roomCode}
              onChange={(e) => handleRoomCodeChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`text-center text-lg font-mono tracking-wider ${
                errors.roomCode ? 'border-blue-500 focus:border-blue-500' : ''
              }`}
              maxLength={8}
              disabled={isJoining}
            />
            {errors.roomCode && (
              <p className="text-sm text-blue-900 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.roomCode}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Ask the room host for the 8-character room code
            </p>
          </div>

          {/* Player Name Input */}
          <div className="space-y-2">
            <Label htmlFor="playerName" className="flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-blue-600" />
              Your Name
            </Label>
            <Input
              id="playerName"
              placeholder="Enter your display name"
              value={playerName}
              onChange={(e) => handlePlayerNameChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className={errors.playerName ? 'border-blue-500 focus:border-blue-500' : ''}
              maxLength={20}
              disabled={isJoining}
            />
            {errors.playerName && (
              <p className="text-sm text-blue-900 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.playerName}
              </p>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This name will be visible to other players</span>
              <span>{playerName.length}/20</span>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50/95 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm text-blue-800">
                <p className="font-medium">How to join:</p>
                <ol className="space-y-1 text-xs">
                  <li>1. Get the room code from the host</li>
                  <li>2. Enter your display name</li>
                  <li>3. Click "Join Room" to enter the lobby</li>
                  <li>4. Wait for the host to start the game</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange?.(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleJoinRoom}
              disabled={!isConnected || isJoining || !roomCode.trim() || !playerName.trim()}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
