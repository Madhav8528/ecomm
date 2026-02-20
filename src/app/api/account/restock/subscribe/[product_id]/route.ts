import { proxyToBackend } from "@/app/api/account/_proxy";

type Params = { params: Promise<{ product_id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { product_id } = await params;
  return proxyToBackend(request, `/account/restock/subscribe/${product_id}/`, "POST");
}
