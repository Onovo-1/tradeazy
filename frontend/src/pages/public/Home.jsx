import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import ProductGrid from "../../components/product/ProductGrid";
import CategoryChips from "../../components/product/CategoryChips";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          productApi.list({ page: 0, size: 8, sort: "newest" }),
          categoryApi.list(),
        ]);
        if (!cancelled) {
          setProducts(productsRes.content || []);
          setCategories(categoriesRes || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Failed to load products."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-maroon-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-maroon-900 mb-4">
            Buy and sell <span className="text-maroon-700">anything</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-8">
            Tradeazy is Nigeria's friendliest marketplace. Browse thousands of
            listings from trusted sellers — from fashion to furniture.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/browse"
              className="bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Browse products
            </Link>
            <Link
              to="/register"
              className="bg-white border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-semibold px-6 py-3 rounded-lg transition"
            >
              Become a seller
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <Link to="/browse" className="text-sm text-maroon-700 hover:underline">
            See all →
          </Link>
        </div>
        <CategoryChips categories={categories} />
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Fresh listings</h2>
          <Link to="/browse" className="text-sm text-maroon-700 hover:underline">
            Browse all →
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No products yet. Be the first to list something!"
        />
      </section>
    </div>
  );
}