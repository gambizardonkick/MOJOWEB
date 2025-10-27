import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Bomb, Gem, Coins, TrendingUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

type GameState = 'betting' | 'playing' | 'gameover';

function MinesGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [betAmount, setBetAmount] = useState("100");
  const [minesCount, setMinesCount] = useState("3");
  const [gameState, setGameState] = useState<GameState>('betting');
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);

  // Check for active game on mount
  const { data: activeGameData } = useQuery<any>({
    queryKey: ["/api/games/mines/active", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/games/mines/active/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch active game');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Restore active game state
  useEffect(() => {
    if (activeGameData?.hasActiveGame) {
      setGameId(activeGameData.gameId);
      setBetAmount(String(activeGameData.betAmount));
      setMinesCount(String(activeGameData.minesCount));
      setRevealedTiles(activeGameData.revealedTiles);
      setCurrentMultiplier(activeGameData.currentMultiplier);
      setGameState('playing');
    }
  }, [activeGameData]);

  const totalTiles = 25;
  const mines = parseInt(minesCount || "3");
  const safeTiles = totalTiles - mines;

  const startGameMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/games/mines/start", {
        userId: user?.id,
        betAmount: parseInt(betAmount),
        minesCount: parseInt(minesCount),
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setGameId(data.gameId);
      setGameState('playing');
      setRevealedTiles([]);
      setMinePositions([]);
      setCurrentMultiplier(0);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Game Started!",
        description: "Click tiles to reveal them. Avoid the mines!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start game",
        variant: "destructive",
      });
    },
  });

  const revealTileMutation = useMutation({
    mutationFn: async (position: number) => {
      return apiRequest("POST", "/api/games/mines/reveal", {
        userId: user?.id,
        position,
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setRevealedTiles(data.revealedTiles);
      setCurrentMultiplier(data.currentMultiplier);

      if (data.hitMine) {
        setGameState('gameover');
        setMinePositions(data.minePositions);
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/games/mines/active", user?.id] });
        toast({
          title: "💥 Hit a Mine!",
          description: "Better luck next time!",
          variant: "destructive",
        });
      } else if (data.autoCashout) {
        setGameState('gameover');
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/games/mines/active", user?.id] });
        toast({
          title: "🎉 All Safe Tiles Cleared!",
          description: `You won ${data.payout.toLocaleString()} points!`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reveal tile",
        variant: "destructive",
      });
    },
  });

  const cashoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/games/mines/cashout", {
        userId: user?.id,
      }) as Promise<any>;
    },
    onSuccess: (data: any) => {
      setGameState('gameover');
      setMinePositions(data.minePositions);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games/mines/active", user?.id] });
      toast({
        title: "💎 Cashed Out!",
        description: `You won ${data.payout.toLocaleString()} points!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cashout",
        variant: "destructive",
      });
    },
  });

  const handleStartGame = () => {
    const bet = parseInt(betAmount);
    const mineCount = parseInt(minesCount);
    
    if (!bet || bet <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!mineCount || mineCount < 1 || mineCount > 24) {
      toast({
        title: "Invalid Mines Count",
        description: "Mines count must be between 1 and 24",
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
    
    startGameMutation.mutate();
  };

  const handleTileClick = (position: number) => {
    if (gameState !== 'playing') return;
    if (revealedTiles.includes(position)) return;
    if (revealTileMutation.isPending) return;
    
    revealTileMutation.mutate(position);
  };

  const handleCashout = () => {
    if (revealedTiles.length === 0) {
      toast({
        title: "Cannot Cashout",
        description: "You need to reveal at least one tile first",
        variant: "destructive",
      });
      return;
    }
    cashoutMutation.mutate();
  };

  const handleNewGame = () => {
    setGameState('betting');
    setRevealedTiles([]);
    setMinePositions([]);
    setCurrentMultiplier(0);
    setGameId(null);
  };

  const getTileContent = (position: number) => {
    if (gameState === 'gameover' && minePositions.includes(position)) {
      return <Bomb className="w-6 h-6 text-white" />;
    }
    if (revealedTiles.includes(position)) {
      return <Gem className="w-6 h-6 text-white" />;
    }
    return null;
  };

  const getTileStyle = (position: number) => {
    if (gameState === 'gameover') {
      if (minePositions.includes(position)) {
        return 'bg-gradient-to-br from-red-600 to-red-500 cursor-default';
      }
      if (revealedTiles.includes(position)) {
        return 'bg-gradient-to-br from-green-600 to-green-500 cursor-default';
      }
      return 'bg-zinc-700/50 cursor-default';
    }
    
    if (revealedTiles.includes(position)) {
      return 'bg-gradient-to-br from-green-600 to-green-500 cursor-default';
    }
    
    if (gameState === 'playing') {
      return 'bg-zinc-700 hover-elevate active-elevate-2 cursor-pointer';
    }
    
    return 'bg-zinc-700/50 cursor-default';
  };

  const potentialPayout = gameState === 'playing' && currentMultiplier > 0
    ? Math.floor(parseInt(betAmount || "0") * currentMultiplier)
    : 0;

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
              Find the gems and avoid the mines! Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50 lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6">Game Settings</h2>
            
            <div className="space-y-4">
              {gameState === 'betting' && (
                <>
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

                  <Button
                    onClick={handleStartGame}
                    disabled={startGameMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                    data-testid="button-start-game"
                  >
                    {startGameMutation.isPending ? (
                      <>
                        <Bomb className="w-5 h-5 mr-2 animate-pulse" />
                        Starting...
                      </>
                    ) : (
                      <>
                        Start Game
                        <Bomb className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}

              {gameState === 'playing' && (
                <>
                  <div className="p-4 bg-zinc-800/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Bet Amount</span>
                      <span className="text-white font-bold">{parseInt(betAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Mines</span>
                      <span className="text-red-500 font-bold"><Bomb className="w-4 h-4 inline mr-1" />{minesCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Revealed</span>
                      <span className="text-green-500 font-bold">{revealedTiles.length} / {safeTiles}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                      <span className="text-sm text-zinc-400">Multiplier</span>
                      <span className="text-xl font-black text-yellow-500">{currentMultiplier.toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Potential Win</span>
                      <span className="text-lg font-bold text-green-400">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {potentialPayout.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCashout}
                    disabled={cashoutMutation.isPending || revealedTiles.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                    data-testid="button-cashout"
                  >
                    {cashoutMutation.isPending ? (
                      <>
                        <Coins className="w-5 h-5 mr-2 animate-pulse" />
                        Cashing Out...
                      </>
                    ) : (
                      <>
                        <Coins className="w-5 h-5 mr-2" />
                        Cashout {potentialPayout.toLocaleString()}
                      </>
                    )}
                  </Button>
                </>
              )}

              {gameState === 'gameover' && (
                <>
                  <div className="p-4 bg-zinc-800/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Bet Amount</span>
                      <span className="text-white font-bold">{parseInt(betAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Revealed</span>
                      <span className="text-white font-bold">{revealedTiles.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Final Multiplier</span>
                      <span className="text-xl font-black text-yellow-500">{currentMultiplier.toFixed(2)}x</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleNewGame}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                    data-testid="button-new-game"
                  >
                    New Game
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/50 lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">Game Board</h2>
            
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleTileClick(i)}
                  disabled={gameState !== 'playing' || revealedTiles.includes(i) || revealTileMutation.isPending}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all ${getTileStyle(i)}`}
                  data-testid={`tile-${i}`}
                >
                  {getTileContent(i)}
                </button>
              ))}
            </div>

            {gameState === 'betting' && (
              <div className="mt-6 text-center">
                <p className="text-zinc-500">Place your bet and start the game to play!</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-6 mt-6 border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
          <ul className="text-zinc-400 space-y-2">
            <li>• Choose your bet amount and number of mines (1-24)</li>
            <li>• Click on tiles to reveal them - find gems and avoid mines!</li>
            <li>• Each safe tile increases your multiplier</li>
            <li>• Cashout anytime to secure your winnings</li>
            <li>• If you reveal all safe tiles, you win automatically</li>
            <li>• Hit a mine and you lose your bet</li>
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
