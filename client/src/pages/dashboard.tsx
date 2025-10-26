import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, Trophy, Coins, Link as LinkIcon, CheckCircle2, ExternalLink } from "lucide-react";
import { SiKick, SiDiscord } from "react-icons/si";
import type { GameHistory } from "@shared/schema";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function DashboardPage() {
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useUser();
  const [gamdomUsername, setGamdomUsername] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linked = params.get('linked');
    const success = params.get('success');
    const error = params.get('error');
    const errorMessage = params.get('error_message');

    if (linked && success === 'true') {
      toast({
        title: "Success!",
        description: `${linked.charAt(0).toUpperCase() + linked.slice(1)} account linked successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      window.history.replaceState({}, '', '/dashboard');
    } else if (linked && success === 'false') {
      toast({
        title: "Error",
        description: errorMessage ? decodeURIComponent(errorMessage) : `Failed to link ${linked} account.`,
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/dashboard');
    } else if (error) {
      const errorMessages: Record<string, string> = {
        missing_params: 'Missing authorization parameters.',
        verifier_not_found: 'Session expired. Please try again.',
        user_not_found: 'User session not found. Please log in again.',
      };
      toast({
        title: "OAuth Error",
        description: errorMessages[error] || 'An unknown error occurred.',
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [toast]);

  const { data: gameHistory = [] } = useQuery<GameHistory[]>({
    queryKey: ["/api/games/history", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/games/history/${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch game history");
      return res.json();
    },
  });

  const linkGamdomMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest("POST", `/api/users/${user?.id}/link-gamdom`, { username });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Success!",
        description: "Gamdom account linked successfully.",
      });
      setGamdomUsername("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to link Gamdom account.",
        variant: "destructive",
      });
    },
  });


  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const recentGames = gameHistory.slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />

      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 text-red-500 mb-4">
              <User className="w-8 h-8" />
              <Trophy className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Your <span className="text-red-600">Dashboard</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Link your accounts, track your points, and view your gaming history.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-red-600/20 to-red-500/10 border-red-600/30" data-testid="card-points">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600/20 rounded-lg">
                <Coins className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Available Points</p>
                <p className="text-3xl font-black text-white" data-testid="text-points-balance">
                  {user?.points?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-600/30" data-testid="card-games-played">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Games Played</p>
                <p className="text-3xl font-black text-white" data-testid="text-games-count">
                  {gameHistory.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-600/20 to-green-500/10 border-green-600/30" data-testid="card-total-wagered">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Coins className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Total Wagered</p>
                <p className="text-3xl font-black text-white" data-testid="text-total-wagered">
                  {gameHistory.reduce((sum, game) => sum + (game.betAmount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-zinc-800 bg-zinc-900/50" data-testid="card-linked-accounts">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-red-500" />
              Linked Accounts
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                  <SiKick className="w-6 h-6 text-[#53FC18]" />
                  <div>
                    <p className="text-white font-semibold">Kick</p>
                    {user?.kickUsername ? (
                      <p className="text-zinc-400 text-sm" data-testid="text-kick-username">{user.kickUsername}</p>
                    ) : (
                      <p className="text-zinc-500 text-sm">Not linked</p>
                    )}
                  </div>
                </div>
                {user?.kickUsername ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" data-testid="icon-kick-linked" />
                ) : (
                  <Button
                    onClick={async () => {
                      const sessionId = localStorage.getItem('sessionId');
                      const response = await fetch(`/api/auth/kick?sessionId=${sessionId}`);
                      const data = await response.json();
                      if (data.authUrl) {
                        localStorage.setItem('kickVerifier', data.codeVerifier);
                        window.location.href = data.authUrl;
                      }
                    }}
                    size="sm"
                    className="bg-[#53FC18] hover:bg-[#45D915] text-black"
                    data-testid="button-link-kick"
                  >
                    Connect with Kick
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                  <SiDiscord className="w-6 h-6 text-[#5865F2]" />
                  <div>
                    <p className="text-white font-semibold">Discord</p>
                    {user?.discordUsername ? (
                      <p className="text-zinc-400 text-sm" data-testid="text-discord-username">{user.discordUsername}</p>
                    ) : (
                      <p className="text-zinc-500 text-sm">Not linked</p>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" data-testid="icon-discord-linked" />
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                  <div>
                    <p className="text-white font-semibold">Gamdom</p>
                    {user?.gamdomUsername ? (
                      <p className="text-zinc-400 text-sm" data-testid="text-gamdom-username">{user.gamdomUsername}</p>
                    ) : (
                      <p className="text-zinc-500 text-sm">Not linked</p>
                    )}
                  </div>
                </div>
                {user?.gamdomUsername ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" data-testid="icon-gamdom-linked" />
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Gamdom username"
                      value={gamdomUsername}
                      onChange={(e) => setGamdomUsername(e.target.value)}
                      className="w-40"
                      data-testid="input-gamdom-username"
                    />
                    <Button
                      onClick={() => gamdomUsername && linkGamdomMutation.mutate(gamdomUsername)}
                      disabled={!gamdomUsername || linkGamdomMutation.isPending}
                      size="sm"
                      data-testid="button-link-gamdom"
                    >
                      Link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 border-zinc-800 bg-zinc-900/50" data-testid="card-recent-games">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-red-500" />
              Recent Games
            </h2>
            
            {recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                    data-testid={`game-history-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={game.result === 'win' ? 'default' : 'secondary'}
                        className={game.result === 'win' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                      >
                        {game.result === 'win' ? 'WIN' : 'LOSS'}
                      </Badge>
                      <div>
                        <p className="text-white font-semibold capitalize">{game.gameName}</p>
                        <p className="text-zinc-400 text-sm">
                          Bet: {game.betAmount} | Payout: {game.payout}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${game.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                      {game.result === 'win' ? '+' : '-'}{Math.abs(game.payout - game.betAmount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-50" />
                <p className="text-zinc-500">No games played yet</p>
                <p className="text-zinc-600 text-sm mt-2">Start playing to see your history!</p>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-8 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 border-red-600/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Play?</h3>
              <p className="text-zinc-400">Try your luck at our casino games and win big!</p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0"
              data-testid="button-play-games"
            >
              <a href="/games/dice">
                Play Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
