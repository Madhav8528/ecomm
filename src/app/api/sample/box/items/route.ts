import { proxyToBackend } from "@/app/api/sample/_proxy";

export async function POST(request: Request) {
  return proxyToBackend(request, "/sample/box/items/", "POST");
}
