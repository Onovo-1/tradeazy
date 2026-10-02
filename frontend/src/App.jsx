import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Home from "./pages/public/Home";
import Browse from "./pages/public/Browse";
import ProductDetails from "./pages/public/ProductDetails";
import SellerLayout from "./components/layout/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import MyProducts from "./pages/seller/MyProducts";
import AddProduct from "./pages/seller/AddProduct";
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Seller */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<MyProducts />} />
            <Route path="products/new" element={<AddProduct />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}