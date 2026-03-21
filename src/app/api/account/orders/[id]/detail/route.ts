import { proxyToBackend } from "@/app/api/account/_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend(request, `/account/orders/${id}/`);
}
