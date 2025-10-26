import { useQuery } from "@tanstack/react-query";
import { Gift, CheckCircle2, Clock, Sparkles, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CopyButton } from "@/components/copy-button";
import { CountdownTimer } from "@/components/countdown-timer";
import type { FreeSpinsOffer } from "@shared/schema";

export default function FreeSpins() {
  const { data: offers = [], isLoading } = useQuery<FreeSpinsOffer[]>({
    queryKey: ["/api/free-spins"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-zinc-400">Loading offers...</p>
        </div>
      </div>
    );
  }

  const activeOffers = offers.filter((o) => o.isActive && new Date(o.expiresAt) > new Date());

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-4">
              <Gift className="w-8 h-8" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Free <span className="text-red-600">Spins</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Claim your exclusive free spins offers and start spinning for big wins!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">
        {/* Offers */}
        {activeOffers.length > 0 ? (
          <div className="space-y-8">
            {activeOffers.map((offer, index) => {
              const claimProgress = ((offer.totalClaims - offer.claimsRemaining) / offer.totalClaims) * 100;
              const totalValue = offer.spinsCount * Number(offer.spinValue);
              
              return (
                <Card
                  key={offer.id}
                  className="overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur hover-elevate transition-all animate-scale-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                  data-testid={`card-offer-${offer.id}`}
                >
                  <div className="p-8 space-y-8">
                    {/* Code Section */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-2 text-zinc-500 text-sm uppercase tracking-wider font-semibold mb-2">
                        <Copy className="w-4 h-4" />
                        Promo Code
                      </div>
                      <div className="inline-flex items-center gap-4 bg-gradient-to-r from-red-600/10 to-red-500/10 border border-red-600/30 p-6 rounded-xl backdrop-blur">
                        <code className="text-3xl md:text-4xl font-mono font-black text-red-500" data-testid="text-promo-code">
                          {offer.code}
                        </code>
                        <CopyButton text={offer.code} />
                      </div>
                      <p className="text-zinc-500 text-sm">Click to copy code</p>
                    </div>

                    {/* Game Info */}
                    <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
                      <div className="flex justify-center">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 opacity-20 blur-xl rounded-2xl group-hover:opacity-30 transition-opacity"></div>
                          <img
                            src={offer.gameImage}
                            alt={offer.gameName}
                            className="relative w-56 h-56 object-cover rounded-2xl border-2 border-zinc-800 group-hover:border-red-600/30 transition-colors"
                            data-testid={`img-game-${offer.id}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h2 className="text-3xl font-black text-white mb-2" data-testid={`text-game-name-${offer.id}`}>
                            {offer.gameName}
                          </h2>
                          <p className="text-zinc-400 text-lg" data-testid={`text-provider-${offer.id}`}>
                            by {offer.gameProvider}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Total Value</div>
                            <div className="text-2xl font-black text-white">
                              ${totalValue.toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Spins</div>
                            <div className="text-2xl font-black text-white" data-testid={`badge-spins-${offer.id}`}>
                              {offer.spinsCount} × ${Number(offer.spinValue)}
                            </div>
                          </div>
                        </div>

                        {/* Claims Progress */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Claims Available</span>
                            <span className="font-bold text-white" data-testid={`badge-claims-${offer.id}`}>
                              {offer.claimsRemaining} / {offer.totalClaims}
                            </span>
                          </div>
                          <Progress value={100 - claimProgress} className="h-3 bg-zinc-800" />
                          <p className="text-xs text-zinc-500">
                            {Math.round(100 - claimProgress)}% still available
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2 justify-center text-zinc-500">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-semibold uppercase tracking-wider">
                          Offer Expires In
                        </p>
                      </div>
                      <CountdownTimer endDate={new Date(offer.expiresAt)} />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4 pt-4 border-t border-zinc-800" data-testid={`section-requirements-${offer.id}`}>
                      <h3 className="text-lg font-bold text-white">Requirements</h3>
                      <Card className="p-6 bg-zinc-800/50 border-zinc-700">
                        {offer.requirements && Array.isArray(offer.requirements) && offer.requirements.length > 0 ? (
                          <ul className="space-y-3">
                            {offer.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-zinc-300">{req}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-zinc-400 text-sm">No specific requirements</p>
                        )}
                      </Card>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-20 text-center border-zinc-800 bg-zinc-900/50">
            <Gift className="w-20 h-20 text-zinc-700 mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">No Active Offers</h2>
            <p className="text-zinc-500 text-lg">Check back later for new free spins offers!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
