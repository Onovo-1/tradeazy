import { formatNaira } from "../../utils/formatters";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function OfferBubble({ 
  offer, 
  isMine, 
  canRespond, 
  onAccept, 
  onReject, 
  onCounter, 
  onEdit,
  onDelete,
  onPay,
  busy 
}) {
  const isPending = offer.status === "PENDING";
  const isAccepted = offer.status === "ACCEPTED";
  
  let bgClass = "bg-yellow-50 border-yellow-300";
  let textClass = "text-yellow-800";
  let badgeClass = "bg-white text-yellow-700 border-yellow-200";

  if (isAccepted) {
    bgClass = "bg-green-50 border-green-300";
    textClass = "text-green-800";
    badgeClass = "bg-green-100 text-green-800 border-green-200";
  } else if (offer.status === "REJECTED") {
    bgClass = "bg-red-50 border-red-300";
    textClass = "text-red-800";
    badgeClass = "bg-red-100 text-red-800 border-red-200";
  } else if (offer.status === "COUNTERED") {
    bgClass = "bg-blue-50 border-blue-300";
    textClass = "text-blue-800";
    badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
      
      {isMine && isPending && (
        <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 pr-2">
          <button 
            type="button"
            onClick={() => onEdit && onEdit(offer)} 
            className="text-gray-400 hover:text-maroon-700 p-1"
            title="Edit Offer"
          >
            ✎
          </button>
          <button 
            type="button"
            onClick={() => onDelete && onDelete(offer)} 
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete Offer"
          >
            🗑
          </button>
        </div>
      )}

      <div className={`max-w-[75%] border-2 rounded-2xl p-4 shadow-sm ${bgClass} ${isMine ? "rounded-br-sm" : "rounded-bl-sm"}`}>
        
        <div className="flex items-center justify-between mb-2">
          <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${textClass}`}>
            🛒 Offer
          </div>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badgeClass}`}>
            {offer.status}
          </div>
        </div>

        <div className={`text-2xl font-extrabold mb-2 ${textClass}`}>
          {formatNaira(offer.amount)}
        </div>

        {offer.note && (
          <p className={`text-sm mb-2 ${textClass} opacity-90`}>
            "{offer.note}"
          </p>
        )}

        <div className={`text-[10px] text-right ${textClass} opacity-70 mb-3`}>
          {formatTime(offer.createdAt)}
        </div>

        {/* PAY NOW (buyer only, accepted offer) */}
        {isAccepted && isMine && onPay && (
          <button
            type="button"
            onClick={() => onPay(offer.id)}
            disabled={busy}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            💳 Pay Now
          </button>
        )}

        {canRespond && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-black/5">
            <button
              type="button"
              onClick={onAccept}
              disabled={busy}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={busy}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onCounter}
              disabled={busy}
              className="flex-1 bg-maroon-700 hover:bg-maroon-800 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition disabled:opacity-50"
            >
              Counter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}