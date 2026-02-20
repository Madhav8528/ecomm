import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="card empty-state">
          <h2>Page not found</h2>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            The page you requested does not exist.
          </p>
          <div style={{ marginTop: "0.9rem" }}>
            <Link href="/" className="btn btn-primary">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

