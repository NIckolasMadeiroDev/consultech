"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  user: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUserFromLogin: (user: AdminUser) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserFromLogin = useCallback((u: AdminUser) => {
    setUser(u);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { user: AdminUser | null }) => {
        setUser(data.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signOut, setUserFromLogin }),
    [user, loading, signOut, setUserFromLogin]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      loading: false,
      signOut: async () => {},
      setUserFromLogin: () => {},
    };
  }
  return ctx;
}
