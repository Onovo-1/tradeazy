import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { favoriteApi } from "../../api/favoriteApi";
import { formatNaira } from "../../utils/formatters";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await favoriteApi.list({ page: 0, size: 100 });
      setProducts(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (e, productId) => {
    e.preventDefault(); // Prevent clicking the card link
    try {
      await favoriteApi.remove(productId);
      // Remove it from the local state so the UI updates instantly
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert("Failed to remove item.");
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Saved products</h1>
          <p className="text-sm text-gray-500">
            {products.length} item{products.length === 1 ? "" : "s"} in your list
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading favorites...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              You haven't saved any products yet.
            </p>
            <Link
              to="/browse"
              className="text-maroon-700 font-semibold hover:underline"
            >
              Browse the marketplace →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const imageUrl = product.primaryImageUrl
                ? `${API_ROOT}${product.primaryImageUrl}`
                : null;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-maroon-300 transition"
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}

                    {/* Minimal Remove Button */}
                    <button
                      onClick={(e) => handleRemove(e, product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm backdrop-blur-sm transition z-10"
                      title="Remove from saved"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight mb-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-maroon-800 font-bold text-lg">
                        {formatNaira(product.effectivePrice)}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}