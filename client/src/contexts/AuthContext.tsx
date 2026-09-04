// Field Notes Institutional Workspace: authenticated access uses role-aware API sessions, not the former prototype browser-only role selector.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as authApi from "@/lib/authApi";

type AuthState = { user: authApi.AuthenticatedUser | null; loading: boolean };
type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<authApi.AuthenticatedUser>;
  register: (displayName: string, email: string, password: string) => Promise<authApi.AuthenticatedUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let active = true;
    authApi.refresh().then((session) => { if (active) setState({ user: session.user, loading: false }); })
      .catch(() => { if (active) setState({ user: null, loading: false }); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login: async (email, password) => { const session = await authApi.login(email, password); setState({ user: session.user, loading: false }); return session.user; },
    register: async (displayName, email, password) => { const session = await authApi.register(displayName, email, password); setState({ user: session.user, loading: false }); return session.user; },
    signOut: async () => { await authApi.logout(); setState({ user: null, loading: false }); },
  }), [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
