import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { favoriteApi } from "../../api/favoriteApi";
import { chatApi } from "../../api/chatApi";
import { useAuth } from "../../context/AuthContext";
import ImageGallery from "../../components/product/ImageGallery";
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getById(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          const status = err.response?.status;
          if (status === 404) {
            setError("This product no longer exists or has been removed.");
          } else {
            setError(err.response?.data?.message || "Failed to load product.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    let cancelled = false;
    favoriteApi
      .check(id)
      .then((r) => {
        if (!cancelled) setFavorited(r.favorited);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, id]);

  const isOwnProduct =
    user?.id && product?.seller?.id && user.id === product.seller.id;

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnProduct) {
      alert("You cannot favorite your own product.");
      return;
    }
    if (favBusy) return;

    setFavBusy(true);
    try {
      if (favorited) {
        await favoriteApi.remove(product.id);
        setFavorited(false);
        setProduct((p) => ({
          ...p,
          favoriteCount: Math.max(0, (p.favoriteCount ?? 1) - 1),
        }));
      } else {
        await favoriteApi.add(product.id);
        setFavorited(true);
        setProduct((p) => ({
          ...p,
          favoriteCount: (p.favoriteCount ?? 0) + 1,
        }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      if (err.response?.status === 409) {
        setFavorited(true);
      } else {
        alert(msg);
      }
    } finally {
      setFavBusy(false);
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isOwnProduct) return;
    if (chatBusy) return;

    setChatBusy(true);
    try {
      const conversation = await chatApi.startConversation(product.id);
      navigate(`/messages?c=${conversation.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start chat.");
    } finally {
      setChatBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-maroon-200 border-t-maroon-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-lg text-gray-700 mb-2">{error}</p>
          <Link
            to="/browse"
            className="text-maroon-700 font-semibold hover:underline"
          >
            ← Back to browse
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount =
    product.discountPercent > 0 &&
    Number(product.effectivePrice) < Number(product.price);

  const sellerInitial =
    product.seller?.firstName?.[0]?.toUpperCase() ??
    product.seller?.username?.[0]?.toUpperCase() ??
    "?";

  const isSold = product.status === "SOLD";

  return (
    <div className="bg-white min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-maroon-700">Home</Link>
          {" / "}
          <Link to="/browse" className="hover:text-maroon-700">Browse</Link>
          {product.category && (
            <>
              {" / "}
              <Link
                to={`/browse?category=${product.category.slug}`}
                className="hover:text-maroon-700"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ImageGallery images={product.images} alt={product.name} />

          <div>
            {isSold && (
              <div className="mb-4 inline-block bg-gray-800 text-white text-sm font-bold px-3 py-1 rounded">
                SOLD
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-4 flex-wrap">
              <span className="text-3xl font-extrabold text-maroon-800">
                {formatNaira(product.effectivePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatNaira(product.price)}
                  </span>
                  <span className="bg-maroon-100 text-maroon-800 text-xs font-bold px-2 py-1 rounded">
                    -{product.discountPercent}% off
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                {product.condition}
              </span>
              {product.category && (
                <Link
                  to={`/browse?category=${product.category.slug}`}
                  className="text-xs bg-maroon-50 text-maroon-800 px-3 py-1 rounded-full hover:bg-maroon-100"
                >
                  {product.category.name}
                </Link>
              )}
              <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                Qty: {product.quantity}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-6">
              <div><span className="text-gray-400">Location:</span> {product.location}</div>
              <div><span className="text-gray-400">Posted:</span> {formatRelativeTime(product.createdAt)}</div>
              <div><span className="text-gray-400">Views:</span> {product.viewCount}</div>
              <div><span className="text-gray-400">Favorites:</span> {product.favoriteCount}</div>
            </div>

            {product.seller && (
              <div className="border border-gray-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-maroon-700 text-white flex items-center justify-center font-bold text-lg">
                  {sellerInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {product.seller.firstName} {product.seller.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{product.seller.username}
                    {product.seller.location && ` · ${product.seller.location}`}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {!isOwnProduct ? (
                <>
                  <button
                    type="button"
                    disabled={isSold || chatBusy}
                    onClick={handleChat}
                    className="flex-1 bg-maroon-700 hover:bg-maroon-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
                  >
                    {chatBusy ? "Opening chat…" : "💬 Chat with Seller"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={favBusy}
                    className={`sm:w-40 font-semibold py-3 rounded-lg transition border ${
                      favorited
                        ? "bg-maroon-700 text-white border-maroon-700 hover:bg-maroon-800"
                        : "border-maroon-700 text-maroon-700 hover:bg-maroon-50"
                    } disabled:opacity-60`}
                  >
                    {favorited ? "♥ Saved" : "♡ Save"}
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 w-full">
                  This is your listing.
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.specifications && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Specifications</h2>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line font-mono leading-relaxed">
                  {product.specifications}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}