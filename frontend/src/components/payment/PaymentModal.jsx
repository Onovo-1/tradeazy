import { useState } from "react";

/**
 * Card payment modal.
 *
 * Accepts any 16-digit card, any 3–4 digit CVV, and any MM/YY expiry.
 * On submit, waits 1.5s (simulating a gateway round-trip) and calls
 * onSuccess(reference). The parent then calls the backend /renew endpoint.
 */
export default function PaymentModal({ open, amount, plan, onClose, onSuccess }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const formatCardNumber = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const digitsOnly = cardNumber.replace(/\s/g, "");
    if (digitsOnly.length !== 16) {
      setError("Card number must be 16 digits");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Expiry must be MM/YY");
      return;
    }
    if (cvv.length < 3) {
      setError("CVV must be at least 3 digits");
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const reference =
      "CARD-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    setProcessing(false);
    onSuccess(reference);
  };

  const reset = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setError(null);
    setProcessing(false);
  };

  const handleClose = () => {
    if (processing) return;
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-maroon-800 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Pay for Rent</h2>
            <p className="text-xs text-maroon-200">
              {plan} — ₦{amount?.toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={processing}
            className="text-white/80 hover:text-white text-2xl leading-none disabled:opacity-50"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Card number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="**** **** **** ****"
              inputMode="numeric"
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Expiry
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                inputMode="numeric"
                disabled={processing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-maroon-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                CVV
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="123"
                inputMode="numeric"
                disabled={processing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-maroon-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              `Pay ₦${amount?.toLocaleString() ?? ""}`
            )}
          </button>

          <p className="text-[11px] text-center text-gray-400">
            Secured by TradeazyPay.
          </p>
        </form>
      </div>
    </div>
  );
}