import { useQuery, useMutation } from "@tanstack/react-query";
import { PartyPopper, Clock, Trophy, Sparkles, Users, Coins, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUser } from "@/contexts/UserContext";
import type { Giveaway, GiveawayEntry, User } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";

function GiveawayParticipants({ giveawayId }: { giveawayId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: entries = [] } = useQuery<GiveawayEntry[]>({
    queryKey: [`/api/giveaways/${giveawayId}/entries`],
    queryFn: async () => {
      const response = await fetch(`/api/giveaways/${giveawayId}/entries`);
      if (!response.ok) throw new Error("Failed to fetch participants");
      return response.json();
    },
  });

  if (entries.length === 0) {
    return (
      <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
        <div className="flex items-center gap-2 text-zinc-400">
          <Users className="w-4 h-4" />
          <span className="text-sm">No participants yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50 hover-elevate transition-all"
        data-testid={`button-toggle-participants-${giveawayId}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white">
                {entries.length} {entries.length === 1 ? 'Participant' : 'Participants'}
              </div>
              <div className="text-xs text-zinc-400">Click to {isExpanded ? 'hide' : 'view'}</div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50 max-h-64 overflow-y-auto animate-slide-in">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2" data-testid={`participants-list-${giveawayId}`}>
              {entries.map((entry, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-600/10 text-blue-400 border-blue-600/30"
                  data-testid={`participant-${index}`}
                >
                  {entry.username && entry.discordUsername ? (
                    `Kick - ${entry.username}, Discord - ${entry.discordUsername}`
                  ) : entry.username ? (
                    `Kick - ${entry.username}`
                  ) : entry.discordUsername ? (
                    `Discord - ${entry.discordUsername}`
                  ) : (
                    'Anonymous'
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Giveaways() {
  const { toast } = useToast();
  const { user: currentUser, sessionId } = useUser();
  const { data: activeGiveaways = [], isLoading: loadingActive } = useQuery<Giveaway[]>({
    queryKey: ["/api/giveaways", "active"],
    queryFn: async () => {
      const response = await fetch("/api/giveaways?status=active");
      if (!response.ok) throw new Error("Failed to fetch active giveaways");
      return response.json();
    },
  });

  const { data: completedGiveaways = [], isLoading: loadingCompleted } = useQuery<Giveaway[]>({
    queryKey: ["/api/giveaways", "completed"],
    queryFn: async () => {
      const response = await fetch("/api/giveaways?status=completed");
      if (!response.ok) throw new Error("Failed to fetch completed giveaways");
      return response.json();
    },
  });

  const enterGiveawayMutation = useMutation({
    mutationFn: async (giveawayId: string) => {
      if (!sessionId) {
        throw new Error("Not authenticated");
      }
      return await apiRequest("POST", `/api/giveaways/${giveawayId}/enter?sessionId=${sessionId}`, {});
    },
    onSuccess: (_data, giveawayId) => {
      toast({
        title: "Entered Successfully!",
        description: "You've been entered into the giveaway. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/giveaways"] });
      queryClient.invalidateQueries({ queryKey: [`/api/giveaways/${giveawayId}/entries`] });
    },
    onError: (error: any) => {
      toast({
        title: "Entry Failed",
        description: error.message || "Failed to enter giveaway",
        variant: "destructive",
      });
    },
  });

  const isLoading = loadingActive || loadingCompleted;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-zinc-400">Loading giveaways...</p>
        </div>
      </div>
    );
  }

  const handleEnter = async (giveawayId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to enter giveaways",
        variant: "destructive",
      });
      return;
    }
    enterGiveawayMutation.mutate(giveawayId);
  };

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
              <PartyPopper className="w-8 h-8" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Points <span className="text-red-600">Giveaways</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Enter active giveaways for a chance to win points instantly!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-16">
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Clock className="w-8 h-8 text-red-500" />
              Active Giveaways
            </h2>
            <p className="text-zinc-400">Enter now before time runs out!</p>
          </div>

          {activeGiveaways.length > 0 ? (
            <div className="space-y-6">
              {activeGiveaways.map((giveaway: Giveaway, index: number) => {
                const isExpired = new Date(giveaway.endTime) < new Date();
                
                return (
                  <Card
                    key={giveaway.id}
                    className="overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur hover-elevate transition-all animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`card-giveaway-${giveaway.id}`}
                  >
                    <div className="p-8">
                      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
                        <div className="space-y-6">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="inline-flex items-center gap-2 mb-3">
                                <Badge className="bg-red-600/20 text-red-500 border-red-600/30 text-lg px-4 py-1.5">
                                  <Coins className="w-5 h-5 mr-2" />
                                  {giveaway.points.toLocaleString()} Points
                                </Badge>
                              </div>
                              <h3 className="text-2xl font-black text-white mb-2">
                                Points Giveaway
                              </h3>
                              <p className="text-zinc-400">
                                Win {giveaway.points.toLocaleString()} points instantly!
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                              <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Prize Pool</div>
                              <div className="text-xl font-black text-white">
                                {giveaway.points.toLocaleString()}
                              </div>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                              <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Duration</div>
                              <div className="text-xl font-black text-white">
                                {giveaway.durationMinutes < 60
                                  ? `${giveaway.durationMinutes}m`
                                  : giveaway.durationMinutes < 1440
                                  ? `${Math.floor(giveaway.durationMinutes / 60)}h`
                                  : `${Math.floor(giveaway.durationMinutes / 1440)}d`}
                              </div>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                              <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Status</div>
                              <div className="text-xl font-black text-green-500">
                                Active
                              </div>
                            </div>
                          </div>

                          <GiveawayParticipants giveawayId={giveaway.id} />

                          {!isExpired && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-zinc-500">
                                <Clock className="w-4 h-4" />
                                <p className="text-sm font-semibold uppercase tracking-wider">
                                  Time Remaining
                                </p>
                              </div>
                              <CountdownTimer endDate={new Date(giveaway.endTime)} />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          <Button
                            size="lg"
                            onClick={() => handleEnter(giveaway.id)}
                            disabled={enterGiveawayMutation.isPending || isExpired}
                            className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-red-600/30"
                            data-testid={`button-enter-${giveaway.id}`}
                          >
                            <Users className="w-5 h-5 mr-2" />
                            {isExpired ? "Ended" : "Enter Giveaway"}
                          </Button>
                          {isExpired && (
                            <p className="text-xs text-amber-500">Winner being selected...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-20 text-center border-zinc-800 bg-zinc-900/50">
              <Clock className="w-20 h-20 text-zinc-700 mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Giveaways</h2>
              <p className="text-zinc-500 text-lg">Check back soon for new giveaways!</p>
            </Card>
          )}
        </section>

        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              Completed Giveaways
            </h2>
            <p className="text-zinc-400">Past giveaway winners</p>
          </div>

          {completedGiveaways.length > 0 ? (
            <div className="space-y-4">
              {completedGiveaways.map((giveaway: Giveaway, index: number) => (
                <Card
                  key={giveaway.id}
                  className="overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur hover-elevate transition-all animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-testid={`card-completed-${giveaway.id}`}
                >
                  <div className="p-6">
                    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/30">
                            <Trophy className="w-4 h-4 mr-2" />
                            Completed
                          </Badge>
                          <Badge className="bg-red-600/20 text-red-500 border-red-600/30">
                            <Coins className="w-4 h-4 mr-2" />
                            {giveaway.points.toLocaleString()} Points
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            Points Giveaway
                          </h3>
                          <p className="text-zinc-500 text-sm">
                            Ended {format(new Date(giveaway.endTime), "PPp")}
                          </p>
                        </div>

                        <GiveawayParticipants giveawayId={giveaway.id} />

                        {giveaway.winnerUsername && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-600/10 to-amber-500/10 border border-amber-600/30 rounded-xl">
                            <Trophy className="w-6 h-6 text-amber-500" />
                            <div>
                              <p className="text-xs text-zinc-400 uppercase tracking-wider">Winner</p>
                              <p className="text-lg font-bold text-white" data-testid={`text-winner-${giveaway.id}`}>
                                {giveaway.winnerUsername && giveaway.winnerDiscordUsername ? (
                                  `Kick - ${giveaway.winnerUsername}, Discord - ${giveaway.winnerDiscordUsername}`
                                ) : giveaway.winnerUsername ? (
                                  `Kick - ${giveaway.winnerUsername}`
                                ) : giveaway.winnerDiscordUsername ? (
                                  `Discord - ${giveaway.winnerDiscordUsername}`
                                ) : (
                                  'Anonymous'
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-center md:text-right">
                        <div className="text-3xl font-black text-amber-500">
                          {giveaway.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">
                          Points
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-zinc-800 bg-zinc-900/50">
              <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No Completed Giveaways</h3>
              <p className="text-zinc-500">Past winners will appear here</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
