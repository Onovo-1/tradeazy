import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { favoriteApi } from "../../api/favoriteApi";
import { chatApi } from "../../api/chatApi";
import { offerApi } from "../../api/offerApi";
import { useAuth } from "../../context/AuthContext";
import ImageGallery from "../../components/product/ImageGallery";
import ConfirmModal from "../../components/common/ConfirmModal";
import { formatNaira, formatRelativeTime } from "../../utils/formatters";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await productApi.getById(id);
        
        if (!cancelled) {
          setProduct(data);

          // --- RECENTLY VISITED TRACKING ---
          const categoryId = data.category?.id || data.categoryId;
          if (categoryId) {
            const recent = JSON.parse(localStorage.getItem("tradeazy_recent_categories") || "[]");
            const updated = [categoryId, ...recent.filter(c => c !== categoryId)];
            localStorage.setItem("tradeazy_recent_categories", JSON.stringify(updated.slice(0, 5)));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.status === 404 ? "Product not found." : "Failed to load product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    let cancelled = false;
    
    const checkFav = async () => {
      try {
        const r = await favoriteApi.check(id);
        if (!cancelled) setFavorited(r.favorited);
      } catch (err) {}
    };
    
    checkFav();
    return () => { cancelled = true; };
  }, [isAuthenticated, id]);

  const isOwnProduct = user?.id && product?.seller?.id && user.id === product.seller.id;

  const handleSave = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (isOwnProduct || favBusy) return;
    setFavBusy(true);
    try {
      if (favorited) {
        await favoriteApi.remove(product.id);
        setFavorited(false);
        setProduct((p) => ({ ...p, favoriteCount: Math.max(0, (p.favoriteCount ?? 1) - 1) }));
      } else {
        await favoriteApi.add(product.id);
        setFavorited(true);
        setProduct((p) => ({ ...p, favoriteCount: (p.favoriteCount ?? 0) + 1 }));
      }
    } catch (err) {
      if (err.response?.status === 409) setFavorited(true);
    } finally {
      setFavBusy(false);
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) return navigate("/login");
    if (isOwnProduct || chatBusy) return;
    setChatBusy(true);
    try {
      const conversation = await chatApi.startConversation(product.id);
      navigate(`/messages?c=${conversation.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start conversation.");
    } finally {
      setChatBusy(false);
    }
  };

  const openBuyModal = () => {
    if (!isAuthenticated) return navigate("/login");
    if (isOwnProduct) return;
    setBuyModalOpen(true);
  };

  const confirmBuy = async () => {
    setBuyBusy(true);
    try {
      const conversation = await chatApi.startConversation(product.id);
      
      try {
        await offerApi.buyNow(conversation.id);
      } catch (offerErr) {
        console.log("Offer creation skipped/failed, redirecting to chat anyway.");
      }
      
      setBuyModalOpen(false);
      navigate(`/messages?c=${conversation.id}`);
      
    } catch (err) {
      alert(err.response?.data?.message || "Could not start conversation.");
      setBuyModalOpen(false);
    } finally {
      setBuyBusy(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  if (error || !product) return <div className="min-h-screen flex justify-center items-center">{error}</div>;

  const hasDiscount = product.discountPercent > 0 && Number(product.effectivePrice) < Number(product.price);
  const isSold = product.status === "SOLD";

  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-maroon-700">Home</Link>
          {" / "}
          <Link to="/browse" className="hover:text-maroon-700">Browse</Link>
          {" / "}
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* IMAGE GALLERY WITH CORNER WATERMARK */}
          <div className="relative">
            <ImageGallery images={product.images} alt={product.name} />
            
            {product.seller && (
              <div className="absolute bottom-4 right-4 pointer-events-none select-none z-10">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-lg">
                  <p className="text-lg md:text-xl font-black text-white/90 tracking-widest uppercase">
                    @{product.seller.username}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {isSold && <div className="mb-4 inline-block bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded">SOLD</div>}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-extrabold text-maroon-800">{formatNaira(product.effectivePrice)}</span>
              {hasDiscount && <span className="text-lg text-gray-400 line-through">{formatNaira(product.price)}</span>}
            </div>

            <div className="flex gap-2 mb-6">
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{product.condition}</span>
              <span className="text-xs bg-maroon-50 text-maroon-800 px-3 py-1 rounded-full">{product.category?.name}</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Qty: {product.quantity}</span>
            </div>

            <div className="grid grid-cols-2 text-sm text-gray-600 mb-6 gap-y-2">
              <div>Location: {product.location}</div>
              <div>Posted: {formatRelativeTime(product.createdAt)}</div>
              <div>Views: {product.viewCount}</div>
              <div>Favorites: {product.favoriteCount}</div>
            </div>

            {product.seller && (
              <div className="border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold text-lg">
                  {product.seller.firstName?.[0] || "?"}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{product.seller.firstName} {product.seller.lastName}</div>
                  <div className="text-xs text-gray-500">@{product.seller.username}</div>
                </div>
              </div>
            )}

            {!isOwnProduct ? (
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  disabled={isSold}
                  onClick={openBuyModal}
                  className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition"
                >
                  {isSold 
                    ? "This item has been sold" 
                    : `🛒 Buy Now — ${formatNaira(product.effectivePrice)}`}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isSold || chatBusy}
                    onClick={handleChat}
                    className="flex-1 border border-maroon-700 text-maroon-700 hover:bg-maroon-50 disabled:opacity-50 font-semibold py-3 rounded-lg transition"
                  >
                    {chatBusy ? "Opening..." : "💬 Chat with Seller"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={favBusy}
                    className={`w-40 font-semibold py-3 rounded-lg border transition ${
                      favorited ? "bg-maroon-700 text-white border-maroon-700" : "border-maroon-700 text-maroon-700 hover:bg-maroon-50"
                    }`}
                  >
                    {favorited ? "♥ Saved" : "♡ Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 mb-6">
                This is your listing.
              </div>
            )}

            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>

          </div>
        </div>
      </div>

      <ConfirmModal
        open={buyModalOpen}
        title="Contact Seller to Buy"
        message={`You are about to start a chat with the seller to purchase "${product.name}".\n\nAn automated buy request will be sent.`}
        confirmLabel={buyBusy ? "Sending..." : "Send Buy Request"}
        cancelLabel="Cancel"
        onConfirm={confirmBuy}
        onCancel={() => setBuyModalOpen(false)}
        busy={buyBusy}
      />
    </div>
  );
}