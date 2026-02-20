import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { CheckoutContent } from "@/components/checkout/checkout-content";

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Secure payment and shipping details confirmation.</p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <CheckoutContent />
        </div>
      </section>
    </>
  );
}
