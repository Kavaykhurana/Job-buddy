import crypto from "node:crypto";

export const PORTAL_ROLES = ["STUDENT", "RECRUITER", "INSTITUTION", "ACADEMICIAN", "ADMIN"] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  roles: PortalRole[];
  passwordHash: string;
};

export type RefreshSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
  replacedBy?: string;
};

type AccessClaims = {
  sub: string;
  sid: string;
  roles: PortalRole[];
  iat: number;
  exp: number;
  iss: "job-buddy";
};

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 15 * 60);
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 7 * 24 * 60 * 60);
const isProduction = process.env.NODE_ENV === "production";

function getSigningKey(): Buffer {
  const configured = process.env.APP_JWT_SECRET;
  if (!configured) {
    if (isProduction) throw new Error("APP_JWT_SECRET must be configured in production.");
    return crypto.createHash("sha256").update("job-buddy-development-only-secret").digest();
  }

  const key = Buffer.from(configured, "base64");
  if (key.length < 32) throw new Error("APP_JWT_SECRET must decode to at least 32 bytes.");
  return key;
}

let signingKey: Buffer | undefined;
function getSigningKeyOnce(): Buffer {
  return signingKey ??= getSigningKey();
}
export function assertAuthConfiguration(): void { getSigningKeyOnce(); }

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSigningKeyOnce()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = crypto.scryptSync(password, salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$16384$8$1$${salt}$${derived.toString("base64url")}`;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, n, r, p, salt, expected] = encoded.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !expected) return false;

  try {
    const derived = crypto.scryptSync(password, salt, 64, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 64 * 1024 * 1024,
    }).toString("base64url");
    return safeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function issueAccessToken(user: StoredUser, sessionId: string): { token: string; expiresAt: string } {
  const now = Math.floor(Date.now() / 1000);
  const claims: AccessClaims = {
    sub: user.id,
    sid: sessionId,
    roles: user.roles,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
    iss: "job-buddy",
  };
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify(claims));
  const unsigned = `${header}.${payload}`;
  return {
    token: `${unsigned}.${sign(unsigned)}`,
    expiresAt: new Date(claims.exp * 1000).toISOString(),
  };
}

export function verifyAccessToken(token: string): AccessClaims | null {
  const [header, payload, signature, ...extra] = token.split(".");
  if (!header || !payload || !signature || extra.length > 0 || !safeEqual(signature, sign(`${header}.${payload}`))) return null;
  const claims = fromBase64Url<AccessClaims>(payload);
  if (!claims || claims.iss !== "job-buddy" || !claims.sub || !claims.sid || !Array.isArray(claims.roles)) return null;
  if (!claims.roles.every((role) => PORTAL_ROLES.includes(role))) return null;
  if (!Number.isFinite(claims.exp) || claims.exp <= Math.floor(Date.now() / 1000)) return null;
  return claims;
}

export function createRefreshSession(userId: string): { token: string; session: RefreshSession } {
  const token = crypto.randomBytes(48).toString("base64url");
  const now = new Date();
  return {
    token,
    session: {
      id: newId("rfs"),
      userId,
      tokenHash: hashOpaqueToken(token),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString(),
    },
  };
}

export function hashOpaqueToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("base64url");
}

export function isRefreshSessionActive(session: RefreshSession): boolean {
  return !session.revokedAt && new Date(session.expiresAt).getTime() > Date.now();
}

export function refreshCookie(token: string): string {
  const attributes = [
    `job_buddy_refresh=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/api",
    "SameSite=Strict",
    `Max-Age=${REFRESH_TOKEN_TTL_SECONDS}`,
  ];
  if (isProduction) attributes.push("Secure");
  return attributes.join("; ");
}

export function clearRefreshCookie(): string {
  const attributes = ["job_buddy_refresh=", "HttpOnly", "Path=/api", "SameSite=Strict", "Max-Age=0"];
  if (isProduction) attributes.push("Secure");
  return attributes.join("; ");
}

export function readCookie(header?: string): string | undefined {
  if (!header) return undefined;
  return header.split(";").map((value) => value.trim()).find((value) => value.startsWith("job_buddy_refresh="))?.slice("job_buddy_refresh=".length);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 12 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
