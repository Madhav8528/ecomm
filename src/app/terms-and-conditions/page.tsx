import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/legal/policy-page-layout";
import { termsAndConditionsDocument } from "@/content/policies";

export const metadata: Metadata = {
  title: {
    absolute: "Terms & Conditions | ClearPiece",
  },
  description:
    "Review ClearPiece's terms governing quotations, orders, customization, payments, intellectual property, and business transactions.",
};

export default function TermsAndConditionsPage() {
  return <PolicyPageLayout document={termsAndConditionsDocument} />;
}
