import { useQuery } from "@tanstack/react-query";
import { Trophy, Crown, Medal, Award, User } from "lucide-react";
import { SiDiscord, SiTelegram } from "react-icons/si";
import { CountdownTimer } from "@/components/countdown-timer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeaderboardEntry, LeaderboardSettings } from "@shared/schema";
import kickLogo from "./image_1761502625743.png";
export default function Leaderboard() {
  const { data: settings, isLoading: settingsLoading } = useQuery<LeaderboardSettings>({
    queryKey: ["/api/leaderboard/settings"],
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/entries"],
  });

  const isLoading = settingsLoading || entriesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-zinc-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: "1st", color: "from-yellow-400 to-yellow-600", borderColor: "border-yellow-500/50", icon: Crown };
    if (rank === 2) return { label: "2nd", color: "from-zinc-300 to-zinc-500", borderColor: "border-zinc-400/50", icon: Medal };
    if (rank === 3) return { label: "3rd", color: "from-orange-400 to-orange-600", borderColor: "border-orange-500/50", icon: Award };
    return { label: "", color: "", borderColor: "", icon: Trophy };
  };

  // Reorder top three for podium display: [2nd, 1st, 3rd]
  const podiumOrder = topThree.length >= 3 
    ? [topThree[1], topThree[0], topThree[2]] 
    : topThree.length === 2 
    ? [topThree[1], topThree[0]]
    : topThree;

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
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          {/* Prize Pool & Title */}
          {settings && (
            <div className="text-center mb-8">
              <div className="text-red-500 text-2xl md:text-3xl font-bold mb-2" data-testid="text-prize-pool">
                ${Number(settings.totalPrizePool).toLocaleString()} MONTHLY WAGER
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent tracking-tight">
                LEADERBOARD
              </h1>
            </div>
          )}

          {/* Countdown Timer */}
          {settings && (
            <div className="mb-6" data-testid="section-countdown">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 text-zinc-400 uppercase tracking-wider text-sm font-semibold">
                  <Trophy className="w-4 h-4" />
                  Ending In
                </div>
              </div>
              <CountdownTimer endDate={new Date(settings.endDate)} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Contact Banner */}
        <Card className="p-8 border-zinc-800 bg-zinc-900/30 backdrop-blur mb-12 animate-fade-in">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Want to Join the Leaderboard?</h3>
              <p className="text-zinc-400">
                Send me a private message with your <span className="font-semibold text-white">Username</span> and <span className="font-semibold text-white">Gamdom ID</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white min-w-[200px]"
                data-testid="button-contact-discord"
              >
                <a href="https://discord.com/users/mojotxkick" target="_blank" rel="noopener noreferrer">
                  <SiDiscord className="w-5 h-5 mr-2" />
                  Discord: mojotxkick
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-[#26A5E4] hover:bg-[#26A5E4]/90 text-white min-w-[200px]"
                data-testid="button-contact-telegram"
              >
                <a href="https://t.me/mojotx" target="_blank" rel="noopener noreferrer">
                  <SiTelegram className="w-5 h-5 mr-2" />
                  Telegram: mojotx
                </a>
              </Button>
            </div>
          </div>
        </Card>

        {entries && entries.length > 0 ? (
          <div className="space-y-8">
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {podiumOrder.map((entry, index) => {
                  const badge = getRankBadge(entry.rank);
                  const Icon = badge.icon;
                  const isFirst = entry.rank === 1;
                  
                  return (
                    <Card
                      key={entry.id}
                      className={`relative overflow-visible border-2 ${badge.borderColor} bg-zinc-900/80 backdrop-blur transition-all animate-scale-in ${
                        isFirst ? 'md:scale-110 md:z-10' : 'md:mt-8'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      data-testid={`card-leaderboard-${entry.rank}`}
                    >
                      {/* Gradient Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10 rounded-xl`}></div>
                      
                      <div className="relative p-6 space-y-4">
                        {/* Avatar */}
                        <div className="flex justify-center -mt-14">
                          <div className={`relative ${isFirst ? 'w-24 h-24' : 'w-20 h-20'}`}>
                            <Avatar className={`${isFirst ? 'w-24 h-24' : 'w-20 h-20'} border-4 ${
                              entry.rank === 1 ? 'border-yellow-500' :
                              entry.rank === 2 ? 'border-zinc-400' :
                              'border-orange-500'
                            }`}>
                              <AvatarImage src={kickLogo} alt="Kick Logo" className="p-3" />
                              <AvatarFallback className={`text-xl font-bold bg-gradient-to-br ${badge.color} text-white`}>
                                {entry.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {/* Rank Badge */}
                            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-bold shadow-lg`}>
                              {badge.label}
                            </div>
                          </div>
                        </div>

                        {/* Username */}
                        <div className="text-center pt-4">
                          <div className={`${isFirst ? 'text-2xl' : 'text-xl'} font-black text-white mb-2 truncate`} data-testid={`text-username-${entry.rank}`}>
                            {entry.username}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2 text-center">
                          <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Wagered</div>
                            <div className={`${isFirst ? 'text-xl' : 'text-lg'} font-bold text-white`}>
                              ${Number(entry.wagered).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Prize</div>
                            <div className={`${isFirst ? 'text-2xl' : 'text-xl'} font-black text-red-500`} data-testid={`text-prize-${entry.rank}`}>
                              ${Number(entry.prize).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Table Header */}
            {remaining.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                  <div className="col-span-2">Place</div>
                  <div className="col-span-5">User</div>
                  <div className="col-span-2 text-right">Wagered</div>
                  <div className="col-span-3 text-right">Prize</div>
                </div>

                {/* Remaining Players Table */}
                {remaining.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className="border-zinc-800 bg-zinc-900/30 backdrop-blur hover-elevate transition-all animate-fade-in"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    data-testid={`card-leaderboard-${entry.rank}`}
                  >
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Rank */}
                        <div className="col-span-2">
                          <Badge className="bg-zinc-800 text-white border-zinc-700 font-bold px-3 py-1">
                            #{entry.rank}
                          </Badge>
                        </div>

                        {/* User */}
                        <div className="col-span-5 flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-zinc-700">
                            <AvatarImage src={kickLogo} alt="Kick Logo" className="p-2" />
                            <AvatarFallback className="bg-zinc-800 text-white font-bold">
                              {entry.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-white truncate text-sm" data-testid={`text-username-${entry.rank}`}>
                              {entry.username}
                            </h3>
                          </div>
                        </div>

                        {/* Wagered */}
                        <div className="col-span-2 text-right">
                          <div className="text-sm text-zinc-400 font-medium">
                            ${Number(entry.wagered).toLocaleString()}
                          </div>
                        </div>

                        {/* Prize */}
                        <div className="col-span-3 text-right">
                          <div className="text-lg font-bold text-red-500" data-testid={`text-prize-${entry.rank}`}>
                            ${Number(entry.prize).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="p-16 text-center border-zinc-800 bg-zinc-900/30">
            <Trophy className="w-20 h-20 text-zinc-700 mx-auto mb-6 opacity-50" />
            <p className="text-zinc-500 text-lg">No leaderboard entries yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
