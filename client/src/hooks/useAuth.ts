import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Treat 401 as expected unauthenticated state, not an error
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      // If 401, return null to indicate not authenticated
      if (response.status === 401) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
  };
}
