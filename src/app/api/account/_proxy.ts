import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL } from "@/lib/backend-config";

async function readBody(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  return await request.text();
}

export async function proxyToBackend(request: Request, path: string, method?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ajanta_auth_token")?.value;
  const headers = new Headers();

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BACKEND_API_BASE_URL}${path}`, {
    method: method ?? request.method,
    headers,
    body: await readBody(request),
  });

  const responseType = response.headers.get("content-type") ?? "";
  if (responseType.includes("application/json")) {
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  }
  const text = await response.text();
  return NextResponse.json({ error: text.slice(0, 200) }, { status: response.status });
}
