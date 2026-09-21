import { Link } from "react-router-dom";
import { formatNaira, formatRelativeTime } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

export default function ProductCard({ product }) {
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
      {/* Image */}
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
      </div>

      {/* Body */}
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