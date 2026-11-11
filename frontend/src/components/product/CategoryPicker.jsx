import { useMemo } from "react";

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {Category[]} [children]
 */

/**
 * @param {Object} props
 * @param {Category[]} props.tree
 * @param {number|string} props.value
 * @param {(id: number|string) => void} props.onChange
 * @param {string} [props.error]
 */
export default function CategoryPicker({ tree = [], value, onChange, error }) {
  // 1. Figure out which Main Category is currently selected
  const selectedMainId = useMemo(() => {
    if (!value) return "";
    
    const numericValue = Number(value);

    // Check if the selected value is a top-level category
    const isMain = tree.find((c) => Number(c.id) === numericValue);
    if (isMain) return isMain.id.toString();

    // Otherwise, it's a subcategory. Find its parent.
    for (const main of tree) {
      if (main.children && main.children.length > 0) {
        const isSub = main.children.find((sub) => Number(sub.id) === numericValue);
        if (isSub) return main.id.toString();
      }
    }
    return "";
  }, [value, tree]);

  // 2. Get the subcategories for the selected main category
  const selectedMainCat = tree.find((c) => Number(c.id) === Number(selectedMainId));
  const subcategories = selectedMainCat?.children || [];

  // 3. Handlers
  const handleMainChange = (e) => {
    const newMainId = e.target.value;
    onChange(newMainId ? Number(newMainId) : "");
  };

  const handleSubChange = (e) => {
    const newSubId = e.target.value;
    if (newSubId) {
      onChange(Number(newSubId));
    } else {
      onChange(selectedMainId ? Number(selectedMainId) : "");
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent ${
      hasError ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Main Category Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
          Main Category
        </label>
        <select
          value={selectedMainId}
          onChange={handleMainChange}
          className={inputClass(error)}
        >
          <option value="">Select main category</option>
          {tree.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
          Subcategory (Optional)
        </label>
        <select
          value={subcategories.some((c) => Number(c.id) === Number(value)) ? value : ""}
          onChange={handleSubChange}
          disabled={!selectedMainId || subcategories.length === 0}
          className={`${inputClass(error)} disabled:bg-gray-100 disabled:text-gray-400`}
        >
          <option value="">
            {!selectedMainId 
              ? "Select main category first" 
              : subcategories.length === 0 
                ? "No subcategories available" 
                : "All subcategories"}
          </option>
          {subcategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="sm:col-span-2">
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}