import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../hooks/useChat";
import { chatApi } from "../../api/chatApi";
import { offerApi } from "../../api/offerApi";
import ConfirmModal from "../common/ConfirmModal";
import OfferModal from "./OfferModal";
import OfferBubble from "./OfferBubble";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

export default function ChatWindow({ conversationId, peer, product, onRead, role, askingPrice }) {
  const { user } = useAuth();
  const { messages, loading, sending, send, refresh } = useChat(conversationId);
  const [draft, setDraft] = useState("");
  
  const [offers, setOffers] = useState([]);
  const [offerBusy, setOfferBusy] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "create", baseAmount: "", editingOfferId: null });

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, messageId: null });
  const [offerDeleteModal, setOfferDeleteModal] = useState({ open: false, offerId: null });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState(null);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const isBuyer = role === "BUYER";

  useEffect(() => {
    if (!conversationId) return;
    chatApi.markRead(conversationId).then(() => onRead?.()).catch(() => {});
  }, [conversationId, messages.length, onRead]);

  const loadOffers = async () => {
    try {
      const list = await offerApi.listByConversation(conversationId);
      setOffers(list || []);
    } catch {}
  };

  useEffect(() => {
    setOffers([]);
    setDraft("");
    setEditingId(null);
    setPendingImageUrl(null);
    if (conversationId) loadOffers();
  }, [conversationId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, offers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text && !pendingImageUrl) return;
    
    let finalContent = text;
    if (pendingImageUrl) {
      finalContent = text ? `${text}\n[IMAGE]:${pendingImageUrl}` : `[IMAGE]:${pendingImageUrl}`;
    }

    setDraft("");
    setPendingImageUrl(null);
    await send(finalContent);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await chatApi.uploadChatImage(conversationId, file);
      setPendingImageUrl(res.url);
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearPendingImage = () => setPendingImageUrl(null);

  const startEdit = (msg) => { setEditingId(msg.id); setEditContent(msg.content); };
  const cancelEdit = () => { setEditingId(null); setEditContent(""); };
  
  const saveEdit = async (messageId) => {
    if (!editContent.trim()) return;
    setActionBusy(true);
    try { 
      await chatApi.editMessage(conversationId, messageId, editContent.trim()); 
      cancelEdit(); 
      refresh(); 
    } catch (err) { 
      alert("Could not edit message"); 
    } finally { 
      setActionBusy(false); 
    }
  };

  const openDeleteModal = (messageId) => { setDeleteModal({ open: true, messageId }); };
  const closeDeleteModal = () => { if (actionBusy) return; setDeleteModal({ open: false, messageId: null }); };
  
  const confirmDelete = async () => {
    const { messageId } = deleteModal; 
    if (!messageId) return;
    setActionBusy(true);
    try { 
      await chatApi.deleteMessage(conversationId, messageId); 
      closeDeleteModal(); 
      refresh(); 
    } catch (err) { 
      alert("Could not delete message"); 
    } finally { 
      setActionBusy(false); 
    }
  };

  const latestPending = offers.find((o) => o.status === "PENDING");
  const canRespondToLatest = latestPending && ((isBuyer && latestPending.madeBy === "SELLER") || (!isBuyer && latestPending.madeBy === "BUYER"));
  
  const openCreateOffer = () => { setModal({ open: true, mode: "create", baseAmount: askingPrice || "", editingOfferId: null }); };
  const openCounter = () => { setModal({ open: true, mode: "counter", baseAmount: latestPending?.amount || askingPrice || "", editingOfferId: null }); };
  
  const handleOfferSubmit = async (amount, note) => {
    setOfferBusy(true);
    try {
      if (modal.editingOfferId) await offerApi.update(modal.editingOfferId, amount, note);
      else if (modal.mode === "counter" && latestPending) await offerApi.counter(latestPending.id, amount, note);
      else await offerApi.create(conversationId, amount, note);
      await loadOffers(); 
      setModal({ open: false, mode: "create", baseAmount: "", editingOfferId: null });
    } catch (err) { 
      alert(err.response?.data?.message || "Failed to submit offer"); 
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
  
  const handlePayOffer = async (offerId) => {
    setOfferBusy(true);
    try {
      await offerApi.pay(offerId);
      alert("Payment successful! Order created. Check 'My Orders'.");
      await loadOffers();
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    } finally {
      setOfferBusy(false);
    }
  };

  const openOfferDeleteModal = (offerId) => { setOfferDeleteModal({ open: true, offerId }); };
  const closeOfferDeleteModal = () => { if (actionBusy) return; setOfferDeleteModal({ open: false, offerId: null }); };
  
  const confirmOfferDelete = async () => {
    const { offerId } = offerDeleteModal; 
    if (!offerId) return;
    setActionBusy(true);
    try { 
      await offerApi.delete(offerId); 
      closeOfferDeleteModal(); 
      loadOffers(); 
    } catch (err) { 
      alert(err.response?.data?.message || "Could not delete offer"); 
    } finally { 
      setActionBusy(false); 
    }
  };

  const timeline = [
    ...messages.map((m) => ({ kind: "message", at: m.createdAt, data: m })),
    ...offers.map((o) => ({ kind: "offer", at: o.createdAt, data: o })),
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  const safeProduct = product || { id: 0, name: "Unknown Product", price: 0 };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold">
          {peer?.firstName?.[0]?.toUpperCase() || peer?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{peer?.firstName} {peer?.lastName}</div>
          <div className="text-xs text-gray-500 truncate">@{peer?.username}</div>
        </div>
        {product && (
          <Link to={`/products/${product.id}`} className="text-xs text-maroon-700 hover:underline shrink-0">
            about {product.name} →
          </Link>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gray-50 px-4 py-3 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-gray-500 py-6">Loading…</div>
        ) : timeline.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-6">No messages yet. Say hi 👋</div>
        ) : (
          timeline.map((entry) => {
            if (entry.kind === "message") {
              const m = entry.data;
              const mine = m.senderId === user?.id;
              const isEditing = editingId === m.id;
              
              const imageMarker = "[IMAGE]:";
              const imageIndex = m.content.indexOf(imageMarker);
              const hasImage = imageIndex !== -1;
              
              let textPart = m.content;
              let imageUrl = null;
              
              if (hasImage) {
                textPart = m.content.substring(0, imageIndex).trim();
                const urlPart = m.content.substring(imageIndex + imageMarker.length).trim();
                imageUrl = `${API_ROOT}${urlPart}`;
              }

              return (
                <div key={`m-${m.id}`} className={`group flex ${mine ? "justify-end" : "justify-start"}`}>
                  {mine && !isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 pr-2">
                       <button onClick={() => startEdit(m)} className="text-gray-400 hover:text-maroon-700 p-1">✎</button>
                       <button onClick={() => openDeleteModal(m.id)} className="text-gray-400 hover:text-red-600 p-1">🗑</button>
                    </div>
                  )}

                  <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      mine ? "bg-maroon-700 text-white rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"
                  }`}>
                    {isEditing ? (
                      <div className="w-64">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-gray-900 rounded p-1 text-sm border-none focus:ring-0 mb-2"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button onClick={cancelEdit} className="text-maroon-200 hover:text-white">Cancel</button>
                          <button onClick={() => saveEdit(m.id)} disabled={actionBusy} className="font-bold text-white hover:underline">Save</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {textPart && <p className="whitespace-pre-wrap break-words mb-2">{textPart}</p>}
                        {imageUrl && (
                          <img 
                            src={imageUrl} 
                            alt="Chat attachment" 
                            className="max-w-[200px] sm:max-w-[250px] rounded-lg cursor-pointer"
                            onClick={() => window.open(imageUrl, "_blank")}
                          />
                        )}
                      </div>
                    )}
                    
                    {!isEditing && (
                      <div className={`text-[10px] mt-1 text-right ${mine ? "text-maroon-200" : "text-gray-400"}`}>
                        {formatTime(m.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            const o = entry.data;
            const isMineOffer = (isBuyer && o.madeBy === "BUYER") || (!isBuyer && o.madeBy === "SELLER");
            
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
                onEdit={(offerToEdit) => setModal({ open: true, mode: "create", baseAmount: offerToEdit.amount, editingOfferId: offerToEdit.id })}
                onDelete={(offerToDelete) => openOfferDeleteModal(offerToDelete.id)}
                onPay={handlePayOffer}
              />
            );
          })
        )}
      </div>

      {pendingImageUrl && (
        <div className="px-3 pt-3 bg-white flex items-center gap-3">
          <div className="relative inline-block">
            <img src={`${API_ROOT}${pendingImageUrl}`} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
            <button 
              onClick={clearPendingImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
            >
              ✕
            </button>
          </div>
          <span className="text-xs text-gray-500">Image attached. Type a caption or press Send.</span>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="border-t border-gray-200 px-3 py-2 flex gap-2 bg-white items-center">
        
        {isBuyer && (
          <button type="button" onClick={openCreateOffer} title="Make an offer"
            className="shrink-0 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 font-bold px-3 py-2 rounded-lg transition text-sm flex items-center gap-1"
          >
            <span>🏷️</span> Offer
          </button>
        )}

        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} title="Send a photo"
          className="shrink-0 text-gray-500 hover:text-maroon-700 transition p-2 disabled:opacity-50"
        >
          {uploadingImage ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-maroon-700 rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…"
          disabled={sending} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500"
        />
        <button type="submit" disabled={sending || (!draft.trim() && !pendingImageUrl)} className="bg-maroon-700 hover:bg-maroon-800 disabled:opacity-50 text-white font-semibold px-4 rounded-lg transition">
          Send
        </button>
      </form>

      <OfferModal open={modal.open} mode={modal.mode} product={safeProduct} baseAmount={modal.baseAmount} onClose={() => setModal({ open: false, mode: "create", baseAmount: "", editingOfferId: null })} onSubmit={handleOfferSubmit} />
      <ConfirmModal open={deleteModal.open} title="Delete message?" message="This message will be permanently removed." confirmLabel={actionBusy ? "Deleting..." : "Yes, delete"} cancelLabel="Cancel" tone="danger" onConfirm={confirmDelete} onCancel={closeDeleteModal} busy={actionBusy} />
      <ConfirmModal open={offerDeleteModal.open} title="Delete Offer?" message="This offer will be permanently removed." confirmLabel={actionBusy ? "Deleting..." : "Yes, delete"} cancelLabel="Cancel" tone="danger" onConfirm={confirmOfferDelete} onCancel={closeOfferDeleteModal} busy={actionBusy} />
    </div>
  );
}