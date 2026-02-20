import { proxyToBackend } from "@/app/api/account/_proxy";

export async function PUT(request: Request) {
  return proxyToBackend(request, "/account/profile/update/", "PUT");
}
