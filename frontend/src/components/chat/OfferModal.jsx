import { useState, useEffect } from "react";
import { formatNaira } from "../../utils/formatters";

export default function OfferModal({ open, mode, product, baseAmount, initialQuantity, initialPrice, onClose, onSubmit }) {
  const [amount, setAmount] = useState(""); // Price per item
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setAmount(initialPrice ? initialPrice.toString() : "");
      setQuantity(initialQuantity || 1);
      setNote("");
      setError(null);
    }
  }, [open, initialPrice, initialQuantity]);

  if (!open) return null;

  const title = mode === "counter" ? "Counter Offer" : "Make an Offer";
  // Lock the quantity if we are countering an offer
  const isQuantityLocked = mode === "counter"; 

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
      const totalAmount = numeric * quantity;
      await onSubmit(totalAmount, note.trim(), quantity);
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
            {product && <p className="text-xs text-maroon-200 truncate pr-4">About: {product.name}</p>}
          </div>
          <button onClick={handleClose} disabled={submitting} className="text-white/80 hover:text-white text-2xl leading-none disabled:opacity-50 shrink-0">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          {baseAmount > 0 && (
            <div className="bg-maroon-50 border border-maroon-100 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-maroon-800">Asking Price:</span>
              <span className="font-bold text-maroon-900">{formatNaira(baseAmount)}</span>
            </div>
          )}

          {/* QUANTITY DISPLAY */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
            {isQuantityLocked ? (
              <div className="text-lg font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {quantity}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  disabled={submitting} 
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(quantity + 1)} 
                  disabled={submitting} 
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  +
                </button>
              </div>
            )}
            {isQuantityLocked && (
              <p className="text-xs text-gray-500 mt-1">Quantity is fixed based on the buyer's original offer.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Price per item (₦)</label>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter your offer per item" disabled={submitting} autoFocus className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-500 placeholder-gray-300" />
          </div>

          <div className="bg-maroon-50 p-3 rounded-lg border border-maroon-100 flex justify-between items-center">
            <span className="text-sm font-bold text-maroon-800">Total Offer:</span>
            <span className="text-xl font-extrabold text-maroon-900">{formatNaira((Number(amount) || 0) * quantity)}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder="Add a short message" disabled={submitting} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleClose} disabled={submitting} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition">{submitting ? "Submitting…" : mode === "counter" ? "Send Counter" : "Send Offer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}