import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Crown, Zap, Eye } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { TournamentData, TournamentMatch, TournamentBracket } from "@shared/schema";

type TournamentSize = 4 | 8 | 16 | 32;

const ADMIN_DISCORD_IDS = ['1197661923718737961', '1356903329518583948'];

export default function TournamentPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [tournamentSize, setTournamentSize] = useState<TournamentSize>(8);
  const [bracket, setBracket] = useState<TournamentBracket>({});
  const [champion, setChampion] = useState<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>("");

  const isAdmin = user?.discordUserId && ADMIN_DISCORD_IDS.includes(user.discordUserId);

  const { data: tournamentData, isLoading } = useQuery<TournamentData>({
    queryKey: ['/api/tournament'],
    refetchInterval: isAdmin ? false : 5000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (tournamentData) {
      const serverDataString = JSON.stringify(tournamentData);
      if (serverDataString !== lastSavedDataRef.current) {
        setTournamentSize(tournamentData.size);
        setBracket(tournamentData.bracket);
        setChampion(tournamentData.champion);
        lastSavedDataRef.current = serverDataString;
      }
    } else if (!isLoading && Object.keys(bracket).length === 0) {
      initializeBracket(tournamentSize);
    }
  }, [tournamentData, isLoading]);

  const initializeBracket = (size: TournamentSize) => {
    const newBracket: TournamentBracket = {};
    const rounds = Math.log2(size);
    
    const round1Matches: TournamentMatch[] = [];
    for (let i = 0; i < size / 2; i++) {
      round1Matches.push({
        id: `R1-${i}`,
        player1: { name: "", multiplier: null },
        player2: { name: "", multiplier: null },
        winner: null,
        completed: false
      });
    }
    newBracket["Round 1"] = round1Matches;

    let prevRoundSize = size / 2;
    for (let round = 2; round <= rounds; round++) {
      const roundMatches: TournamentMatch[] = [];
      const roundSize = prevRoundSize / 2;
      
      for (let i = 0; i < roundSize; i++) {
        roundMatches.push({
          id: `R${round}-${i}`,
          player1: { name: "", multiplier: null },
          player2: { name: "", multiplier: null },
          winner: null,
          completed: false
        });
      }
      
      if (round === rounds) {
        newBracket["Final"] = roundMatches;
      } else {
        newBracket[`Round ${round}`] = roundMatches;
      }
      
      prevRoundSize = roundSize;
    }

    setBracket(newBracket);
    setChampion("");
  };

  const saveTournamentToFirebase = async (data: TournamentData) => {
    try {
      const dataString = JSON.stringify(data);
      lastSavedDataRef.current = dataString;
      
      await fetch('/api/tournament', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dataString,
      });
    } catch (error) {
      console.error('Failed to save tournament:', error);
    }
  };

  useEffect(() => {
    if (isAdmin && Object.keys(bracket).length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const tournamentData: TournamentData = {
          size: tournamentSize,
          bracket,
          champion,
          lastUpdated: new Date().toISOString(),
        };
        saveTournamentToFirebase(tournamentData);
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [bracket, champion, tournamentSize, isAdmin]);

  const updatePlayer = (roundName: string, matchIndex: number, playerKey: 'player1' | 'player2', field: 'name' | 'multiplier', value: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only authorized admins can edit tournament data.",
        variant: "destructive",
      });
      return;
    }

    setBracket(prev => {
      const newBracket = { ...prev };
      const round = [...newBracket[roundName]];
      const match = { ...round[matchIndex] };
      
      if (field === 'name') {
        match[playerKey] = { ...match[playerKey], name: value };
      } else {
        match[playerKey] = { ...match[playerKey], multiplier: value ? parseFloat(value) : null };
      }
      
      round[matchIndex] = match;
      newBracket[roundName] = round;
      return newBracket;
    });
  };

  const decideWinner = (roundName: string, matchIndex: number) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only authorized admins can decide winners.",
        variant: "destructive",
      });
      return;
    }

    const match = bracket[roundName][matchIndex];
    const { player1, player2 } = match;

    if (!player1.name || !player2.name || player1.multiplier === null || player2.multiplier === null) {
      toast({
        title: "Missing Information",
        description: "Please enter both player names and multipliers.",
        variant: "destructive",
      });
      return;
    }

    const winner = player1.multiplier >= player2.multiplier ? player1.name : player2.name;
    
    setBracket(prev => {
      const newBracket = { ...prev };
      const round = [...newBracket[roundName]];
      round[matchIndex] = { ...round[matchIndex], winner, completed: true };
      newBracket[roundName] = round;
      return newBracket;
    });

    advanceWinner(roundName, matchIndex, winner);
  };

  const advanceWinner = (currentRound: string, matchIndex: number, winner: string) => {
    const rounds = Object.keys(bracket);
    const currentRoundIndex = rounds.indexOf(currentRound);
    
    if (currentRoundIndex < rounds.length - 1) {
      const nextRound = rounds[currentRoundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const playerSlot = matchIndex % 2 === 0 ? 'player1' : 'player2';

      setBracket(prev => {
        const newBracket = { ...prev };
        const round = [...newBracket[nextRound]];
        round[nextMatchIndex] = {
          ...round[nextMatchIndex],
          [playerSlot]: { name: winner, multiplier: null }
        };
        newBracket[nextRound] = round;
        return newBracket;
      });
    } else {
      setChampion(winner);
    }
  };

  const resetTournament = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only authorized admins can reset the tournament.",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Reset all tournament data?")) {
      try {
        await fetch('/api/tournament/reset', { method: 'POST' });
        initializeBracket(tournamentSize);
        toast({
          title: "Tournament Reset",
          description: "The tournament has been reset successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset tournament.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSizeChange = (size: TournamentSize) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only authorized admins can change tournament size.",
        variant: "destructive",
      });
      return;
    }
    setTournamentSize(size);
    initializeBracket(size);
  };

  const canDecideWinner = (match: TournamentMatch) => {
    return match.player1.name && 
           match.player2.name && 
           match.player1.multiplier !== null && 
           match.player2.multiplier !== null &&
           !match.completed;
  };

  if (isLoading && Object.keys(bracket).length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text mb-4">
          Slot Tournament
        </h1>
        
        <div className="flex justify-center gap-2 mb-6">
          {[4, 8, 16, 32].map(size => (
            <Button
              key={size}
              onClick={() => handleSizeChange(size as TournamentSize)}
              variant={tournamentSize === size ? "default" : "outline"}
              disabled={!isAdmin}
              data-testid={`button-size-${size}`}
            >
              <Users className="w-4 h-4 mr-2" />
              {size} Players
            </Button>
          ))}
        </div>

        {isAdmin ? (
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="outline" className="border-cyan-500 text-cyan-400" data-testid="badge-admin-mode">
              <Crown className="w-4 h-4 mr-2" />
              Admin Mode Active
            </Badge>
            <Button 
              onClick={resetTournament} 
              variant="destructive" 
              size="sm"
              data-testid="button-reset-tournament"
            >
              Reset Tournament
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="outline" className="border-blue-500 text-blue-400" data-testid="badge-viewer-mode">
              <Eye className="w-4 h-4 mr-2" />
              Viewer Mode
            </Badge>
          </div>
        )}
      </div>

      {champion && (
        <Card className="bg-gradient-to-r from-yellow-900 to-orange-900 border-yellow-600 mb-8">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">Tournament Champion</h2>
            <p className="text-2xl font-semibold text-yellow-200" data-testid="text-champion">{champion}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${Object.keys(bracket).length}, 1fr)` }}>
        {Object.entries(bracket).sort((a, b) => {
          const [nameA] = a;
          const [nameB] = b;
          
          if (nameA === "Final") return 1;
          if (nameB === "Final") return -1;
          
          const numA = parseInt(nameA.replace("Round ", ""));
          const numB = parseInt(nameB.replace("Round ", ""));
          return numA - numB;
        }).map(([roundName, matches]) => (
          <div key={roundName} className="space-y-6">
            <h3 className="text-xl font-bold text-center text-foreground mb-4">
              {roundName}
            </h3>
            
            <div className="space-y-8">
              {matches.map((match, matchIndex) => (
                <Card 
                  key={match.id} 
                  className={`transition-all duration-300 ${
                    match.completed ? 'border-green-600 bg-green-900/20' : ''
                  }`}
                  data-testid={`card-match-${match.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={match.player1.name}
                        onChange={(e) => updatePlayer(roundName, matchIndex, 'player1', 'name', e.target.value)}
                        placeholder={roundName === "Round 1" ? `Player ${matchIndex * 2 + 1}` : "Winner advances"}
                        disabled={!isAdmin || match.completed}
                        className="flex-1"
                        data-testid={`input-player1-name-${match.id}`}
                      />
                      <Input
                        type="number"
                        value={match.player1.multiplier || ""}
                        onChange={(e) => updatePlayer(roundName, matchIndex, 'player1', 'multiplier', e.target.value)}
                        placeholder="x"
                        disabled={!isAdmin || match.completed}
                        className="w-20"
                        step="0.01"
                        data-testid={`input-player1-multiplier-${match.id}`}
                      />
                    </div>

                    <div className="text-center text-muted-foreground text-sm mb-2">VS</div>

                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        value={match.player2.name}
                        onChange={(e) => updatePlayer(roundName, matchIndex, 'player2', 'name', e.target.value)}
                        placeholder={roundName === "Round 1" ? `Player ${matchIndex * 2 + 2}` : "Winner advances"}
                        disabled={!isAdmin || match.completed}
                        className="flex-1"
                        data-testid={`input-player2-name-${match.id}`}
                      />
                      <Input
                        type="number"
                        value={match.player2.multiplier || ""}
                        onChange={(e) => updatePlayer(roundName, matchIndex, 'player2', 'multiplier', e.target.value)}
                        placeholder="x"
                        disabled={!isAdmin || match.completed}
                        className="w-20"
                        step="0.01"
                        data-testid={`input-player2-multiplier-${match.id}`}
                      />
                    </div>

                    {isAdmin && canDecideWinner(match) && (
                      <Button
                        onClick={() => decideWinner(roundName, matchIndex)}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                        data-testid={`button-decide-winner-${match.id}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Decide Winner
                      </Button>
                    )}

                    {match.winner && (
                      <div className="text-center mt-2">
                        <Badge className="bg-green-600 text-white" data-testid={`badge-winner-${match.id}`}>
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner: {match.winner}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>1. Select tournament size (4, 8, 16, or 32 players)</p>
          <p>2. {isAdmin ? "Fill in player names and multipliers for Round 1 matches" : "Only admins can edit player information"}</p>
          <p>3. {isAdmin ? "Click 'Decide Winner' to advance the player with higher multiplier" : "Watch as admins decide the winners"}</p>
          <p>4. Winners automatically advance to the next round</p>
          <p>5. Continue until a champion is crowned!</p>
          {isAdmin ? (
            <p className="text-cyan-400">Changes are automatically saved to Firebase.</p>
          ) : (
            <p className="text-yellow-500">You are in viewer mode. Updates refresh every 5 seconds.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
