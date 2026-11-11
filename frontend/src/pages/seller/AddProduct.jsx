import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { categoryApi } from "../../api/categoryApi";
import { productApi } from "../../api/productApi";
import { sellerApi } from "../../api/sellerApi";
import { subscriptionApi } from "../../api/subscriptionApi";

export default function AddProduct() {
  const navigate = useNavigate();
  
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Subscription check state
  const [hasRent, setHasRent] = useState(null); // null = checking, true = active, false = no rent

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    condition: "NEW",
    quantity: 1,
    location: "",
    discountPercent: 0,
    mainCategoryId: "",
    subCategoryId: "",
    specifications: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);

  // 1. Check rent status + load categories
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Check subscription first
        const sub = await subscriptionApi.getCurrent().catch(() => null);
        if (!cancelled) {
          setHasRent(!!sub);
        }

        // Load categories
        const cats = await categoryApi.list();
        if (!cancelled) {
          setCategoryTree(cats || []);
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load page data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "price") {
      const rawValue = value.replace(/[^0-9]/g, "");
      const formattedValue = rawValue ? parseInt(rawValue, 10).toLocaleString("en-US") : "";
      setFormData((prev) => ({ ...prev, price: formattedValue }));
      return;
    }

    if (name === "mainCategoryId") {
      setFormData((prev) => ({ ...prev, mainCategoryId: value, subCategoryId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files.slice(0, 5)); 
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      setError("Please upload at least one image for your product.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      let finalCategoryId;
      
      if (formData.mainCategoryId === "other") {
        finalCategoryId = 99; 
      } else {
        finalCategoryId = formData.subCategoryId 
          ? Number(formData.subCategoryId) 
          : Number(formData.mainCategoryId);
      }

      const cleanPrice = Number(formData.price.replace(/,/g, ""));

      const payload = {
        name: formData.name,
        description: formData.description,
        price: cleanPrice,
        condition: formData.condition,
        quantity: Number(formData.quantity),
        location: formData.location,
        discountPercent: Number(formData.discountPercent),
        categoryId: finalCategoryId,
        specifications: formData.specifications,
      };

      const createdProduct = await productApi.create(payload);
      
      if (selectedImages.length > 0) {
        for (const file of selectedImages) {
          try {
            await sellerApi.uploadImage(createdProduct.id, file);
          } catch (err) {
            console.error("Failed to upload image", err);
          }
        }
      }

      navigate("/seller/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product. Check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMainCategory = categoryTree.find((c) => c.id === Number(formData.mainCategoryId));
  const subCategories = selectedMainCategory?.children || [];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Checking your subscription...</div>;
  }

  // Block the form if no active rent
  if (!hasRent) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="text-5xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You need an active Rent subscription to add products
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your Rent is what keeps your listings live on Tradeazy. 
          Pay for a plan to start adding products.
        </p>
        <Link
          to="/seller/rent"
          className="inline-block bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Go to Rent →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add a new product</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below to list your item.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text" name="name" required
            value={formData.name} onChange={handleChange}
            placeholder="e.g. iPhone 15 Pro Max"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            name="description" rows="4"
            value={formData.description} onChange={handleChange}
            placeholder="Describe your product in detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
            <input
              type="text" name="price" required
              value={formData.price} onChange={handleChange}
              placeholder="e.g. 500,000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              name="condition" required
              value={formData.condition} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
            >
              <option value="NEW">New</option>
              <option value="USED">Used</option>
              <option value="REFURBISHED">Refurbished</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number" name="quantity" required min="1"
              value={formData.quantity} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text" name="location" required
              value={formData.location} onChange={handleChange}
              placeholder="e.g. Lagos, Nigeria"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main Category</label>
            <select
              name="mainCategoryId" required
              value={formData.mainCategoryId} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
            >
              <option value="" disabled hidden className="font-bold text-gray-400">
                Select main category
              </option>
              {categoryTree.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="other" className="font-bold text-maroon-700">
                ➕ Others (Not listed here)
              </option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory (Optional)</label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 disabled:bg-gray-100"
              disabled={!formData.mainCategoryId || formData.mainCategoryId === "other" || subCategories.length === 0}
            >
              <option value="">
                {!formData.mainCategoryId 
                  ? "Select main category first" 
                  : formData.mainCategoryId === "other"
                    ? "N/A for Others"
                    : subCategories.length === 0 
                      ? "No subcategories available" 
                      : "Select subcategory (optional)"}
              </option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
          <input
            type="number" name="discountPercent" min="0" max="100"
            value={formData.discountPercent} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (optional)</label>
          <textarea
            name="specifications" rows="3"
            value={formData.specifications} onChange={handleChange}
            placeholder="One spec per line, e.g.&#10;Color: Blue&#10;Storage: 256GB"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images (Required, up to 5)
          </label>
          <input
            type="file" multiple accept="image/*" required
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-maroon-50 file:text-maroon-700 hover:file:bg-maroon-100"
          />
          
          {selectedImages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">
                {selectedImages.length} image(s) selected
              </p>
              <div className="flex flex-wrap gap-3">
                {selectedImages.map((file, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 bg-black/70 text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-bl-lg"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-maroon-700 text-white text-[9px] font-bold text-center py-0.5">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button
            type="submit" disabled={submitting}
            className="bg-maroon-700 hover:bg-maroon-800 text-white font-bold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create product"}
          </button>
          <button
            type="button" onClick={() => navigate("/seller/dashboard")}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}