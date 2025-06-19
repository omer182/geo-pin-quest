import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Crown, 
  Settings, 
  Trophy, 
  Copy, 
  CheckCircle,
  UserPlus,
  Play,
  LogOut,
  Loader2,
  Clock,
  Target
} from 'lucide-react';
import { useMultiplayerStore, multiplayerSelectors } from '@/stores/multiplayerStore';
import { multiplayerActions } from '@/services/multiplayerIntegration';
import { useToast } from '@/hooks/use-toast';
import { ShareableLink } from './ShareableLink';
import { PlayerList } from './PlayerList';

export function RoomLobby() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    room, 
    currentPlayer, 
    opponent, 
    connection,
    actions 
  } = useMultiplayerStore();
  
  const isHost = multiplayerSelectors.isHost(useMultiplayerStore.getState());
  const hasOpponent = multiplayerSelectors.hasOpponent(useMultiplayerStore.getState());
  const canStartGame = multiplayerSelectors.canStartGame(useMultiplayerStore.getState());

  useEffect(() => {
    // Auto-focus on the room lobby view
    actions.setActiveView('room-lobby');
  }, [actions]);

  // Navigate to game when game starts
  useEffect(() => {
    const { ui, room } = useMultiplayerStore.getState();
    if (ui.activeView === 'game' && room.current?.id) {
      navigate(`/multiplayer/game/${room.current.id}`);
    }
  }, [navigate]);

  // Listen for activeView changes to navigate to game
  useEffect(() => {
    const unsubscribe = useMultiplayerStore.subscribe((state) => {
      if (state.ui.activeView === 'game' && state.room.current?.id) {
        navigate(`/multiplayer/game/${state.room.current.id}`);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleStartGame = async () => {
    if (!canStartGame) return;
    
    try {
      await multiplayerActions.startGame();
      toast({
        title: "Game Starting!",
        description: "Get ready for the first round.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to start game",
        description: error instanceof Error ? error.message : "Unable to start the game.",
      });
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await multiplayerActions.leaveRoom();
      actions.setActiveView('lobby');
      toast({
        title: "Left room",
        description: "You have left the multiplayer room.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error leaving room",
        description: error instanceof Error ? error.message : "Unable to leave the room.",
      });
    }
  };

  const handleCopyRoomCode = async () => {
    if (!room.current?.id) return;
    
    try {
      await navigator.clipboard.writeText(room.current.id);
      toast({
        title: "Room code copied!",
        description: "Share this code with your friend to join.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Unable to copy room code to clipboard.",
      });
    }
  };

  if (!room.current || !currentPlayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading room...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const difficultyLabels = {
    1: { label: 'Very Easy', icon: '🌟', color: 'bg-green-100 text-green-800' },
    2: { label: 'Easy', icon: '⭐', color: 'bg-blue-100 text-blue-800' },
    3: { label: 'Medium', icon: '🎯', color: 'bg-yellow-100 text-yellow-800' },
    4: { label: 'Hard', icon: '🔥', color: 'bg-orange-100 text-orange-800' },
    5: { label: 'Expert', icon: '💎', color: 'bg-purple-100 text-purple-800' },
  };

  const currentDifficulty = difficultyLabels[room.current.difficulty as keyof typeof difficultyLabels];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Room Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Multiplayer Room</CardTitle>
                  <p className="text-muted-foreground">
                    Waiting for players to join and start the game
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLeaveRoom}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Leave Room
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Code Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Room Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="text-center">
                      <div className="text-3xl font-mono font-bold tracking-widest text-blue-900">
                        {room.current.id}
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Share this code with your friend
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleCopyRoomCode} size="lg" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                
                {room.shareableLink && (
                  <div className="mt-4">
                    <ShareableLink link={room.shareableLink} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Players Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Players ({hasOpponent ? '2' : '1'}/2)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerList 
                  currentPlayer={currentPlayer}
                  opponent={opponent}
                  showStatus={true}
                />
                
                {!hasOpponent && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Waiting for opponent</p>
                        <p className="text-sm text-blue-700">
                          Share the room code with a friend to start playing
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Start Game Button */}
            {isHost && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                    size="lg"
                    className="w-full flex items-center gap-3"
                  >
                    <Play className="h-5 w-5" />
                    {hasOpponent ? 'Start Game' : 'Waiting for opponent...'}
                  </Button>
                  
                  {!hasOpponent && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      You need an opponent to start the game
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {!isHost && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Waiting for host to start the game...</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The room host will start the game when ready
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Game Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Difficulty</span>
                    <Badge className={currentDifficulty.color}>
                      <span className="mr-1">{currentDifficulty.icon}</span>
                      {currentDifficulty.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Rounds</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{room.current.roundLimit}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Time per Round</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">30 seconds</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Game Mode</span>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">1v1 Battle</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">ESTIMATED TIME</p>
                  <p className="text-sm">
                    {Math.ceil(room.current.roundLimit * 1.5)} - {room.current.roundLimit * 2} minutes
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Room Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Room Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Room active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connection.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm capitalize">{connection.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  <span className="text-sm">
                    Host: {isHost ? 'You' : (opponent?.name || 'Unknown')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
