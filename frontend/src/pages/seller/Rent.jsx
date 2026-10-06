import { useEffect, useState } from "react";
import { subscriptionApi } from "../../api/subscriptionApi";
import { formatNaira } from "../../utils/formatters";
import PaymentModal from "../../components/payment/PaymentModal";

const PLANS = [
  { key: "MONTHLY",   label: "Monthly",   days: 30,  hint: "Basic" },
  { key: "QUARTERLY", label: "Quarterly", days: 90,  hint: "Save 10%" },
  { key: "YEARLY",    label: "Yearly",    days: 365, hint: "Best value" },
];

export default function Rent() {
  const [current, setCurrent] = useState(null);
  const [prices, setPrices] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Payment modal state
  const [payModal, setPayModal] = useState({ open: false, plan: null, amount: null });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, pricesRes, historyRes] = await Promise.all([
        subscriptionApi.me().catch(() => null),
        subscriptionApi.prices().catch(() => null),
        subscriptionApi.history({ page: 0, size: 10 }).catch(() => ({ content: [] })),
      ]);
      setCurrent(meRes);
      setPrices(pricesRes);
      setHistory(historyRes.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openPayment = (plan) => {
    const amount = prices?.[plan]?.price;
    setPayModal({ open: true, plan, amount });
  };

  const closePayment = () => {
    setPayModal({ open: false, plan: null, amount: null });
  };

  const handlePaymentSuccess = async () => {
    setError(null);
    setSuccess(null);
    setRenewing(true);
    closePayment();

    try {
      const result = await subscriptionApi.renew(payModal.plan);
      setSuccess(
        `Payment successful! Your Rent is now active until ${new Date(
          result.expiryDate
        ).toLocaleDateString()}.`
      );
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const isActive = current && current.status === "ACTIVE";
  const daysLeft = current?.daysRemaining ?? 0;
  const expiringSoon = isActive && daysLeft <= 7;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rent Subscription</h1>
        <p className="text-sm text-gray-500">
          Your monthly fee to list products on Tradeazy.
        </p>
      </div>

      {/* Current status */}
      <div
        className={`rounded-xl border p-5 ${
          isActive
            ? expiringSoon
              ? "bg-yellow-50 border-yellow-300"
              : "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
        }`}
      >
        {isActive ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-gray-600">
                  Current subscription
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {current.plan} — ACTIVE
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Expires in</p>
                <p
                  className={`text-2xl font-extrabold ${
                    expiringSoon ? "text-yellow-700" : "text-green-700"
                  }`}
                >
                  {daysLeft} days
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Expiry date: {new Date(current.expiryDate).toLocaleString()}
            </p>
            {expiringSoon && (
              <p className="text-xs text-yellow-800 font-semibold mt-2">
                ⚠ Your Rent is expiring soon. Renew to keep adding new listings.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-xs uppercase font-bold text-red-700">
              No active subscription
            </p>
            <p className="text-lg font-bold text-red-900 mt-1">
              You cannot create new listings until you renew your Rent.
            </p>
            <p className="text-sm text-red-800 mt-1">
              Your existing listings are still visible to buyers.
            </p>
          </>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Choose a plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const price = prices?.[p.key]?.price;
            return (
              <div
                key={p.key}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
              >
                <p className="text-xs uppercase font-bold text-maroon-700 mb-1">
                  {p.hint}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {p.label}
                </h3>
                <p className="text-3xl font-extrabold text-maroon-800 mb-2">
                  {price ? formatNaira(price) : "—"}
                </p>
                <p className="text-sm text-gray-500 mb-4">for {p.days} days</p>
                <button
                  onClick={() => openPayment(p.key)}
                  disabled={renewing}
                  className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Pay Rent
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Payment history</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No previous subscriptions.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-medium">{s.plan}</td>
                    <td className="px-4 py-3 font-semibold text-maroon-800">
                      {formatNaira(s.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          s.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(s.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(s.expiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment modal */}
      <PaymentModal
        open={payModal.open}
        plan={payModal.plan}
        amount={payModal.amount}
        onClose={closePayment}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}