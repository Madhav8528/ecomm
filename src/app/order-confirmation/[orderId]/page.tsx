import type { Metadata } from "next";
import { OrderConfirmationContent } from "@/components/checkout/order-confirmation-content";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = {
  title: "Order Confirmation",
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderId } = await params;
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Order Confirmation</h1>
          <p>Your order summary and confirmation details.</p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <OrderConfirmationContent orderId={orderId} />
        </div>
      </section>
    </>
  );
}
