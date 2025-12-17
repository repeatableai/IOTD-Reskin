import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes an API request with support for both JSON and FormData payloads.
 * 
 * For FormData:
 * - Does not set Content-Type header (browser sets it automatically with boundary)
 * - Passes FormData directly to fetch body
 * 
 * For JSON data:
 * - Sets Content-Type: application/json header
 * - Serializes data with JSON.stringify
 * 
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - API endpoint URL
 * @param data - Request payload (FormData instance or JSON-serializable object)
 * @returns Promise resolving to Response object
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Detect FormData instance - needs special handling
  const isFormData = data instanceof FormData;
  
  const res = await fetch(url, {
    method,
    headers: isFormData 
      ? {} // Browser sets Content-Type with boundary automatically for FormData
      : (data ? { "Content-Type": "application/json" } : {}),
    body: isFormData 
      ? data as FormData // Pass FormData directly
      : (data ? JSON.stringify(data) : undefined),
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
    const res = await fetch(queryKey.join("/") as string, {
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
