import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ShoppingBag, Coins, Package, Clock } from "lucide-react";
import type { ShopItem, Redemption } from "@shared/schema";
import { useUser } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ShopPage() {
  const { toast } = useToast();
  const { user } = useUser();

  const { data: shopItems = [], isLoading: itemsLoading } = useQuery<ShopItem[]>({
    queryKey: ["/api/shop/items"],
  });

  const { data: redemptions = [] } = useQuery<Redemption[]>({
    queryKey: ["/api/shop/redemptions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch(`/api/shop/redemptions?userId=${user?.id}`);
      if (!res.ok) throw new Error("Failed to fetch redemptions");
      return res.json();
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (shopItemId: string) => {
      return apiRequest("POST", "/api/shop/redeem", {
        userId: user?.id,
        shopItemId,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
      toast({
        title: "Redeemed!",
        description: "Your redemption is pending. We'll contact you soon!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem item",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return null;
  }

  const activeItems = shopItems.filter(item => item.isActive && (item.stock === -1 || item.stock > 0));

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
              <ShoppingBag className="w-8 h-8" />
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white">
              Points <span className="text-red-600">Shop</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Redeem your points for exclusive rewards! Balance: <span className="text-white font-bold" data-testid="text-balance">{user.points.toLocaleString()}</span> points
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {itemsLoading ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading shop items...</p>
            </div>
          ) : activeItems.length > 0 ? (
            activeItems.map((item, index) => (
              <Card
                key={item.id}
                className="p-6 border-zinc-800 bg-zinc-900/50 hover-elevate transition-all duration-300"
                data-testid={`shop-item-${index}`}
              >
                {item.imageUrl && (
                  <div className="w-full h-48 bg-zinc-800 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white" data-testid={`item-name-${index}`}>
                        {item.name}
                      </h3>
                      {item.stock > 0 && item.stock < 10 && (
                        <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-500">
                          {item.stock} left
                        </Badge>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm" data-testid={`item-description-${index}`}>
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-red-500" />
                      <span className="text-2xl font-bold text-white" data-testid={`item-cost-${index}`}>
                        {item.pointsCost.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      onClick={() => redeemMutation.mutate(item.id)}
                      disabled={user.points < item.pointsCost || redeemMutation.isPending || item.stock === 0}
                      className="bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white border-0"
                      data-testid={`button-redeem-${index}`}
                    >
                      {user.points < item.pointsCost ? "Not Enough" : item.stock === 0 ? "Out of Stock" : "Redeem"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-3 p-20 text-center border-zinc-800 bg-zinc-900/50">
              <Package className="w-20 h-20 text-zinc-700 mx-auto mb-6 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">No Items Available</h2>
              <p className="text-zinc-500 text-lg">Check back later for new rewards!</p>
            </Card>
          )}
        </div>

        {redemptions.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-8 h-8 text-red-500" />
              Your Redemptions
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {redemptions.map((redemption, index) => {
                const item = shopItems.find(i => i.id === redemption.shopItemId);
                return (
                  <Card
                    key={redemption.id}
                    className="p-6 border-zinc-800 bg-zinc-900/50"
                    data-testid={`redemption-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Package className="w-8 h-8 text-red-500" />
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {item?.name || "Unknown Item"}
                          </h3>
                          <p className="text-zinc-400 text-sm">
                            Redeemed for {redemption.pointsSpent.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          redemption.status === 'fulfilled' 
                            ? 'default' 
                            : redemption.status === 'pending'
                            ? 'secondary'
                            : 'secondary'
                        }
                        className={
                          redemption.status === 'fulfilled'
                            ? 'bg-green-600/20 text-green-500'
                            : redemption.status === 'pending'
                            ? 'bg-yellow-600/20 text-yellow-500'
                            : 'bg-red-600/20 text-red-500'
                        }
                        data-testid={`redemption-status-${index}`}
                      >
                        {redemption.status.toUpperCase()}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <ProtectedRoute>
      <ShopPage />
    </ProtectedRoute>
  );
}
