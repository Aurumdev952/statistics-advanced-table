import { API_CONFIG } from "@/utils/constants";
import { LoginCredentials, LoginResponse } from "../types";

const AUTH_BASE_URL = `${API_CONFIG.BASE_URL}/auth`;

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail || "Invalid email or password");
  }

  return response.json();
}

export async function getProfile(accessToken: string) {
  const response = await fetch(`${AUTH_BASE_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return response.json();
}

