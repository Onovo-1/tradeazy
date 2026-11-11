import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi } from "../../api/productApi";
import ConfirmModal from "../../components/common/ConfirmModal";

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/api$/, "");

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null });
  const [deleting, setDeleting] = useState(false);

  // Mark Sold State
  const [soldModal, setSoldModal] = useState({ open: false, productId: null, currentQty: 0 });
  const [markingSold, setMarkingSold] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await productApi.listMyProducts({ page: 0, size: 100 });
        if (!cancelled) {
          setProducts(res.content || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load your products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openDeleteModal = (productId) => {
    setDeleteModal({ open: true, productId });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, productId: null });
  };

  const confirmDelete = async () => {
    const { productId } = deleteModal;
    if (!productId) return;

    setDeleting(true);
    try {
      await productApi.delete(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      closeDeleteModal();
    } catch (err) {
      alert("Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const openSoldModal = (productId, currentQty) => {
    setSoldModal({ open: true, productId, currentQty });
  };

  const closeSoldModal = () => {
    if (markingSold) return;
    setSoldModal({ open: false, productId: null, currentQty: 0 });
  };

  const confirmMarkSold = async () => {
    const { productId, currentQty } = soldModal;
    if (!productId) return;

    setMarkingSold(true);
    try {
      const updated = await productApi.markSold(productId);
      setProducts((prev) => 
        prev.map((p) => p.id === productId ? updated : p)
      );
      closeSoldModal();
    } catch (err) {
      alert("Failed to mark as sold.");
    } finally {
      setMarkingSold(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your listings in one place.</p>
        </div>
        <Link
          to="/seller/products/new"
          className="bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-5 py-2.5 rounded-lg transition text-center"
        >
          Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading your products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">You haven't listed any products yet.</p>
            <Link to="/seller/products/new" className="text-maroon-700 font-bold hover:underline">
              Create your first listing →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Price</th>
                  <th className="px-6 py-4 font-semibold">Qty</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  {/* ADDED text-center HERE */}
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const imageUrl = product.primaryImageUrl 
                    ? `${API_ROOT}${product.primaryImageUrl}` 
                    : null;
                  const isActive = product.status === "ACTIVE";
                  const isSold = product.status === "SOLD";
                  const isRemoved = product.status === "REMOVED";

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <span>{product.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-maroon-800">
                        ₦{Number(product.price).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-gray-700">
                        {product.quantity}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          isActive ? "bg-green-100 text-green-800" : 
                          isSold ? "bg-maroon-100 text-maroon-800" : 
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {product.status}
                        </span>
                      </td>

                      {/* ADDED text-center HERE to align with header */}
                      <td className="px-6 py-4 text-center space-x-3 whitespace-nowrap">
                        {isActive ? (
                          <>
                            <Link 
                              to={`/seller/products/edit/${product.id}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              Edit
                            </Link>
                            <button 
                              onClick={() => openSoldModal(product.id, product.quantity)}
                              className="text-maroon-700 hover:underline font-medium"
                            >
                              Mark Sold
                            </button>
                            <button 
                              onClick={() => openDeleteModal(product.id)}
                              className="text-red-600 hover:underline font-medium"
                            >
                              Remove
                            </button>
                          </>
                        ) : isRemoved ? (
                          <span className="text-gray-400 text-sm italic">Removed</span>
                        ) : (
                          <button 
                            onClick={() => openDeleteModal(product.id)}
                            className="text-red-600 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        title="Remove Product"
        message="Are you sure you want to permanently remove this product? It will no longer be visible to buyers."
        confirmLabel={deleting ? "Removing..." : "Yes, remove"}
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        busy={deleting}
      />

      {/* Mark Sold Confirmation Modal */}
      <ConfirmModal
        open={soldModal.open}
        title="Mark as Sold"
        message={`Mark 1 unit as sold? You currently have ${soldModal.currentQty} in stock. This will be reduced to ${soldModal.currentQty - 1}.`}
        confirmLabel={markingSold ? "Processing..." : "Yes, sell 1"}
        cancelLabel="Cancel"
        tone="warning"
        onConfirm={confirmMarkSold}
        onCancel={closeSoldModal}
        busy={markingSold}
      />
    </div>
  );
}