import { proxyToBackend } from "@/app/api/sample/_proxy";

type Params = { params: Promise<{ product_id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { product_id } = await params;
  return proxyToBackend(request, `/sample/box/items/${product_id}/`, "PATCH");
}

export async function DELETE(request: Request, { params }: Params) {
  const { product_id } = await params;
  return proxyToBackend(request, `/sample/box/items/${product_id}/`, "DELETE");
}
