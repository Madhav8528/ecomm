import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  return <AccountDashboard />;
}
