import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Development mode bypass
  const isDev = window.location.hostname === 'localhost' || window.location.search.includes('dev=true');
  
  if (isDev) {
    // Check if user has selected a plan
    const selectedPlan = localStorage.getItem('selectedPlan') as 'free' | 'premium' | null;
    
    if (!selectedPlan) {
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        needsPlanSelection: true,
        error: null
      };
    }
    
    return {
      user: {
        id: 'dev-user-123',
        name: 'Developer User',
        email: 'dev@example.com',
        tier: selectedPlan,
        avatar: '',
        firstName: 'Developer',
        lastName: 'User',
        profileImageUrl: ''
      },
      isLoading: false,
      isAuthenticated: true,
      needsPlanSelection: false,
      error: null
    };
  }

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
    needsPlanSelection: false,
  };
}
