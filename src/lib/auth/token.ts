import { jwtVerify, SignJWT } from "jose";
import type { SessionUser } from "@/types/auth";

export const AUTH_COOKIE_NAME = "ajanta_auth_token";
const TOKEN_AGE_SECONDS = 60 * 60 * 24 * 7;

const FALLBACK_SECRET = "dev-only-secret-change-in-production";
const authSecret =
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV === "production" ? undefined : FALLBACK_SECRET);

type TokenPayload = {
  sub: string;
  name: string;
  email: string;
};

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TOKEN_AGE_SECONDS,
};

export async function createAuthToken(user: SessionUser) {
  if (!authSecret) {
    throw new Error("AUTH_SECRET must be set in production.");
  }

  const secretKey = new TextEncoder().encode(authSecret);
  return new SignJWT({
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(user.id)
    .setExpirationTime(`${TOKEN_AGE_SECONDS}s`)
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<SessionUser | null> {
  if (!authSecret) return null;

  const secretKey = new TextEncoder().encode(authSecret);

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const typedPayload = payload as Partial<TokenPayload>;

    if (!payload.sub || !typedPayload.name || !typedPayload.email) {
      return null;
    }

    return {
      id: payload.sub,
      name: typedPayload.name,
      email: typedPayload.email,
    };
  } catch {
    return null;
  }
}
