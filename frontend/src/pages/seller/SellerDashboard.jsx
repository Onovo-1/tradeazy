import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { useAuth } from "../../context/AuthContext";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await productApi.listMyProducts({ page: 0, size: 100 });
        if (!cancelled) {
          setProducts(res.content || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load your products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // CALCULATE STATS
  // Total = Number of distinct listings
  const total = products.length;
  
  // Active = Sum of quantities for all ACTIVE products
  const active = products.reduce((acc, p) => acc + (p.status === "ACTIVE" ? p.quantity : 0), 0);
  
  // Sold = Sum of soldCount for all products
  const sold = products.reduce((acc, p) => acc + (p.soldCount || 0), 0);
  
  // Removed = Number of distinct listings that are REMOVED
  const removed = products.filter((p) => p.status === "REMOVED").length;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your seller overview.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Listings</h3>
            <p className="text-3xl font-extrabold text-gray-900">{loading ? "..." : total}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Stock</h3>
            <p className="text-3xl font-extrabold text-green-600">{loading ? "..." : active}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Items Sold</h3>
            <p className="text-3xl font-extrabold text-maroon-700">{loading ? "..." : sold}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Removed Items</h3>
            <p className="text-3xl font-extrabold text-gray-400">{loading ? "..." : removed}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick actions</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/seller/products/new"
              className="bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-5 py-2.5 rounded-lg transition"
            >
              + Add new product
            </Link>
            <Link
              to="/seller/products"
              className="bg-white border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-semibold px-5 py-2.5 rounded-lg transition"
            >
              Manage products
            </Link>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
            <Link to="/seller/products" className="text-sm text-maroon-700 hover:underline">
              View all →
            </Link>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading listings...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">You haven't listed any products yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4">
                        ₦{Number(product.price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          product.status === 'SOLD' ? 'bg-maroon-100 text-maroon-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}