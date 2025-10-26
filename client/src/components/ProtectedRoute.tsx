import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, sessionId } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !sessionId && !user) {
      setLocation("/login");
    }
  }, [isLoading, sessionId, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
