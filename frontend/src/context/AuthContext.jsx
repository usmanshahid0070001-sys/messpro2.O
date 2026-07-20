import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get("/api/auth/verify");
        const userData = response.data.user;
        localStorage.setItem("userInfo", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          // Server explicitly rejected the session — log out
          console.error("Auth verification failed: Session expired or invalid");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("authToken");
          setUser(null);
          setIsAuthenticated(false);
          queryClient.clear();
        } else {
          // Network error, Vercel cold start, 500, timeout, etc.
          // Don't log the user out — trust the localStorage cache
          console.warn("Auth verification failed due to network/server issue — using cached session");
          const cached = localStorage.getItem("userInfo");
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

    if (localStorage.getItem("userInfo")) {
      verifySession();
    } else {
      setLoading(false);
    }
  }, [queryClient]);

  const login = (userData, token) => {
    localStorage.setItem("userInfo", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("authToken", token);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout API failed:", error);
      toast.error("Session ended offline");
    } finally {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear(); // Ensure all cached data is wiped for security
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
