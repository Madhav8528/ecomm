import type { Metadata } from "next";
import { PolicyPageLayout } from "@/components/legal/policy-page-layout";
import { privacyPolicyDocument } from "@/content/policies";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | ClearPiece",
  },
  description:
    "Understand how ClearPiece collects, stores, uses, and protects customer information.",
};

export default function PrivacyPolicyPage() {
  return <PolicyPageLayout document={privacyPolicyDocument} />;
}
