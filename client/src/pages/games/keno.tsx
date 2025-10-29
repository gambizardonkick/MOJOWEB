import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Grid3x3, Coins, Trophy } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { GameHistory } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RiskLevel = 'low' | 'medium' | 'high';

const payoutTables: Record<string, Record<number, number[]>> = {
  low: {
    1: [0.70, 1.85],
    2: [0.00, 2.00, 3.80],
    3: [0.00, 1.10, 1.38, 26.00],
    4: [0.00, 0.00, 2.20, 7.90, 90.00],
    5: [0.00, 0.00, 1.50, 4.20, 13.00, 300.0],
    6: [0.00, 0.00, 1.10, 2.00, 6.20, 100.0, 700.0],
    7: [0.00, 0.00, 1.10, 1.60, 3.50, 15.00, 225.0, 700.0],
    8: [0.00, 0.00, 1.10, 1.50, 2.00, 5.50, 39.00, 100.0, 800.0],
    9: [0.00, 0.00, 1.10, 1.30, 1.70, 2.50, 7.50, 50.00, 250.0, 1000],
    10: [0.00, 0.00, 1.10, 1.20, 1.30, 1.80, 3.50, 13.00, 50.00, 250.0, 1000],
  },
  medium: {
    1: [0.40, 2.75],
    2: [0.00, 1.80, 5.10],
    3: [0.00, 0.00, 2.80, 50.00],
    4: [0.00, 0.00, 1.70, 10.00, 100.0],
    5: [0.00, 0.00, 1.40, 4.00, 14.00, 390.0],
    6: [0.00, 0.00, 0.00, 3.00, 9.00, 180.0, 710.0],
    7: [0.00, 0.00, 0.00, 2.00, 7.00, 30.00, 400.0, 800.0],
    8: [0.00, 0.00, 0.00, 2.00, 4.00, 11.00, 67.00, 400.0, 900.0],
    9: [0.00, 0.00, 0.00, 2.00, 2.50, 5.00, 15.00, 100.0, 500.0, 1000],
    10: [0.00, 0.00, 0.00, 1.60, 2.00, 4.00, 7.00, 26.00, 100.0, 500.0, 1000],
  },
  high: {
    1: [0.00, 3.96],
    2: [0.00, 0.00, 17.10],
    3: [0.00, 0.00, 0.00, 81.50],
    4: [0.00, 0.00, 0.00, 10.00, 259.0],
    5: [0.00, 0.00, 0.00, 4.50, 48.00, 450.0],
    6: [0.00, 0.00, 0.00, 0.00, 11.00, 350.0, 710.0],
    7: [0.00, 0.00, 0.00, 0.00, 7.00, 90.00, 400.0, 800.0],
    8: [0.00, 0.00, 0.00, 0.00, 5.00, 20.00, 270.0, 600.0, 900.0],
    9: [0.00, 0.00, 0.00, 0.00, 4.00, 11.00, 56.00, 500.0, 800.0, 1000],
    10: [0.00, 0.00, 0.00, 0.00, 3.50, 8.00, 13.00, 63.00, 500.0, 800.0, 1000],
  },
};

function KenoGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { sendMessage, on, isConnected } = useWebSocket();
  const [betAmount, setBetAmount] = useState("100");
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [risk, setRisk] = useState<RiskLevel>('low');
  const [lastResult, setLastResult] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastWagerRef = useRef<number>(0);

  const { data: gameHistory = [] } = useQuery<GameHistory[]>({
    queryKey: ["/api/games/history", user?.id],
    enabled: !!user?.id,
  });

  useEffect(() => {
    const unsubscribeResult = on('keno:result', (data: any) => {
      console.log('🎮 KENO RESULT RECEIVED:', data);
      
      // Clear any existing animation
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      
      setRevealedNumbers([]);
      
      // Start animation
      let currentIndex = 0;
      const revealNext = () => {
        if (currentIndex < data.drawnNumbers.length) {
          const tileNumber = data.drawnNumbers[currentIndex];
          setRevealedNumbers(prev => [...prev, tileNumber]);
          currentIndex++;
          animationTimerRef.current = setTimeout(revealNext, 200);
        } else {
          setTimeout(() => {
            const fullResult = {
              drawnNumbers: data.drawnNumbers,
              hits: data.hits,
              multiplier: data.multiplier,
              payout: data.payout,
              newBalance: data.newBalance,
              won: data.payout > 0,
            };
            
            setLastResult(fullResult);
            setIsPlaying(false);
            
            if (fullResult.won && fullResult.payout > 0) {
              setTimeout(() => {
                setShowWinDialog(true);
              }, 300);
            }
            
            queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
            queryClient.invalidateQueries({ queryKey: ["/api/games/history", user?.id] });
          }, 500);
        }
      };
      
      animationTimerRef.current = setTimeout(revealNext, 200);
    });

    const unsubscribeError = on('error', (data: any) => {
      console.error('Keno error:', data);
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
      setIsPlaying(false);
      toast({
        title: "Error",
        description: data.error || "Failed to play game",
        variant: "destructive",
      });
    });

    return () => {
      unsubscribeResult();
      unsubscribeError();
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [on, toast, user?.id]);

  const handleTileClick = (tileNumber: number) => {
    if (isPlaying) return;
    
    if (selectedTiles.includes(tileNumber)) {
      setSelectedTiles(selectedTiles.filter(n => n !== tileNumber));
    } else if (selectedTiles.length < 10) {
      setSelectedTiles([...selectedTiles, tileNumber]);
    } else {
      toast({
        title: "Maximum Tiles Selected",
        description: "You can select a maximum of 10 tiles",
        variant: "destructive",
      });
    }
  };

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
    
    if (selectedTiles.length === 0) {
      toast({
        title: "No Tiles Selected",
        description: "Please select at least 1 tile",
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
    
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Not connected to server. Please wait...",
        variant: "destructive",
      });
      return;
    }
    
    setIsPlaying(true);
    setLastResult(null);
    setRevealedNumbers([]);
    lastWagerRef.current = bet;
    sendMessage('keno:play', {
      betAmount: bet,
      selectedNumbers: selectedTiles,
      risk,
    });
  };

  const handleClearSelection = () => {
    if (!isPlaying) {
      setSelectedTiles([]);
      setLastResult(null);
      setRevealedNumbers([]);
    }
  };

  const getTileState = (tileNumber: number) => {
    const isSelected = selectedTiles.includes(tileNumber);
    const isDrawn = revealedNumbers.includes(tileNumber);
    const isHit = isSelected && isDrawn;
    const isMiss = isDrawn && !isSelected;
    
    return { isSelected, isDrawn, isHit, isMiss };
  };

  const getCurrentMultipliers = () => {
    const tilesCount = selectedTiles.length;
    if (tilesCount === 0) return [];
    return payoutTables[risk][tilesCount] || [];
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="sm:max-w-md border-green-600/40 bg-gradient-to-br from-green-900/20 to-zinc-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-green-400">
              <Trophy className="w-6 h-6" />
              You Won!
            </DialogTitle>
            <DialogDescription className="sr-only">
              Congratulations on your win
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Bet Amount</span>
              <span className="text-white font-bold text-lg">{lastWagerRef.current.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Multiplier</span>
              <span className="text-yellow-400 font-bold text-lg">{lastResult?.multiplier?.toFixed(2) || '0.00'}×</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/40 rounded-lg">
              <span className="text-zinc-300 text-lg">Payout</span>
              <span className="text-green-400 font-black text-2xl">+{lastResult?.payout?.toLocaleString() || 0}</span>
            </div>
          </div>
          <Button
            onClick={() => setShowWinDialog(false)}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:opacity-90 text-white"
            data-testid="button-close-win-dialog"
          >
            Continue Playing
          </Button>
        </DialogContent>
      </Dialog>

      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />

      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-4">
              <Grid3x3 className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Keno <span className="text-red-600">Game</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Pick up to 10 numbers and match them! Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Game Board</h2>
                <div className="text-sm text-zinc-400">
                  Selected: <span className="text-white font-bold">{selectedTiles.length}</span>/10
                </div>
              </div>
              
              <div className="grid grid-cols-8 gap-2 mb-4">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
                  const { isSelected, isDrawn, isHit, isMiss } = getTileState(num);
                  
                  return (
                    <button
                      key={num}
                      onClick={() => handleTileClick(num)}
                      disabled={isPlaying}
                      className={`
                        aspect-square rounded-lg font-bold text-lg relative
                        transition-all duration-200
                        ${isHit ? 'bg-green-500 text-white border-[3px] border-green-300' : ''}
                        ${isMiss ? 'bg-red-500/80 text-white border-[3px] border-red-400' : ''}
                        ${isSelected && !isDrawn ? 'bg-blue-600 text-white border-2 border-blue-400' : ''}
                        ${!isSelected && !isDrawn ? 'bg-zinc-800 text-zinc-300 border-2 border-zinc-700 hover-elevate' : ''}
                        ${isPlaying && !isDrawn ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active-elevate-2'}
                      `}
                      style={{
                        boxShadow: isHit 
                          ? '0 0 30px 12px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.2)' 
                          : isMiss 
                          ? '0 0 30px 12px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)' 
                          : 'none',
                      }}
                      data-testid={`tile-${num}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {selectedTiles.length > 0 && (
                <div className="p-4 bg-zinc-800/50 rounded-lg mb-4">
                  <h3 className="text-sm font-bold text-white mb-3">Multiplier Table ({risk.charAt(0).toUpperCase() + risk.slice(1)} Risk)</h3>
                  <div className="grid grid-cols-11 gap-1">
                    {getCurrentMultipliers().map((multiplier, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`px-2 py-1 rounded text-xs font-bold mb-1 ${
                          multiplier >= 100 ? 'bg-green-600/20 text-green-400' :
                          multiplier >= 10 ? 'bg-yellow-600/20 text-yellow-400' :
                          multiplier > 0 ? 'bg-blue-600/20 text-blue-400' :
                          'bg-zinc-700/50 text-zinc-500'
                        }`}>
                          {multiplier >= 1000 ? '1,000×' : multiplier.toFixed(2) + '×'}
                        </div>
                        <div className="text-xs text-zinc-500">{index}×</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 text-center">
                    Payouts based on {selectedTiles.length} tile{selectedTiles.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-600 border-2 border-blue-400"></div>
                    <span className="text-zinc-400">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-300"></div>
                    <span className="text-zinc-400">Hit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/80 border-2 border-red-400"></div>
                    <span className="text-zinc-400">Drawn (Miss)</span>
                  </div>
                </div>
                <Button
                  onClick={handleClearSelection}
                  disabled={isPlaying || selectedTiles.length === 0}
                  variant="outline"
                  size="sm"
                  data-testid="button-clear"
                >
                  Clear Selection
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
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
                      data-testid="button-half-bet"
                    >
                      1/2
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(String(parseInt(betAmount || "100") * 2))}
                      className="px-3"
                      data-testid="button-double-bet"
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
                  <Label>Risk Level</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button
                      variant={risk === 'low' ? 'default' : 'outline'}
                      onClick={() => setRisk('low')}
                      size="sm"
                      data-testid="button-risk-low"
                    >
                      Low
                    </Button>
                    <Button
                      variant={risk === 'medium' ? 'default' : 'outline'}
                      onClick={() => setRisk('medium')}
                      size="sm"
                      data-testid="button-risk-medium"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={risk === 'high' ? 'default' : 'outline'}
                      onClick={() => setRisk('high')}
                      size="sm"
                      data-testid="button-risk-high"
                    >
                      High
                    </Button>
                  </div>
                </div>

                {lastResult && (
                  <div className="p-4 bg-zinc-800/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Hits</span>
                      <span className="text-white font-bold">{lastResult.hits}/{selectedTiles.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Multiplier</span>
                      <span className="text-green-500 font-bold">{lastResult.multiplier !== undefined ? lastResult.multiplier.toFixed(2) : '0.00'}×</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Payout</span>
                      <span className="text-yellow-500 font-bold">{lastResult.payout?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePlay}
                  disabled={!isConnected || isPlaying || selectedTiles.length === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                  data-testid="button-play"
                >
                  {isPlaying ? (
                    <>
                      <Grid3x3 className="w-5 h-5 mr-2 animate-spin" />
                      Drawing Numbers...
                    </>
                  ) : !isConnected ? (
                    <>
                      Connecting...
                    </>
                  ) : (
                    <>
                      Play Game
                      <Grid3x3 className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {lastResult && (
              <Card className={`p-6 border-zinc-800 ${lastResult.won ? 'bg-gradient-to-br from-green-900/20 to-zinc-900/50' : 'bg-gradient-to-br from-red-900/20 to-zinc-900/50'}`}>
                <h3 className="text-xl font-bold text-white mb-4">Last Result</h3>
                <div className={`p-4 rounded-xl ${lastResult.won ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/40' : 'bg-gradient-to-r from-red-600/20 to-rose-600/20 border border-red-600/40'}`}>
                  <p className={`text-center text-xl font-black ${lastResult.won ? 'text-green-400' : 'text-red-400'}`}>
                    {lastResult.won ? 'YOU WON!' : 'YOU LOST'}
                  </p>
                  {lastResult.payout > 0 && (
                    <p className="text-center text-2xl font-black text-white mt-1">
                      +{lastResult.payout.toLocaleString()} points
                    </p>
                  )}
                </div>
                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">New Balance</span>
                    <span className="text-white font-bold" data-testid="text-new-balance">
                      <Coins className="w-4 h-4 inline mr-1 text-yellow-500" />
                      {lastResult?.newBalance?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        <Card className="p-6 mt-6 border-zinc-800 bg-zinc-900/50">
          <h3 className="text-xl font-bold text-white mb-4">Game History</h3>
          {gameHistory.filter(game => game.gameName === "keno").length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Tiles</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Risk</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Hits</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Bet</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Mult.</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Payout</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory
                    .filter((game) => game.gameName === "keno")
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((game, index) => {
                      const gameData = game.gameData ? JSON.parse(game.gameData) : {};
                      return (
                        <tr 
                          key={game.id} 
                          className="border-b border-zinc-800/50 hover-elevate"
                          data-testid={`row-history-${index}`}
                        >
                          <td className="py-2 px-2 text-white" data-testid={`text-tiles-${index}`}>
                            {gameData.selectedNumbers?.length || 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-white capitalize" data-testid={`text-risk-${index}`}>
                            {gameData.risk || 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-white" data-testid={`text-hits-${index}`}>
                            {gameData.hits !== undefined ? gameData.hits : 'N/A'}
                          </td>
                          <td className="py-2 px-2 text-white" data-testid={`text-bet-${index}`}>
                            {game.betAmount.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-yellow-400 font-mono" data-testid={`text-mult-${index}`}>
                            {gameData.multiplier !== undefined ? gameData.multiplier.toFixed(2) : '0.00'}×
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
        </Card>
      </div>
    </div>
  );
}

export default function KenoGame() {
  return (
    <ProtectedRoute>
      <KenoGamePage />
    </ProtectedRoute>
  );
}
