import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "consultech_admin_session";
const DEFAULT_TTL_SEC = 60 * 60 * 24 * 7;

export type AdminSession = {
  id: string;
  email: string;
  name: string;
};

function getSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: AdminSession): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("AUTH_SECRET (min 32 chars) is required for admin auth");
  return new SignJWT({
    sub: payload.id,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DEFAULT_TTL_SEC}s`)
    .sign(secret);
}

export async function getSession(req: NextRequest): Promise<AdminSession | null> {
  const secret = getSecret();
  if (!secret) return null;
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    return {
      id: sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? "",
    };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const secret = getSecret();
  if (!secret) return null;
  const storePromise = cookies();
  const store = await Promise.resolve(storePromise);
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    if (!sub || typeof sub !== "string") return null;
    return {
      id: sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? "",
    };
  } catch {
    return null;
  }
}

export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEFAULT_TTL_SEC,
  };
}

export async function getCreatedBy(req: NextRequest): Promise<string> {
  const session = await getSession(req);
  if (session?.id) return session.id;
  const header = req.headers.get("x-user-id");
  if (header) return header;
  return "anonymous";
}
