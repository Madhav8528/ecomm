import { proxyToBackend } from "@/app/api/checkout/_proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ order_id: string }> },
) {
  const { order_id } = await params;
  return proxyToBackend(request, `/checkout/order-confirmation/${order_id}/`);
}
