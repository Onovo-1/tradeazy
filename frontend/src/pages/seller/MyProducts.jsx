import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sellerApi } from "../../api/sellerApi";
import { formatNaira } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerApi.myProducts({ page: 0, size: 100 });
      setProducts(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markSold = async (id) => {
    if (!confirm("Mark this product as SOLD? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await sellerApi.markSold(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as sold");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product? It will be hidden from buyers.")) return;
    setBusyId(id);
    try {
      await sellerApi.remove(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          to="/seller/products/new"
          className="bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
        >
          + Add Product
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
          <Link
            to="/seller/products/new"
            className="text-maroon-700 font-semibold hover:underline"
          >
            Create your first listing →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
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
                        <p className="font-medium text-gray-900 truncate">{p.name}</p>
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
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      {p.status === "ACTIVE" && (
                        <>
                          <Link
                            to={`/seller/products/${p.id}/edit`}
                            className="text-xs px-3 py-1.5 border border-gray-300 hover:border-maroon-500 hover:text-maroon-700 rounded"
                          >
                            Edit
                          </Link>
                          <button
                            disabled={busyId === p.id}
                            onClick={() => markSold(p.id)}
                            className="text-xs px-3 py-1.5 border border-gray-300 hover:border-maroon-500 hover:text-maroon-700 rounded disabled:opacity-50"
                          >
                            Mark Sold
                          </button>
                          <button
                            disabled={busyId === p.id}
                            onClick={() => remove(p.id)}
                            className="text-xs px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {p.status !== "ACTIVE" && (
                        <span className="text-xs text-gray-400">No actions</span>
                      )}
                    </div>
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

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-green-100 text-green-800",
    SOLD: "bg-maroon-100 text-maroon-800",
    REMOVED: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}