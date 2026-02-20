import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";

type VerifyBody = {
  email?: string;
  otp?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as VerifyBody;
  const email = body.email?.trim() ?? "";
  const otp = body.otp?.trim() ?? "";

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required." }, { status: 400 });
  }

  const response = await fetch(`${BACKEND_API_BASE_URL}/auth/verify-email-otp/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const payload = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: payload.error ?? "OTP verification failed." }, { status: response.status });
  }

  return NextResponse.json(payload, { status: response.status });
}
