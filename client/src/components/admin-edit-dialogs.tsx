import React from "react";
import { Pencil, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LevelMilestone, Challenge, FreeSpinsOffer, InsertLevelMilestone, InsertChallenge, InsertFreeSpinsOffer } from "@shared/schema";

// Milestone Edit Dialog
export function MilestoneEditDialog({
  milestone,
  editData,
  setEditData,
  onSave,
  onClose,
  isPending,
}: {
  milestone: LevelMilestone | null;
  editData: InsertLevelMilestone & { rewards: string[] };
  setEditData: (data: InsertLevelMilestone & { rewards: string[] }) => void;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [rewardInput, setRewardInput] = React.useState("");

  const addReward = () => {
    if (rewardInput.trim()) {
      setEditData({ ...editData, rewards: [...editData.rewards, rewardInput.trim()] });
      setRewardInput("");
    }
  };

  const removeReward = (index: number) => {
    setEditData({ ...editData, rewards: editData.rewards.filter((_, i) => i !== index) });
  };

  return (
    <Dialog open={!!milestone} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Milestone</DialogTitle>
          <DialogDescription>Update milestone details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ms-name">Name</Label>
              <Input
                id="edit-ms-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ms-tier">Tier</Label>
              <Input
                id="edit-ms-tier"
                type="number"
                value={editData.tier}
                onChange={(e) => setEditData({ ...editData, tier: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-ms-imageUrl">Image URL</Label>
            <Input
              id="edit-ms-imageUrl"
              value={editData.imageUrl}
              onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Rewards</Label>
            <div className="flex gap-2">
              <Input
                value={rewardInput}
                onChange={(e) => setRewardInput(e.target.value)}
                placeholder="Enter a reward..."
                onKeyPress={(e) => e.key === "Enter" && addReward()}
              />
              <Button onClick={addReward} type="button" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1 mt-2">
              {editData.rewards.map((reward, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border border-border rounded text-sm">
                  <span>{reward}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeReward(idx)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onSave} disabled={isPending} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Challenge Edit Dialog
export function ChallengeEditDialog({
  challenge,
  editData,
  setEditData,
  onSave,
  onClose,
  isPending,
}: {
  challenge: Challenge | null;
  editData: InsertChallenge;
  setEditData: (data: InsertChallenge) => void;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={!!challenge} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Challenge</DialogTitle>
          <DialogDescription>Update challenge details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ch-gameName">Game Name</Label>
              <Input
                id="edit-ch-gameName"
                value={editData.gameName}
                onChange={(e) => setEditData({ ...editData, gameName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ch-gameImage">Game Image URL</Label>
              <Input
                id="edit-ch-gameImage"
                value={editData.gameImage}
                onChange={(e) => setEditData({ ...editData, gameImage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ch-minMultiplier">Min Multiplier</Label>
              <Input
                id="edit-ch-minMultiplier"
                type="number"
                step="0.01"
                value={editData.minMultiplier}
                onChange={(e) => setEditData({ ...editData, minMultiplier: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ch-minBet">Min Bet ($)</Label>
              <Input
                id="edit-ch-minBet"
                type="number"
                step="0.01"
                value={editData.minBet}
                onChange={(e) => setEditData({ ...editData, minBet: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ch-prize">Prize ($)</Label>
              <Input
                id="edit-ch-prize"
                type="number"
                step="0.01"
                value={editData.prize}
                onChange={(e) => setEditData({ ...editData, prize: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={onSave} disabled={isPending} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Free Spins Edit Dialog
export function FreeSpinsEditDialog({
  offer,
  editData,
  setEditData,
  onSave,
  onClose,
  isPending,
}: {
  offer: FreeSpinsOffer | null;
  editData: InsertFreeSpinsOffer & { requirements: string[] };
  setEditData: (data: InsertFreeSpinsOffer & { requirements: string[] }) => void;
  onSave: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [reqInput, setReqInput] = React.useState("");

  const addRequirement = () => {
    if (reqInput.trim()) {
      setEditData({ ...editData, requirements: [...editData.requirements, reqInput.trim()] });
      setReqInput("");
    }
  };

  return (
    <Dialog open={!!offer} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Free Spins Offer</DialogTitle>
          <DialogDescription>Update offer details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fs-code">Code</Label>
              <Input
                id="edit-fs-code"
                value={editData.code}
                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fs-gameName">Game Name</Label>
              <Input
                id="edit-fs-gameName"
                value={editData.gameName}
                onChange={(e) => setEditData({ ...editData, gameName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fs-gameProvider">Provider</Label>
              <Input
                id="edit-fs-gameProvider"
                value={editData.gameProvider}
                onChange={(e) => setEditData({ ...editData, gameProvider: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fs-spinsCount">Spins Count</Label>
              <Input
                id="edit-fs-spinsCount"
                type="number"
                value={editData.spinsCount}
                onChange={(e) => setEditData({ ...editData, spinsCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fs-spinValue">Spin Value ($)</Label>
              <Input
                id="edit-fs-spinValue"
                type="number"
                step="0.01"
                value={editData.spinValue}
                onChange={(e) => setEditData({ ...editData, spinValue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fs-claimsRemaining">Claims Remaining</Label>
              <Input
                id="edit-fs-claimsRemaining"
                type="number"
                value={editData.claimsRemaining}
                onChange={(e) => setEditData({ ...editData, claimsRemaining: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-fs-gameImage">Game Image URL</Label>
            <Input
              id="edit-fs-gameImage"
              value={editData.gameImage}
              onChange={(e) => setEditData({ ...editData, gameImage: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                placeholder="Enter a requirement..."
                onKeyPress={(e) => e.key === "Enter" && addRequirement()}
              />
              <Button onClick={addRequirement} type="button" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1 mt-2">
              {editData.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border border-border rounded text-sm">
                  <span>{req}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEditData({
                        ...editData,
                        requirements: editData.requirements.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onSave} disabled={isPending} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
