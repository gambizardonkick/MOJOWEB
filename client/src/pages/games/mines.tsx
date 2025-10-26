import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bomb, Gem, Coins } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function MinesGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [betAmount, setBetAmount] = useState("100");
  const [minesCount, setMinesCount] = useState("3");
  const [revealed, setRevealed] = useState("5");
  const [lastResult, setLastResult] = useState<any>(null);

  const totalTiles = 25;
  const safeTiles = totalTiles - parseInt(minesCount || "3");
  const winChance = revealed && minesCount ? (safeTiles / totalTiles * ((safeTiles - 1) / (totalTiles - 1)) * ((safeTiles - 2) / (totalTiles - 2))) * 100 : 0;
  const multiplier = revealed && minesCount ? Math.pow((totalTiles / (totalTiles - parseInt(minesCount || "3"))), parseInt(revealed || "5")) * 0.95 : 1;
  const potentialPayout = Math.floor(parseInt(betAmount || "0") * multiplier);

  const playMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/games/mines/play", {
        userId: user?.id,
        betAmount: parseInt(betAmount),
        mines: parseInt(minesCount),
        revealed: parseInt(revealed),
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/history"] });
      
      if (data.won) {
        toast({
          title: "You Won!",
          description: `You won ${data.payout} points!`,
        });
      } else {
        toast({
          title: "Hit a Mine!",
          description: `Better luck next time!`,
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
    const mines = parseInt(minesCount);
    const rev = parseInt(revealed);
    
    if (!bet || bet <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!mines || mines < 1 || mines > 24) {
      toast({
        title: "Invalid Mines Count",
        description: "Mines count must be between 1 and 24",
        variant: "destructive",
      });
      return;
    }
    
    if (!rev || rev < 1 || rev > 24) {
      toast({
        title: "Invalid Revealed Count",
        description: "Revealed count must be between 1 and 24",
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

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />

      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-4">
              <Bomb className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Mines <span className="text-red-600">Game</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Avoid the mines and win! Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="mines">Number of Mines</Label>
                  <span className="text-sm text-zinc-400">{minesCount}</span>
                </div>
                <input
                  id="mines"
                  type="range"
                  value={minesCount}
                  onChange={(e) => setMinesCount(e.target.value)}
                  min="1"
                  max="24"
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                  data-testid="input-mines-count"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="revealed">Tiles to Reveal</Label>
                  <span className="text-sm text-zinc-400">{revealed}</span>
                </div>
                <input
                  id="revealed"
                  type="range"
                  value={revealed}
                  onChange={(e) => setRevealed(e.target.value)}
                  min="1"
                  max="24"
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-600"
                  data-testid="input-revealed-count"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Mines</p>
                  <p className="text-lg font-bold text-red-500"><Bomb className="w-4 h-4 inline mr-1" />{minesCount}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Multiplier</p>
                  <p className="text-lg font-bold text-green-500">{multiplier.toFixed(2)}x</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Payout on Win</p>
                  <p className="text-lg font-bold text-yellow-500">{potentialPayout.toLocaleString()} points</p>
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
                    <Bomb className="w-5 h-5 mr-2 animate-pulse" />
                    Playing...
                  </>
                ) : (
                  <>
                    Play Mines
                    <Bomb className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/50">
            <h2 className="text-2xl font-bold text-white mb-6">Result</h2>
            
            {lastResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-800/30 rounded-lg">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center ${
                        lastResult.hitMine && i === 0 ? 'bg-gradient-to-br from-red-600 to-red-500' : 'bg-gradient-to-br from-green-600 to-green-500'
                      } ${i < parseInt(revealed) ? 'opacity-100' : 'opacity-20'}`}
                    >
                      {i < parseInt(revealed) ? (
                        lastResult.hitMine && i === 0 ? (
                          <Bomb className="w-6 h-6 text-white" />
                        ) : (
                          <Gem className="w-6 h-6 text-white" />
                        )
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className={`p-6 rounded-xl ${lastResult.won ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/40' : 'bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-600/40'}`}>
                  <p className={`text-center text-2xl font-black ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.won ? '💎 YOU WON!' : '💥 HIT A MINE!'}
                  </p>
                  {lastResult.won && (
                    <p className="text-center text-3xl font-black text-white mt-2">
                      +{lastResult.payout.toLocaleString()} points
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
                <Bomb className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-50" />
                <p className="text-zinc-500">Place a bet to play!</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 mt-6 border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
          <ul className="text-zinc-400 space-y-2">
            <li>• Choose your bet amount</li>
            <li>• Select how many mines are hidden (more mines = higher risk, higher reward)</li>
            <li>• Choose how many tiles you want to reveal</li>
            <li>• If you don't hit a mine, you win based on the risk level!</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function MinesGame() {
  return (
    <ProtectedRoute>
      <MinesGamePage />
    </ProtectedRoute>
  );
}
