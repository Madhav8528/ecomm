"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const slides = [
  {
    title: "Pure Clarity Glass Jars",
    subtitle: "Crystal-clear glass jars made for everyday and premium use.",
    ctaLabel: "Explore Glass Jars",
    ctaHref: "/products?q=jar",
    image: "/banners/banner-1.webp",
    imagePosition: "center top",
  },
  {
    title: "Signature Bottle Profiles",
    subtitle: "Refined silhouettes designed for beverages and wellness.",
    ctaLabel: "Explore Glass Bottles",
    ctaHref: "/products?q=bottle",
    image: "/banners/banner-2.webp",
    imagePosition: "center center",
  },
  {
    title: "Precision Closures & Custom Branding",
    subtitle: "Secure seals, clean lines, and logo-ready finishes.",
    ctaLabel: "View Closure Options",
    ctaHref: "/products?q=cap",
    image: "/banners/banner-3.webp",
    imagePosition: "center center",
  },
];

const INTERVAL_MS = 4500;

export function HomeSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;

  useEffect(() => {
    setActiveIndex((prev) => (prev >= slideCount ? 0 : prev));
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [slideCount]);

  return (
    <section className="slider-wrap">
      <div className="slider-card">
        {slides.map((slide, index) => (
          <article
            key={slide.title}
            className={`slider-item ${index === activeIndex ? "active" : ""}`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="slider-image"
              style={{ objectPosition: slide.imagePosition }}
              sizes="100vw"
              priority={index === 0}
              unoptimized
            />
            <div className="slider-overlay" />
            <div className="container slider-content-shell">
              <div className="slider-content">
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
                <Link href={slide.ctaHref} className="btn btn-primary">
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
        <div className="slider-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`slider-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
