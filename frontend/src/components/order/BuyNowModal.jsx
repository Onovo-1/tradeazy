import { useState } from "react";
import { formatNaira } from "../../utils/formatters";

export default function BuyNowModal({ open, product, onClose, onSubmit }) {
  const [paymentType, setPaymentType] = useState("FULL"); // "FULL" | "PLAN"
  const [initialPayment, setInitialPayment] = useState("");
  const [installments, setInstallments] = useState("4");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open || !product) return null;

  const price = Number(product.effectivePrice);
  const initAmt = Number(initialPayment) || 0;
  const numInstallments = Number(installments) || 1;
  const remaining = price - initAmt;
  const perInstallment = remaining > 0 ? (remaining / numInstallments).toFixed(2) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (paymentType === "PLAN") {
      if (initAmt <= 0 || initAmt >= price) {
        setError("Initial payment must be greater than 0 and less than the total price.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        product,
        paymentType,
        initialPayment: initAmt,
        installments: numInstallments,
        perInstallment: Number(perInstallment),
        totalPrice: price,
      });
    } catch (err) {
      setError(err.message || "Failed to send proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-maroon-800 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">How would you like to pay?</h2>
            <p className="text-xs text-maroon-200">
              {product.name} — {formatNaira(price)}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Payment Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentType("FULL")}
              className={`p-3 rounded-lg border-2 text-left transition ${
                paymentType === "FULL"
                  ? "border-maroon-700 bg-maroon-50"
                  : "border-gray-200 hover:border-maroon-300"
              }`}
            >
              <p className="font-bold text-gray-900 mb-1">Full Payment</p>
              <p className="text-xs text-gray-500">Pay the full amount now</p>
            </button>
            
            <button
              type="button"
              onClick={() => setPaymentType("PLAN")}
              className={`p-3 rounded-lg border-2 text-left transition ${
                paymentType === "PLAN"
                  ? "border-maroon-700 bg-maroon-50"
                  : "border-gray-200 hover:border-maroon-300"
              }`}
            >
              <p className="font-bold text-gray-900 mb-1">Installment Plan</p>
              <p className="text-xs text-gray-500">Pay a deposit, then spread the rest</p>
            </button>
          </div>

          {/* Installment Details (if selected) */}
          {paymentType === "PLAN" && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Initial payment (Deposit ₦)
                </label>
                <input
                  type="number"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.value)}
                  placeholder={`e.g. ${price / 2}`}
                  max={price - 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Number of installments
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-maroon-500"
                >
                  <option value="2">2 installments</option>
                  <option value="3">3 installments</option>
                  <option value="4">4 installments</option>
                  <option value="6">6 installments</option>
                  <option value="12">12 installments</option>
                </select>
              </div>

              {initAmt > 0 && initAmt < price && (
                <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                  <p>Deposit: <strong>{formatNaira(initAmt)}</strong></p>
                  <p>Remaining: <strong>{formatNaira(remaining)}</strong></p>
                  <p>Payments: <strong>{formatNaira(perInstallment)}/mo for {numInstallments} months</strong></p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
            >
              {submitting ? "Sending proposal..." : "Send Proposal to Seller"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}