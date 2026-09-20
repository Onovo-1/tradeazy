import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-maroon-200 border-t-maroon-700" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
      <div className="text-center space-y-4 px-6">
        <h1 className="text-6xl font-extrabold text-maroon-700">Tradeazy</h1>
        <p className="text-gray-600 text-lg">Your marketplace, made easy.</p>

        {isAuthenticated ? (
          <div className="mt-8 p-6 rounded-xl border border-gray-200 shadow-sm inline-block">
            <p className="text-sm text-gray-500 mb-1">Logged in as</p>
            <p className="font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-maroon-700 font-mono mt-1">
              {user.roles?.join(", ")}
            </p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-gray-500">
            Please log in or create an account to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}