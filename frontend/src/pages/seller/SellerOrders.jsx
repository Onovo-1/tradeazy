import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { formatNaira, formatRelativeTime } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "COMPLETED",
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.forSeller({ page: 0, size: 50 });
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

  const advance = async (order, nextStatus) => {
    setBusyId(order.id);
    try {
      await orderApi.updateStatus(order.id, nextStatus);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (order) => {
    if (!confirm("Cancel this order?")) return;
    setBusyId(order.id);
    try {
      await orderApi.updateStatus(order.id, "CANCELLED");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          {orders.length} order{orders.length === 1 ? "" : "s"} received
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const imageUrl = o.productImageUrl ? `${API_ROOT}${o.productImageUrl}` : null;
            const nextStatus = NEXT_STATUS[o.status];
            const canCancel = o.status === "PENDING" || o.status === "CONFIRMED";

            return (
              <div
                key={o.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={o.productName} className="w-full h-full object-cover" />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/products/${o.productId}`}
                        className="font-semibold text-gray-900 hover:text-maroon-700 truncate block"
                      >
                        {o.productName}
                      </Link>
                      <p className="text-xs text-gray-500">
                        Buyer @{o.buyerUsername} · {formatRelativeTime(o.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>

                  <div className="text-sm text-gray-600 mt-2">
                    Qty {o.quantity} × {formatNaira(o.unitPrice)} ={" "}
                    <span className="font-bold text-maroon-800">
                      {formatNaira(o.totalAmount)}
                    </span>
                  </div>

                  {o.notes && (
                    <p className="text-xs text-gray-500 italic mt-1">
                      Note: {o.notes}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {nextStatus && (
                      <button
                        disabled={busyId === o.id}
                        onClick={() => advance(o, nextStatus)}
                        className="text-xs px-3 py-1.5 bg-maroon-700 hover:bg-maroon-800 text-white font-semibold rounded disabled:opacity-50"
                      >
                        Mark {nextStatus}
                      </button>
                    )}
                    {canCancel && (
                      <button
                        disabled={busyId === o.id}
                        onClick={() => cancel(o)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    {(o.status === "COMPLETED" || o.status === "CANCELLED") && (
                      <span className="text-xs text-gray-400 italic pt-1.5">
                        No actions available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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