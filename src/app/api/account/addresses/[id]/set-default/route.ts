import { proxyToBackend } from "@/app/api/account/_proxy";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return proxyToBackend(request, `/account/addresses/${id}/set-default/`, "POST");
}
