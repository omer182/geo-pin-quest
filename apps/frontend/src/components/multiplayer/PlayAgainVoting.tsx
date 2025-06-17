import React, { useEffect, useState } from 'react';
import { useMultiplayerStore } from '../../stores/multiplayerStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { RefreshCw, Check, X, Users, Clock } from 'lucide-react';

interface PlayAgainVotingProps {
  className?: string;
  votingTimeLimit?: number; // seconds
}

interface PlayerVoteProps {
  playerId: string;
  playerName: string;
  hasVoted: boolean;
  vote: boolean | null;
  isCurrentPlayer: boolean;
}

const PlayerVote: React.FC<PlayerVoteProps> = ({
  playerId,
  playerName,
  hasVoted,
  vote,
  isCurrentPlayer
}) => {
  const getVoteIcon = () => {
    if (!hasVoted) return <Clock className="w-4 h-4 text-gray-400" />;
    if (vote === true) return <Check className="w-4 h-4 text-green-600" />;
    if (vote === false) return <X className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getVoteText = () => {
    if (!hasVoted) return 'Waiting...';
    if (vote === true) return 'Yes';
    if (vote === false) return 'No';
    return 'Waiting...';
  };

  const getVoteColor = () => {
    if (!hasVoted) return 'text-gray-500';
    if (vote === true) return 'text-green-600';
    if (vote === false) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded ${isCurrentPlayer ? 'bg-blue-50' : ''}`}>
      <span className={`font-medium ${isCurrentPlayer ? 'text-blue-900' : 'text-gray-900'}`}>
        {playerName}
        {isCurrentPlayer && <span className="text-blue-600 ml-1">(You)</span>}
      </span>
      
      <div className={`flex items-center space-x-1 ${getVoteColor()}`}>
        {getVoteIcon()}
        <span className="text-sm font-medium">{getVoteText()}</span>
      </div>
    </div>
  );
};

export const PlayAgainVoting: React.FC<PlayAgainVotingProps> = ({ 
  className, 
  votingTimeLimit = 30 
}) => {
  const [timeLeft, setTimeLeft] = useState(votingTimeLimit);
  const [hasVoted, setHasVoted] = useState(false);
  
  const players = useMultiplayerStore((state) => state.room.players);
  const currentPlayerId = useMultiplayerStore((state) => state.room.playerId);
  const gameState = useMultiplayerStore((state) => state.game.state);
  const playAgainVotes = useMultiplayerStore((state) => state.game.playAgainVotes || {});
  
  const { votePlayAgain } = useWebSocket();

  // Countdown timer
  useEffect(() => {
    if (gameState === 'play_again_voting' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft]);

  // Reset state when voting starts
  useEffect(() => {
    if (gameState === 'play_again_voting') {
      setTimeLeft(votingTimeLimit);
      setHasVoted(false);
    }
  }, [gameState, votingTimeLimit]);

  // Only show during play again voting phase
  if (gameState !== 'play_again_voting') {
    return null;
  }

  const handleVote = async (vote: boolean) => {
    if (hasVoted) return;
    
    setHasVoted(true);
    await votePlayAgain(vote);
  };

  // Calculate voting statistics
  const totalPlayers = players.length;
  const votedPlayers = Object.keys(playAgainVotes).length;
  const yesVotes = Object.values(playAgainVotes).filter(vote => vote === true).length;
  const noVotes = Object.values(playAgainVotes).filter(vote => vote === false).length;
  const progressPercentage = (votedPlayers / totalPlayers) * 100;

  // Check if voting is complete
  const allPlayersVoted = votedPlayers === totalPlayers;
  const majorityYes = yesVotes > totalPlayers / 2;

  const currentPlayerVote = playAgainVotes[currentPlayerId];
  const currentPlayerHasVoted = currentPlayerId in playAgainVotes;

  return (
    <Card className={`max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-lg font-semibold flex items-center justify-center">
          <RefreshCw className="w-5 h-5 mr-2" />
          Play Again?
        </CardTitle>
        <p className="text-sm text-gray-600">
          Vote to start a new game with the same players
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voting Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{votedPlayers} of {totalPlayers} voted</span>
            <span>{timeLeft}s remaining</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Vote Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{yesVotes}</div>
            <div className="text-sm text-green-700">Yes</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{noVotes}</div>
            <div className="text-sm text-red-700">No</div>
          </div>
        </div>

        {/* Voting Buttons */}
        {!currentPlayerHasVoted && timeLeft > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleVote(true)}
              className="bg-green-600 hover:bg-green-700"
              disabled={hasVoted}
            >
              <Check className="w-4 h-4 mr-2" />
              Yes
            </Button>
            <Button
              onClick={() => handleVote(false)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              disabled={hasVoted}
            >
              <X className="w-4 h-4 mr-2" />
              No
            </Button>
          </div>
        )}

        {/* Current player's vote */}
        {currentPlayerHasVoted && (
          <div className="text-center p-2 rounded bg-blue-50 border border-blue-200">
            <span className="text-sm text-blue-700">
              You voted: {currentPlayerVote ? 'Yes' : 'No'}
            </span>
          </div>
        )}

        {/* Player vote status */}
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Users className="w-4 h-4 mr-1" />
            Player Votes
          </div>
          {players.map(player => (
            <PlayerVote
              key={player.id}
              playerId={player.id}
              playerName={player.name}
              hasVoted={player.id in playAgainVotes}
              vote={playAgainVotes[player.id] || null}
              isCurrentPlayer={player.id === currentPlayerId}
            />
          ))}
        </div>

        {/* Voting result preview */}
        {allPlayersVoted && (
          <div className="text-center p-3 rounded-lg border">
            {majorityYes ? (
              <div className="text-green-600">
                <Check className="w-6 h-6 mx-auto mb-1" />
                <p className="font-medium">Starting new game...</p>
              </div>
            ) : (
              <div className="text-red-600">
                <X className="w-6 h-6 mx-auto mb-1" />
                <p className="font-medium">Returning to lobby...</p>
              </div>
            )}
          </div>
        )}

        {/* Time up message */}
        {timeLeft === 0 && !allPlayersVoted && (
          <div className="text-center p-3 rounded-lg bg-gray-50 border">
            <Clock className="w-6 h-6 mx-auto mb-1 text-gray-500" />
            <p className="text-sm text-gray-600">Time's up! Processing votes...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
