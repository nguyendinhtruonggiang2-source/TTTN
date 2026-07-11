import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import axios from "axios";
import axiosClient from "./api/axiosClient";
import "./App.css";
import Header from "./components/Header";
import { CategoryProvider } from "./contexts/CategoryContext";
import About from "./pages/About";
import Addresses from "./pages/Addresses";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import BranchDetail from "./pages/BranchDetail";
import BranchList from "./pages/BranchList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Compare from "./pages/Compare";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import FigureList from "./pages/FigureList";
import FlashSale from "./pages/FlashSale";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications"; // 👈 THÊM IMPORT
import OrderDetail from "./pages/OrderDetail";
import OrderHistory from "./pages/OrderHistory";
import Policies from "./pages/Policies";
import ProductDetail from "./pages/ProductDetail";
import ProductReviews from "./pages/ProductReviews"; // 👈 THÊM IMPORT
import Profile from "./pages/Profile";
import Promotions from "./pages/Promotions";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import TrackOrder from "./pages/TrackOrder"; // 👈 THÊM IMPORT
import Wishlist from "./pages/Wishlist";
import AiChatWidget from "./components/AiChatWidget";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import BranchManagement from "./components/admin/BranchManagement";
import CategoryManagement from "./components/admin/CategoryManagement";
import BannerManagement from "./components/admin/BannerManagement";
import DashboardStats from "./components/admin/DashboardStats"; // 👈 THÊM IMPORT
import FlashSaleManagement from "./components/admin/FlashSaleManagement";
import OrderManagement from "./components/admin/OrderManagement";
import PostManagement from "./components/admin/PostManagement";
import ProductManagement from "./components/admin/ProductManagement";
import PromotionManagement from "./components/admin/PromotionManagement";
import UserManagement from "./components/admin/UserManagement";
import AdminAiChat from "./components/admin/AdminAiChat";
import NotificationListener from "./components/NotificationListener";

// Component Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Component Admin Route (chỉ cho user có role ADMIN)
const AdminRoute = ({ children, user }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Component Public Route (chỉ truy cập khi chưa đăng nhập)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Component Wrapper cho Header để ẩn trên trang Login/Register/Forgot Password
const HeaderWrapper = ({ isAuthenticated, user, updateAuthStatus, onLogout }) => {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  if (!shouldShowHeader) return null;

  return (
    <Header 
      isAuthenticated={isAuthenticated} 
      user={user}
      updateAuthStatus={updateAuthStatus}
      onLogout={onLogout}
    />
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error("Error parsing initial user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    setIsAuthenticated(!!token);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
    
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      
      setIsAuthenticated(!!token);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateAuthStatus = (newUser = null) => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    setIsAuthenticated(!!token);
    
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } else if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <CategoryProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes với Header */}
          <Route path="/*" element={
            <>
              <HeaderWrapper 
                isAuthenticated={isAuthenticated} 
                user={user}
                updateAuthStatus={updateAuthStatus}
                onLogout={handleLogout}
              />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/figures" element={<FigureList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                
                {/* 👇 PRODUCT REVIEWS ROUTE */}
                <Route path="/product/:id/reviews" element={<ProductReviews />} />
                
                <Route path="/branches" element={<BranchList />} />
                <Route path="/branches/:id" element={<BranchDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/addresses" element={
                  <ProtectedRoute>
                    <Addresses />
                  </ProtectedRoute>
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ForgotPassword />} />
                <Route path="/terms" element={<div>Terms Page</div>} />
                <Route path="/privacy" element={<div>Privacy Page</div>} />
                
                <Route path="/login" element={
                  <PublicRoute>
                    <Login updateAuthStatus={updateAuthStatus} />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register updateAuthStatus={updateAuthStatus} />
                  </PublicRoute>
                } />
                
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile updateAuthStatus={updateAuthStatus} />
                  </ProtectedRoute>
                } />
                
                {/* 👇 WISHLIST ROUTE */}
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                
                {/* 👇 FLASH SALE ROUTE - Public */}
                <Route path="/flash-sale" element={<FlashSale />} />
                
                {/* 👇 NOTIFICATIONS ROUTE */}
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                
                {/* 👇 TRACK ORDER ROUTE - Public */}
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/track-order/:code" element={<TrackOrder />} />
                
                {/* 👇 ORDER ROUTES */}
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/addresses" element={
                  <ProtectedRoute>
                    <Addresses />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </>
          } />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <AdminRoute user={user}>
              <AdminLayout user={user} onLogout={handleLogout} />
            </AdminRoute>
          }>
            {/* 👉 REPLACE DASHBOARD WITH DASHBOARD STATS */}
            <Route index element={<DashboardStats />} />
            <Route path="dashboard" element={<DashboardStats />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="branches" element={<BranchManagement />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="promotions" element={<PromotionManagement />} />
            <Route path="flash-sale" element={<FlashSaleManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="ai-chat" element={<AdminAiChat />} />
          </Route>
        </Routes>
        <AiChatWidget />
        <NotificationListener />
      </BrowserRouter>
    </CategoryProvider>
  );
}

export default App;