import { formatRelativeTime } from "../../utils/formatters";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

export default function ConversationList({ conversations, activeId, onSelect }) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-10 px-4 text-sm text-gray-500">
        No conversations found.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((c) => {
        const isActive = c.id === activeId;
        
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-start gap-3 p-3 text-left border-b border-gray-100 transition ${
              isActive ? "bg-maroon-50 border-l-4 border-l-maroon-700" : "hover:bg-gray-50 border-l-4 border-l-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold shrink-0 overflow-hidden">
              {c.productImageUrl ? (
                <img src={`${API_ROOT}${c.productImageUrl}`} alt={c.productName} className="w-full h-full object-cover" />
              ) : (
                c.peerFirstName?.[0]?.toUpperCase() || c.peerUsername?.[0]?.toUpperCase() || "?"
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-semibold text-gray-900 truncate">
                  {c.peerFirstName ? `${c.peerFirstName} ${c.peerLastName || ""}` : c.peerUsername}
                </span>
                {c.lastMessageAt && (
                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                    {formatRelativeTime(c.lastMessageAt)}
                  </span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 truncate mb-1">
                {c.productName}
              </div>
              
              <div className="text-xs text-gray-400 truncate">
                {c.lastMessage || "No messages yet"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}