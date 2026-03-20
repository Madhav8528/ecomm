"use client";

import { useMemo, useState } from "react";

type ProductGalleryProps = {
  name: string;
  images?: string[];
  inStock: boolean;
};

const DIAGRAM_IMAGE =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20width%3D'600'%20height%3D'600'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'white'/%3E%3Crect%20x%3D'210'%20y%3D'120'%20width%3D'180'%20height%3D'360'%20fill%3D'none'%20stroke%3D'%23000'%20stroke-width%3D'3'/%3E%3Cline%20x1%3D'200'%20y1%3D'120'%20x2%3D'400'%20y2%3D'120'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'200'%20y1%3D'480'%20x2%3D'400'%20y2%3D'480'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'130'%20y1%3D'120'%20x2%3D'130'%20y2%3D'480'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'120'%20y1%3D'120'%20x2%3D'140'%20y2%3D'120'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'120'%20y1%3D'480'%20x2%3D'140'%20y2%3D'480'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Ctext%20x%3D'95'%20y%3D'310'%20font-size%3D'20'%20font-family%3D'Arial'%20fill%3D'%23000'%20transform%3D'rotate(-90%2095%2C310)'%3EHeight%20%28%2B%2F-1mm%29%3C/text%3E%3Cline%20x1%3D'210'%20y1%3D'90'%20x2%3D'390'%20y2%3D'90'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'210'%20y1%3D'80'%20x2%3D'210'%20y2%3D'100'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'390'%20y1%3D'80'%20x2%3D'390'%20y2%3D'100'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Ctext%20x%3D'245'%20y%3D'70'%20font-size%3D'18'%20font-family%3D'Arial'%20fill%3D'%23000'%3ENeck%20Width%20%28%2B%2F-0.5mm%29%3C/text%3E%3Cline%20x1%3D'200'%20y1%3D'520'%20x2%3D'400'%20y2%3D'520'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'200'%20y1%3D'510'%20x2%3D'200'%20y2%3D'530'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Cline%20x1%3D'400'%20y1%3D'510'%20x2%3D'400'%20y2%3D'530'%20stroke%3D'%23000'%20stroke-width%3D'2'/%3E%3Ctext%20x%3D'235'%20y%3D'555'%20font-size%3D'18'%20font-family%3D'Arial'%20fill%3D'%23000'%3EBase%20Width%20%28%2B%2F-0.8mm%29%3C/text%3E%3C/svg%3E";

export function ProductGallery({ name, images, inStock }: ProductGalleryProps) {
  const galleryImages = useMemo(
    () => [...(images ?? []).slice(0, 3), DIAGRAM_IMAGE],
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const mainImage = galleryImages[activeIndex];

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }

  return (
    <>
      <article className="card product-gallery">
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
            <span className="zoom-icon" aria-hidden="true">??</span>
          </div>
        </div>

        <div className="gallery-stock-row">
          <span className={`stock-sticker ${inStock ? "in" : "out"}`}>
            ? {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <div className="product-gallery-thumbs">
          {galleryImages.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                type="button"
                className={`product-gallery-thumb ${isActive ? "active" : ""}`}
                key={`thumb-${index}`}
                onClick={() => setActiveIndex(index)}
              >
                <img src={image} alt={`${name} view ${index + 1}`} />
              </button>
            );
          })}
        </div>
      </article>

      {isModalOpen && mainImage ? (
        <div className="gallery-modal-backdrop" role="dialog" aria-modal="true">
          <div className="gallery-modal">
            <div className="gallery-modal-header">
              <strong>{name}</strong>
              <button type="button" className="btn-link" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
            <div className="gallery-modal-body">
              <img src={mainImage} alt={name} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
