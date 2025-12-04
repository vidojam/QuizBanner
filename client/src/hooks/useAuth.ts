import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  guestId: string | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  tier: 'free' | 'premium';
  error: Error | null;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
  });
  
  return response;
}

// Generate or get persistent guest ID
function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = `guest-${crypto.randomUUID()}`;
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
}

// Check if guest has premium
async function checkGuestPremium(guestId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/guest/premium/${guestId}`);
    if (response.ok) {
      const data = await response.json();
      return data.isPremium === true;
    }
  } catch (error) {
    console.error('Error checking guest premium:', error);
  }
  return false;
}

export function useAuth(): AuthContextType {
  const token = localStorage.getItem('authToken');
  const guestId = getOrCreateGuestId();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      
      // No token means not authenticated
      if (!token) {
        return null;
      }
      
      const response = await fetchWithAuth("/api/auth/user");
      
      // If 401, clear token and return null
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Check guest premium status
  const { data: guestPremium } = useQuery({
    queryKey: ['guestPremium', guestId],
    queryFn: () => checkGuestPremium(guestId),
    enabled: !user && !!guestId, // Only check if not logged in
  });

  const isGuest = !user;
  const tier = user?.tier || (guestPremium ? 'premium' : 'free');

  return {
    user: user || null,
    guestId: isGuest ? guestId : null,
    isGuest,
    isLoading,
    isAuthenticated: !!user,
    tier: tier as 'free' | 'premium',
    error: error as Error | null,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string;
    }) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const result = await response.json();
      localStorage.setItem('authToken', result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('authToken');
      queryClient.setQueryData(['/api/auth/user'], null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }
      
      return response.json();
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }
      
      return response.json();
    },
  });
}
