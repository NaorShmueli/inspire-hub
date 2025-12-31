import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/lib/api-types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (
    userId: number,
    name?: string,
    email?: string
  ) => Promise<void>;
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

  const handleAuthCallback = useCallback(
    async (userId: number, name?: string, email?: string) => {
      setIsLoading(true);
      try {
        const result = await apiClient.createToken(userId);
        if (result.data?.accessToken) {
          apiClient.setTokens(result.data.accessToken);
          // Use name and email from URL params if available
          const newUser: User = {
            id: userId,
            email: email || "user@example.com",
            name: name || "User",
          };
          localStorage.setItem("user", JSON.stringify(newUser));
          setUser(newUser);
        }
      } catch (error) {
        console.error("Auth callback failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
