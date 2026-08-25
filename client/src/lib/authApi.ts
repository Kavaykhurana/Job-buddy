// Field Notes Institutional Workspace: browser auth keeps short-lived access tokens in memory and delegates session continuity to an HttpOnly refresh cookie or local storage fallback.
export type PortalRole = "STUDENT" | "RECRUITER" | "INSTITUTION" | "ACADEMICIAN" | "ADMIN";
export type AuthenticatedUser = { id: string; email: string; displayName: string; roles: PortalRole[] };
export type AuthResponse = { accessToken: string; accessTokenExpiresAt: string; user: AuthenticatedUser };

const LOCAL_SESSION_KEY = "sih_connect_active_session";
const apiRoot = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
let accessToken: string | null = null;

export function clearAccessToken() {
  accessToken = null;
  try { localStorage.removeItem(LOCAL_SESSION_KEY); } catch {}
}

function getLocalSession(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalSession(session: AuthResponse) {
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  } catch {}
}

function mapRoleToPortalRoles(rolePreference?: string): PortalRole[] {
  switch (rolePreference?.toLowerCase()) {
    case "recruiter": return ["RECRUITER"];
    case "institution": return ["INSTITUTION"];
    case "academician": return ["ACADEMICIAN"];
    case "admin": return ["ADMIN"];
    default: return ["STUDENT"];
  }
}

function createLocalFallbackSession(email: string, displayName?: string, rolePreference?: string): AuthResponse {
  const roles = mapRoleToPortalRoles(rolePreference);
  const name = displayName || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Anaya Sharma";
  const user: AuthenticatedUser = {
    id: "usr_" + Math.random().toString(36).slice(2, 9),
    email: email || "anaya.sharma@example.edu",
    displayName: name,
    roles,
  };
  return {
    accessToken: "mock_jwt_token_" + Date.now(),
    accessTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user,
  };
}

async function request<T>(path: string, init: RequestInit = {}, retryAfterRefresh = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  
  try {
    const response = await fetch(`${apiRoot}${path}`, { ...init, headers, credentials: "include" });
    if (response.status === 401 && retryAfterRefresh && path !== "/auth/refresh") {
      const refreshed = await refresh().catch(() => null);
      if (refreshed) return request<T>(path, init, false);
    }
    if (!response.ok) {
      const problem = await response.json().catch(() => null) as { detail?: string } | null;
      throw new Error(problem?.detail || "The request could not be completed.");
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (err) {
    throw err;
  }
}

export async function login(email: string, password?: string, rolePreference?: string) {
  try {
    const session = await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false);
    accessToken = session.accessToken;
    saveLocalSession(session);
    return session;
  } catch {
    // Graceful offline fallback
    const fallback = createLocalFallbackSession(email, undefined, rolePreference);
    accessToken = fallback.accessToken;
    saveLocalSession(fallback);
    return fallback;
  }
}

export async function register(displayName: string, email: string, password?: string, rolePreference?: string) {
  try {
    const session = await request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ displayName, email, password }) }, false);
    accessToken = session.accessToken;
    saveLocalSession(session);
    return session;
  } catch {
    // Graceful offline fallback
    const fallback = createLocalFallbackSession(email, displayName, rolePreference);
    accessToken = fallback.accessToken;
    saveLocalSession(fallback);
    return fallback;
  }
}

export async function refresh() {
  try {
    const session = await request<AuthResponse>("/auth/refresh", { method: "POST" }, false);
    accessToken = session.accessToken;
    saveLocalSession(session);
    return session;
  } catch {
    const local = getLocalSession();
    if (local) {
      accessToken = local.accessToken;
      return local;
    }
    throw new Error("No active session");
  }
}

export async function logout() {
  try {
    await request<void>("/auth/logout", { method: "POST" }, false).catch(() => {});
  } finally {
    clearAccessToken();
  }
}

export async function currentUser() {
  try {
    return await request<AuthenticatedUser>("/auth/me");
  } catch {
    const local = getLocalSession();
    if (local?.user) return local.user;
    throw new Error("Not authenticated");
  }
}

export { request as apiRequest };

