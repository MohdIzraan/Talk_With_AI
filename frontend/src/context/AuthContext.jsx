import { createContext, useState, useEffect } from "react";
import {
  loginUser as loginRequest,
  registerUser as registerRequest,
  fetchProfile,
} from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token      = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const guestMode  = localStorage.getItem("guestMode");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const freshUser = await fetchProfile();
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else if (guestMode === "true") {
        // Restore guest session across page refreshes
        setIsGuest(true);
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    // Clear any leftover guest flag when a real user logs in
    localStorage.removeItem("guestMode");
    setIsGuest(false);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await registerRequest(name, email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.removeItem("guestMode");
    setIsGuest(false);
    setUser(data.user);
    return data.user;
  };

  const loginAsGuest = () => {
    localStorage.setItem("guestMode", "true");
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("guestMode");
    setUser(null);
    setIsGuest(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        login,
        register,
        loginAsGuest,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
