import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";
import { createAuthToken, AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth/token";

type LoginBody = {
  email?: string;
  password?: string;
};

async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as Record<string, unknown>;
  }
  const text = await response.text();
  return { error: text.slice(0, 200) };
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await safeJson(backendResponse);
  if (!backendResponse.ok || !payload.user) {
    return NextResponse.json(
      { error: (payload.error as string) ?? "Invalid email or password." },
      { status: backendResponse.status },
    );
  }

  const token = await createAuthToken(payload.user);
  const response = NextResponse.json({ user: payload.user });
  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
  return response;
}
