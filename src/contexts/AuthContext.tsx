import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/lib/api-types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (userId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tokens and user on mount
    apiClient.loadTokens();
    const storedUser = localStorage.getItem("user");
    if (storedUser && apiClient.isAuthenticated()) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    // Redirect to Google OAuth
    window.location.href = apiClient.getGoogleLoginUrl();
  }, []);

  const logout = useCallback(() => {
    apiClient.clearTokens();
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const handleAuthCallback = useCallback(async (userId: number) => {
    setIsLoading(true);
    try {
      const result = await apiClient.createToken(userId);
      if (result.data?.accessToken) {
        apiClient.setTokens(result.data.accessToken);
        // For now, create a basic user object
        // In production, you'd fetch user details from the API
        const newUser: User = {
          id: userId,
          email: "user@example.com", // This should come from the API
          name: "User", // This should come from the API
        };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      }
    } catch (error) {
      console.error("Auth callback failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        handleAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
