import { proxyToBackend } from "@/app/api/account/_proxy";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyToBackend(request, `/account/orders/${id}/`);
}
