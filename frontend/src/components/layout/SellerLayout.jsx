import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/seller", label: "Overview", end: true },
  { to: "/seller/products", label: "My Products" },
  { to: "/seller/products/new", label: "Add Product" },
];

export default function SellerLayout() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs uppercase font-bold text-gray-400 px-3 mb-2">
                Seller
              </p>
              <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                        isActive
                          ? "bg-maroon-700 text-white"
                          : "text-gray-700 hover:bg-maroon-50 hover:text-maroon-700"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}