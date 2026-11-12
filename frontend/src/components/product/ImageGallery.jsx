import { useState } from "react";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

export default function ImageGallery({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        No image available
      </div>
    );
  }

  const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-4">
      
      {/* Main Image Wrapper */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
        <img
          src={`${API_ROOT}${images[currentIndex].url}`}
          alt={`${alt} - ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain pointer-events-none"
        />

        {images.length > 1 && (
          <>
            {/* LEFT HOVER ZONE */}
            <div 
              className="group/left absolute inset-y-0 left-0 w-1/2 flex items-center justify-start pl-3 cursor-pointer"
              onClick={handlePrev}
            >
              <button
                aria-label="Previous image"
                className="w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md backdrop-blur-md opacity-0 group-hover/left:opacity-100 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* RIGHT HOVER ZONE */}
            <div 
              className="group/right absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-3 cursor-pointer"
              onClick={handleNext}
            >
              <button
                aria-label="Next image"
                className="w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md backdrop-blur-md opacity-0 group-hover/right:opacity-100 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => setCurrentIndex(index)}
              className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                currentIndex === index ? "border-maroon-700" : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={`${API_ROOT}${img.url}`} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}