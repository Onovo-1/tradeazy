import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-maroon-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">
          Tradeazy
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:text-maroon-200 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-maroon-600 hover:bg-maroon-500 px-4 py-1.5 rounded-lg font-semibold transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-maroon-200">
                Hi, <span className="font-semibold text-white">{user?.firstName}</span>
              </span>
              {user?.roles?.includes("ADMIN") && (
                <Link to="/admin" className="hover:text-maroon-200 transition">
                  Admin
                </Link>
              )}
              {user?.roles?.includes("SELLER") && (
                <Link to="/seller" className="hover:text-maroon-200 transition">
                  Seller
                </Link>
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