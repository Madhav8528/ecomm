import { proxyToBackend } from "@/app/api/account/_proxy";

export async function GET(request: Request) {
  return proxyToBackend(request, "/account/notifications/");
}
