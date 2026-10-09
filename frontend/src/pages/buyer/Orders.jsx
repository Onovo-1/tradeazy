import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { formatNaira, formatRelativeTime } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

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

  const cancelOrder = async (id) => {
    if (!confirm("Cancel this order? Stock will be restored.")) return;
    setBusyId(id);
    try {
      await orderApi.cancel(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
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

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link
              to="/browse"
              className="text-maroon-700 font-semibold hover:underline"
            >
              Browse products →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                onCancel={cancelOrder}
                busy={busyId === o.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order, onCancel, busy }) {
  const imageUrl = order.productImageUrl
    ? `${API_ROOT}${order.productImageUrl}`
    : null;

  const canCancel = order.status === "PENDING";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={order.productName}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/products/${order.productId}`}
              className="font-semibold text-gray-900 hover:text-maroon-700 truncate block"
            >
              {order.productName}
            </Link>
            <p className="text-xs text-gray-500">
              From @{order.sellerUsername} ·{" "}
              {formatRelativeTime(order.createdAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
          <div className="text-sm text-gray-600">
            Qty {order.quantity} × {formatNaira(order.unitPrice)} ={" "}
            <span className="font-bold text-maroon-800">
              {formatNaira(order.totalAmount)}
            </span>
          </div>

          {canCancel && (
            <button
              onClick={() => onCancel(order.id)}
              disabled={busy}
              className="text-xs px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
            >
              Cancel order
            </button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Payment: <span className="font-semibold">{order.paymentStatus}</span>
          {order.paymentReference && (
            <span className="ml-2 font-mono">{order.paymentReference}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING:    "bg-yellow-100 text-yellow-800",
    CONFIRMED:  "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    COMPLETED:  "bg-green-100 text-green-800",
    CANCELLED:  "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}