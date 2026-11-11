import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import ConfirmModal from "../../components/common/ConfirmModal";
import { formatNaira, formatRelativeTime } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelModal, setCancelModal] = useState({
    open: false,
    orderId: null,
  });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.mine({ page: 0, size: 50 });
      setOrders(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCancel = (orderId) => setCancelModal({ open: true, orderId });
  const closeCancel = () => {
    if (busy) return;
    setCancelModal({ open: false, orderId: null });
  };

  const confirmCancel = async () => {
    setBusy(true);
    try {
      await orderApi.cancel(cancelModal.orderId);
      setCancelModal({ open: false, orderId: null });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-maroon-200 border-t-maroon-700" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/browse"
              className="text-maroon-700 font-semibold hover:underline"
            >
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {o.productImageUrl ? (
                    <img
                      src={`${API_ROOT}${o.productImageUrl}`}
                      alt={o.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${o.productId}`}
                    className="font-semibold text-gray-900 hover:text-maroon-700 truncate block"
                  >
                    {o.productName}
                  </Link>
                  <p className="text-xs text-gray-500 mb-2">
                    From @{o.sellerUsername} · {formatRelativeTime(o.createdAt)}
                  </p>

                  <p className="text-sm text-gray-700">
                    Qty {o.quantity} × {formatNaira(o.unitPrice)} ={" "}
                    <strong className="text-maroon-800">
                      {formatNaira(o.totalAmount)}
                    </strong>
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Payment: <strong>{o.paymentStatus}</strong>
                    {o.paymentReference && (
                      <span className="ml-2 font-mono">{o.paymentReference}</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      STATUS_STYLES[o.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {o.status}
                  </span>

                  {o.status === "PENDING" && (
                    <button
                      onClick={() => openCancel(o.id)}
                      className="text-xs px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded transition"
                    >
                      Cancel order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={cancelModal.open}
        title="Cancel this order?"
        message="Stock will be restored and the seller will be notified."
        confirmLabel={busy ? "Cancelling…" : "Yes, cancel order"}
        cancelLabel="Keep order"
        tone="danger"
        onConfirm={confirmCancel}
        onCancel={closeCancel}
        busy={busy}
      />
    </div>
  );
}