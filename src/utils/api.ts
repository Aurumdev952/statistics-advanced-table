import { API_CONFIG } from "./constants";
import { getAccessToken } from "@/features/auth";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function apiFetchJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(endpoint, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

