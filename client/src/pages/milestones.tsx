import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, ExternalLink, Trophy, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LevelMilestone } from "@shared/schema";

export default function Milestones() {
  const [selectedMilestone, setSelectedMilestone] = useState<LevelMilestone | null>(null);

  const { data: milestones, isLoading } = useQuery<LevelMilestone[]>({
    queryKey: ["/api/milestones"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-zinc-400">Loading milestones...</p>
        </div>
      </div>
    );
  }

  const sortedMilestones = milestones?.sort((a, b) => a.tier - b.tier) || [];

  const getTierColor = (tier: number) => {
    if (tier <= 1) return "from-amber-700 to-amber-600";
    if (tier <= 2) return "from-zinc-400 to-zinc-500";
    if (tier <= 3) return "from-yellow-600 to-yellow-500";
    if (tier <= 4) return "from-emerald-600 to-emerald-500";
    if (tier <= 5) return "from-cyan-600 to-cyan-500";
    if (tier <= 6) return "from-blue-600 to-blue-500";
    if (tier <= 7) return "from-purple-600 to-purple-500";
    return "from-red-600 to-red-500";
  };

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
              <Trophy className="w-8 h-8" />
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Level <span className="text-red-600">Milestones</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Unlock exclusive rewards as you level up on Gamdom. Each milestone brings bigger and better bonuses.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Info Card */}
        <Card className="p-8 mb-12 border-zinc-800 bg-zinc-900/50 backdrop-blur animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">How to Claim Your Rewards</h3>
              <p className="text-zinc-400 leading-relaxed">
                Reach a milestone level on Gamdom and claim your rewards by creating a ticket on our Discord server. 
                Our team will verify your level and deliver your rewards within 24 hours.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white flex-shrink-0"
            >
              <a href="https://discord.gg/mojotx" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Discord
              </a>
            </Button>
          </div>
        </Card>

        {/* Milestone Grid */}
        {sortedMilestones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedMilestones.map((milestone, index) => {
              const tierColor = getTierColor(milestone.tier);
              
              return (
                <Card
                  key={milestone.id}
                  className="relative overflow-hidden border-zinc-800 bg-zinc-900/80 backdrop-blur hover-elevate hover:scale-105 transition-all duration-300 group animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-testid={`card-milestone-${milestone.tier}`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tierColor} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  
                  <div className="relative p-6 space-y-4">
                    {/* Tier Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={`bg-gradient-to-r ${tierColor} text-white border-0 font-bold px-3 py-1`}>
                        Level {milestone.tier}
                      </Badge>
                    </div>

                    {/* Badge Image */}
                    <div className="flex justify-center py-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${tierColor} opacity-20 blur-xl rounded-full`}></div>
                        <img
                          src={milestone.imageUrl}
                          alt={milestone.name}
                          className="relative w-32 h-32 object-contain"
                          data-testid={`img-badge-${milestone.tier}`}
                        />
                      </div>
                    </div>

                    {/* Milestone Name */}
                    <h3 className="text-xl font-bold text-center text-white" data-testid={`text-milestone-name-${milestone.tier}`}>
                      {milestone.name}
                    </h3>

                    {/* Rewards Preview */}
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                        Rewards:
                      </p>
                      <ul className="space-y-1.5">
                        {(milestone.rewards || []).slice(0, 2).map((reward, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className={`bg-gradient-to-r ${tierColor} bg-clip-text text-transparent font-bold mt-0.5`}>•</span>
                            <span className="text-zinc-300">{reward}</span>
                          </li>
                        ))}
                        {(milestone.rewards || []).length > 2 && (
                          <li className="text-zinc-500 text-xs pl-4">
                            +{(milestone.rewards || []).length - 2} more rewards...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Claim Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${tierColor} hover:opacity-90 text-white border-0`}
                      onClick={() => setSelectedMilestone(milestone)}
                      data-testid={`button-claim-${milestone.tier}`}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-20 text-center border-zinc-800 bg-zinc-900/50">
            <Trophy className="w-20 h-20 text-zinc-700 mx-auto mb-6 opacity-50" />
            <p className="text-zinc-500 text-lg">No milestones available yet</p>
          </Card>
        )}
      </div>

      {/* Claim Modal */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800 text-white" data-testid="dialog-claim-milestone">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedMilestone?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create a ticket on Discord to claim your rewards
            </DialogDescription>
          </DialogHeader>

          {selectedMilestone && (
            <div className="space-y-6">
              {/* Badge Image */}
              <div className="flex justify-center py-4">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(selectedMilestone.tier)} opacity-20 blur-2xl rounded-full`}></div>
                  <img
                    src={selectedMilestone.imageUrl}
                    alt={selectedMilestone.name}
                    className="relative w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* Full Rewards List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-400">
                    All Rewards
                  </h4>
                  <Badge className={`bg-gradient-to-r ${getTierColor(selectedMilestone.tier)} text-white border-0`}>
                    Level {selectedMilestone.tier}
                  </Badge>
                </div>
                <ul className="space-y-3">
                  {(selectedMilestone.rewards || []).map((reward, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className={`bg-gradient-to-r ${getTierColor(selectedMilestone.tier)} bg-clip-text text-transparent font-bold mt-0.5`}>•</span>
                      <span className="text-zinc-300">{reward}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discord Button */}
              <Button
                asChild
                size="lg"
                className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white"
                data-testid="button-claim-discord"
              >
                <a href="https://discord.gg/mojotx" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Claim on Discord
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
