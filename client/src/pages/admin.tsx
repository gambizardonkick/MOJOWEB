import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, Trash2, Save, Settings as SettingsIcon, Pencil, Lock, X,
  LayoutDashboard, Trophy, Target, Gift, Users, Coins, ShoppingBag, Package,
  CheckCircle, XCircle, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type {
  LeaderboardEntry,
  LeaderboardSettings,
  LevelMilestone,
  Challenge,
  FreeSpinsOffer,
  InsertLeaderboardEntry,
  InsertLeaderboardSettings,
  InsertLevelMilestone,
  InsertChallenge,
  InsertFreeSpinsOffer,
  User,
  ShopItem,
  InsertShopItem,
  Redemption,
} from "@shared/schema";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ADMIN_PASSWORD) {
      setError(true);
      return;
    }
    
    if (password === ADMIN_PASSWORD) {
      onAuthenticated();
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div className="fixed inset-0 bg-grid opacity-[0.03] pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none animate-gradient-slow" />
        <Card className="w-full max-w-md mx-4 p-8 shadow-xl bg-zinc-900 border-zinc-800 border-red-600/50 relative z-10 animate-slide-in">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Admin Access Disabled
              </h1>
              <div className="space-y-3 text-sm text-zinc-400">
                <p className="font-semibold text-amber-500">
                  Security Notice: Admin password not configured
                </p>
                <p>
                  For security reasons, the admin panel requires the <code className="text-red-500 bg-zinc-800 px-2 py-1 rounded">VITE_ADMIN_PASSWORD</code> environment variable to be set.
                </p>
                <p className="text-xs text-zinc-500 mt-4">
                  Note: This client-side authentication is for development only. Production deployments should use server-side authentication.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <Card className="w-full max-w-md mx-4 p-8 shadow-xl bg-zinc-900 border-zinc-800">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your password to continue
            </p>
            <p className="text-xs text-amber-500/80 mt-2">
              Development Mode Only
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin password"
                data-testid="input-admin-password"
                className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${error ? "border-red-500" : ""}`}
              />
              {error && (
                <p className="text-sm text-red-500">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" data-testid="button-admin-login">
              Access Admin Panel
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

type NavSection = "leaderboard" | "milestones" | "challenges" | "free-spins" | "users" | "shop-items" | "redemptions" | "settings";

export default function Admin() {
  const [activeSection, setActiveSection] = useState<NavSection>("leaderboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isProduction = import.meta.env.PROD;

  if (isProduction) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <Card className="w-full max-w-md mx-4 p-8 shadow-xl bg-zinc-900 border-zinc-800 border-red-600/50">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Admin Panel Disabled
              </h1>
              <div className="space-y-3 text-sm text-zinc-400">
                <p className="font-semibold text-red-500">
                  Security Notice: Admin access unavailable in production
                </p>
                <p>
                  For security reasons, the admin panel is disabled in production builds. Admin functions require server-side authentication.
                </p>
                <p className="text-xs text-zinc-500 mt-4">
                  If you need admin access, please use the development environment or implement proper server-side authentication.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const navItems = [
    { id: "leaderboard" as NavSection, label: "Leaderboard", icon: Trophy, testId: "tab-leaderboard" },
    { id: "milestones" as NavSection, label: "Milestones", icon: Target, testId: "tab-milestones" },
    { id: "challenges" as NavSection, label: "Challenges", icon: Users, testId: "tab-challenges" },
    { id: "free-spins" as NavSection, label: "Free Spins", icon: Gift, testId: "tab-free-spins" },
    { id: "users" as NavSection, label: "Users & Points", icon: Coins, testId: "tab-users" },
    { id: "shop-items" as NavSection, label: "Shop Items", icon: ShoppingBag, testId: "tab-shop-items" },
    { id: "redemptions" as NavSection, label: "Redemption Center", icon: Package, testId: "tab-redemptions" },
    { id: "settings" as NavSection, label: "Settings", icon: SettingsIcon, testId: "tab-settings" },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-600/30 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-zinc-500">Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-3 px-3">
              MAIN
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  data-testid={item.testId}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-red-600/20 text-red-500 border border-red-600/30' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeSection === "leaderboard" && <LeaderboardAdmin />}
          {activeSection === "milestones" && <MilestonesAdmin />}
          {activeSection === "challenges" && <ChallengesAdmin />}
          {activeSection === "free-spins" && <FreeSpinsAdmin />}
          {activeSection === "users" && <UsersAdmin />}
          {activeSection === "shop-items" && <ShopItemsAdmin />}
          {activeSection === "redemptions" && <RedemptionCenterAdmin />}
          {activeSection === "settings" && <SettingsAdmin />}
        </div>
      </div>
    </div>
  );
}

function LeaderboardAdmin() {
  const { toast } = useToast();
  const { data: entries } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/entries"],
  });

  const [newEntry, setNewEntry] = useState<InsertLeaderboardEntry>({
    rank: 1,
    username: "",
    wagered: "0",
    prize: "0",
  });

  const [editingEntry, setEditingEntry] = useState<LeaderboardEntry | null>(null);
  const [editData, setEditData] = useState<InsertLeaderboardEntry>({
    rank: 1,
    username: "",
    wagered: "0",
    prize: "0",
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertLeaderboardEntry) =>
      apiRequest("POST", "/api/leaderboard/entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/entries"] });
      toast({ title: "Entry added successfully" });
      setNewEntry({ rank: 1, username: "", wagered: "0", prize: "0" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertLeaderboardEntry> }) =>
      apiRequest("PATCH", `/api/leaderboard/entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/entries"] });
      toast({ title: "Entry updated successfully" });
      setEditingEntry(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/leaderboard/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/entries"] });
      toast({ title: "Entry deleted successfully" });
    },
  });

  const openEdit = (entry: LeaderboardEntry) => {
    setEditingEntry(entry);
    setEditData({
      rank: entry.rank,
      username: entry.username,
      wagered: entry.wagered,
      prize: entry.prize,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Leaderboard Management</h2>
        <p className="text-zinc-400">Add and manage leaderboard entries</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Add Leaderboard Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rank" className="text-sm font-medium text-zinc-300">Rank</Label>
            <Input
              id="rank"
              type="number"
              value={newEntry.rank}
              onChange={(e) => setNewEntry({ ...newEntry, rank: parseInt(e.target.value) || 1 })}
              data-testid="input-rank"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-zinc-300">Username</Label>
            <Input
              id="username"
              value={newEntry.username}
              onChange={(e) => setNewEntry({ ...newEntry, username: e.target.value })}
              data-testid="input-username"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wagered" className="text-sm font-medium text-zinc-300">Wagered ($)</Label>
            <Input
              id="wagered"
              type="number"
              step="0.01"
              value={newEntry.wagered}
              onChange={(e) => setNewEntry({ ...newEntry, wagered: e.target.value })}
              data-testid="input-wagered"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prize" className="text-sm font-medium text-zinc-300">Prize ($)</Label>
            <Input
              id="prize"
              type="number"
              step="0.01"
              value={newEntry.prize}
              onChange={(e) => setNewEntry({ ...newEntry, prize: e.target.value })}
              data-testid="input-prize"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
        <Button
          onClick={() => createMutation.mutate(newEntry)}
          disabled={createMutation.isPending || !newEntry.username}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white"
          data-testid="button-add-entry"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </Card>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Current Entries</h3>
        <div className="space-y-3">
          {entries?.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              data-testid={`entry-${entry.id}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 font-bold text-lg">
                  #{entry.rank}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{entry.username}</div>
                  <div className="text-sm text-zinc-400">
                    Wagered: ${Number(entry.wagered).toLocaleString()} • Prize: ${Number(entry.prize).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(entry)}
                  data-testid={`button-edit-${entry.id}`}
                  className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(entry.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${entry.id}`}
                  className="hover:bg-red-600/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!entries || entries.length === 0) && (
            <div className="text-center py-12 text-zinc-500">
              <p>No entries yet. Add your first entry above.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Leaderboard Entry</DialogTitle>
            <DialogDescription className="text-zinc-400">Update the leaderboard entry details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rank" className="text-sm font-medium text-zinc-300">Rank</Label>
              <Input
                id="edit-rank"
                type="number"
                value={editData.rank}
                onChange={(e) => setEditData({ ...editData, rank: parseInt(e.target.value) || 1 })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-sm font-medium text-zinc-300">Username</Label>
              <Input
                id="edit-username"
                value={editData.username}
                onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-wagered" className="text-sm font-medium text-zinc-300">Wagered ($)</Label>
              <Input
                id="edit-wagered"
                type="number"
                step="0.01"
                value={editData.wagered}
                onChange={(e) => setEditData({ ...editData, wagered: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prize" className="text-sm font-medium text-zinc-300">Prize ($)</Label>
              <Input
                id="edit-prize"
                type="number"
                step="0.01"
                value={editData.prize}
                onChange={(e) => setEditData({ ...editData, prize: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button
              onClick={() => editingEntry && updateMutation.mutate({ id: editingEntry.id, data: editData })}
              disabled={updateMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MilestonesAdmin() {
  const { toast } = useToast();
  const { data: milestones } = useQuery<LevelMilestone[]>({
    queryKey: ["/api/milestones"],
  });

  const [newMilestone, setNewMilestone] = useState<InsertLevelMilestone>({
    name: "",
    tier: 1,
    imageUrl: "",
    rewards: [],
  });
  const [rewardInput, setRewardInput] = useState("");
  const [editingMilestone, setEditingMilestone] = useState<LevelMilestone | null>(null);
  const [editData, setEditData] = useState<InsertLevelMilestone>({
    name: "",
    tier: 1,
    imageUrl: "",
    rewards: [],
  });
  const [editRewardInput, setEditRewardInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: InsertLevelMilestone) =>
      apiRequest("POST", "/api/milestones", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone added successfully" });
      setNewMilestone({ name: "", tier: 1, imageUrl: "", rewards: [] });
      setRewardInput("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding milestone", 
        description: error?.message || "Failed to add milestone",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertLevelMilestone> }) =>
      apiRequest("PATCH", `/api/milestones/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone updated successfully" });
      setEditingMilestone(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating milestone", 
        description: error?.message || "Failed to update milestone",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/milestones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting milestone", 
        description: error?.message || "Failed to delete milestone",
        variant: "destructive"
      });
    },
  });

  const addReward = () => {
    if (rewardInput.trim()) {
      setNewMilestone({ ...newMilestone, rewards: [...newMilestone.rewards, rewardInput.trim()] });
      setRewardInput("");
    }
  };

  const removeReward = (index: number) => {
    setNewMilestone({
      ...newMilestone,
      rewards: newMilestone.rewards.filter((_, i) => i !== index),
    });
  };

  const openEdit = (milestone: LevelMilestone) => {
    setEditingMilestone(milestone);
    setEditData({
      name: milestone.name,
      tier: milestone.tier,
      imageUrl: milestone.imageUrl,
      rewards: milestone.rewards ? [...milestone.rewards] : [],
    });
    setEditRewardInput("");
  };

  const addEditReward = () => {
    if (editRewardInput.trim()) {
      setEditData({ ...editData, rewards: [...editData.rewards, editRewardInput.trim()] });
      setEditRewardInput("");
    }
  };

  const removeEditReward = (index: number) => {
    setEditData({
      ...editData,
      rewards: editData.rewards.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Milestones Management</h2>
        <p className="text-zinc-400">Add and manage level milestones</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Add Milestone</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-300">Name</Label>
              <Input
                id="name"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="e.g., Bronze 1"
                data-testid="input-milestone-name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier" className="text-sm font-medium text-zinc-300">Tier</Label>
              <Input
                id="tier"
                type="number"
                value={newMilestone.tier}
                onChange={(e) => setNewMilestone({ ...newMilestone, tier: parseInt(e.target.value) || 1 })}
                data-testid="input-tier"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-sm font-medium text-zinc-300">Image URL</Label>
              <Input
                id="imageUrl"
                value={newMilestone.imageUrl}
                onChange={(e) => setNewMilestone({ ...newMilestone, imageUrl: e.target.value })}
                data-testid="input-image-url"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward" className="text-sm font-medium text-zinc-300">Rewards</Label>
            <div className="flex gap-2">
              <Input
                id="reward"
                value={rewardInput}
                onChange={(e) => setRewardInput(e.target.value)}
                placeholder="Enter a reward"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReward())}
                data-testid="input-reward"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button onClick={addReward} type="button" data-testid="button-add-reward" className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {newMilestone.rewards.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newMilestone.rewards.map((reward, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 bg-zinc-800 text-zinc-300 border-zinc-700"
                  >
                    <span className="text-sm">{reward}</span>
                    <button
                      onClick={() => removeReward(index)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={() => createMutation.mutate(newMilestone)}
            disabled={createMutation.isPending || !newMilestone.name}
            data-testid="button-add-milestone"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Current Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones?.map((milestone) => (
            <Card key={milestone.id} className="p-4 relative bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex gap-2 absolute top-2 right-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(milestone)}
                  data-testid={`button-edit-milestone-${milestone.id}`}
                  className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(milestone.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-milestone-${milestone.id}`}
                  className="h-8 w-8 hover:bg-red-600/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mb-3">
                {milestone.imageUrl && (
                  <img src={milestone.imageUrl} alt={milestone.name} className="w-16 h-16 rounded-lg mb-3 object-cover border border-zinc-800" />
                )}
                <h4 className="font-semibold text-white">{milestone.name}</h4>
                <p className="text-sm text-zinc-400">Tier {milestone.tier}</p>
              </div>
              {milestone.rewards?.length > 0 && (
                <div className="text-xs text-zinc-500 mt-2">
                  {milestone.rewards.join(", ")}
                </div>
              )}
            </Card>
          ))}
          {(!milestones || milestones.length === 0) && (
            <div className="col-span-full text-center py-12 text-zinc-500">
              <p>No milestones yet. Add your first milestone above.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Milestone</DialogTitle>
            <DialogDescription className="text-zinc-400">Update the milestone details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium text-zinc-300">Name</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tier" className="text-sm font-medium text-zinc-300">Tier</Label>
              <Input
                id="edit-tier"
                type="number"
                value={editData.tier}
                onChange={(e) => setEditData({ ...editData, tier: parseInt(e.target.value) || 1 })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl" className="text-sm font-medium text-zinc-300">Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={editData.imageUrl}
                onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reward" className="text-sm font-medium text-zinc-300">Rewards</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-reward"
                  value={editRewardInput}
                  onChange={(e) => setEditRewardInput(e.target.value)}
                  placeholder="Enter a reward"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEditReward())}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Button onClick={addEditReward} type="button" className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {editData.rewards.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editData.rewards.map((reward, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2 bg-zinc-800 text-zinc-300 border-zinc-700"
                    >
                      <span className="text-sm">{reward}</span>
                      <button
                        onClick={() => removeEditReward(index)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => editingMilestone && updateMutation.mutate({ id: editingMilestone.id, data: editData })}
              disabled={updateMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChallengesAdmin() {
  const { toast } = useToast();
  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const [newChallenge, setNewChallenge] = useState<InsertChallenge>({
    gameName: "",
    gameImage: "",
    minMultiplier: "1",
    minBet: "0",
    prize: "0",
    isActive: true,
  });

  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [editData, setEditData] = useState<InsertChallenge>({
    gameName: "",
    gameImage: "",
    minMultiplier: "1",
    minBet: "0",
    prize: "0",
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertChallenge) =>
      apiRequest("POST", "/api/challenges", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Challenge added successfully" });
      setNewChallenge({
        gameName: "",
        gameImage: "",
        minMultiplier: "1",
        minBet: "0",
        prize: "0",
        isActive: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertChallenge> }) =>
      apiRequest("PATCH", `/api/challenges/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Challenge updated successfully" });
      setEditingChallenge(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/challenges/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Challenge updated successfully" });
    },
  });

  const approveClaimMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/challenges/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Claim approved successfully" });
    },
  });

  const declineClaimMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/challenges/${id}/decline`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Claim declined successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/challenges/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: "Challenge deleted successfully" });
    },
  });

  const openEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setEditData({
      gameName: challenge.gameName,
      gameImage: challenge.gameImage,
      minMultiplier: challenge.minMultiplier,
      minBet: challenge.minBet,
      prize: challenge.prize,
      isActive: challenge.isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Challenges Management</h2>
        <p className="text-zinc-400">Add and manage game challenges</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Add Challenge</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gameName" className="text-sm font-medium text-zinc-300">Game Name</Label>
              <Input
                id="gameName"
                value={newChallenge.gameName}
                onChange={(e) => setNewChallenge({ ...newChallenge, gameName: e.target.value })}
                data-testid="input-game-name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameImage" className="text-sm font-medium text-zinc-300">Game Image URL</Label>
              <Input
                id="gameImage"
                value={newChallenge.gameImage}
                onChange={(e) => setNewChallenge({ ...newChallenge, gameImage: e.target.value })}
                data-testid="input-game-image"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minMultiplier" className="text-sm font-medium text-zinc-300">Min Multiplier</Label>
              <Input
                id="minMultiplier"
                type="number"
                step="0.01"
                value={newChallenge.minMultiplier}
                onChange={(e) => setNewChallenge({ ...newChallenge, minMultiplier: e.target.value })}
                data-testid="input-min-multiplier"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minBet" className="text-sm font-medium text-zinc-300">Min Bet ($)</Label>
              <Input
                id="minBet"
                type="number"
                step="0.01"
                value={newChallenge.minBet}
                onChange={(e) => setNewChallenge({ ...newChallenge, minBet: e.target.value })}
                data-testid="input-min-bet"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize" className="text-sm font-medium text-zinc-300">Prize ($)</Label>
              <Input
                id="prize"
                type="number"
                step="0.01"
                value={newChallenge.prize}
                onChange={(e) => setNewChallenge({ ...newChallenge, prize: e.target.value })}
                data-testid="input-challenge-prize"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isActive"
                checked={newChallenge.isActive}
                onCheckedChange={(checked) => setNewChallenge({ ...newChallenge, isActive: checked })}
                data-testid="switch-is-active"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-zinc-300">Active</Label>
            </div>
          </div>

          <Button
            onClick={() => createMutation.mutate(newChallenge)}
            disabled={createMutation.isPending || !newChallenge.gameName}
            data-testid="button-add-challenge"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Challenge
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Current Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges?.map((challenge) => (
            <Card key={challenge.id} className="p-4 bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors" data-testid={`challenge-${challenge.id}`}>
              <div className="flex gap-4">
                {challenge.gameImage && (
                  <img src={challenge.gameImage} alt={challenge.gameName} className="w-20 h-20 rounded-lg object-cover border border-zinc-800" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{challenge.gameName}</h4>
                      <div className="text-xs text-zinc-400 mt-1">
                        {challenge.minMultiplier}x • ${Number(challenge.minBet).toFixed(2)} bet
                      </div>
                    </div>
                    <Badge className={challenge.isActive ? "bg-green-600/20 text-green-500 border-green-600/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"}>
                      {challenge.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-zinc-300 mb-3">
                    Prize: ${Number(challenge.prize).toLocaleString()}
                  </div>
                  {(challenge.claimStatus === "pending" || challenge.claimStatus === "claimed") && (
                    <div className="mb-3 p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/30">
                          Pending Verification
                        </Badge>
                      </div>
                      <div className="text-xs text-amber-200 space-y-1 mb-3">
                        <div><span className="text-amber-400 font-semibold">Username:</span> {challenge.claimedBy || 'N/A'}</div>
                        <div><span className="text-amber-400 font-semibold">Discord:</span> {challenge.discordUsername || 'N/A'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveClaimMutation.mutate(challenge.id)}
                          disabled={approveClaimMutation.isPending}
                          data-testid={`button-approve-${challenge.id}`}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => declineClaimMutation.mutate(challenge.id)}
                          disabled={declineClaimMutation.isPending}
                          data-testid={`button-decline-${challenge.id}`}
                          className="border-red-600/30 text-red-500 hover:bg-red-600/20 flex-1"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                  {challenge.claimStatus === "verified" && (
                    <div className="mb-3 p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-600/20 text-green-500 border-green-600/30">
                          Verified
                        </Badge>
                      </div>
                      <div className="text-xs text-green-200 space-y-1">
                        <div><span className="text-green-400 font-semibold">Winner:</span> {challenge.claimedBy}</div>
                        <div><span className="text-green-400 font-semibold">Discord:</span> {challenge.discordUsername}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActiveMutation.mutate({ id: challenge.id, isActive: !challenge.isActive })}
                      disabled={toggleActiveMutation.isPending}
                      data-testid={`button-toggle-${challenge.id}`}
                      className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      {challenge.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(challenge)}
                      data-testid={`button-edit-challenge-${challenge.id}`}
                      className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(challenge.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-challenge-${challenge.id}`}
                      className="hover:bg-red-600/20 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {(!challenges || challenges.length === 0) && (
            <div className="col-span-full text-center py-12 text-zinc-500">
              <p>No challenges yet. Add your first challenge above.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!editingChallenge} onOpenChange={(open) => !open && setEditingChallenge(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Challenge</DialogTitle>
            <DialogDescription className="text-zinc-400">Update the challenge details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-gameName" className="text-sm font-medium text-zinc-300">Game Name</Label>
              <Input
                id="edit-gameName"
                value={editData.gameName}
                onChange={(e) => setEditData({ ...editData, gameName: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gameImage" className="text-sm font-medium text-zinc-300">Game Image URL</Label>
              <Input
                id="edit-gameImage"
                value={editData.gameImage}
                onChange={(e) => setEditData({ ...editData, gameImage: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-minMultiplier" className="text-sm font-medium text-zinc-300">Min Multiplier</Label>
                <Input
                  id="edit-minMultiplier"
                  type="number"
                  step="0.01"
                  value={editData.minMultiplier}
                  onChange={(e) => setEditData({ ...editData, minMultiplier: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minBet" className="text-sm font-medium text-zinc-300">Min Bet ($)</Label>
                <Input
                  id="edit-minBet"
                  type="number"
                  step="0.01"
                  value={editData.minBet}
                  onChange={(e) => setEditData({ ...editData, minBet: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-challenge-prize" className="text-sm font-medium text-zinc-300">Prize ($)</Label>
              <Input
                id="edit-challenge-prize"
                type="number"
                step="0.01"
                value={editData.prize}
                onChange={(e) => setEditData({ ...editData, prize: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={editData.isActive}
                onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive" className="text-sm font-medium text-zinc-300">Active</Label>
            </div>
            <Button
              onClick={() => editingChallenge && updateMutation.mutate({ id: editingChallenge.id, data: editData })}
              disabled={updateMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FreeSpinsAdmin() {
  const { toast } = useToast();
  const { data: offers } = useQuery<FreeSpinsOffer[]>({
    queryKey: ["/api/free-spins"],
  });

  const [newOffer, setNewOffer] = useState<InsertFreeSpinsOffer>({
    code: "",
    gameName: "",
    gameProvider: "",
    gameImage: "",
    spinsCount: 100,
    spinValue: "0.20",
    totalClaims: 10,
    claimsRemaining: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: [],
    isActive: true,
  });
  const [reqInput, setReqInput] = useState("");

  const [editingOffer, setEditingOffer] = useState<FreeSpinsOffer | null>(null);
  const [editData, setEditData] = useState<InsertFreeSpinsOffer>({
    code: "",
    gameName: "",
    gameProvider: "",
    gameImage: "",
    spinsCount: 100,
    spinValue: "0.20",
    totalClaims: 10,
    claimsRemaining: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: [],
    isActive: true,
  });
  const [editReqInput, setEditReqInput] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: InsertFreeSpinsOffer) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt instanceof Date ? data.expiresAt.toISOString() : data.expiresAt,
      };
      return apiRequest("POST", "/api/free-spins", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/free-spins"] });
      toast({ title: "Free spins offer added successfully" });
      setNewOffer({
        code: "",
        gameName: "",
        gameProvider: "",
        gameImage: "",
        spinsCount: 100,
        spinValue: "0.20",
        totalClaims: 10,
        claimsRemaining: 10,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        requirements: [],
        isActive: true,
      });
      setReqInput("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding free spins offer", 
        description: error?.message || "Failed to add offer",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertFreeSpinsOffer> }) => {
      const payload = {
        ...data,
        expiresAt: data.expiresAt instanceof Date ? data.expiresAt.toISOString() : data.expiresAt,
      };
      return apiRequest("PATCH", `/api/free-spins/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/free-spins"] });
      toast({ title: "Free spins offer updated successfully" });
      setEditingOffer(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating free spins offer", 
        description: error?.message || "Failed to update offer",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/free-spins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/free-spins"] });
      toast({ title: "Offer deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting offer", 
        description: error?.message || "Failed to delete offer",
        variant: "destructive"
      });
    },
  });

  const addRequirement = () => {
    if (reqInput.trim()) {
      setNewOffer({ ...newOffer, requirements: [...newOffer.requirements, reqInput.trim()] });
      setReqInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setNewOffer({
      ...newOffer,
      requirements: newOffer.requirements.filter((_, i) => i !== index),
    });
  };

  const openEdit = (offer: FreeSpinsOffer) => {
    setEditingOffer(offer);
    setEditData({
      code: offer.code,
      gameName: offer.gameName,
      gameProvider: offer.gameProvider,
      gameImage: offer.gameImage,
      spinsCount: offer.spinsCount,
      spinValue: offer.spinValue,
      totalClaims: offer.totalClaims,
      claimsRemaining: offer.claimsRemaining,
      expiresAt: new Date(offer.expiresAt),
      requirements: offer.requirements ? [...offer.requirements] : [],
      isActive: offer.isActive,
    });
    setEditReqInput("");
  };

  const addEditRequirement = () => {
    if (editReqInput.trim()) {
      setEditData({ ...editData, requirements: [...editData.requirements, editReqInput.trim()] });
      setEditReqInput("");
    }
  };

  const removeEditRequirement = (index: number) => {
    setEditData({
      ...editData,
      requirements: editData.requirements.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Free Spins Management</h2>
        <p className="text-zinc-400">Add and manage free spins offers</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Add Free Spins Offer</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-zinc-300">Code</Label>
              <Input
                id="code"
                value={newOffer.code}
                onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                data-testid="input-code"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameName" className="text-sm font-medium text-zinc-300">Game Name</Label>
              <Input
                id="gameName"
                value={newOffer.gameName}
                onChange={(e) => setNewOffer({ ...newOffer, gameName: e.target.value })}
                data-testid="input-game-name-fs"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameProvider" className="text-sm font-medium text-zinc-300">Game Provider</Label>
              <Input
                id="gameProvider"
                value={newOffer.gameProvider}
                onChange={(e) => setNewOffer({ ...newOffer, gameProvider: e.target.value })}
                data-testid="input-game-provider"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gameImage" className="text-sm font-medium text-zinc-300">Game Image URL</Label>
              <Input
                id="gameImage"
                value={newOffer.gameImage}
                onChange={(e) => setNewOffer({ ...newOffer, gameImage: e.target.value })}
                data-testid="input-game-image-fs"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spinsCount" className="text-sm font-medium text-zinc-300">Spins Count</Label>
              <Input
                id="spinsCount"
                type="number"
                value={newOffer.spinsCount}
                onChange={(e) => setNewOffer({ ...newOffer, spinsCount: parseInt(e.target.value) || 0 })}
                data-testid="input-spins-count"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spinValue" className="text-sm font-medium text-zinc-300">Spin Value ($)</Label>
              <Input
                id="spinValue"
                type="number"
                step="0.01"
                value={newOffer.spinValue}
                onChange={(e) => setNewOffer({ ...newOffer, spinValue: e.target.value })}
                data-testid="input-spin-value"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalClaims" className="text-sm font-medium text-zinc-300">Total Claims</Label>
              <Input
                id="totalClaims"
                type="number"
                value={newOffer.totalClaims}
                onChange={(e) => setNewOffer({ 
                  ...newOffer, 
                  totalClaims: parseInt(e.target.value) || 0,
                  claimsRemaining: parseInt(e.target.value) || 0 
                })}
                data-testid="input-total-claims"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-sm font-medium text-zinc-300">Expires At</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={new Date(newOffer.expiresAt).toISOString().slice(0, 16)}
                onChange={(e) => setNewOffer({ ...newOffer, expiresAt: new Date(e.target.value) })}
                data-testid="input-expires-at"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirement" className="text-sm font-medium text-zinc-300">Requirements</Label>
            <div className="flex gap-2">
              <Input
                id="requirement"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                placeholder="Enter a requirement"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                data-testid="input-requirement"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button onClick={addRequirement} type="button" data-testid="button-add-requirement" className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {newOffer.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newOffer.requirements.map((req, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 bg-zinc-800 text-zinc-300 border-zinc-700"
                  >
                    <span className="text-sm">{req}</span>
                    <button
                      onClick={() => removeRequirement(index)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={newOffer.isActive}
              onCheckedChange={(checked) => setNewOffer({ ...newOffer, isActive: checked })}
              data-testid="switch-is-active-fs"
            />
            <Label htmlFor="isActive" className="text-sm font-medium text-zinc-300">Active</Label>
          </div>

          <Button
            onClick={() => createMutation.mutate(newOffer)}
            disabled={createMutation.isPending || !newOffer.code || !newOffer.gameName}
            data-testid="button-add-offer"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Offer
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Current Offers</h3>
        <div className="space-y-3">
          {offers?.map((offer) => (
            <Card key={offer.id} className="p-4 bg-zinc-950 border-zinc-800 hover:border-zinc-700 transition-colors" data-testid={`offer-${offer.id}`}>
              <div className="flex gap-4">
                {offer.gameImage && (
                  <img src={offer.gameImage} alt={offer.gameName} className="w-24 h-24 rounded-lg object-cover border border-zinc-800" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{offer.gameName}</h4>
                      <p className="text-sm text-zinc-400">{offer.gameProvider}</p>
                      <Badge className="mt-2 bg-red-600/20 text-red-500 border-red-600/30">
                        {offer.code}
                      </Badge>
                    </div>
                    <Badge className={offer.isActive ? "bg-green-600/20 text-green-500 border-green-600/30" : "bg-zinc-800 text-zinc-500 border-zinc-700"}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-zinc-300 mb-2">
                    {offer.spinsCount} spins × ${Number(offer.spinValue).toFixed(2)} = ${(offer.spinsCount * Number(offer.spinValue)).toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500 mb-2">
                    Claims: {offer.claimsRemaining}/{offer.totalClaims} • Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                  </div>
                  {offer.requirements?.length > 0 && (
                    <div className="text-xs text-zinc-500 mb-3">
                      Requirements: {offer.requirements.join(", ")}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(offer)}
                      data-testid={`button-edit-offer-${offer.id}`}
                      className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(offer.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-offer-${offer.id}`}
                      className="hover:bg-red-600/20 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {(!offers || offers.length === 0) && (
            <div className="text-center py-12 text-zinc-500">
              <p>No offers yet. Add your first offer above.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!editingOffer} onOpenChange={(open) => !open && setEditingOffer(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Free Spins Offer</DialogTitle>
            <DialogDescription className="text-zinc-400">Update the offer details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code" className="text-sm font-medium text-zinc-300">Code</Label>
                <Input
                  id="edit-code"
                  value={editData.code}
                  onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gameName-fs" className="text-sm font-medium text-zinc-300">Game Name</Label>
                <Input
                  id="edit-gameName-fs"
                  value={editData.gameName}
                  onChange={(e) => setEditData({ ...editData, gameName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gameProvider" className="text-sm font-medium text-zinc-300">Game Provider</Label>
                <Input
                  id="edit-gameProvider"
                  value={editData.gameProvider}
                  onChange={(e) => setEditData({ ...editData, gameProvider: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gameImage-fs" className="text-sm font-medium text-zinc-300">Game Image URL</Label>
                <Input
                  id="edit-gameImage-fs"
                  value={editData.gameImage}
                  onChange={(e) => setEditData({ ...editData, gameImage: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-spinsCount" className="text-sm font-medium text-zinc-300">Spins Count</Label>
                <Input
                  id="edit-spinsCount"
                  type="number"
                  value={editData.spinsCount}
                  onChange={(e) => setEditData({ ...editData, spinsCount: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-spinValue" className="text-sm font-medium text-zinc-300">Spin Value ($)</Label>
                <Input
                  id="edit-spinValue"
                  type="number"
                  step="0.01"
                  value={editData.spinValue}
                  onChange={(e) => setEditData({ ...editData, spinValue: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalClaims" className="text-sm font-medium text-zinc-300">Total Claims</Label>
                <Input
                  id="edit-totalClaims"
                  type="number"
                  value={editData.totalClaims}
                  onChange={(e) => setEditData({ ...editData, totalClaims: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-claimsRemaining" className="text-sm font-medium text-zinc-300">Claims Remaining</Label>
                <Input
                  id="edit-claimsRemaining"
                  type="number"
                  value={editData.claimsRemaining}
                  onChange={(e) => setEditData({ ...editData, claimsRemaining: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-expiresAt" className="text-sm font-medium text-zinc-300">Expires At</Label>
                <Input
                  id="edit-expiresAt"
                  type="datetime-local"
                  value={new Date(editData.expiresAt).toISOString().slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, expiresAt: new Date(e.target.value) })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-requirement" className="text-sm font-medium text-zinc-300">Requirements</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-requirement"
                  value={editReqInput}
                  onChange={(e) => setEditReqInput(e.target.value)}
                  placeholder="Enter a requirement"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEditRequirement())}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Button onClick={addEditRequirement} type="button" className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {editData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editData.requirements.map((req, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2 bg-zinc-800 text-zinc-300 border-zinc-700"
                    >
                      <span className="text-sm">{req}</span>
                      <button
                        onClick={() => removeEditRequirement(index)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={editData.isActive}
                onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive" className="text-sm font-medium text-zinc-300">Active</Label>
            </div>

            <Button
              onClick={() => editingOffer && updateMutation.mutate({ id: editingOffer.id, data: editData })}
              disabled={updateMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersAdmin() {
  const { toast } = useToast();
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [action, setAction] = useState<'add' | 'remove' | 'set'>('add');

  const managePointsMutation = useMutation({
    mutationFn: ({ userId, points, action }: { userId: string; points: number; action: 'add' | 'remove' | 'set' }) =>
      apiRequest("POST", `/api/users/${userId}/points`, { points, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Points updated successfully" });
      setSelectedUser(null);
      setPointsAmount("");
      setAction('add');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update points",
        variant: "destructive",
      });
    },
  });

  const handleManagePoints = (selectedAction: 'add' | 'remove' | 'set') => {
    if (!selectedUser || !pointsAmount) return;
    const points = parseInt(pointsAmount);
    if (isNaN(points) || points < 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }
    if (points <= 0 && (selectedAction === 'add' || selectedAction === 'remove')) {
      toast({
        title: "Invalid amount",
        description: "Points must be greater than 0 for add/remove",
        variant: "destructive",
      });
      return;
    }
    managePointsMutation.mutate({ userId: selectedUser.id, points, action: selectedAction });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Users & Points Management</h2>
        <p className="text-zinc-400">View users and assign points manually</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">All Users</h3>
        <div className="space-y-3">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              data-testid={`user-${user.id}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center text-red-500 font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">User #{user.id.slice(0, 8)}</div>
                  <div className="text-sm text-zinc-400 space-y-1">
                    {user.kickUsername && (
                      <div>Kick: {user.kickUsername}</div>
                    )}
                    {user.discordUsername && (
                      <div>Discord: {user.discordUsername}</div>
                    )}
                    {user.gamdomUsername && (
                      <div>Gamdom: {user.gamdomUsername}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Points Balance</div>
                  <div className="text-2xl font-bold text-white">{user.points.toLocaleString()}</div>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedUser(user);
                  setPointsAmount("");
                  setAction('add');
                }}
                className="ml-4 bg-red-600 hover:bg-red-700 text-white"
                data-testid={`button-manage-points-${user.id}`}
              >
                <Coins className="w-4 h-4 mr-2" />
                Manage Points
              </Button>
            </div>
          ))}
          {(!users || users.length === 0) && (
            <div className="text-center py-12 text-zinc-500">
              <p>No users yet.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Points</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {selectedUser?.kickUsername 
                ? `Managing Kicklet points for ${selectedUser.kickUsername}. Changes sync with Kick.`
                : "Add, remove, or set points for this user."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-zinc-400">Current Balance</div>
                {selectedUser?.kickUsername && (
                  <Badge variant="secondary" className="text-xs">
                    Kick Linked
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-white">
                {selectedUser?.points.toLocaleString()} points
              </div>
              {selectedUser?.kickUsername && (
                <div className="text-xs text-zinc-500 mt-1">
                  Kick: @{selectedUser.kickUsername}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="points-amount" className="text-sm font-medium text-zinc-300">
                Points Amount
              </Label>
              <Input
                id="points-amount"
                type="number"
                min="0"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-zinc-800 border-zinc-700 text-white"
                data-testid="input-points-amount"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleManagePoints('add')}
                disabled={managePointsMutation.isPending || !pointsAmount}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-add-points"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                onClick={() => handleManagePoints('remove')}
                disabled={managePointsMutation.isPending || !pointsAmount}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                data-testid="button-remove-points"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
              <Button
                onClick={() => handleManagePoints('set')}
                disabled={managePointsMutation.isPending || !pointsAmount}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-set-points"
              >
                <Save className="w-4 h-4 mr-1" />
                Set
              </Button>
            </div>
            <div className="text-xs text-zinc-500 space-y-1">
              <div>• <strong>Add:</strong> Increases points by the amount</div>
              <div>• <strong>Remove:</strong> Decreases points by the amount</div>
              <div>• <strong>Set:</strong> Sets points to the exact amount</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShopItemsAdmin() {
  const { toast } = useToast();
  const { data: items } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop/items"],
  });

  const [newItem, setNewItem] = useState<InsertShopItem>({
    name: "",
    description: "",
    pointsCost: 1000,
    imageUrl: "",
    stock: -1,
    isActive: true,
  });

  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [editData, setEditData] = useState<InsertShopItem>({
    name: "",
    description: "",
    pointsCost: 1000,
    imageUrl: "",
    stock: -1,
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertShopItem) =>
      apiRequest("POST", "/api/shop/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
      toast({ title: "Shop item added successfully" });
      setNewItem({
        name: "",
        description: "",
        pointsCost: 1000,
        imageUrl: "",
        stock: -1,
        isActive: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertShopItem> }) =>
      apiRequest("PATCH", `/api/shop/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
      toast({ title: "Shop item updated successfully" });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/shop/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
      toast({ title: "Shop item deleted successfully" });
    },
  });

  const openEdit = (item: ShopItem) => {
    setEditingItem(item);
    setEditData({
      name: item.name,
      description: item.description,
      pointsCost: item.pointsCost,
      imageUrl: item.imageUrl || "",
      stock: item.stock,
      isActive: item.isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Shop Items Management</h2>
        <p className="text-zinc-400">Add and manage shop items that users can redeem with points</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Add Shop Item</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium text-zinc-300">Item Name</Label>
            <Input
              id="item-name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g., $10 Gamdom Bonus"
              data-testid="input-item-name"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-cost" className="text-sm font-medium text-zinc-300">Points Cost</Label>
            <Input
              id="item-cost"
              type="number"
              value={newItem.pointsCost}
              onChange={(e) => setNewItem({ ...newItem, pointsCost: parseInt(e.target.value) || 0 })}
              data-testid="input-item-cost"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="item-description" className="text-sm font-medium text-zinc-300">Description</Label>
            <Input
              id="item-description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Brief description of the item"
              data-testid="input-item-description"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-image" className="text-sm font-medium text-zinc-300">Image URL (optional)</Label>
            <Input
              id="item-image"
              value={newItem.imageUrl || ""}
              onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
              placeholder="https://example.com/image.png"
              data-testid="input-item-image"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-stock" className="text-sm font-medium text-zinc-300">Stock (-1 for unlimited)</Label>
            <Input
              id="item-stock"
              type="number"
              value={newItem.stock}
              onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || -1 })}
              data-testid="input-item-stock"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="flex items-center space-x-2 md:col-span-2">
            <Switch
              id="item-active"
              checked={newItem.isActive}
              onCheckedChange={(checked) => setNewItem({ ...newItem, isActive: checked })}
            />
            <Label htmlFor="item-active" className="text-sm font-medium text-zinc-300">Active (visible in shop)</Label>
          </div>
        </div>
        <Button
          onClick={() => createMutation.mutate(newItem)}
          disabled={createMutation.isPending || !newItem.name || !newItem.description}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white"
          data-testid="button-add-item"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </Card>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Current Shop Items</h3>
        <div className="space-y-3">
          {items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
              data-testid={`shop-item-${item.id}`}
            >
              <div className="flex items-center gap-4 flex-1">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-zinc-700"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-white">{item.name}</div>
                    {item.isActive ? (
                      <Badge variant="default" className="bg-green-600/20 text-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400">{item.description}</div>
                  <div className="text-sm text-zinc-500 mt-1">
                    Stock: {item.stock === -1 ? "Unlimited" : item.stock} • Cost: {item.pointsCost.toLocaleString()} pts
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => openEdit(item)}
                  data-testid={`button-edit-item-${item.id}`}
                  className="hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-item-${item.id}`}
                  className="hover:bg-red-600/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!items || items.length === 0) && (
            <div className="text-center py-12 text-zinc-500">
              <p>No shop items yet. Add your first item above.</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Shop Item</DialogTitle>
            <DialogDescription className="text-zinc-400">Update the shop item details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item-name" className="text-sm font-medium text-zinc-300">Item Name</Label>
                <Input
                  id="edit-item-name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-item-cost" className="text-sm font-medium text-zinc-300">Points Cost</Label>
                <Input
                  id="edit-item-cost"
                  type="number"
                  value={editData.pointsCost}
                  onChange={(e) => setEditData({ ...editData, pointsCost: parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-description" className="text-sm font-medium text-zinc-300">Description</Label>
              <Input
                id="edit-item-description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-image" className="text-sm font-medium text-zinc-300">Image URL</Label>
              <Input
                id="edit-item-image"
                value={editData.imageUrl || ""}
                onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-stock" className="text-sm font-medium text-zinc-300">Stock</Label>
              <Input
                id="edit-item-stock"
                type="number"
                value={editData.stock}
                onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) || -1 })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-item-active"
                checked={editData.isActive}
                onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
              />
              <Label htmlFor="edit-item-active" className="text-sm font-medium text-zinc-300">Active</Label>
            </div>
            <Button
              onClick={() => editingItem && updateMutation.mutate({ id: editingItem.id, data: editData })}
              disabled={updateMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RedemptionCenterAdmin() {
  const { toast } = useToast();
  const { data: redemptions } = useQuery<Redemption[]>({
    queryKey: ["/api/shop/redemptions"],
  });
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  const { data: shopItems } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop/items"],
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/shop/redemptions/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/redemptions"] });
      toast({ title: "Redemption approved successfully" });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("POST", `/api/shop/redemptions/${id}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Redemption declined and points refunded" });
    },
  });

  const getUserById = (userId: string) => {
    return users?.find((u) => u.id === userId);
  };

  const getItemById = (itemId: string) => {
    return shopItems?.find((i) => i.id === itemId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-600/20 text-amber-500 border-amber-600/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-600/20 text-green-500 border-green-600/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "declined":
        return <Badge className="bg-red-600/20 text-red-500 border-red-600/30"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingRedemptions = redemptions?.filter((r) => r.status === "pending") || [];
  const processedRedemptions = redemptions?.filter((r) => r.status !== "pending") || [];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Redemption Center</h2>
        <p className="text-zinc-400">Review and manage user point redemptions</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Pending Redemptions ({pendingRedemptions.length})</h3>
        <div className="space-y-4">
          {pendingRedemptions.map((redemption) => {
            const user = getUserById(redemption.userId);
            const item = getItemById(redemption.shopItemId);
            
            return (
              <Card key={redemption.id} className="p-6 bg-zinc-950 border-zinc-800" data-testid={`redemption-${redemption.id}`}>
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-lg font-semibold text-white">Redemption Request</h4>
                        {getStatusBadge(redemption.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-semibold text-red-500 mb-3">User Details</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Username:</span>
                              <span className="text-white font-medium" data-testid={`text-username-${redemption.id}`}>
                                {user?.username || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Current Points:</span>
                              <span className="text-white font-medium" data-testid={`text-points-${redemption.id}`}>
                                {user?.points?.toLocaleString() || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Discord:</span>
                              <span className="text-zinc-300" data-testid={`text-discord-${redemption.id}`}>
                                {user?.discordUsername || "Not linked"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Kick:</span>
                              <span className="text-zinc-300" data-testid={`text-kick-${redemption.id}`}>
                                {user?.kickUsername || "Not linked"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Gamdom:</span>
                              <span className="text-zinc-300" data-testid={`text-gamdom-${redemption.id}`}>
                                {user?.gamdomUsername || "Not linked"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-semibold text-red-500 mb-3">Item Requested</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Item:</span>
                              <span className="text-white font-medium" data-testid={`text-item-name-${redemption.id}`}>
                                {item?.name || "Unknown Item"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Description:</span>
                              <span className="text-zinc-300" data-testid={`text-item-description-${redemption.id}`}>
                                {item?.description || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Points Cost:</span>
                              <span className="text-white font-medium" data-testid={`text-points-cost-${redemption.id}`}>
                                {redemption.pointsSpent.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 w-32">Requested:</span>
                              <span className="text-zinc-300" data-testid={`text-created-at-${redemption.id}`}>
                                {new Date(redemption.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {redemption.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t border-zinc-800">
                      <Button
                        onClick={() => approveMutation.mutate(redemption.id)}
                        disabled={approveMutation.isPending || declineMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        data-testid={`button-approve-${redemption.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Redemption
                      </Button>
                      <Button
                        onClick={() => declineMutation.mutate(redemption.id)}
                        disabled={approveMutation.isPending || declineMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                        data-testid={`button-decline-${redemption.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline & Refund Points
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          {pendingRedemptions.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending redemptions</p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <h3 className="text-lg font-semibold mb-6 text-white">Processed Redemptions ({processedRedemptions.length})</h3>
        <div className="space-y-3">
          {processedRedemptions.map((redemption) => {
            const user = getUserById(redemption.userId);
            const item = getItemById(redemption.shopItemId);
            
            return (
              <div
                key={redemption.id}
                className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg"
                data-testid={`processed-redemption-${redemption.id}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{user?.username || "Unknown User"}</span>
                      <span className="text-zinc-500">→</span>
                      <span className="text-white">{item?.name || "Unknown Item"}</span>
                      {getStatusBadge(redemption.status)}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {redemption.pointsSpent.toLocaleString()} points • {new Date(redemption.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {processedRedemptions.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              <p>No processed redemptions yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function SettingsAdmin() {
  const { toast } = useToast();
  const { data: settings } = useQuery<LeaderboardSettings>({
    queryKey: ["/api/leaderboard/settings"],
  });

  const [newSettings, setNewSettings] = useState<InsertLeaderboardSettings>({
    totalPrizePool: "10000",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertLeaderboardSettings) => {
      const payload = {
        ...data,
        endDate: data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate,
      };
      return apiRequest("POST", "/api/leaderboard/settings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/settings"] });
      toast({ title: "Settings updated successfully" });
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Leaderboard Settings</h2>
        <p className="text-zinc-400">Configure global leaderboard settings</p>
      </div>

      <Card className="p-8 bg-zinc-900 border-zinc-800">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prizePool" className="text-sm font-medium text-zinc-300">Total Prize Pool ($)</Label>
            <Input
              id="prizePool"
              type="number"
              step="0.01"
              value={newSettings.totalPrizePool}
              onChange={(e) => setNewSettings({ ...newSettings, totalPrizePool: e.target.value })}
              data-testid="input-prize-pool"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium text-zinc-300">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={new Date(newSettings.endDate).toISOString().slice(0, 16)}
              onChange={(e) => setNewSettings({ ...newSettings, endDate: new Date(e.target.value) })}
              data-testid="input-end-date"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {settings && (
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
              <p className="text-sm font-semibold text-white">Current Settings</p>
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Prize Pool:</span> ${Number(settings.totalPrizePool).toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">
                  <span className="font-medium text-zinc-300">Ends:</span> {new Date(settings.endDate).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={() => updateMutation.mutate(newSettings)}
            disabled={updateMutation.isPending}
            data-testid="button-save-settings"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
