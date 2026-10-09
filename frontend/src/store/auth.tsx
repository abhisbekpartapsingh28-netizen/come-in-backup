// Come In — Auth context.
//
// Loads a persisted bearer token on mount, exposes:
//   - user: null (loading) | undefined (not logged in) | User
//   - login, register, logout, refresh
//
// Token is stored via the shared storage util (web = IndexedDB, native = secure).

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { api, TOKEN_KEY } from "@/src/lib/api";
import { storage } from "@/src/utils/storage";

export type Role = "customer" | "shopkeeper" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
};

type AuthState = {
  user: User | null | undefined; // null = loading, undefined = anonymous
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | undefined>;
  patchUser: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

async function saveToken(token: string) {
  await storage.setItem(TOKEN_KEY, token);
}

async function clearToken() {
  await storage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(null);

  const refresh = useCallback(async (): Promise<User | undefined> => {
    try {
      const token = await storage.getItem<string>(TOKEN_KEY, "");
      if (!token || typeof token !== "string") {
        setUser(undefined);
        return undefined;
      }
      const me = await api.get<User>("/auth/me");
      setUser(me);
      return me;
    } catch {
      setUser(undefined);
      return undefined;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>(
      "/auth/login",
      { email, password },
      false,
    );
    await saveToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const res = await api.post<{ token: string; user: User }>(
        "/auth/register",
        { name, email, password, phone },
        false,
      );
      await saveToken(res.token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearToken();
    setUser(undefined);
  }, []);

  const patchUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev && typeof prev === "object" ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading: user === null, login, register, logout, refresh, patchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
