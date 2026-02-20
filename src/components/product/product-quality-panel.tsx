"use client";

const QUALITY_ITEMS = [
  "BPA Free & Food Grade",
  "GST Input Ready",
  "Fast Dispatch 24-48 hrs",
  "Best Clarity White Glass",
  "Scratch-Safe Finish",
  "Leak-Tested Neck",
  "Bulk-Safe Carton Packing",
  "In Stock",
];

export function ProductQualityPanel() {
  return (
    <div className="quality-row">
      <div className="quality-row-inner">
        {QUALITY_ITEMS.map((item) => (
          <span key={item} className="quality-badge">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
