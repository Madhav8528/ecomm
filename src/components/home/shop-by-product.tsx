import Link from "next/link";

const heroCard = {
  title: "Glass Jars",
  subLabel: "From pantry staples to premium gifting \u2014 every shape, every size.",
  href: "/products?category=jars",
  image: "/categories/cat-jars.webp",
  tag: "MOST POPULAR",
  productCount: "48 Products",
  cta: "Explore Glass Jars",
};

const bottleCard = {
  title: "Glass Bottles",
  subLabel: "Precision-crafted profiles for beverages, wellness & more.",
  href: "/products?category=bottles",
  image: "/categories/cat-bottles.webp",
};

const capCard = {
  title: "Cap Closures",
  subLabel: "Gold, printed & custom \u2014 the perfect finish for every jar.",
  href: "/products?category=closures",
  image: "/categories/cat-caps.webp",
};

const giftingCard = {
  title: "Corporate Gifting",
  subLabel: "Branded glass gift sets for every occasion & bulk order.",
  href: "/corporate-gifting",
  image: "/categories/cat-gifting.webp",
  quoteBadge: "GET A QUOTE",
};

export function ShopByProduct() {
  return (
    <section className="section section-soft" id="shop-by-product">
      <div className="container">
        <div className="shop-bento-header">
          <h2>Shop by Product</h2>
          <Link href="/products" className="shop-bento-catalog-link">
            View full catalog <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>

        <div className="shop-bento-grid">
          <Link href={heroCard.href} className="shop-bento-card shop-bento-hero">
            <img src={heroCard.image} alt={heroCard.title} className="shop-bento-image" loading="eager" />
            <div className="shop-bento-overlay" />

            <span className="shop-bento-tag">{heroCard.tag}</span>
            <span className="shop-bento-count">{heroCard.productCount}</span>

            <div className="shop-bento-hero-content">
              <h3>{heroCard.title}</h3>
              <p>{heroCard.subLabel}</p>
              <span className="shop-bento-cta">{heroCard.cta}</span>
            </div>
          </Link>

          <Link href={bottleCard.href} className="shop-bento-card shop-bento-bottles">
            <img src={bottleCard.image} alt={bottleCard.title} className="shop-bento-image" loading="lazy" />
            <div className="shop-bento-overlay" />
            <div className="shop-bento-small-content">
              <div>
                <h3>{bottleCard.title}</h3>
                <p>{bottleCard.subLabel}</p>
              </div>
              <span className="shop-bento-arrow shop-bento-arrow-bottles">
                <span aria-hidden="true">-&gt;</span>
              </span>
            </div>
          </Link>

          <Link href={capCard.href} className="shop-bento-card shop-bento-caps">
            <img src={capCard.image} alt={capCard.title} className="shop-bento-image" loading="lazy" />
            <div className="shop-bento-overlay" />
            <div className="shop-bento-small-content">
              <div>
                <h3>{capCard.title}</h3>
                <p>{capCard.subLabel}</p>
              </div>
              <span className="shop-bento-arrow shop-bento-arrow-caps">
                <span aria-hidden="true">-&gt;</span>
              </span>
            </div>
          </Link>

          <Link href={giftingCard.href} className="shop-bento-card shop-bento-gifting">
            <img
              src={giftingCard.image}
              alt={giftingCard.title}
              className="shop-bento-image shop-bento-gifting-image"
              loading="lazy"
            />
            <div className="shop-bento-overlay" />
            <div className="shop-bento-corporate-content">
              <div className="shop-bento-corporate-left">
                <span className="shop-bento-quote">{giftingCard.quoteBadge}</span>
                <div>
                  <h3>{giftingCard.title}</h3>
                  <p>{giftingCard.subLabel}</p>
                </div>
              </div>
              <span className="shop-bento-arrow shop-bento-arrow-gifting">
                <span aria-hidden="true">-&gt;</span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
