import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/legal/policy-page-layout";
import { shippingPolicyDocument } from "@/content/policies";

export const metadata: Metadata = {
  title: {
    absolute: "Shipping, Breakage & Return Policy | ClearPiece",
  },
  description:
    "Learn about ClearPiece shipping timelines, breakage claims, returns, refunds, freight charges, and logistics responsibilities.",
};

export default function ShippingBreakageReturnPolicyPage() {
  return <PolicyPageLayout document={shippingPolicyDocument} />;
}
