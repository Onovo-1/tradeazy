import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  };

  return (
    <nav className="bg-maroon-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="text-2xl font-extrabold tracking-tight shrink-0">
          Tradeazy
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <input
            name="q"
            type="text"
            placeholder="Search products..."
            className="w-full px-3 py-1.5 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-maroon-400"
          />
        </form>

        <div className="flex items-center gap-4 text-sm ml-auto shrink-0">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:text-maroon-200 transition">Login</Link>
              <Link
                to="/register"
                className="bg-maroon-600 hover:bg-maroon-500 px-4 py-1.5 rounded-lg font-semibold transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/messages"
                className="relative hover:text-maroon-200 transition hidden sm:inline"
              >
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/orders"
                className="hover:text-maroon-200 transition hidden sm:inline"
              >
                Orders
              </Link>
              <Link
                to="/favorites"
                className="hover:text-maroon-200 transition hidden sm:inline"
              >
                Saved
              </Link>
              <span className="text-maroon-200 hidden md:inline">
                Hi,{" "}
                <span className="font-semibold text-white">{user?.firstName}</span>
              </span>
              {user?.roles?.includes("ADMIN") && (
                <Link to="/admin" className="hover:text-maroon-200 transition">Admin</Link>
              )}
              {user?.roles?.includes("SELLER") && (
                <Link to="/seller" className="hover:text-maroon-200 transition">Seller</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-maroon-600 hover:bg-maroon-500 px-4 py-1.5 rounded-lg font-semibold transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}