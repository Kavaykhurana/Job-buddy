export type PortalRole = "STUDENT" | "RECRUITER" | "INSTITUTION" | "ACADEMICIAN" | "ADMIN";
export type AuthenticatedUser = { id: string; email: string; displayName: string; roles: PortalRole[] };
export type AuthResponse = { accessToken: string; accessTokenExpiresAt: string; user: AuthenticatedUser };

const apiRoot = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
let accessToken: string | null = null;
let authenticatedUser: AuthenticatedUser | null = null;

export function clearAccessToken() { accessToken = null; authenticatedUser = null; }
export function currentUserId(): string | null { return authenticatedUser?.id ?? null; }

async function request<T>(path: string, init: RequestInit = {}, retryAfterRefresh = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${apiRoot}${path}`, { ...init, headers, credentials: "include" });
  if (response.status === 401 && retryAfterRefresh && path !== "/auth/refresh") {
    await refresh();
    return request<T>(path, init, false);
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(problem?.detail || "The request could not be completed.");
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

function acceptSession(session: AuthResponse) { accessToken = session.accessToken; authenticatedUser = session.user; return session; }

export async function login(email: string, password: string) {
  return acceptSession(await request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false));
}

export async function register(displayName: string, email: string, password: string) {
  return acceptSession(await request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ displayName, email, password }) }, false));
}

export async function refresh() {
  return acceptSession(await request<AuthResponse>("/auth/refresh", { method: "POST" }, false));
}

export async function logout() {
  try { await request<void>("/auth/logout", { method: "POST" }, false); }
  finally { clearAccessToken(); }
}

export async function currentUser() { return request<AuthenticatedUser>("/auth/me"); }
export { request as apiRequest };
