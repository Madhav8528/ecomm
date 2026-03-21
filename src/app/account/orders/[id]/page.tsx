import type { Metadata } from "next";
import { OrderConfirmationContent } from "@/components/checkout/order-confirmation-content";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>Order Details</h1>
          <p>Full details and status for your order.</p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <OrderConfirmationContent orderId={id} />
        </div>
      </section>
    </>
  );
}
