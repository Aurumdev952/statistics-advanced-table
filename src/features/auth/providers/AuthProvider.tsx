import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { User, AuthState } from "../types";
import { login as loginApi, getProfile, refreshAccessToken } from "../api/auth.api";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getUser,
  setUser,
  clearAuth,
} from "../utils/auth.utils";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      const user = getUser();

      if (accessToken && user) {
        try {
          const userProfile = await getProfile(accessToken);
          setState({
            user: userProfile,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          setUser(userProfile);
        } catch (error) {
          if (refreshToken) {
            try {
              await refreshAuth();
            } catch {
              clearAuth();
              setState({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            clearAuth();
            setState({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } else {
        setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginApi({ email, password });
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);
      setUser(response.user);

      setState({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshAuth = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await refreshAccessToken(refreshToken);
      setAccessToken(response.access_token);
      setRefreshToken(response.refresh_token);
      setUser(response.user);

      setState({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      clearAuth();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

