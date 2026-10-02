import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatNaira, formatRelativeTime } from "../../utils/formatters";
import { favoriteApi } from "../../api/favoriteApi";
import { useAuth } from "../../context/AuthContext";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

export default function ProductCard({ product }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  const isOwnProduct =
    user?.id && product.sellerId && user.id === product.sellerId;

  useEffect(() => {
    if (!isAuthenticated) {
      setFavorited(false);
      return;
    }
    let cancelled = false;
    favoriteApi
      .check(product.id)
      .then((r) => {
        if (!cancelled) setFavorited(r.favorited);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, product.id]);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnProduct) return;
    if (busy) return;

    setBusy(true);
    try {
      if (favorited) {
        await favoriteApi.remove(product.id);
        setFavorited(false);
      } else {
        await favoriteApi.add(product.id);
        setFavorited(true);
      }
    } catch (err) {
      // silently ignore
    } finally {
      setBusy(false);
    }
  };

  const hasDiscount =
    product.discountPercent > 0 &&
    Number(product.effectivePrice) < Number(product.price);

  const imageUrl = product.primaryImageUrl
    ? `${API_ROOT}${product.primaryImageUrl}`
    : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-maroon-300 transition"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-maroon-700 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discountPercent}%
          </div>
        )}

        {product.status === "SOLD" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wider">
              SOLD
            </span>
          </div>
        )}

        {!isOwnProduct && (
          <button
            type="button"
            onClick={handleFavorite}
            disabled={busy}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm border border-gray-200 disabled:opacity-60 transition"
          >
            <span
              className={
                favorited
                  ? "text-maroon-700 text-lg leading-none"
                  : "text-gray-500 text-lg leading-none"
              }
            >
              {favorited ? "♥" : "♡"}
            </span>
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-maroon-800 font-bold text-lg">
            {formatNaira(product.effectivePrice)}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-xs">
              {formatNaira(product.price)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{product.location}</span>
          <span className="shrink-0">
            {formatRelativeTime(product.createdAt)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
            {product.condition}
          </span>
          {product.categoryName && (
            <span className="text-xs text-gray-500 truncate">
              {product.categoryName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}