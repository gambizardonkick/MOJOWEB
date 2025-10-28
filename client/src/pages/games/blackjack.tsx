import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card as UICard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Spade, Coins } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Card, BlackjackHand } from "@shared/schema";
import cardBackImage from "@assets/image_1761609062906.png";

function BlackjackGamePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [betAmount, setBetAmount] = useState("100");
  const [gameState, setGameState] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [componentKey, setComponentKey] = useState(0);
  const [previousCardCounts, setPreviousCardCounts] = useState<{
    dealerCards: number;
    playerHands: number[];
  }>({ dealerCards: 0, playerHands: [] });
  const [resultPopup, setResultPopup] = useState<{
    show: boolean;
    result: string;
    betAmount: number;
    payout: number;
  } | null>(null);

  const { data: activeGameData } = useQuery({
    queryKey: ["/api/games/blackjack/active", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/games/blackjack/active/${user.id}`);
      return response.json();
    },
    enabled: !!user?.id && !gameState,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (activeGameData?.hasActiveGame && !gameState) {
      setGameState(activeGameData.game);
      setShowResults(false);
    }
  }, [activeGameData, gameState]);

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/blackjack/start", {
        userId: user?.id,
        betAmount: parseInt(betAmount),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.game) {
        if (data.gameOver) {
          const resultType = data.results?.[0]?.result || 'loss';
          const resultLabel = resultType === 'blackjack' ? 'Blackjack!' : 
                             resultType === 'win' ? 'Win!' : 
                             resultType === 'push' ? 'Push' : 'Lose';
          
          setGameState(data.game);
          setShowResults(true);

          setTimeout(() => {
            setResultPopup({
              show: true,
              result: resultLabel,
              betAmount: data.game.betAmount,
              payout: data.totalPayout || 0
            });

            setTimeout(() => {
              setResultPopup(null);
              setGameState(null);
              setShowResults(false);
              setPreviousCardCounts({ dealerCards: 0, playerHands: [] });
              setBetAmount("100");
              setComponentKey(prev => prev + 1);
              queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
              queryClient.invalidateQueries({ queryKey: ["/api/games/blackjack/active", user?.id] });
            }, 2000);
          }, 2000);
        } else {
          setGameState(data.game);
          setShowResults(false);
        }
        setPreviousCardCounts({
          dealerCards: 0,
          playerHands: []
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start game",
        variant: "destructive",
      });
    },
  });

  const hitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/blackjack/hit", {
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.game) {
        setPreviousCardCounts({
          dealerCards: gameState?.dealerHand?.cards?.length || 0,
          playerHands: gameState?.playerHands?.map((h: any) => h.cards.length) || []
        });
        if (data.gameOver) {
          const resultType = data.results?.[0]?.result || 'loss';
          const resultLabel = resultType === 'blackjack' ? 'Blackjack!' : 
                             resultType === 'win' ? 'Win!' : 
                             resultType === 'push' ? 'Push' : 'Lose';
          
          setGameState(data.game);
          setShowResults(true);

          setTimeout(() => {
            setResultPopup({
              show: true,
              result: resultLabel,
              betAmount: data.game.betAmount,
              payout: data.totalPayout || 0
            });

            setTimeout(() => {
              setResultPopup(null);
              setGameState(null);
              setShowResults(false);
              setPreviousCardCounts({ dealerCards: 0, playerHands: [] });
              setBetAmount("100");
              setComponentKey(prev => prev + 1);
              queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
              queryClient.invalidateQueries({ queryKey: ["/api/games/blackjack/active", user?.id] });
            }, 2000);
          }, 2000);
        } else {
          setGameState(data.game);
          setShowResults(false);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to hit",
        variant: "destructive",
      });
    },
  });

  const standMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/blackjack/stand", {
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.game) {
        setPreviousCardCounts({
          dealerCards: gameState?.dealerHand?.cards?.length || 0,
          playerHands: gameState?.playerHands?.map((h: any) => h.cards.length) || []
        });
        if (data.gameOver) {
          const resultType = data.results?.[0]?.result || 'loss';
          const resultLabel = resultType === 'blackjack' ? 'Blackjack!' : 
                             resultType === 'win' ? 'Win!' : 
                             resultType === 'push' ? 'Push' : 'Lose';
          
          setGameState(data.game);
          setShowResults(true);

          setTimeout(() => {
            setResultPopup({
              show: true,
              result: resultLabel,
              betAmount: data.game.betAmount,
              payout: data.totalPayout || 0
            });

            setTimeout(() => {
              setResultPopup(null);
              setGameState(null);
              setShowResults(false);
              setPreviousCardCounts({ dealerCards: 0, playerHands: [] });
              setBetAmount("100");
              setComponentKey(prev => prev + 1);
              queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
              queryClient.invalidateQueries({ queryKey: ["/api/games/blackjack/active", user?.id] });
            }, 2000);
          }, 2000);
        } else {
          setGameState(data.game);
          setShowResults(false);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stand",
        variant: "destructive",
      });
    },
  });

  const doubleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/games/blackjack/double", {
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.game) {
        setPreviousCardCounts({
          dealerCards: gameState?.dealerHand?.cards?.length || 0,
          playerHands: gameState?.playerHands?.map((h: any) => h.cards.length) || []
        });
        if (data.gameOver) {
          const resultType = data.results?.[0]?.result || 'loss';
          const resultLabel = resultType === 'blackjack' ? 'Blackjack!' : 
                             resultType === 'win' ? 'Win!' : 
                             resultType === 'push' ? 'Push' : 'Lose';
          
          setGameState(data.game);
          setShowResults(true);

          setTimeout(() => {
            setResultPopup({
              show: true,
              result: resultLabel,
              betAmount: data.game.betAmount,
              payout: data.totalPayout || 0
            });

            setTimeout(() => {
              setResultPopup(null);
              setGameState(null);
              setShowResults(false);
              setPreviousCardCounts({ dealerCards: 0, playerHands: [] });
              setBetAmount("100");
              setComponentKey(prev => prev + 1);
              queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
              queryClient.invalidateQueries({ queryKey: ["/api/games/blackjack/active", user?.id] });
            }, 2000);
          }, 2000);
        } else {
          setGameState(data.game);
          setShowResults(false);
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to double",
        variant: "destructive",
      });
    },
  });


  const handleStart = () => {
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
    
    setResultPopup(null);
    setShowResults(false);
    startMutation.mutate();
  };

  if (!user) {
    return null;
  }

  const getCardColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const PlayingCard = ({ card, isHidden = false, testId, delay = 0, isDealer = false, shouldAnimate = false }: { card?: Card; isHidden?: boolean; testId?: string; delay?: number; isDealer?: boolean; shouldAnimate?: boolean }) => {
    const animationStyle = shouldAnimate ? { 
      animation: `dealCard 0.5s ease-out ${delay}ms both`,
      transformOrigin: isDealer ? 'top right' : 'bottom right'
    } : {};

    if (isHidden || !card) {
      return (
        <div 
          className="relative w-28 h-40 rounded-lg overflow-hidden shadow-xl border-2 border-zinc-700"
          style={animationStyle}
          data-testid={testId}
        >
          <img 
            src={cardBackImage} 
            alt="Card back" 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div 
        className="relative w-28 h-40 bg-white rounded-lg shadow-xl border-2 border-zinc-300 flex flex-col p-3"
        style={animationStyle}
        data-testid={testId}
      >
        <div className={`text-left ${getCardColor(card.suit)}`}>
          <div className="text-2xl font-bold leading-none">{card.rank}</div>
          <div className="text-xl leading-none">{getSuitSymbol(card.suit)}</div>
        </div>
        <div className={`flex-1 flex items-center justify-center ${getCardColor(card.suit)}`}>
          <span className="text-5xl">{getSuitSymbol(card.suit)}</span>
        </div>
        <div className={`text-right transform rotate-180 ${getCardColor(card.suit)}`}>
          <div className="text-2xl font-bold leading-none">{card.rank}</div>
          <div className="text-xl leading-none">{getSuitSymbol(card.suit)}</div>
        </div>
      </div>
    );
  };

  const HandDisplay = ({ hand, label, isDealer = false, showHoleCard = false, handIndex = 0, previousCount = 0 }: { hand?: BlackjackHand; label: string; isDealer?: boolean; showHoleCard?: boolean; handIndex?: number; previousCount?: number }) => {
    if (!hand) return null;

    const calculateVisibleTotal = () => {
      if (!isDealer || showHoleCard) {
        return hand.total;
      }
      const visibleCards = hand.cards.slice(0, 1);
      let total = 0;
      let aces = 0;
      
      for (const card of visibleCards) {
        if (card.rank === 'A') {
          aces++;
          total += 11;
        } else {
          total += card.value;
        }
      }
      
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      
      return total;
    };

    const displayTotal = calculateVisibleTotal();

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-zinc-400 text-sm font-semibold">{label}</p>
          <p className="text-white text-2xl font-bold" data-testid={`text-${label.toLowerCase().replace(/\s+/g, '-')}-total`}>
            {isDealer && !showHoleCard ? `${displayTotal} + ?` : displayTotal}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {hand.cards.map((card, idx) => {
            const isNewCard = idx >= previousCount && previousCount > 0;
            const animationDelay = isNewCard ? (idx - previousCount) * 150 : 0;
            
            return (
              <PlayingCard 
                key={`${card.suit}-${card.rank}-${idx}`} 
                card={card} 
                isHidden={isDealer && idx === 1 && !showHoleCard}
                testId={`${isDealer ? 'dealer' : 'player'}-card-${idx}`}
                delay={animationDelay}
                isDealer={isDealer}
                shouldAnimate={isNewCard}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const isPlaying = gameState?.gameStatus === 'playing';

  return (
    <div key={componentKey} className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />
      
      {resultPopup?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-4">
              <h2 className={`text-5xl font-black ${
                resultPopup.result === 'Blackjack!' ? 'text-yellow-500' :
                resultPopup.result === 'Win!' ? 'text-green-500' :
                resultPopup.result === 'Push' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {resultPopup.result}
              </h2>
              
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-zinc-400">Bet Amount:</span>
                  <span className="text-white font-bold">{resultPopup.betAmount} pts</span>
                </div>
                <div className="flex justify-between items-center text-lg border-t border-zinc-700 pt-2">
                  <span className="text-zinc-400">Payout:</span>
                  <span className={`font-bold text-2xl ${
                    resultPopup.payout > resultPopup.betAmount ? 'text-green-500' :
                    resultPopup.payout === resultPopup.betAmount ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {resultPopup.payout > 0 ? `+${resultPopup.payout}` : '0'} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-2">
              <Spade className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Blackjack <span className="text-red-600">21</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Balance: <span className="text-white font-bold" data-testid="text-balance">{user?.points?.toLocaleString() || '0'}</span> points
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <UICard className="p-6 border-zinc-800 bg-zinc-900/50 min-h-[600px] relative">
              <div className="absolute top-6 right-6">
                <div className="relative">
                  <div className="w-28 h-40 rounded-lg overflow-hidden shadow-xl border-2 border-zinc-700">
                    <img 
                      src={cardBackImage} 
                      alt="Card back" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 text-center mt-2 font-semibold">Deck</p>
                </div>
              </div>

              <div className="space-y-12">
                {gameState?.dealerHand && (
                  <div>
                    <HandDisplay 
                      hand={gameState.dealerHand} 
                      label="Dealer's Hand" 
                      isDealer={true}
                      showHoleCard={showResults}
                      previousCount={previousCardCounts.dealerCards}
                    />
                  </div>
                )}

                {!gameState?.dealerHand && (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-zinc-600 text-lg">Waiting for dealer...</p>
                  </div>
                )}

                <div className="border-t border-zinc-800 pt-12">
                  {gameState?.playerHands && gameState.playerHands.length > 0 ? (
                    gameState.playerHands.map((hand: BlackjackHand, idx: number) => (
                      <div key={idx} className={`${idx > 0 ? 'mt-6 pt-6 border-t border-zinc-800' : ''}`}>
                        <HandDisplay 
                          hand={hand} 
                          label={gameState.hasSplit ? `Your Hand ${idx + 1}` : "Your Hand"}
                          handIndex={idx}
                          previousCount={previousCardCounts.playerHands[idx] || 0}
                        />
                        {gameState.currentHandIndex === idx && isPlaying && (
                          <div className="mt-3">
                            <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 text-xs font-semibold rounded-full border border-red-600/40 animate-pulse">
                              Active Hand
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-zinc-600 text-lg">Place your bet to start playing!</p>
                    </div>
                  )}
                </div>
              </div>
            </UICard>

            <UICard className="p-6 border-zinc-800 bg-zinc-900/50 mt-6">
              <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-400">
                <div>• <span className="font-semibold text-white">Hit:</span> Draw another card</div>
                <div>• <span className="font-semibold text-white">Stand:</span> Keep your current hand</div>
                <div>• <span className="font-semibold text-white">Double Down:</span> Double bet, get one card</div>
              </div>
            </UICard>
          </div>

          <div className="lg:col-span-3">
            <UICard className="p-6 border-zinc-800 bg-zinc-900/50 sticky top-4">
              {!gameState || showResults ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Place Your Bet</h2>

                  <div>
                    <Label htmlFor="bet" className="text-zinc-300">Bet Amount</Label>
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
                        placeholder="Enter bet"
                        className="flex-1"
                        data-testid="input-bet-amount"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      if (showResults) {
                        setGameState(null);
                        setShowResults(false);
                      }
                      handleStart();
                    }}
                    disabled={startMutation.isPending}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 h-12 text-base font-bold"
                    data-testid="button-deal"
                  >
                    {startMutation.isPending ? (
                      <>
                        <Spade className="w-5 h-5 mr-2 animate-pulse" />
                        Dealing...
                      </>
                    ) : showResults ? (
                      <>
                        <Spade className="w-5 h-5 mr-2" />
                        New Game
                      </>
                    ) : (
                      <>
                        Deal Cards
                        <Spade className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h3 className="text-sm font-semibold text-white mb-2">Payouts</h3>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <div className="flex justify-between">
                        <span>Blackjack</span>
                        <span className="text-green-500 font-bold">2.5:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win</span>
                        <span className="text-green-500 font-bold">2:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Push</span>
                        <span className="text-yellow-500 font-bold">1:1</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Actions</h2>
                  
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-sm text-zinc-400">Bet Amount</div>
                    <div className="text-2xl font-bold text-white" data-testid="text-bet-amount">
                      {gameState.betAmount?.toLocaleString()} pts
                    </div>
                  </div>

                  {isPlaying && (
                    <div className="space-y-2">
                      <Button
                        onClick={() => hitMutation.mutate()}
                        disabled={hitMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                        data-testid="button-hit"
                      >
                        Hit
                      </Button>
                      <Button
                        onClick={() => standMutation.mutate()}
                        disabled={standMutation.isPending}
                        variant="outline"
                        className="w-full"
                        data-testid="button-stand"
                      >
                        Stand
                      </Button>
                      {gameState.canDouble && (
                        <Button
                          onClick={() => doubleMutation.mutate()}
                          disabled={doubleMutation.isPending || (user.points < gameState.betAmount)}
                          variant="outline"
                          className="w-full"
                          data-testid="button-double"
                        >
                          Double Down
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </UICard>
          </div>
        </div>
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
