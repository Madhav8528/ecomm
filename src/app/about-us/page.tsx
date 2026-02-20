import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutUsPage() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <h1>About Guru</h1>
          <p>
            We build reliable glass packaging solutions for FMCG, food,
            beverages, pharma, and corporate gifting.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container card">
          <p>
            Guru focuses on scalable production, strict quality checks, and
            customization support for modern brands.
          </p>
        </div>
      </section>
    </>
  );
}

