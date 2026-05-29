import { proxyToBackend } from "@/app/api/sample/_proxy";

export async function GET(request: Request) {
  return proxyToBackend(request, "/sample/requests/");
}
