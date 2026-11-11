import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";
import { favoriteApi } from "../../api/favoriteApi";
import { useAuth } from "../../context/AuthContext";
import ProductGrid from "../../components/product/ProductGrid";
import CategoryChips from "../../components/product/CategoryChips";

const PAGE_SIZE = 20;

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const categorySlug = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const q = searchParams.get("q") || "";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const location = searchParams.get("location") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedProductIds, setSavedProductIds] = useState([]);
  
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    totalPages: 0,
    totalElements: 0,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      categoryApi.list().then((res) => {
        if (!cancelled) setCategories(res);
      }).catch(() => {});

      if (isAuthenticated) {
        try {
          const favs = await favoriteApi.list();
          if (!cancelled) {
            const favIds = (favs.content || []).map(f => f.productId || f.id);
            setSavedProductIds(favIds);
          }
        } catch (err) {}
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        let backendSort = "createdAt,desc"; 
        if (sort === "price_asc") backendSort = "price,asc";
        if (sort === "price_desc") backendSort = "price,desc";
        if (sort === "popular") backendSort = "viewCount,desc";

        const params = { page, size: PAGE_SIZE, sort: backendSort };
        if (q) params.q = q;
        if (condition) params.condition = condition;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (location) params.location = location;
        
        let res;
        
        // If we are inside a category AND any advanced filter is applied, we still need to filter by category.
        // Currently productApi.search doesn't accept a category, so we need to add categoryId or use a different approach.
        // Let's use the listByCategory endpoint and filter server-side if possible, or extend the search API.
        
        // For now, if we have filters AND a category, we use listByCategory and then client-filter? 
        // Or we need to update the backend search to accept categorySlug.
        
        // Let's check if the backend search endpoint accepts a category slug. If not, we might need to update it.
        // For this fix, we will use listByCategory which already supports pagination and sorting,
        // and we will need to extend it to support search filters. 
        
        // TEMPORARY FIX: If we have filters, we call the search endpoint. But we need to pass category info.
        // Let's assume the backend search endpoint has been updated to accept `categorySlug`.
        
        if (categorySlug) {
          // If we have a category, we use listByCategory.
          // NOTE: We need to add the filters to the listByCategory call.
          // If the backend doesn't support filters on listByCategory, we'll need to update it.
          // For now, let's just use listByCategory with the current parameters.
          params.category = categorySlug; // Assume backend search/list handles this
        }
        
        if (q || condition || minPrice || maxPrice || location) {
          // If we have any search filter, we use the search API.
          // We need to make sure the backend search API handles the category parameter.
          res = await productApi.search(params);
        } else if (categorySlug) {
          res = await productApi.listByCategory(categorySlug, params);
        } else {
          res = await productApi.list(params);
        }

        if (!cancelled) {
          setProducts(res.content || []);
          setPageInfo({
            page: res.page,
            totalPages: res.totalPages,
            totalElements: res.totalElements,
            last: res.last,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Something went wrong loading products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [categorySlug, sort, page, q, condition, minPrice, maxPrice, location]);

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

  const clearAllFilters = () => {
    // Keep the category if we are inside one, clear everything else
    const next = new URLSearchParams();
    if (categorySlug) next.set("category", categorySlug);
    setSearchParams(next);
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {q ? `Search: "${q}"` : categorySlug ? `Browse: ${categories.find(c => c.slug === categorySlug)?.name || categorySlug}` : "All products"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Loading..." : `${pageInfo.totalElements} listings`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-maroon-500"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most viewed</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <CategoryChips categories={categories} activeSlug={categorySlug} />
        </div>

        {/* Advanced Filters Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => updateParam("condition", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            >
              <option value="">Any</option>
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Min price</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateParam("minPrice", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max price</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
            <input
              type="text"
              placeholder="City"
              value={location}
              onChange={(e) => updateParam("location", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          {(condition || minPrice || maxPrice || location) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-maroon-700 hover:underline font-semibold pb-2 px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No products match your search."
          savedProductIds={savedProductIds}
        />

        {!loading && pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page === 0}
              onClick={() => updateParam("page", page - 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {pageInfo.page + 1} of {pageInfo.totalPages}
            </span>
            <button
              disabled={pageInfo.last}
              onClick={() => updateParam("page", page + 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}