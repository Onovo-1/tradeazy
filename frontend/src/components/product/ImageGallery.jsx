import { useEffect, useState } from "react";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

/**
 * Main image with clickable thumbnail strip below.
 *
 * Props:
 *   images — array of { id, url, isPrimary, displayOrder } from the backend
 *   alt    — alt text for the images (usually the product name)
 *
 * If images is empty, shows a placeholder.
 */
export default function ImageGallery({ images, alt }) {
  // Sort: primary first, then by displayOrder
  const sortedImages = [...(images || [])].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index when the images prop changes (e.g. navigating to another product)
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  const active = sortedImages[activeIndex];
  const activeUrl = active?.url ? `${API_ROOT}${active.url}` : null;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={alt}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Image unavailable
          </div>
        )}
      </div>

      {/* Thumbnails (only if 2+ images) */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedImages.map((img, index) => {
            const url = `${API_ROOT}${img.url}`;
            const isActive = index === activeIndex;
            return (
              <button
                key={img.id ?? index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  isActive
                    ? "border-maroon-700"
                    : "border-gray-200 hover:border-maroon-400"
                }`}
              >
                <img
                  src={url}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}