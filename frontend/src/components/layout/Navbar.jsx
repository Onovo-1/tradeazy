import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import axiosClient from "../../api/axiosClient";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [orderCount, setOrderCount] = useState(0);

  const isAdmin = user?.roles?.includes("ADMIN");
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isSellerPage = location.pathname.startsWith("/seller");
  const isAdminPage = location.pathname.startsWith("/admin");

  // Fetch order count when user is logged in
  useEffect(() => {
    if (user && !isAdmin) {
      axiosClient.get("/orders/unread-count")
        .then(res => setOrderCount(res.data.unreadOrders || 0))
        .catch(() => {});
    }
  }, [user, isAdmin, location.pathname]);

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

  // Combine message count and order count for the global badge
  const totalNotifications = (count || 0) + (orderCount || 0);

  return (
    <nav className="bg-maroon-900 text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo takes Admin to Admin Dashboard, others to Home */}
        <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center gap-2">
          <img src="/tradeazy-favicon.png" alt="Logo" className="h-8 w-auto object-contain" />
          <span className="text-2xl font-bold tracking-tight">Tradeazy</span>
        </Link>

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
                    <button className="flex items-center gap-2 hover:text-maroon-200 py-4 transition relative">
                      <span>Hi, {user.firstName}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      {/* GLOBAL NOTIFICATION DOT ON THE AVATAR */}
                      {totalNotifications > 0 && (
                         <span className="absolute top-2 right-0 flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                         </span>
                      )}
                    </button>
                    
                    <div className="absolute right-0 mt-0 w-56 bg-white rounded-lg shadow-lg py-1 text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                      <Link to="/favorites" className="block px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center gap-2">
                        <span className="text-gray-400">♡</span> Saved
                      </Link>
                      
                      <Link to="/messages" className="block px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">💬</span> Messages
                        </div>
                        {count > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </Link>

                      <Link to="/orders" className="block px-4 py-2.5 hover:bg-gray-100 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📦</span> Orders
                        </div>
                        {orderCount > 0 && (
                          <span className="bg-maroon-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {orderCount}
                          </span>
                        )}
                      </Link>

                      {user.roles?.includes("SELLER") && (
                        <>
                          <div className="border-t border-gray-200 my-1"></div>
                          <Link 
                            to="/seller/dashboard" 
                            className="block px-4 py-2.5 hover:bg-maroon-50 text-sm flex items-center gap-2 font-bold text-maroon-800 transition-colors"
                          >
                            <span className="text-lg">🏪</span> Seller Dashboard
                          </Link>
                        </>
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