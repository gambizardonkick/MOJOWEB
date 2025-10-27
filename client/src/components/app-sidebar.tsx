import { Trophy, Award, Target, Gift, Users, ExternalLink, HelpCircle, Dices, User, ShoppingBag, Bomb, Spade, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SiDiscord, SiX, SiInstagram, SiKick } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainMenuItems = [
  {
    title: "Leaderboard",
    url: "/",
    icon: Trophy,
  },
  {
    title: "Milestones",
    url: "/milestones",
    icon: Award,
  },
];

const communityMenuItems = [
  {
    title: "Challenges",
    url: "/challenges",
    icon: Target,
  },
  {
    title: "Free Spins",
    url: "/free-spins",
    icon: Gift,
  },
];

const userMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: User,
  },
  {
    title: "Shop",
    url: "/shop",
    icon: ShoppingBag,
  },
];

const gameMenuItems = [
  {
    title: "Dice",
    url: "/games/dice",
    icon: Dices,
  },
  {
    title: "Limbo",
    url: "/games/limbo",
    icon: TrendingUp,
  },
  {
    title: "Mines",
    url: "/games/mines",
    icon: Bomb,
  },
];

const socialLinks = [
  {
    name: "Discord",
    url: "https://discord.gg/mojotx",
    icon: SiDiscord,
    color: "text-[#5865F2]",
  },
  {
    name: "Kick",
    url: "https://kick.com/mojotx",
    icon: SiKick,
    color: "text-[#53FC18]",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/MojoTxOnX",
    icon: SiX,
    color: "text-foreground",
  },
  {
    name: "Instagram",
    url: "https://instagram.com/MojoTxKick",
    icon: SiInstagram,
    color: "text-[#E4405F]",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-sidebar-border bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95">
      <SidebarHeader className="p-6 border-b border-sidebar-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="flex items-center gap-3 relative z-10 animate-slide-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse-slow" />
            <img 
              src="https://files.kick.com/images/user/565379/profile_image/conversion/6165ea43-dffd-419e-b4ea-b3ebde51a45e-fullsize.webp" 
              alt="MojoTX Logo" 
              className="w-10 h-10 rounded-full ring-2 ring-primary/40 relative z-10 transition-transform hover:scale-110 duration-300"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-primary bg-clip-text">
              MojoTX
            </h1>
            <p className="text-xs text-muted-foreground">Rewards Hub</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        
        {/* MAIN Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-3 py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            Main
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item, index) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group relative transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-2 border-primary shadow-lg shadow-primary/10' : ''
                      }`}
                    >
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                          isActive ? 'text-primary animate-pulse-slow' : ''
                        }`} />
                        <span className={`transition-all duration-300 ${isActive ? 'font-semibold text-primary' : ''}`}>{item.title}</span>
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/5 rounded-md -z-10 animate-pulse-slow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* COMMUNITY Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-3 py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            Community
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {communityMenuItems.map((item, index) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="animate-slide-in" style={{ animationDelay: `${(index + 2) * 0.05}s` }}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group relative transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-2 border-primary shadow-lg shadow-primary/10' : ''
                      }`}
                    >
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                          isActive ? 'text-primary animate-pulse-slow' : ''
                        }`} />
                        <span className={`transition-all duration-300 ${isActive ? 'font-semibold text-primary' : ''}`}>{item.title}</span>
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/5 rounded-md -z-10 animate-pulse-slow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* USER Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-3 py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            Your Account
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {userMenuItems.map((item, index) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="animate-slide-in" style={{ animationDelay: `${(index + 4) * 0.05}s` }}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group relative transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-2 border-primary shadow-lg shadow-primary/10' : ''
                      }`}
                    >
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                          isActive ? 'text-primary animate-pulse-slow' : ''
                        }`} />
                        <span className={`transition-all duration-300 ${isActive ? 'font-semibold text-primary' : ''}`}>{item.title}</span>
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/5 rounded-md -z-10 animate-pulse-slow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GAMES Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-3 py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            Casino Games
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {gameMenuItems.map((item, index) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="animate-slide-in" style={{ animationDelay: `${(index + 6) * 0.05}s` }}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`group relative transition-all duration-300 ${
                        isActive ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-2 border-primary shadow-lg shadow-primary/10' : ''
                      }`}
                    >
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                          isActive ? 'text-primary animate-pulse-slow' : ''
                        }`} />
                        <span className={`transition-all duration-300 ${isActive ? 'font-semibold text-primary' : ''}`}>{item.title}</span>
                        {isActive && (
                          <div className="absolute inset-0 bg-primary/5 rounded-md -z-10 animate-pulse-slow" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* STORE Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-3 py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            Gamdom
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem className="animate-slide-in" style={{ animationDelay: '0.25s' }}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === "/referral"}
                  className={`group relative transition-all duration-300 ${
                    location === "/referral" ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-2 border-primary shadow-lg shadow-primary/10' : ''
                  }`}
                >
                  <Link href="/referral" data-testid="link-referral">
                    <Users className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                      location === "/referral" ? 'text-primary animate-pulse-slow' : ''
                    }`} />
                    <span className={`transition-all duration-300 ${location === "/referral" ? 'font-semibold text-primary' : ''}`}>Referral Program</span>
                    {location === "/referral" && (
                      <div className="absolute inset-0 bg-primary/5 rounded-md -z-10 animate-pulse-slow" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                <SidebarMenuButton asChild className="group relative transition-all duration-300">
                  <a href="https://gamdom.com/r/mojokick" target="_blank" rel="noopener noreferrer" data-testid="link-gamdom-store">
                    <Dices className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="transition-all duration-300">Gamdom Sign Up</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SUPPORT Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-3 py-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            Support
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem className="animate-slide-in" style={{ animationDelay: '0.35s' }}>
                <SidebarMenuButton asChild className="group relative transition-all duration-300">
                  <a href="https://discord.gg/mojotx" target="_blank" rel="noopener noreferrer" data-testid="link-support-discord">
                    <HelpCircle className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="transition-all duration-300">Help & Support</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 bg-gradient-to-t from-sidebar-accent/30 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="space-y-4 relative z-10">
          <Button 
            asChild 
            className="w-full bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground font-semibold shadow-lg shadow-primary/30 animate-gradient-slow group relative overflow-hidden"
            data-testid="button-gamdom"
          >
            <a href="https://gamdom.com/r/mojokick" target="_blank" rel="noopener noreferrer" className="relative z-10">
              <span className="relative z-10">Play on Gamdom</span>
              <ExternalLink className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </a>
          </Button>
          
          <Separator className="bg-sidebar-border/50" />
          
          <div className="space-y-3 animate-slide-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider text-center font-semibold flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-muted-foreground/30" />
              Follow MojoTX
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-muted-foreground/30" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {socialLinks.map((social, index) => (
                <Button 
                  key={social.name}
                  asChild 
                  size="icon" 
                  variant="ghost"
                  className={`hover-elevate ${social.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1 animate-slide-in`}
                  style={{ animationDelay: `${0.45 + index * 0.05}s` }}
                  data-testid={`button-social-${social.name.toLowerCase()}`}
                >
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    <social.icon className="w-4 h-4 transition-transform duration-300" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
