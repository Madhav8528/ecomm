import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";

type Body = { email?: string; otp?: string; newPassword?: string; confirmPassword?: string };

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
  const newPassword = body.newPassword ?? "";
  const confirmPassword = body.confirmPassword ?? "";
  if (!email || !otp || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const response = await fetch(`${BACKEND_API_BASE_URL}/auth/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
  const payload = await safeJson(response);
  if (!response.ok) {
    const fieldError =
      (payload.confirm_password as string[] | undefined)?.[0] ??
      (payload.new_password as string[] | undefined)?.[0];
    return NextResponse.json(
      { error: fieldError ?? payload.error ?? "Password reset failed." },
      { status: response.status },
    );
  }
  return NextResponse.json(payload, { status: response.status });
}
