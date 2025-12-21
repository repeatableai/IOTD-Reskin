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
  console.log('[apiRequest] ===== API REQUEST =====');
  console.log('[apiRequest] Method:', method);
  console.log('[apiRequest] URL:', url);
  console.log('[apiRequest] Data:', data);
  
  // Detect FormData instance - needs special handling
  const isFormData = data instanceof FormData;
  
  const fetchOptions: RequestInit = {
    method,
    headers: isFormData 
      ? {} // Browser sets Content-Type with boundary automatically for FormData
      : (data ? { "Content-Type": "application/json" } : {}),
    body: isFormData 
      ? data as FormData // Pass FormData directly
      : (data ? JSON.stringify(data) : undefined),
    credentials: "include",
  };
  
  console.log('[apiRequest] Fetch options:', {
    method: fetchOptions.method,
    headers: fetchOptions.headers,
    hasBody: !!fetchOptions.body,
    credentials: fetchOptions.credentials
  });
  
  try {
    console.log('[apiRequest] Calling fetch...');
    const res = await fetch(url, fetchOptions);
    console.log('[apiRequest] ✅ Fetch completed');
    console.log('[apiRequest] Response status:', res.status);
    console.log('[apiRequest] Response ok:', res.ok);
    console.log('[apiRequest] Response statusText:', res.statusText);
    
    await throwIfResNotOk(res);
    console.log('[apiRequest] ✅ Response is OK');
    return res;
  } catch (error: any) {
    console.error('[apiRequest] ❌ ERROR:', error);
    console.error('[apiRequest] Error message:', error?.message);
    console.error('[apiRequest] Error stack:', error?.stack);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle query keys that may contain objects for query parameters
    const baseUrl = queryKey[0] as string;
    const params = queryKey.slice(1);
    
    let url = baseUrl;
    const queryParams: string[] = [];
    
    // Process any objects in the query key as query parameters
    params.forEach((param) => {
      if (typeof param === 'object' && param !== null) {
        Object.entries(param).forEach(([key, value]) => {
          queryParams.push(`${key}=${encodeURIComponent(String(value))}`);
        });
      } else if (param !== undefined && param !== null) {
        // For trend endpoint, use keyword as query parameter
        if (baseUrl.includes('/api/external/trend')) {
          queryParams.push(`keyword=${encodeURIComponent(String(param))}`);
        } else {
          queryParams.push(String(param));
        }
      }
    });
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }
    
    const res = await fetch(url, {
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
