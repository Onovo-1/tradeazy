import { useState } from "react";
import { formatNaira } from "../../utils/formatters";
import { orderApi } from "../../api/orderApi";

export default function BuyOrderModal({ open, product, onClose, onSuccess }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!open || !product) return null;

  const unitPrice = Number(product.effectivePrice ?? product.price ?? 0);
  const total = unitPrice * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    try {
      const order = await orderApi.create({
        productId: product.id,
        quantity,
        notes: notes.trim() || null,
      });
      onSuccess(order);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return;
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-maroon-800 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Buy this product</h2>
            <p className="text-xs text-maroon-200">{product.name}</p>
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
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    Math.max(1, parseInt(e.target.value || "1", 10)),
                    product.quantity || 1
                  )
                )
              }
              min={1}
              max={product.quantity || 1}
              disabled={processing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {product.quantity} in stock
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              disabled={processing}
              placeholder="Delivery instructions, contact info..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Unit price</span>
              <span>{formatNaira(unitPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span className="text-maroon-800">{formatNaira(total)}</span>
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
                Processing payment...
              </>
            ) : (
              `Pay ${formatNaira(total)} & Place Order`
            )}
          </button>

          <p className="text-[11px] text-center text-gray-400">
            Powered by TradeazyPay — mock payment in dev
          </p>
        </form>
      </div>
    </div>
  );
}