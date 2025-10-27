import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dices, ArrowUp, ArrowDown, Coins } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { GameHistory } from "@shared/schema";

function DiceGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [betAmount, setBetAmount] = useState("100");
  const [targetNumber, setTargetNumber] = useState("50");
  const [direction, setDirection] = useState<"under" | "over">("over");
  const [lastResult, setLastResult] = useState<any>(null);
  const [isRolling, setIsRolling] = useState(false);

  const { data: gameHistory = [] } = useQuery<GameHistory[]>({
    queryKey: ["/api/games/history", user?.id],
    enabled: !!user?.id,
  });

  const target = parseInt(targetNumber || "50");
  const winChance = direction === "under" ? (target / 100) * 100 : ((100 - target) / 100) * 100;
  const multiplier = direction === "under" 
    ? (target > 0 ? (100 / target) * 0.99 : 0)
    : ((100 - target) > 0 ? (100 / (100 - target)) * 0.99 : 0);
  const potentialPayout = Math.floor(parseInt(betAmount || "0") * multiplier);

  const playMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/games/dice/play", {
        userId: user?.id,
        betAmount: parseInt(betAmount),
        targetNumber: parseInt(targetNumber),
        direction,
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      console.log('Raw API response:', data);
      const currentBetDirection = direction;
      const currentBetTarget = targetNumber;
      
      const enrichedData = {
        ...data,
        betDirection: currentBetDirection,
        betTarget: currentBetTarget,
      };
      
      console.log('Enriched data:', enrichedData);
      
      setIsRolling(true);
      setTimeout(() => {
        console.log('Setting lastResult to:', enrichedData);
        setLastResult(enrichedData);
        setIsRolling(false);
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/games/history", user?.id] });
      }, 1000);
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
    const target = parseInt(targetNumber);
    
    if (!bet || bet <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (target === undefined || target < 0 || target > 100) {
      toast({
        title: "Invalid Target",
        description: "Target number must be between 0 and 100",
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
              <Dices className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Dice <span className="text-red-600">Game</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Predict whether the roll will be under or over! Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
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
                  <Label htmlFor="target">Target Number</Label>
                  <span className="text-sm text-zinc-400">{targetNumber}</span>
                </div>
                <input
                  id="target"
                  type="range"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  min="1"
                  max="99"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer dice-slider"
                  style={{
                    background: direction === "under" 
                      ? `linear-gradient(to right, #dc2626 0%, #dc2626 ${target}%, #3f3f46 ${target}%, #3f3f46 100%)`
                      : `linear-gradient(to right, #3f3f46 0%, #3f3f46 ${target}%, #dc2626 ${target}%, #dc2626 100%)`
                  }}
                  data-testid="input-target-number"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Win Chance</p>
                  <p className="text-lg font-bold text-white">{winChance.toFixed(2)}%</p>
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

              <div className="flex gap-2">
                <Button
                  variant={direction === "under" ? "default" : "secondary"}
                  onClick={() => setDirection("under")}
                  className="flex-1"
                  data-testid="button-roll-under"
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Roll Under
                </Button>
                <Button
                  variant={direction === "over" ? "default" : "secondary"}
                  onClick={() => setDirection("over")}
                  className="flex-1"
                  data-testid="button-roll-over"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Roll Over
                </Button>
              </div>

              <Button
                onClick={handlePlay}
                disabled={playMutation.isPending || isRolling}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                data-testid="button-play"
              >
                {playMutation.isPending || isRolling ? (
                  <>
                    <Dices className="w-5 h-5 mr-2 animate-spin" />
                    Rolling...
                  </>
                ) : (
                  <>
                    Roll Dice
                    <Dices className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/50 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6">Result</h2>
            
            {isRolling ? (
              <div className="text-center py-12">
                <Dices className="w-16 h-16 text-red-600 mx-auto mb-4 animate-spin" />
                <p className="text-zinc-400 animate-pulse">Rolling the dice...</p>
              </div>
            ) : lastResult && typeof lastResult.roll === 'number' ? (
              <div className="space-y-4 mb-6">
                <div className="text-center py-6 bg-zinc-800/30 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Roll Result</p>
                  <p className={`text-6xl font-black ${lastResult.won ? 'text-green-400' : 'text-red-400'}`} data-testid="text-result">
                    {lastResult.roll.toFixed(2)}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2">
                    Target: {(lastResult.betDirection || direction) === "under" ? "Under" : "Over"} {lastResult.betTarget || targetNumber}
                  </p>
                </div>

                <div className={`p-4 rounded-xl ${lastResult.won ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/40' : 'bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-600/40'}`}>
                  <p className={`text-center text-xl font-black ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.won ? 'YOU WON!' : 'YOU LOST'}
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

            <div className={lastResult && typeof lastResult.roll === 'number' ? 'flex-1' : ''}>
              <h3 className="text-lg font-bold text-white mb-3">Game History</h3>
              {gameHistory.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-zinc-900">
                      <tr className="border-b border-zinc-800">
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Roll</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Bet</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Mult.</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Payout</th>
                        <th className="text-left py-2 px-2 text-zinc-400 font-medium">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameHistory
                        .filter((game) => game.gameName === "dice")
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((game, index) => {
                          const gameData = game.gameData ? JSON.parse(game.gameData) : {};
                          return (
                            <tr 
                              key={game.id} 
                              className="border-b border-zinc-800/50 hover-elevate"
                              data-testid={`row-history-${index}`}
                            >
                              <td className="py-2 px-2 text-white font-mono" data-testid={`text-roll-${index}`}>
                                {gameData.roll?.toFixed(2) || 'N/A'}
                              </td>
                              <td className="py-2 px-2 text-white" data-testid={`text-bet-${index}`}>
                                {game.betAmount.toLocaleString()}
                              </td>
                              <td className="py-2 px-2 text-white" data-testid={`text-multiplier-${index}`}>
                                {gameData.multiplier?.toFixed(2) || '0.00'}x
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
            <li>• Select a target number between 0 and 100</li>
            <li>• Choose whether to roll under or over your target</li>
            <li>• Win multiplier is based on the probability: (100 / targetNumber) * 0.99</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default function DiceGame() {
  return (
    <ProtectedRoute>
      <DiceGamePage />
    </ProtectedRoute>
  );
}
