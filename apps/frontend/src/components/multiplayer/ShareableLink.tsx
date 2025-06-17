import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, CheckCircle, Share, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableLinkProps {
  link: string;
  className?: string;
}

export function ShareableLink({ link, className }: ShareableLinkProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      
      toast({
        title: "Link copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Unable to copy link to clipboard.",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Geo Pin Quest game!',
          text: 'I\'ve created a multiplayer geography quiz room. Click the link to join and test your knowledge!',
          url: link,
        });
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        handleCopyLink();
      }
    } else {
      // Web Share API not supported, fallback to copy
      handleCopyLink();
    }
  };

  const handleOpenLink = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={`border-green-200 bg-green-50 ${className}`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Share className="h-4 w-4 text-green-600" />
            <Label className="text-sm font-medium text-green-800">
              Shareable Link
            </Label>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={link}
              readOnly
              className="flex-1 text-xs bg-white border-green-300 focus:border-green-500"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopyLink}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-100"
            >
              {copied ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Share className="h-3 w-3 mr-1" />
              Share Link
            </Button>
            <Button
              onClick={handleOpenLink}
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          
          <p className="text-xs text-green-700">
            Send this link to your friend so they can join directly without entering the room code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
