import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Spade, Coins } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function BlackjackGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [betAmount, setBetAmount] = useState("100");
  const [lastResult, setLastResult] = useState<any>(null);

  const playMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/games/blackjack/play", {
        userId: user?.id,
        betAmount: parseInt(betAmount),
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/history"] });
      
      if (data.isPush) {
        toast({
          title: "Push",
          description: "It's a tie! Bet returned.",
        });
      } else if (data.won) {
        toast({
          title: "You Won!",
          description: `You won ${data.payout} points!`,
        });
      } else {
        toast({
          title: "You Lost",
          description: "Dealer wins this round!",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to play game",
        variant: "destructive",
      });
    },
  });

  const handlePlay = () => {
    const bet = parseInt(betAmount);
    
    if (!bet || bet <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (user && user.points < bet) {
      toast({
        title: "Insufficient Points",
        description: "You don't have enough points",
        variant: "destructive",
      });
      return;
    }
    
    playMutation.mutate();
  };

  if (!user) {
    return null;
  }

  const cardSuits = ['♠', '♥', '♦', '♣'];
  const getCardDisplay = (value: number) => {
    if (value === 1) return 'A';
    if (value === 11) return 'J';
    if (value === 12) return 'Q';
    if (value === 13) return 'K';
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />

      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-4">
              <Spade className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Blackjack <span className="text-red-600">21</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Get 21 or beat the dealer! Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            <h2 className="text-2xl font-bold text-white mb-6">Place Your Bet</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="bet">Bet Amount</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(String(Math.max(10, parseInt(betAmount || "100") / 2)))}
                    className="px-3"
                  >
                    1/2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(String(parseInt(betAmount || "100") * 2))}
                    className="px-3"
                  >
                    2×
                  </Button>
                  <Input
                    id="bet"
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter bet amount"
                    className="flex-1"
                    data-testid="input-bet-amount"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Potential Win</span>
                  <span className="text-white font-bold">{(parseInt(betAmount || "0") * 2).toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-zinc-500">Blackjack Pays</span>
                  <span className="text-yellow-500 font-bold">{Math.floor(parseInt(betAmount || "0") * 2.5).toLocaleString()} pts</span>
                </div>
              </div>

              <Button
                onClick={handlePlay}
                disabled={playMutation.isPending}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                data-testid="button-play"
              >
                {playMutation.isPending ? (
                  <>
                    <Spade className="w-5 h-5 mr-2 animate-pulse" />
                    Dealing...
                  </>
                ) : (
                  <>
                    Deal Cards
                    <Spade className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="p-4 bg-zinc-800/50 rounded-lg mt-4">
                <h3 className="text-sm font-semibold text-white mb-2">Payouts</h3>
                <div className="space-y-1 text-sm text-zinc-400">
                  <div className="flex justify-between">
                    <span>Blackjack (21)</span>
                    <span className="text-green-500 font-bold">2.5x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win</span>
                    <span className="text-green-500 font-bold">2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Push (Tie)</span>
                    <span className="text-yellow-500 font-bold">1x</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            <h2 className="text-2xl font-bold text-white mb-6">Game</h2>
            
            {lastResult && lastResult.playerCards && lastResult.dealerCards && Array.isArray(lastResult.playerCards) && Array.isArray(lastResult.dealerCards) ? (
              <div className="space-y-6">
                <div>
                  <p className="text-zinc-400 text-sm mb-2">Dealer's Hand ({lastResult.dealerTotal || 0})</p>
                  <div className="flex gap-2 flex-wrap">
                    {lastResult.dealerCards.map((card: number, idx: number) => (
                      <div key={idx} className="w-14 h-20 bg-white rounded border-2 border-zinc-700 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-zinc-900" data-testid={`dealer-card-${idx}`}>{getCardDisplay(card)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-zinc-400 text-sm mb-2">Your Hand ({lastResult.playerTotal || 0})</p>
                  <div className="flex gap-2 flex-wrap">
                    {lastResult.playerCards.map((card: number, idx: number) => (
                      <div key={idx} className="w-14 h-20 bg-white rounded border-2 border-zinc-700 flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-zinc-900" data-testid={`player-card-${idx}`}>{getCardDisplay(card)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-xl ${
                  lastResult.isPush ? 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-600/40' :
                  lastResult.won ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/40' : 
                  'bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-600/40'
                }`}>
                  <p className={`text-center text-2xl font-black ${
                    lastResult.isPush ? 'text-yellow-400' :
                    lastResult.won ? 'text-green-400' : 
                    'text-red-400'
                  }`}>
                    {lastResult.isPush ? '🤝 PUSH!' : lastResult.won ? '🎰 YOU WON!' : '😞 DEALER WINS'}
                  </p>
                  {(lastResult.won || lastResult.isPush) && lastResult.payout !== undefined && (
                    <p className="text-center text-3xl font-black text-white mt-2">
                      {lastResult.isPush ? 'Bet Returned' : `+${lastResult.payout.toLocaleString()} points`}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">New Balance</span>
                    <span className="text-white font-bold text-lg" data-testid="text-new-balance">
                      <Coins className="w-4 h-4 inline mr-1 text-yellow-500" />
                      {lastResult?.newBalance?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Spade className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-50" />
                <p className="text-zinc-500">Place a bet to start!</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 mt-6 border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
          <ul className="text-zinc-400 space-y-2">
            <li>• This is an auto-play version - the game plays out automatically when you deal cards</li>
            <li>• Get a hand total closer to 21 than the dealer without going over</li>
            <li>• Aces count as 1 or 11, face cards count as 10</li>
            <li>• Blackjack (21 with 2 cards) pays 2.5x your bet</li>
            <li>• Dealer automatically hits on 16 and stands on 17</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function BlackjackGame() {
  return (
    <ProtectedRoute>
      <BlackjackGamePage />
    </ProtectedRoute>
  );
}
