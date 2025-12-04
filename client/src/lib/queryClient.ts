import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get guest ID from localStorage
function getGuestId(): string | null {
  return localStorage.getItem('guestId');
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  const guestId = getGuestId();
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (guestId && !token) {
    headers["X-Guest-Id"] = guestId;
  }

  // Add guestId to body for POST/PATCH requests if not authenticated
  const bodyData = data && !token && guestId ? { ...data as any, guestId } : data;

  const res = await fetch(url, {
    method,
    headers,
    body: bodyData ? JSON.stringify(bodyData) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const guestId = getGuestId();
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (guestId && !token) {
      headers["X-Guest-Id"] = guestId;
    }

    // Add guestId as query param for GET requests if not authenticated
    let url = queryKey.join("/") as string;
    if (guestId && !token && !url.includes('?')) {
      url += `?guestId=${guestId}`;
    } else if (guestId && !token && !url.includes('guestId=')) {
      url += `&guestId=${guestId}`;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
