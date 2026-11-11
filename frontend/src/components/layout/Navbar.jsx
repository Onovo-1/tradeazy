import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.roles?.includes("ADMIN");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isSellerPage = location.pathname.startsWith("/seller");
  const isAdminPage = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Debugging log to see what the navbar thinks the count is
  console.log("Navbar Render - Unread Count:", count);

  return (
    <nav className="bg-maroon-900 text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2">
          <img src="/tradeazy-favicon.png" alt="Logo" className="h-8 w-auto object-contain" />
          <span className="text-2xl font-bold tracking-tight">Tradeazy</span>
        </Link>

        {/* Search Bar */}
        {!isAdmin && !isAuthPage && !isSellerPage && !isAdminPage && (
          <form onSubmit={handleSearch} className="ml-8 w-full max-w-md hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-1.5 rounded-full text-gray-900 text-sm focus:outline-none"
            />
          </form>
        )}

        {/* User Menu */}
        {!isAuthPage && (
          <div className="flex items-center gap-4 ml-auto">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin/dashboard" className="flex items-center gap-2 text-sm font-semibold hover:text-maroon-200 transition">
                      🛡️ Admin Dashboard
                    </Link>
                    <span className="text-gray-400 text-sm">|</span>
                    <span className="text-sm">Hi, Admin</span>
                  </>
                ) : (
                  <div className="relative group">
                    <button className="flex items-center gap-2 hover:text-maroon-200 py-4 transition">
                      <span>Hi, {user.firstName}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg py-1 text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link to="/favorites" className="block px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
                        <span className="text-gray-400">♡</span> Saved
                      </Link>
                      
                      {/* Messages with Unread Badge */}
                      <Link to="/messages" className="block px-4 py-2 hover:bg-gray-100 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">💬</span> Messages
                        </div>
                        {count > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </Link>

                      <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
                        <span className="text-gray-400">📦</span> Orders
                      </Link>
                      
                      {user.roles?.includes("SELLER") && (
                        <Link to="/seller/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
                          <span className="text-gray-400">🏪</span> Seller Dashboard
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleLogout} 
                  className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition duration-150 ease-in-out ml-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="hover:text-maroon-200 text-sm">Login</Link>
                <Link to="/register" className="bg-maroon-700 hover:bg-maroon-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}