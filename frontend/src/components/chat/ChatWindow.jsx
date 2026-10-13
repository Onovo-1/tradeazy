import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../hooks/useChat";
import { chatApi } from "../../api/chatApi";
import { offerApi } from "../../api/offerApi";
import { formatNaira } from "../../utils/formatters";
import OfferModal from "./OfferModal";
import OfferBubble from "./OfferBubble";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWindow({ conversationId, peer, product, onRead, role, askingPrice }) {
  const { user } = useAuth();
  const { messages, loading, sending, send } = useChat(conversationId);
  const [draft, setDraft] = useState("");
  const [offers, setOffers] = useState([]);
  const [offerBusy, setOfferBusy] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "create", baseAmount: "" });
  const scrollRef = useRef(null);

  // mark read on open + refresh unread
  useEffect(() => {
    if (!conversationId) return;
    chatApi.markRead(conversationId).then(() => onRead?.()).catch(() => {});
  }, [conversationId, messages.length, onRead]);

  // load offers
  const loadOffers = async () => {
    try {
      const list = await offerApi.listByConversation(conversationId);
      setOffers(list || []);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    setOffers([]);
    setDraft("");
    if (conversationId) loadOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, offers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await send(text);
  };

  const isBuyer = role === "BUYER"; // viewer's role
  const latestPending = offers.find((o) => o.status === "PENDING");
  const canRespondToLatest =
    latestPending &&
    // buyer can respond only if the offer was made by the seller, and vice versa
    ((isBuyer && latestPending.madeBy === "SELLER") ||
      (!isBuyer && latestPending.madeBy === "BUYER"));

  const openCreateOffer = () => {
    setModal({ open: true, mode: "create", baseAmount: askingPrice || "" });
  };
  const openCounter = () => {
    setModal({
      open: true,
      mode: "counter",
      baseAmount: latestPending?.amount || askingPrice || "",
    });
  };

  const handleOfferSubmit = async (amount, note) => {
    setOfferBusy(true);
    try {
      if (modal.mode === "counter" && latestPending) {
        await offerApi.counter(latestPending.id, amount, note);
      } else {
        await offerApi.create(conversationId, amount, note);
      }
      await loadOffers();
    } finally {
      setOfferBusy(false);
    }
  };

  const handleAccept = async () => {
    if (!latestPending) return;
    setOfferBusy(true);
    try {
      await offerApi.accept(latestPending.id);
      await loadOffers();
    } catch (err) {
      alert(err.response?.data?.message || "Could not accept");
    } finally {
      setOfferBusy(false);
    }
  };

  const handleReject = async () => {
    if (!latestPending) return;
    setOfferBusy(true);
    try {
      await offerApi.reject(latestPending.id);
      await loadOffers();
    } catch (err) {
      alert(err.response?.data?.message || "Could not reject");
    } finally {
      setOfferBusy(false);
    }
  };

  // Split messages/offers by time so they render interleaved
  const timeline = [
    ...messages.map((m) => ({ kind: "message", at: m.createdAt, data: m })),
    ...offers.map((o) => ({ kind: "offer", at: o.createdAt, data: o })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold">
          {peer?.firstName?.[0]?.toUpperCase() ||
            peer?.username?.[0]?.toUpperCase() ||
            "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">
            {peer?.firstName} {peer?.lastName}
          </div>
          <div className="text-xs text-gray-500 truncate">@{peer?.username}</div>
        </div>
        {product && (
          <Link
            to={`/products/${product.id}`}
            className="text-xs text-maroon-700 hover:underline shrink-0"
          >
            about {product.name} →
          </Link>
        )}
      </div>

      {/* Message/offer stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3 space-y-3"
      >
        {loading ? (
          <div className="text-center text-sm text-gray-500 py-6">Loading…</div>
        ) : timeline.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-6">
            No messages yet. Say hi 👋
          </div>
        ) : (
          timeline.map((entry) => {
            if (entry.kind === "message") {
              const m = entry.data;
              const mine = m.senderId === user?.id;
              return (
                <div
                  key={`m-${m.id}`}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      mine
                        ? "bg-maroon-700 text-white rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        mine ? "text-maroon-200" : "text-gray-400"
                      }`}
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            }
            // offer
            const o = entry.data;
            const isMineOffer =
              (isBuyer && o.madeBy === "BUYER") ||
              (!isBuyer && o.madeBy === "SELLER");
            return (
              <OfferBubble
                key={`o-${o.id}`}
                offer={o}
                isMine={isMineOffer}
                canRespond={canRespondToLatest && o.id === latestPending.id}
                onAccept={handleAccept}
                onReject={handleReject}
                onCounter={openCounter}
                busy={offerBusy}
              />
            );
          })
        )}
      </div>

      {/* Offer bar */}
      <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex gap-2 items-center">
        {!latestPending && (
          <button
            type="button"
            onClick={openCreateOffer}
            disabled={offerBusy}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-maroon-700 text-maroon-700 hover:bg-maroon-50 disabled:opacity-60"
          >
            💰 Make an Offer
          </button>
        )}
        {product?.price && (
          <span className="text-xs text-gray-500">
            Asking: <strong>{formatNaira(product.price)}</strong>
          </span>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 px-3 py-2 flex gap-2 bg-white"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-semibold px-4 rounded-lg transition"
        >
          Send
        </button>
      </form>

      <OfferModal
        open={modal.open}
        mode={modal.mode}
        product={product}
        baseAmount={modal.baseAmount}
        onClose={() => setModal({ open: false, mode: "create", baseAmount: "" })}
        onSubmit={handleOfferSubmit}
      />
    </div>
  );
}