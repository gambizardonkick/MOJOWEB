import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dices, Trophy, Target } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId');
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
      setTimeout(() => setLocation('/dashboard'), 100);
    }
  }, [setLocation]);

  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/discord');
      const data = await response.json();
      
      if (data.authUrl && data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Discord login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-blue-600/10 pointer-events-none animate-gradient-slow" />
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="p-8 border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Dices className="w-10 h-10 text-red-600" />
              <Trophy className="w-8 h-8 text-red-500" />
              <Target className="w-8 h-8 text-red-600" />
            </div>

            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Casino <span className="text-red-600">Games</span>
              </h1>
              <p className="text-zinc-400">
                Login with Discord to start playing
              </p>
            </div>

            <div className="py-6 space-y-4">
              <Button
                onClick={handleDiscordLogin}
                disabled={isLoading}
                className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 gap-3"
                data-testid="button-discord-login"
              >
                <SiDiscord className="w-6 h-6" />
                <span className="font-semibold">
                  {isLoading ? 'Connecting...' : 'Login with Discord'}
                </span>
              </Button>

              <div className="pt-4 space-y-2 text-sm text-zinc-500">
                <p>• Link your Kick and Gamdom accounts</p>
                <p>• Earn points through Kick integration</p>
                <p>• Play Dice, Mines, Keno, Limbo & Blackjack</p>
                <p>• Compete on leaderboards and earn rewards</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-zinc-600 text-sm">
            By logging in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
