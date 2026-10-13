import { formatNaira } from "../../utils/formatters";

/**
 * Renders a single offer as a card inside the chat.
 * mode: "mine" | "peer" — whose offer it is
 * role: "BUYER" | "SELLER" — who made it
 * canRespond: boolean — show accept/reject/counter buttons
 */
export default function OfferBubble({
  offer,
  isMine,
  canRespond,
  onAccept,
  onReject,
  onCounter,
  busy,
}) {
  const statusColor = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ACCEPTED: "bg-green-100 text-green-800 border-green-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
    COUNTERED: "bg-gray-100 text-gray-700 border-gray-300",
    EXPIRED: "bg-gray-100 text-gray-500 border-gray-300",
  }[offer.status] || "bg-gray-100 text-gray-600 border-gray-300";

  const time = offer.createdAt
    ? new Date(offer.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isPending = offer.status === "PENDING";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] w-full sm:w-80">
        <div
          className={`rounded-2xl border-2 p-3 shadow-sm bg-white ${statusColor}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">
              {offer.madeBy === "BUYER" ? "🛒 Offer" : "🏪 Counter Offer"}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60">
              {offer.status}
            </span>
          </div>

          <div className="text-2xl font-extrabold text-maroon-800 mb-1">
            {formatNaira(offer.amount)}
          </div>

          {offer.note && (
            <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
              "{offer.note}"
            </p>
          )}

          <div className="text-[10px] text-gray-400 text-right">{time}</div>

          {isPending && canRespond && (
            <div className="grid grid-cols-3 gap-1.5 mt-3">
              <button
                type="button"
                onClick={onAccept}
                disabled={busy}
                className="text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-1.5 rounded-lg"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={onReject}
                disabled={busy}
                className="text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-1.5 rounded-lg"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={onCounter}
                disabled={busy}
                className="text-xs font-semibold bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white py-1.5 rounded-lg"
              >
                Counter
              </button>
            </div>
          )}

          {isPending && !canRespond && (
            <p className="text-[11px] text-gray-500 mt-2 italic">
              Waiting for the other party…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}