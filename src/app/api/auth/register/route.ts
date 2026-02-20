import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
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
    const body = (await request.json()) as RegisterBody;

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";
    const phone = body.phone?.trim() ?? "";

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 },
      );
    }
    if (!email || !password || !confirmPassword || !phone) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const response = await fetch(`${BACKEND_API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
      }),
    });

    const payload = await safeJson(response);
    if (!response.ok) {
      const fieldError =
        (payload.confirm_password as string[] | undefined)?.[0] ??
        (payload.email as string[] | undefined)?.[0] ??
        (payload.phone as string[] | undefined)?.[0];
      return NextResponse.json(
        { error: fieldError ?? (payload.error as string) ?? "Registration failed." },
        { status: response.status },
      );
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed." }, { status: 400 });
  }
}
