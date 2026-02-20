import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Orders",
};

export default function OrdersPage() {
  redirect("/account");
}
