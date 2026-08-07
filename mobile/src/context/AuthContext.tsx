import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
import * as SecureStore from 'expo-secure-store';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  agreement?: string;
  agreementSignedAt?: Date;
} | null;

interface AuthContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  role: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const userInfoStr = await SecureStore.getItemAsync("userInfo");
        if (!userInfoStr) {
          setLoading(false);
          return;
        }

        const response = await api.get("/api/auth/verify");
        const userData = response.data.user;
        await SecureStore.setItemAsync("userInfo", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error: any) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          console.error("Auth verification failed: Session expired or invalid");
          await SecureStore.deleteItemAsync("userInfo");
          await SecureStore.deleteItemAsync("authToken");
          setUser(null);
          setIsAuthenticated(false);
        } else {
          console.warn("Auth verification failed due to network/server issue — using cached session");
          const cached = await SecureStore.getItemAsync("userInfo");
          if (cached) {
            setUser(JSON.parse(cached));
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (userData: User, token?: string) => {
    await SecureStore.setItemAsync("userInfo", JSON.stringify(userData));
    if (token) {
      await SecureStore.setItemAsync("authToken", token);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      await SecureStore.deleteItemAsync("userInfo");
      await SecureStore.deleteItemAsync("authToken");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role: user?.role || null,
        isAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
