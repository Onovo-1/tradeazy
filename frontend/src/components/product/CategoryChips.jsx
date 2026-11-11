import { Link } from "react-router-dom";

export default function CategoryChips({ categories, activeSlug }) {
  if (!categories || categories.length === 0) return null;

  const baseClass = "px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap border";
  const activeClass = "bg-maroon-700 text-white border-maroon-700";
  const inactiveClass = "bg-white border-gray-300 text-gray-700 hover:border-maroon-500 hover:text-maroon-700";

  return (
    // CHANGED: overflow-x-auto to overflow-visible on desktop, and disabled truncation
    <div className="flex gap-2 overflow-x-auto md:overflow-visible py-2 -mx-1 px-1">
      <Link
        to="/browse"
        className={`${baseClass} ${!activeSlug ? activeClass : inactiveClass}`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <div key={cat.id} className="relative group">
          <Link
            to={`/browse?category=${cat.slug}`}
            className={`block ${baseClass} ${activeSlug === cat.slug ? activeClass : inactiveClass}`}
          >
            {cat.name}
          </Link>

          {/* Hover Dropdown for Subcategories */}
          {cat.children && cat.children.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {cat.children.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/browse?category=${sub.slug}`}
                  className="block px-4 py-2 hover:bg-maroon-50 hover:text-maroon-700 text-sm"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}