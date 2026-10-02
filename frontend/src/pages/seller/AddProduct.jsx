import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sellerApi } from "../../api/sellerApi";
import { categoryApi } from "../../api/categoryApi";

export default function AddProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
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
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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

      const created = await sellerApi.create(payload);

      // Upload images (each in sequence, ignoring individual failures)
      for (const file of images) {
        try {
          await sellerApi.uploadImage(created.id, file);
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
        setError(data?.message || "Failed to create product.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent ${
      fieldErrors[field] ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/seller/products" className="hover:text-maroon-700">
          My Products
        </Link>
        <span>/</span>
        <span className="text-gray-700">Add Product</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Add a new product</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Name */}
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
            placeholder="e.g. iPhone 15 Pro Max"
          />
          {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className={inputClass("description")}
            placeholder="Describe your product in detail..."
          />
          {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
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
            {fieldErrors.price && <p className="text-xs text-red-600 mt-1">{fieldErrors.price}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className={inputClass("categoryId")}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && <p className="text-xs text-red-600 mt-1">{fieldErrors.categoryId}</p>}
          </div>

          {/* Condition */}
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

          {/* Quantity */}
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
            {fieldErrors.quantity && <p className="text-xs text-red-600 mt-1">{fieldErrors.quantity}</p>}
          </div>

          {/* Location */}
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
              placeholder="Lagos, Nigeria"
              className={inputClass("location")}
            />
            {fieldErrors.location && <p className="text-xs text-red-600 mt-1">{fieldErrors.location}</p>}
          </div>

          {/* Discount */}
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

        {/* Specifications */}
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
            placeholder="One spec per line, e.g.&#10;Color: Blue&#10;Storage: 256GB"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images (up to 5)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFiles}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-maroon-700 file:text-white file:font-semibold hover:file:bg-maroon-800"
          />
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((file, i) => (
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
                    onClick={() => removeImage(i)}
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
            {submitting ? "Creating..." : "Create product"}
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