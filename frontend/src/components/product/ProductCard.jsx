import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatNaira } from "../../utils/formatters";
import { favoriteApi } from "../../api/favoriteApi";
import { useAuth } from "../../context/AuthContext";

const PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' dy='10' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, savedProductIds = [] }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Track the state locally so the heart fills in instantly when clicked
  const [isSaved, setIsSaved] = useState(savedProductIds.includes(product.id));
  const [busy, setBusy] = useState(false);

  const isOwnProduct = user?.id === product.sellerId;

  const imageUrl = product.primaryImageUrl 
    ? `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace('/api', '')}${product.primaryImageUrl}` 
    : PLACEHOLDER_IMAGE;

  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Prevent the card from navigating to the product page when the heart is clicked
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnProduct || busy) return;

    setBusy(true);
    try {
      if (isSaved) {
        await favoriteApi.remove(product.id);
        setIsSaved(false);
      } else {
        await favoriteApi.add(product.id);
        setIsSaved(true);
      }
    } catch (err) {
      // If it fails because it's already saved (409), just set it to true
      if (err.response?.status === 409) setIsSaved(true);
      console.error("Failed to toggle favorite", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group relative flex flex-col">
      
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        </Link>

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-maroon-700 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discountPercent}%
          </div>
        )}

        {/* Clickable Heart Icon */}
        <button
          onClick={handleToggleFavorite}
          disabled={busy || isOwnProduct}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition disabled:opacity-50 ${
            isSaved ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 line-clamp-2 hover:text-maroon-700 mb-2">
          {product.name}
        </Link>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-extrabold text-maroon-800">
            {formatNaira(product.effectivePrice || product.price)}
          </span>
          {product.discountPercent > 0 && (
            <span className="text-sm text-gray-400 line-through">
              {formatNaira(product.price)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>{product.location}</span>
          <span>{product.categoryName || "Uncategorized"}</span>
        </div>
      </div>
    </div>
  );
}