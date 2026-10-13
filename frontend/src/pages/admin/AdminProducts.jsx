import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { formatNaira } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (status) params.status = status;
      const res = await adminApi.listProducts(params);
      setProducts(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async (id) => {
    if (!confirm("Remove this product from the marketplace?")) return;
    setBusyId(id);
    try {
      await adminApi.removeProduct(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove");
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (id) => {
    setBusyId(id);
    try {
      await adminApi.restoreProduct(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to restore");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SOLD">Sold</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
                        {p.primaryImageUrl ? (
                          <img
                            src={`${API_ROOT}${p.primaryImageUrl}`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/products/${p.id}`}
                          className="font-medium text-gray-900 truncate hover:text-maroon-700"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">
                          {p.categoryName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-maroon-800">
                    {formatNaira(p.effectivePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : p.status === "SOLD"
                          ? "bg-maroon-100 text-maroon-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    @{p.sellerUsername}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status !== "REMOVED" ? (
                      <button
                        disabled={busyId === p.id}
                        onClick={() => handleRemove(p.id)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        disabled={busyId === p.id}
                        onClick={() => handleRestore(p.id)}
                        className="text-xs px-3 py-1.5 border border-green-300 text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}