import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Crown, 
  RotateCcw, 
  Home, 
  Share2,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { useMultiplayerStore, multiplayerSelectors } from '@/stores/multiplayerStore';
import { multiplayerActions } from '@/services/multiplayerIntegration';
import { useToast } from '@/hooks/use-toast';
import { ScoreComparison } from './ScoreComparison';
import { PlayerList } from './PlayerList';

export function GameOver() {
  const { toast } = useToast();
  const [playAgainVote, setPlayAgainVote] = useState<boolean | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  
  const { 
    game, 
    currentPlayer, 
    opponent,
    actions 
  } = useMultiplayerStore();

  if (!game || !currentPlayer) {
    return null;
  }

  const currentPlayerTotal = game.roundResults.reduce((total, result) => {
    return total + (currentPlayer.isHost ? result.hostScore : result.opponentScore);
  }, 0);

  const opponentTotal = game.roundResults.reduce((total, result) => {
    return total + (currentPlayer.isHost ? result.opponentScore : result.hostScore);
  }, 0);

  const isWinner = currentPlayerTotal > opponentTotal;
  const isTie = currentPlayerTotal === opponentTotal;
  const winnerName = game.winner ? (game.winner === currentPlayer.id ? currentPlayer.name : opponent?.name) : null;

  const currentPlayerWins = game.roundResults.filter(result => {
    const currentScore = currentPlayer.isHost ? result.hostScore : result.opponentScore;
    const opponentScore = currentPlayer.isHost ? result.opponentScore : result.hostScore;
    return currentScore > opponentScore;
  }).length;

  const opponentWins = game.roundResults.filter(result => {
    const currentScore = currentPlayer.isHost ? result.hostScore : result.opponentScore;
    const opponentScore = currentPlayer.isHost ? result.opponentScore : result.hostScore;
    return opponentScore > currentScore;
  }).length;

  const ties = game.roundResults.length - currentPlayerWins - opponentWins;

  const handlePlayAgainVote = async (vote: boolean) => {
    if (isVoting) return;
    
    setIsVoting(true);
    setPlayAgainVote(vote);
    
    try {
      await multiplayerActions.votePlayAgain(vote);
      
      toast({
        title: vote ? "Voted to play again!" : "Declined to play again",
        description: vote ? 
          "Waiting for your opponent's vote..." : 
          "You can leave the room or change your vote.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to vote",
        description: error instanceof Error ? error.message : "Unable to submit your vote.",
      });
      setPlayAgainVote(null);
    } finally {
      setIsVoting(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await multiplayerActions.leaveRoom();
      actions.setActiveView('lobby');
      
      toast({
        title: "Left room",
        description: "You have returned to the main lobby.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error leaving room",
        description: error instanceof Error ? error.message : "Unable to leave the room.",
      });
    }
  };

  const handleShareResults = () => {
    const resultsText = `I just played Geo Pin Quest multiplayer! Final score: ${currentPlayerTotal} vs ${opponentTotal}. ${
      isWinner ? 'I won!' : isTie ? 'We tied!' : 'They got me this time!'
    } Want to challenge me?`;

    if (navigator.share) {
      navigator.share({
        title: 'Geo Pin Quest Results',
        text: resultsText,
        url: window.location.origin,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(resultsText);
        toast({
          title: "Results copied!",
          description: "Share your results with friends.",
        });
      });
    } else {
      navigator.clipboard.writeText(resultsText);
      toast({
        title: "Results copied!",
        description: "Share your results with friends.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Game Over Header */}
        <Card className={`border-2 ${
          isWinner ? 'border-green-200 bg-green-50' : 
          isTie ? 'border-yellow-200 bg-yellow-50' : 
          'border-blue-200 bg-blue-50'
        }`}>
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">
              {isWinner ? '🎉' : isTie ? '🤝' : '🏆'}
            </div>
            <CardTitle className={`text-3xl ${
              isWinner ? 'text-green-800' : 
              isTie ? 'text-yellow-800' : 
              'text-blue-800'
            }`}>
              {isWinner ? 'Victory!' : 
               isTie ? 'It\'s a Tie!' : 
               'Game Over'}
            </CardTitle>
            <p className={`text-lg ${
              isWinner ? 'text-green-700' : 
              isTie ? 'text-yellow-700' : 
              'text-blue-700'
            }`}>
              {isWinner ? 'Congratulations on your geographical mastery!' : 
               isTie ? 'Both players showed excellent geographical knowledge!' : 
               `${winnerName || 'Your opponent'} wins this round!`}
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Final Scores */}
          <div className="space-y-6">
            {/* Score Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Final Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Your Score */}
                  <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    isWinner ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      {isWinner && <Crown className="h-5 w-5 text-yellow-500" />}
                      <div>
                        <p className="font-semibold">{currentPlayer.name} (You)</p>
                        <p className="text-sm text-muted-foreground">
                          {currentPlayerWins} wins, {ties} ties
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xl px-4 py-2 ${
                      isWinner ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {currentPlayerTotal}
                    </Badge>
                  </div>

                  {/* Opponent Score */}
                  <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    !isWinner && !isTie ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      {!isWinner && !isTie && <Crown className="h-5 w-5 text-yellow-500" />}
                      <div>
                        <p className="font-semibold">{opponent?.name || 'Opponent'}</p>
                        <p className="text-sm text-muted-foreground">
                          {opponentWins} wins, {ties} ties
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-xl px-4 py-2 ${
                      !isWinner && !isTie ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {opponentTotal}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Game Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{currentPlayerWins}</p>
                    <p className="text-xs text-muted-foreground">Your Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{ties}</p>
                    <p className="text-xs text-muted-foreground">Ties</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{opponentWins}</p>
                    <p className="text-xs text-muted-foreground">Their Wins</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {isWinner && (
                    <Badge className="bg-yellow-100 text-yellow-800 p-2 justify-center">
                      🏆 Game Winner
                    </Badge>
                  )}
                  {currentPlayerWins >= opponentWins && (
                    <Badge className="bg-green-100 text-green-800 p-2 justify-center">
                      🎯 Most Rounds Won
                    </Badge>
                  )}
                  {currentPlayerTotal >= 4000 && (
                    <Badge className="bg-blue-100 text-blue-800 p-2 justify-center">
                      ⭐ High Scorer
                    </Badge>
                  )}
                  {ties > 0 && (
                    <Badge className="bg-purple-100 text-purple-800 p-2 justify-center">
                      🤝 Great Match
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Details */}
          <div className="space-y-6">
            {/* Detailed Score Breakdown */}
            <ScoreComparison
              currentPlayer={currentPlayer}
              opponent={opponent}
              roundResults={game.roundResults}
              showRoundBreakdown={true}
            />
          </div>
        </div>

        {/* Play Again Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Play Again?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {playAgainVote === null ? (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Would you like to play another game with the same settings?
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => handlePlayAgainVote(true)}
                    disabled={isVoting}
                    className="flex items-center gap-2"
                  >
                    {isVoting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Yes, Play Again!
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePlayAgainVote(false)}
                    disabled={isVoting}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    No Thanks
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <Badge className={`p-2 ${
                  playAgainVote ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {playAgainVote ? 'You voted to play again' : 'You declined to play again'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {playAgainVote ? 
                    'Waiting for your opponent to vote...' : 
                    'You can change your mind or leave the room'
                  }
                </p>
                {!playAgainVote && (
                  <Button
                    variant="outline"
                    onClick={() => setPlayAgainVote(null)}
                    size="sm"
                  >
                    Change Vote
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={handleShareResults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
          
          <Button
            onClick={handleLeaveRoom}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
