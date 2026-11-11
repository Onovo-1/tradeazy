import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import { favoriteApi } from "../../api/favoriteApi"; // Added import
import ProductGrid from "../../components/product/ProductGrid";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedProductIds, setSavedProductIds] = useState([]); // Added state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        
        // Fetch products, categories, and favorites in parallel
        const [productsRes, categoriesRes, favoritesRes] = await Promise.all([
          productApi.list({ page: 0, size: 8, sort: "newest" }),
          categoryApi.list(),
          isAuthenticated ? favoriteApi.list().catch(() => ({ content: [] })) : Promise.resolve({ content: [] })
        ]);
        
        if (!cancelled) {
          setProducts(productsRes.content || []);
          setCategories(categoriesRes || []);
          
          // Extract the IDs of the favorited products
          const favIds = (favoritesRes.content || []).map(f => f.productId || f.id);
          setSavedProductIds(favIds);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]); // Re-run if auth state changes

  const isSeller = user?.roles?.includes("SELLER");

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
            
            {isSeller ? (
              <Link
                to="/seller/products/new"
                className="bg-white border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-semibold px-6 py-3 rounded-lg transition"
              >
                + Add a product
              </Link>
            ) : (
              <Link
                to="/register"
                className="bg-white border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-semibold px-6 py-3 rounded-lg transition"
              >
                Become a seller
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories with Hover Dropdown */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <Link to="/browse" className="text-sm text-maroon-700 hover:underline">
            See all →
          </Link>
        </div>
        <div className="flex gap-2 py-2 -mx-1 px-1">
          <Link
            to="/browse"
            className="px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap bg-maroon-700 text-white"
          >
            All
          </Link>
          {categories.map((cat) => (
            <div key={cat.id} className="relative group">
              <Link
                to={`/browse?category=${cat.slug}`}
                className="block px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap bg-white border border-gray-300 text-gray-700 hover:border-maroon-500 hover:text-maroon-700"
              >
                {cat.name}
              </Link>

              {/* Dropdown for subcategories */}
              {cat.children && cat.children.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {cat.children.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/browse?category=${sub.slug}`}
                      className="block px-4 py-2 hover:bg-maroon-50 hover:text-maroon-700 text-sm"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
          savedProductIds={savedProductIds} // Passed here!
        />
      </section>
    </div>
  );
}