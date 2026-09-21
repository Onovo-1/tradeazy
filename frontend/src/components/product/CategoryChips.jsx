import { Link } from "react-router-dom";

export default function CategoryChips({ categories, activeSlug }) {
  if (!categories || categories.length === 0) return null;

  const baseClass = "px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap";
  const activeClass = "bg-maroon-700 text-white";
  const inactiveClass = "bg-white border border-gray-300 text-gray-700 hover:border-maroon-500 hover:text-maroon-700";

  return (
    <div className="flex gap-2 overflow-x-auto py-2 -mx-1 px-1 scrollbar-hide">
      <Link
        to="/browse"
        className={`${baseClass} ${!activeSlug ? activeClass : inactiveClass}`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/browse?category=${cat.slug}`}
          className={`${baseClass} ${activeSlug === cat.slug ? activeClass : inactiveClass}`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}