"use client";

import { useMemo, useState } from "react";

type ProductGalleryProps = {
  name: string;
  images?: string[];
  inStock: boolean;
  isTableware?: boolean;
  capacityDisplay?: string;
};

const DIAGRAM_IMAGE = "/product-dimension-guide.svg";

export function ProductGallery({
  name,
  images,
  inStock,
  isTableware,
  capacityDisplay,
}: ProductGalleryProps) {
  const galleryImages = useMemo(() => {
    const cleaned = (images ?? []).filter((image) => image.trim().length > 0);
    return [...cleaned, DIAGRAM_IMAGE];
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const safeActiveIndex =
    galleryImages.length > 0 ? Math.min(activeIndex, galleryImages.length - 1) : -1;
  const mainImage = safeActiveIndex >= 0 ? galleryImages[safeActiveIndex] : undefined;

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }

  return (
    <>
      <article className="card product-gallery">
        <div className="gallery-thumb-strip">
          {galleryImages.map((image, index) => {
            const isActive = index === safeActiveIndex;
            return (
              <button
                type="button"
                className={`product-gallery-thumb ${isActive ? "active" : ""}`}
                key={`thumb-${index}`}
                onClick={() => setActiveIndex(index)}
              >
                <img src={image} alt={`${name} view ${index + 1}`} draggable={false} />
              </button>
            );
          })}
        </div>

        <div className="product-gallery-main">
          <div
            className={`product-gallery-frame ${mainImage ? "has-image" : ""}`}
            onClick={() => mainImage && setIsModalOpen(true)}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            role={mainImage ? "button" : undefined}
            tabIndex={mainImage ? 0 : -1}
          >
            {mainImage ? (
              <div
                className="product-gallery-zoom"
                style={{
                  backgroundImage: `url(${mainImage})`,
                  backgroundPosition: isZooming ? `${zoomPosition.x}% ${zoomPosition.y}%` : "50% 50%",
                  backgroundSize: isZooming ? "220%" : "contain",
                }}
              />
            ) : (
              <div className="gallery-no-image">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="6" y="10" width="36" height="28" rx="4" />
                  <circle cx="18" cy="22" r="4" />
                  <path d="M6 34l10-10 8 8 6-6 12 12" />
                </svg>
                <span>Image coming soon</span>
              </div>
            )}
            <span className="zoom-icon" aria-hidden="true">Zoom</span>
          </div>

          <div className="gallery-stock-row">
            <span className={`stock-sticker ${inStock ? "in" : "out"}`}>
              • {inStock ? "In Stock" : "Out of Stock"}
            </span>
            {isTableware && capacityDisplay ? (
              <span className="capacity-image-badge">
                <span className="capacity-badge-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35">
                    <path d="M8 1.8c-.8 1.4-3.8 4.2-3.8 7a3.8 3.8 0 1 0 7.6 0c0-2.8-3-5.6-3.8-7Z" />
                    <path d="M6.3 10.2a1.8 1.8 0 0 0 1.4.9" strokeLinecap="round" />
                  </svg>
                </span>
                <span>{capacityDisplay}</span>
              </span>
            ) : null}
          </div>
        </div>
      </article>

      {isModalOpen && mainImage ? (
        <div
          className="gallery-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="gallery-modal" onClick={(event) => event.stopPropagation()}>
            <div className="gallery-modal-header">
              <strong>{name}</strong>
              <button type="button" className="btn-link" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
            <div className="gallery-modal-body">
              <img src={mainImage} alt={name} draggable={false} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
