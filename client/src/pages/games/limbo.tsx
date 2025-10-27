import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TrendingUp, Coins } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { GameHistory } from "@shared/schema";
import { HOUSE_EDGE } from "@shared/constants";

function LimboGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [betAmount, setBetAmount] = useState("100");
  const [targetMultiplier, setTargetMultiplier] = useState("2");
  const [lastResult, setLastResult] = useState<any>(null);
  
  const { data: gameHistory = [] } = useQuery<GameHistory[]>({
    queryKey: ["/api/games/history", user?.id],
    enabled: !!user?.id,
  });
  
  const winChance = ((1 / parseFloat(targetMultiplier || "2")) * (1 - HOUSE_EDGE)) * 100;
  const potentialPayout = Math.floor(parseInt(betAmount || "0") * parseFloat(targetMultiplier || "2") * (1 - HOUSE_EDGE));

  const playMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/games/limbo/play", {
        userId: user?.id,
        betAmount: parseInt(betAmount),
        targetMultiplier: parseFloat(targetMultiplier),
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/history", user?.id] });
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
    const target = parseFloat(targetMultiplier);
    
    if (!bet || bet <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!target || target < 1.01) {
      toast({
        title: "Invalid Multiplier",
        description: "Target multiplier must be at least 1.01",
        variant: "destructive",
      });
      return;
    }
    
    if (target > 1000) {
      toast({
        title: "Invalid Multiplier",
        description: "Target multiplier cannot exceed 1000",
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
              <TrendingUp className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Limbo <span className="text-red-600">Game</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Aim high and win big! Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
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
                <Label htmlFor="multiplier">Target Multiplier (1.01 - 1000)</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="1000"
                  value={targetMultiplier}
                  onChange={(e) => setTargetMultiplier(e.target.value)}
                  placeholder="Enter target multiplier"
                  className="mt-2"
                  data-testid="input-target-multiplier"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Win Chance</p>
                  <p className="text-lg font-bold text-white">{winChance.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Payout on Win</p>
                  <p className="text-lg font-bold text-yellow-500">{potentialPayout.toLocaleString()} pts</p>
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
                    <TrendingUp className="w-5 h-5 mr-2 animate-pulse" />
                    Playing...
                  </>
                ) : (
                  <>
                    Play Limbo
                    <TrendingUp className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/50 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Result</h2>
            
            {lastResult && lastResult.crashPoint !== undefined ? (
              <div className="space-y-4 mb-6">
                <div className="text-center py-6 bg-zinc-800/30 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Crash Point</p>
                  <p className={`text-6xl font-black ${lastResult.won ? 'text-green-400' : 'text-red-400'}`} data-testid="text-crash-point">
                    {lastResult.crashPoint.toFixed(2)}x
                  </p>
                  <p className="text-sm text-zinc-500 mt-2">Target: {parseFloat(targetMultiplier).toFixed(2)}x</p>
                </div>

                <div className={`p-4 rounded-xl ${lastResult.won ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/40' : 'bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-600/40'}`}>
                  <p className={`text-center text-xl font-black ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.won ? 'YOU WON!' : 'CRASHED!'}
                  </p>
                  {lastResult.won && lastResult.payout > 0 && (
                    <p className="text-center text-2xl font-black text-white mt-1">
                      +{lastResult.payout.toLocaleString()} points
                    </p>
                  )}
                </div>

                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">New Balance</span>
                    <span className="text-white font-bold" data-testid="text-new-balance">
                      <Coins className="w-4 h-4 inline mr-1 text-yellow-500" />
                      {lastResult?.newBalance?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={lastResult && lastResult.crashPoint !== undefined ? 'flex-1' : ''}>
              <h3 className="text-lg font-bold text-white mb-3">Game History</h3>
              {gameHistory.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-zinc-900">
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Crash</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Bet</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Payout</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameHistory
                        .filter((game) => game.gameName === "limbo")
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((game, index) => {
                          const gameData = game.gameData ? JSON.parse(game.gameData) : {};
                          return (
                            <tr 
                              key={game.id} 
                              className="border-b border-zinc-800/50 hover-elevate"
                              data-testid={`row-history-${index}`}
                            >
                              <td className="py-2 px-2 text-white font-mono" data-testid={`text-crash-${index}`}>
                                {gameData.crashPoint ? Number(gameData.crashPoint).toFixed(2) : 'N/A'}x
                              </td>
                              <td className="py-2 px-2 text-white" data-testid={`text-bet-${index}`}>
                                {game.betAmount.toLocaleString()}
                              </td>
                              <td className="py-2 px-2 text-white" data-testid={`text-payout-${index}`}>
                                {game.payout.toLocaleString()}
                              </td>
                              <td className="py-2 px-2" data-testid={`text-result-${index}`}>
                                <span className={`font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                                  {game.result === 'win' ? 'WIN' : 'LOSS'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No game history yet. Place your first bet!</p>
              )}
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-6 border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
          <ul className="text-zinc-400 space-y-2">
            <li>• Choose your bet amount</li>
            <li>• Set a target multiplier (between 1.01x and 1000x)</li>
            <li>• Win if the crash point is equal to or above your target</li>
            <li>• Higher multipliers = lower win chance but bigger payouts</li>
            <li>• All payouts include a 1% house edge</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function LimboGame() {
  return (
    <ProtectedRoute>
      <LimboGamePage />
    </ProtectedRoute>
  );
}
