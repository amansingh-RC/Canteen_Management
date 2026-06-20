import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { login as loginRequest } from "@/services/authService";
import { disconnectSocket } from "@/services/socketClient";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import {
  AUTH_STORAGE_KEY,
  IDLE_FLAG_KEY,
  IDLE_TIMEOUT_MS,
} from "@/config/auth";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const persist = (nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const login = useCallback(async (credentials) => {
    const authedUser = await loginRequest(credentials);
    sessionStorage.removeItem(IDLE_FLAG_KEY);
    persist(authedUser);
    return authedUser;
  }, []);

  const logout = useCallback((reason) => {
    if (reason === "idle") sessionStorage.setItem(IDLE_FLAG_KEY, "1");
    disconnectSocket();
    persist(null);
  }, []);

  // Auto-logout on inactivity — only armed while signed in.
  useIdleTimeout(() => logout("idle"), {
    timeout: IDLE_TIMEOUT_MS,
    enabled: Boolean(user),
  });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
