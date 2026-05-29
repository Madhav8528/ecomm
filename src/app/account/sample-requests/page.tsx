import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SampleRequestsPanel } from "@/components/account/sample-requests-panel";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sample Requests",
};

export default async function SampleRequestsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/account/sample-requests");
  }

  return <SampleRequestsPanel />;
}
