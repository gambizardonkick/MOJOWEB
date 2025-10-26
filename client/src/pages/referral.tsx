import { useState } from "react";
import { ExternalLink, DollarSign, Users, Gift, TrendingUp, Star, Sparkles, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/copy-button";

export default function Referral() {
  const referralCode = "mojokick";
  const [wagerAmount, setWagerAmount] = useState("100000");

  const payoutTiers = [
    { wager: "> $10,000", payout: "$10", min: 10000, max: 25000 },
    { wager: "> $25,000", payout: "$25", min: 25000, max: 50000 },
    { wager: "> $50,000", payout: "$50", min: 50000, max: 100000 },
    { wager: "> $100,000", payout: "$100", min: 100000, max: 250000 },
    { wager: "> $250,000", payout: "$250", min: 250000, max: 500000 },
    { wager: "> $500,000", payout: "$500", min: 500000, max: 1000000 },
    { wager: "> $1,000,000", payout: "$1,000", min: 1000000, max: 2500000 },
    { wager: "> $2,500,000", payout: "$2,500", min: 2500000, max: Infinity },
  ];

  const calculatePayout = (wager: number) => {
    const tier = payoutTiers.find(t => wager >= t.min && wager < t.max);
    return tier?.payout || "$0";
  };

  const currentWager = parseFloat(wagerAmount) || 0;
  const estimatedPayout = calculatePayout(currentWager);

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
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-4">
              <Gift className="w-8 h-8" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Referral <span className="text-red-600">Program</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
              Earn up to <span className="text-white font-bold">$2,500</span> per referral! Share your code and get paid when your friends play.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 relative z-10">

        {/* Referral Code Card */}
        <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur animate-scale-in">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 opacity-5"></div>
          <div className="relative p-8 md:p-10 text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                Referral Code
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Share this code with friends to start earning rewards
              </p>
            </div>
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-red-600/10 to-red-500/10 border border-red-600/30 p-6 rounded-xl backdrop-blur">
              <code className="text-3xl md:text-4xl font-mono font-black text-red-500" data-testid="text-referral-code">
                {referralCode}
              </code>
              <CopyButton text={referralCode} />
            </div>
            <p className="text-zinc-500 text-sm">Click to copy your code</p>

            {/* Join Button */}
            <a
              href="https://gamdom.com/r/mojokick"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-xl hover:scale-105 transition-transform"
            >
              Join on Gamdom
            </a>
          </div>
        </Card>


        {/* ROI Calculator */}
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Earnings Calculator</h2>
                <p className="text-zinc-400 text-sm">See how much you can earn</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="wager-calculator" className="text-zinc-300">
                  Estimated Monthly Wager
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                  <Input
                    id="wager-calculator"
                    type="number"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    className="pl-8 bg-zinc-800 border-zinc-700 text-white text-lg font-bold h-14"
                    placeholder="100000"
                    data-testid="input-wager-calculator"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <div className="w-full p-6 bg-gradient-to-r from-red-600/10 to-red-500/10 border border-red-600/30 rounded-xl">
                  <div className="text-zinc-500 text-sm mb-2 uppercase tracking-wider">Your Estimated Payout</div>
                  <div className="text-4xl font-black text-red-500" data-testid="text-estimated-payout">
                    {estimatedPayout}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur hover-elevate transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 opacity-5"></div>
              <div className="relative p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-black text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white">Share Your Code</h3>
                <p className="text-zinc-400">
                  Share code <code className="font-mono font-bold text-red-500">{referralCode}</code> with friends when they sign up
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur hover-elevate transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 opacity-5"></div>
              <div className="relative p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-black text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white">They Play</h3>
                <p className="text-zinc-400">
                  After they wager for a full month, track their progress and earnings
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur hover-elevate transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 opacity-5"></div>
              <div className="relative p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center mx-auto">
                  <span className="text-3xl font-black text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-white">Earn Rewards</h3>
                <p className="text-zinc-400">
                  Get paid based on their monthly wager - up to $2,500 per referral!
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Payout Tiers */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight text-center">Payout Tiers</h2>
          <Card className="overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/50">
                    <th className="text-left p-5 font-bold text-white uppercase tracking-wider text-sm">Monthly Wager</th>
                    <th className="text-right p-5 font-bold text-white uppercase tracking-wider text-sm">Your Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutTiers.map((tier, idx) => {
                    const isTopTier = idx === payoutTiers.length - 1;
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-zinc-800 last:border-0 hover-elevate transition-all ${isTopTier ? 'bg-red-600/5' : ''}`}
                        data-testid={`row-tier-${idx}`}
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            {isTopTier && <Star className="w-5 h-5 text-red-500" />}
                            <span className={`font-bold ${isTopTier ? 'text-white text-lg' : 'text-zinc-300'}`}>
                              {tier.wager}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <Badge className={`${isTopTier ? 'bg-gradient-to-r from-red-600 to-red-500 text-white text-lg px-4 py-2' : 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                            {tier.payout}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Bonus Info */}
        <Card className="p-8 bg-gradient-to-r from-red-600/10 to-red-500/10 border-red-600/30 backdrop-blur">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">First Deposit Bonus!</h3>
              <p className="text-zinc-300 leading-relaxed">
                For every first deposit your friends make (minimum $25), you'll get an instant <span className="text-red-500 font-bold">$7.50</span> bonus!
              </p>
              <p className="text-sm text-red-400 italic">
                *The minimum wager is 25x, and Originals are not included.
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-12 text-center border-zinc-800 bg-zinc-900/80 backdrop-blur">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl font-black text-white">Ready to Start Earning?</h3>
            <p className="text-zinc-400 text-lg">
              Claim your referral rewards on Discord and start earning today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0 min-w-[200px]" 
                asChild 
                data-testid="button-discord"
              >
                <a
                  href="https://discord.gg/mojotx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Join Discord
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 min-w-[200px]" 
                asChild
              >
                <a
                  href="https://gamdom.com/r/mojokick"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Play on Gamdom
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
