export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    email_verified: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

