import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { sellerApi } from "../../api/sellerApi";
import { categoryApi } from "../../api/categoryApi";
import CategoryPicker from "../../components/product/CategoryPicker";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tree, setTree] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    condition: "NEW",
    location: "",
    quantity: 1,
    discountPercent: 0,
    specifications: "",
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [treeData, product, imgs] = await Promise.all([
          categoryApi.tree(),
          sellerApi.myProduct(id),
          sellerApi.images(id).catch(() => []),
        ]);

        if (!cancelled) {
          setTree(treeData || []);
          setExistingImages(imgs || []);
          setForm({
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? "",
            categoryId: product.category?.id ?? "",
            condition: product.condition || "NEW",
            location: product.location || "",
            quantity: product.quantity ?? 1,
            discountPercent: product.discountPercent ?? 0,
            specifications: product.specifications || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        categoryId: parseInt(form.categoryId),
        quantity: parseInt(form.quantity),
        discountPercent: parseInt(form.discountPercent || 0),
      };

      await sellerApi.update(id, payload);

      for (const file of newImages) {
        try {
          await sellerApi.uploadImage(id, file);
        } catch (uploadErr) {
          console.warn("Image upload failed:", uploadErr);
        }
      }

      navigate("/seller/products");
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
        setError("Please fix the highlighted fields.");
      } else {
        setError(data?.message || "Failed to update product.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExistingImage = async (imageId) => {
    if (!confirm("Delete this image?")) return;
    try {
      await sellerApi.deleteImage(id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete image");
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await sellerApi.setPrimaryImage(id, imageId);
      const refreshed = await sellerApi.images(id);
      setExistingImages(refreshed || []);
    } catch (err) {
      alert(err.response?.data?.message || "Could not set primary image");
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent ${
      fieldErrors[field] ? "border-red-400" : "border-gray-300"
    }`;

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/seller/products" className="hover:text-maroon-700">
          My Products
        </Link>
        <span>/</span>
        <span className="text-gray-700">Edit Product</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Edit product</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass("name")}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={inputClass("description")}
          />
          {fieldErrors.description && (
            <p className="text-xs text-red-600 mt-1">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₦)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className={inputClass("price")}
            />
            {fieldErrors.price && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className={inputClass("condition")}
            >
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
              className={inputClass("quantity")}
            />
            {fieldErrors.quantity && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.quantity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className={inputClass("location")}
            />
            {fieldErrors.location && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.location}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              name="discountPercent"
              value={form.discountPercent}
              onChange={handleChange}
              min="0"
              max="100"
              className={inputClass("discountPercent")}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <CategoryPicker
            tree={tree}
            value={form.categoryId}
            onChange={(id) => setForm((f) => ({ ...f, categoryId: id }))}
            error={fieldErrors.categoryId}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specifications (optional)
          </label>
          <textarea
            name="specifications"
            value={form.specifications}
            onChange={handleChange}
            rows={3}
            className={inputClass("specifications")}
          />
        </div>

        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current images
            </label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={img.url}
                    alt="product"
                    className="w-full h-full object-cover"
                  />
                  {img.isPrimary && (
                    <div className="absolute top-1 left-1 bg-maroon-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      PRIMARY
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] flex">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img.id)}
                        className="flex-1 py-1 hover:bg-maroon-700"
                      >
                        Set primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="flex-1 py-1 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add more images (up to 5 total)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-maroon-700 file:text-white file:font-semibold hover:file:bg-maroon-800"
          />
          {newImages.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {newImages.map((file, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-0 right-0 bg-black/70 text-white text-xs px-1.5 py-0.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            to="/seller/products"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}