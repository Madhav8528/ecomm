"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthStatus, SessionUser } from "@/types/auth";

type AuthResult = {
  ok: boolean;
  error?: string;
  pendingVerification?: boolean;
  requiresPhoneVerification?: boolean;
};

type AuthContextValue = {
  user: SessionUser | null;
  status: AuthStatus;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
  ) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  googleLogin: (credential: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseUserResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as {
        user?: SessionUser;
        error?: string;
        requires_phone_verification?: boolean;
      };
    } catch {
      return { error: "Received invalid JSON response." };
    }
  }

  try {
    const text = await response.text();
    return { error: text.slice(0, 200) || "Unexpected server response." };
  } catch {
    return { error: "Unable to read server response." };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  async function fetchSessionUser() {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });
      const payload = await parseUserResponse(response);
      if (!response.ok || !payload.user) {
        return null;
      }
      return payload.user;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const currentUser = await fetchSessionUser();
      if (!isMounted) return;
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "unauthenticated");
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshSession() {
    setStatus("loading");
    const currentUser = await fetchSessionUser();
    setUser(currentUser);
    setStatus(currentUser ? "authenticated" : "unauthenticated");
  }

  async function register(
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
  ): Promise<AuthResult> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        confirmPassword,
      }),
    });
    const payload = await parseUserResponse(response);
    if (!response.ok) {
      return { ok: false, error: payload.error ?? "Registration failed." };
    }
    return { ok: true, pendingVerification: true };
  }

  async function login(email: string, password: string): Promise<AuthResult> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await parseUserResponse(response);
    if (!response.ok || !payload.user) {
      return { ok: false, error: payload.error ?? "Login failed." };
    }
    setUser(payload.user);
    setStatus("authenticated");
    return { ok: true };
  }

  async function googleLogin(credential: string): Promise<AuthResult> {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const payload = await parseUserResponse(response);
    if (!response.ok || !payload.user) {
      return { ok: false, error: payload.error ?? "Google login failed." };
    }
    setUser(payload.user);
    setStatus("authenticated");
    return {
      ok: true,
      requiresPhoneVerification: Boolean(payload.requires_phone_verification),
    };
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStatus("unauthenticated");
  }

  const value: AuthContextValue = {
    user,
    status,
    register,
    login,
    googleLogin,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
