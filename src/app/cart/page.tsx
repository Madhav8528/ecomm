import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Review your selected products and proceed to secure checkout.</p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <CartPageContent />
        </div>
      </section>
    </>
  );
}

