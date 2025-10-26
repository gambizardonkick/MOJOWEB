import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  sessionId: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get('sessionId');
    
    if (urlSessionId) {
      localStorage.setItem("sessionId", urlSessionId);
      setSessionId(urlSessionId);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    
    let stored = localStorage.getItem("sessionId");
    if (stored) {
      setSessionId(stored);
    }
  }, []);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users/me", sessionId],
    enabled: !!sessionId,
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await fetch(`/api/users/me?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  return (
    <UserContext.Provider value={{ user: user || null, sessionId, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
