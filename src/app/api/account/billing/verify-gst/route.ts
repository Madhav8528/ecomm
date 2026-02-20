import { proxyToBackend } from "@/app/api/account/_proxy";

export async function POST(request: Request) {
  return proxyToBackend(request, "/account/billing/verify-gst/", "POST");
}
