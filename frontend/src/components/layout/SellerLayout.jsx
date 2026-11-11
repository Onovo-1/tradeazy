import { NavLink, Outlet } from "react-router-dom";

export default function SellerLayout() {
  const menuItems = [
    { name: "Overview", path: "/seller/dashboard" },
    { name: "My Products", path: "/seller/products" },
    { name: "Add Product", path: "/seller/products/new" },
    { name: "Orders", path: "/seller/orders" },
    { name: "Rent", path: "/seller/rent" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seller</h3>
          </div>
          <nav className="flex flex-col p-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/seller/dashboard"}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-maroon-700 text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-maroon-700"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}