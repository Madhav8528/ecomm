import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";
import { AUTH_COOKIE_NAME, authCookieOptions, createAuthToken } from "@/lib/auth/token";

type GoogleLoginBody = {
  credential?: string;
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
  try {
    const body = (await request.json()) as GoogleLoginBody;
    const credential = body.credential?.trim() ?? "";

    if (!credential) {
      return NextResponse.json({ error: "Google credential is required." }, { status: 400 });
    }

    const backendResponse = await fetch(`${BACKEND_API_BASE_URL}/auth/google-login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const payload = await safeJson(backendResponse);
    if (!backendResponse.ok || !payload.user) {
      return NextResponse.json(
        { error: (payload.error as string) ?? "Google login failed." },
        { status: backendResponse.status },
      );
    }

    const token = await createAuthToken(payload.user);
    const response = NextResponse.json({
      user: payload.user,
      requires_phone_verification: Boolean(payload.requires_phone_verification),
    });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions);
    return response;
  } catch (error) {
    let message =
      error instanceof Error ? error.message : "Google login failed due to a server error.";
    if (message.toLowerCase().includes("fetch failed")) {
      message = `Cannot reach backend API at ${BACKEND_API_BASE_URL}. Start backend server or update NEXT_PUBLIC_BACKEND_API_URL.`;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
