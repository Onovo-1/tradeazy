import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tradeazy_token");
    
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("tradeazy_token");
        localStorage.removeItem("tradeazy_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("tradeazy_token", token);
    localStorage.setItem("tradeazy_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("tradeazy_token");
    localStorage.removeItem("tradeazy_user");
    setUser(null);
  };

  const register = async (data) => {
    try {
      const response = await authApi.register(data);
      
      const loginResponse = await authApi.login({ 
        identifier: data.username, 
        password: data.password 
      });
      
      login(loginResponse.token, loginResponse.user);
      return response;
    } catch (error) {
      console.error("AuthContext register error:", error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);