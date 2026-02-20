import { proxyToBackend } from "@/app/api/checkout/_proxy";

export async function POST(request: Request) {
  return proxyToBackend(request, "/checkout/razorpay/verify/");
}
