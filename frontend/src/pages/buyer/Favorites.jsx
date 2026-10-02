import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { favoriteApi } from "../../api/favoriteApi";
import ProductGrid from "../../components/product/ProductGrid";

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

        {!loading && products.length === 0 ? (
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
          <ProductGrid
            products={products}
            loading={loading}
            emptyMessage="No saved products."
          />
        )}
      </div>
    </div>
  );
}