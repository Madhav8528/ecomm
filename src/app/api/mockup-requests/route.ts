import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const response = await fetch(`${BACKEND_API_BASE_URL}/mockup-requests/`, {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.status });
    }

    const fallback = await response.text();
    return NextResponse.json(
      { error: fallback.slice(0, 200) || "Submission failed." },
      { status: response.status },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to submit your request right now." },
      { status: 500 },
    );
  }
}
