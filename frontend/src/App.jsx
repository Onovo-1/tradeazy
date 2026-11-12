import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

// Layouts
import Navbar from "./components/layout/Navbar";
import SellerLayout from "./components/layout/SellerLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Public Pages
import Home from "./pages/public/Home";
import Browse from "./pages/public/Browse";
import ProductDetails from "./pages/public/ProductDetails";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Favorites from "./pages/public/Favorites";

// Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard";
import MyProducts from "./pages/seller/MyProducts";
import AddProduct from "./pages/seller/AddProduct";
import EditProduct from "./pages/seller/EditProduct";
import Rent from "./pages/seller/Rent";
import SellerOrders from "./pages/seller/SellerOrders"; 

// Buyer Pages
import Messages from "./pages/buyer/Messages";
import BuyerOrders from "./pages/buyer/Orders"; // <-- ADDED THIS IMPORT

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";

// Common
import ProtectedRoute from "./components/common/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favorites" element={<Favorites />} />

            {/* Protected Buyer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/messages" element={<Messages />} />
              <Route path="/orders" element={<BuyerOrders />} /> {/* <-- ADDED THIS ROUTE */}
            </Route>

            {/* Protected Seller Routes */}
            <Route element={<ProtectedRoute allowedRoles={["SELLER"]} />}>
              <Route path="/seller" element={<SellerLayout />}>
                <Route index element={<Navigate to="/seller/dashboard" replace />} />
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products" element={<MyProducts />} />
                <Route path="products/new" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="rent" element={<Rent />} />
                <Route path="orders" element={<SellerOrders />} /> 
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}