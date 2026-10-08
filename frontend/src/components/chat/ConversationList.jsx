import { useState, useEffect } from "react";
import { formatRelativeTime } from "../../utils/formatters";

const API_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/api$/, "");

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  filter,
  onFilterChange,
  loading,
}) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header with All / Unread tabs */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onFilterChange("all")}
            className={`flex-1 text-xs font-semibold py-1.5 rounded transition ${
              filter === "all"
                ? "bg-white text-maroon-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("unread")}
            className={`flex-1 text-xs font-semibold py-1.5 rounded transition ${
              filter === "unread"
                ? "bg-white text-maroon-800 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            {filter === "unread"
              ? "No unread conversations."
              : "No conversations yet."}
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === activeId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ConversationItem({ conversation, active, onClick }) {
  const peerName =
    [conversation.peerFirstName, conversation.peerLastName]
      .filter(Boolean)
      .join(" ") || conversation.peerUsername;

  const initial = peerName[0]?.toUpperCase() ?? "?";

  const productImg = conversation.productImageUrl
    ? `${API_ROOT}${conversation.productImageUrl}`
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
        active ? "bg-maroon-50 border-l-4 border-l-maroon-700" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {peerName}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="bg-maroon-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-maroon-700 truncate">
            {conversation.productName}
          </p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className="text-xs text-gray-500 truncate">
              {conversation.lastMessagePreview || "No messages yet"}
            </p>
            {conversation.lastMessageAt && (
              <span className="text-[10px] text-gray-400 shrink-0">
                {formatRelativeTime(conversation.lastMessageAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}