import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DifficultySelector } from '../components/multiplayer/DifficultySelector';
import { RoundLimitSelector } from '../components/multiplayer/RoundLimitSelector';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { useRoom } from '../hooks/useWebSocket';
import { useToast } from '../hooks/use-toast';

export default function CreateRoomPage() {
  const [difficulty, setDifficulty] = useState('medium');
  const [roundLimit, setRoundLimit] = useState(5);
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createRoom, isConnected } = useRoom();
  const room = useMultiplayerStore((state) => state.room);

  const handleCreateRoom = async () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Not connected to multiplayer server. Please check your connection.",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Convert difficulty to number (1-5 scale)
      const difficultyNum = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
      
      await createRoom(difficultyNum, roundLimit);
      
      toast({
        title: "Room Created!",
        description: "Your multiplayer room has been created successfully.",
      });

      // Navigate to room lobby when room is created
      // This will be handled by the WebSocket event listener
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Create Room",
        description: error instanceof Error ? error.message : "Unable to create room. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Redirect to lobby if room is created
  React.useEffect(() => {
    if (room.current?.id) {
      navigate(`/multiplayer/lobby/${room.current.id}`);
    }
  }, [room, navigate]);

  return (
    <div className="min-h-screen bg-blue-50/95 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-blue-900">Create Multiplayer Room</h1>
          <p className="text-blue-600 mt-2">Set up a new geography challenge game</p>
        </div>

        {/* Create Room Form */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="w-5 h-5 text-blue-600" />
              Room Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Difficulty Selection */}
            <DifficultySelector
              value={difficulty}
              onChange={setDifficulty}
              disabled={isCreating}
            />

            {/* Round Limit Selection */}
            <RoundLimitSelector
              value={roundLimit}
              onChange={setRoundLimit}
              disabled={isCreating}
            />

            {/* Create Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating || !isConnected}
                size="lg"
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Create Room
                  </>
                )}
              </Button>
              
              {!isConnected && (
                <p className="text-sm text-blue-900 mt-2 text-center">
                  Connecting to multiplayer server...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
