import { proxyToBackend } from "@/app/api/sample/_proxy";

type Params = { params: Promise<{ request_id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { request_id } = await params;
  return proxyToBackend(request, `/sample/requests/${request_id}/`);
}
