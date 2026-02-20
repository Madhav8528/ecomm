import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";

type Body = { email?: string; otp?: string };

async function safeJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as Record<string, unknown>;
  }
  const text = await response.text();
  return { error: text.slice(0, 200) };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const email = body.email?.trim() ?? "";
  const otp = body.otp?.trim() ?? "";
  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
  }

  const response = await fetch(`${BACKEND_API_BASE_URL}/auth/password-reset/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    return NextResponse.json({ error: payload.error ?? "OTP verification failed." }, { status: response.status });
  }
  return NextResponse.json(payload, { status: response.status });
}
