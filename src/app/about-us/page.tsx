import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutUsPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>About Clearpiece</h1>
          <p>
            We craft ultra-clear glass packaging for FMCG, food, beverages, pharma,
            and premium gifting.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container card">
          <p>
            Clearpiece focuses on scalable production, precision inspection, and
            customization support for modern brands.
          </p>
        </div>
      </section>
    </>
  );
}
