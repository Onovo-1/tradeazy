import { useState } from "react";
import { formatNaira } from "../../utils/formatters";

export default function OfferModal({ open, mode, product, baseAmount, onClose, onSubmit }) {
  const [amount, setAmount] = useState(baseAmount || "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const title = mode === "counter" ? "Counter Offer" : "Make an Offer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(numeric, note.trim());
      setAmount("");
      setNote("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="bg-maroon-800 text-white px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-lg">{title}</h2>
            {product && (
              <p className="text-xs text-maroon-200">
                About: {product.name}
                {product.price && ` · asking ${formatNaira(product.price)}`}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-white/80 hover:text-white text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Your amount (₦)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={submitting}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Add a short message"
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {submitting ? "Submitting…" : mode === "counter" ? "Send Counter" : "Send Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}