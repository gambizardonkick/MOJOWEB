import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import LoadingScreen from "@/components/LoadingScreen";
import Login from "@/pages/login";
import Leaderboard from "@/pages/leaderboard";
import Milestones from "@/pages/milestones";
import Challenges from "@/pages/challenges";
import FreeSpins from "@/pages/free-spins";
import Referral from "@/pages/referral";
import Admin from "@/pages/admin";
import Dashboard from "@/pages/dashboard";
import Shop from "@/pages/shop";
import Tournament from "@/pages/tournament";
import DiceGame from "@/pages/games/dice";
import LimboGame from "@/pages/games/limbo";
import MinesGame from "@/pages/games/mines";
import BlackjackGame from "@/pages/games/blackjack";
import NotFound from "@/pages/not-found";
import { Menu, User as UserIcon, Coins } from "lucide-react";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/milestones" component={Milestones} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/free-spins" component={FreeSpins} />
      <Route path="/referral" component={Referral} />
      <Route path="/admin" component={Admin} />
      <Route path="/tournament" component={Tournament} />
      <Route path="/" component={Leaderboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/shop" component={Shop} />
      <Route path="/games/dice" component={DiceGame} />
      <Route path="/games/limbo" component={LimboGame} />
      <Route path="/games/mines" component={MinesGame} />
      <Route path="/games/blackjack" component={BlackjackGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

function HeaderContent() {
  const { user, isLoading } = useUser();

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <div className="px-4 py-2 text-sm text-muted-foreground" data-testid="text-loading">
          Loading...
        </div>
      ) : user && (user.username || user.gamdomUsername || user.kickUsername || user.discordUsername) ? (
        <Link href="/dashboard">
          <Button 
            variant="outline" 
            className="gap-2 hover-elevate flex-col items-start py-2 h-auto"
            data-testid="button-user-profile"
          >
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="font-semibold">{user.username || user.gamdomUsername || user.kickUsername || user.discordUsername}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Coins className="w-3 h-3" />
              <span data-testid="text-user-points">{user.points?.toLocaleString() || '0'} points</span>
            </div>
          </Button>
        </Link>
      ) : (
        <Link href="/login">
          <Button 
            variant="default" 
            className="gap-2 hover-elevate"
            data-testid="button-login"
          >
            <UserIcon className="w-4 h-4" />
            <span>Login</span>
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <LoadingScreen />
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur sticky top-0 z-50" role="banner">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger 
                      data-testid="button-sidebar-toggle" 
                      className="hover-elevate" 
                      aria-label="Toggle navigation menu"
                    >
                      <Menu className="w-5 h-5" />
                    </SidebarTrigger>
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-600 blur-lg opacity-30 rounded-full" aria-hidden="true"></div>
                        <img 
                          src="https://files.kick.com/images/user/565379/profile_image/conversion/6165ea43-dffd-419e-b4ea-b3ebde51a45e-fullsize.webp" 
                          alt="MojoTX Profile Picture" 
                          className="relative w-10 h-10 rounded-full border-2 border-red-600/30"
                        />
                      </div>
                      <div>
                        <h1 className="text-lg font-black text-white">
                          Mojo<span className="text-red-600">TX</span>
                        </h1>
                        <p className="text-xs text-zinc-500">Rewards Hub</p>
                      </div>
                    </div>
                  </div>
                  <HeaderContent />
                </header>
                <main className="flex-1 overflow-y-auto" role="main">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
