const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E";

export default function ConversationList({ conversations, activeId, onSelect }) {
  if (!conversations.length) {
    return (
      <div className="text-center py-10 px-4 text-sm text-gray-500">
        No conversations yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((c) => {
        const isActive = c.id === activeId;
        const initial =
          c.peerFirstName?.[0]?.toUpperCase() ||
          c.peerUsername?.[0]?.toUpperCase() ||
          "?";
        const imgSrc = c.productImageUrl
          ? `${API_ROOT}${c.productImageUrl}`
          : PLACEHOLDER_IMG;

        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-3 py-3 flex gap-3 items-start transition ${
                isActive ? "bg-maroon-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={imgSrc}
                    alt={c.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-gray-900 truncate">
                    {c.peerFirstName} {c.peerLastName}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="shrink-0 bg-maroon-700 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 truncate mb-0.5">
                  {c.productName}
                </p>

                <p
                  className={`text-xs truncate ${
                    c.unreadCount > 0
                      ? "text-gray-900 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {c.lastMessagePreview || "No messages yet"}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}