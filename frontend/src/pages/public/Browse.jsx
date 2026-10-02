import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { categoryApi } from "../../api/categoryApi";
import ProductGrid from "../../components/product/ProductGrid";
import CategoryChips from "../../components/product/CategoryChips";

const PAGE_SIZE = 20;

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") || "";
  const categorySlug = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const location = searchParams.get("location") || "";
  const page = parseInt(searchParams.get("page") || "0", 10);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load categories once
  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  // Load products whenever filters change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Resolve category slug → id
        let categoryId = "";
        if (categorySlug) {
          const found = categories.find((c) => c.slug === categorySlug);
          categoryId = found ? found.id : "";
        }

        const params = {
          page,
          size: PAGE_SIZE,
          sort,
          ...(q && { q }),
          ...(categoryId && { categoryId }),
          ...(condition && { condition }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(location && { location }),
        };

        const res = await axiosClient.get("/products", { params });
        const data = res.data;

        if (!cancelled) {
          setProducts(data.content || []);
          setPageInfo({
            page: data.page,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            last: data.last,
          });
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
  }, [q, categorySlug, sort, condition, minPrice, maxPrice, location, page, categories]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value === null || value === undefined) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const clearAllFilters = () => setSearchParams({});

  const hasFilters =
    q || categorySlug || condition || minPrice || maxPrice || location;

  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {q ? `Search: "${q}"` : categorySlug ? "Browse category" : "All products"}
            </h1>
            <p className="text-sm text-gray-500">
              {pageInfo.totalElements} listing
              {pageInfo.totalElements === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Sort:</label>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-maroon-500"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most viewed</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4">
          <CategoryChips categories={categories} activeSlug={categorySlug} />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200 items-end">
          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => updateParam("condition", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-maroon-500"
            >
              <option value="">Any</option>
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          </div>

          {/* Min price */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Min price
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => updateParam("minPrice", e.target.value)}
              placeholder="0"
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          {/* Max price */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Max price
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
              placeholder="Any"
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => updateParam("location", e.target.value)}
              placeholder="City"
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-maroon-700 hover:underline font-semibold pb-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No products match your search."
        />

        {/* Pagination */}
        {!loading && pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page === 0}
              onClick={() => updateParam("page", page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {pageInfo.page + 1} of {pageInfo.totalPages}
            </span>
            <button
              disabled={pageInfo.last}
              onClick={() => updateParam("page", page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}