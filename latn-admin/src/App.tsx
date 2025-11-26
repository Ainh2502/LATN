import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// 🔐 Auth & layout
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';

// 📊 Dashboard
import Dashboard from './pages/Dashboard';

// 🛍️ Products & Categories
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import CategoryList from './pages/categories/CategoryList';

// 🧾 Orders
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';

// 👥 Customers & Users
import CustomerList from './pages/Customers/CustomerList';
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';

// 🎁 Promotions & Coupons
import PromotionList from './pages/Promotions/PromotionList';

// ⭐ Reviews
import ReviewList from './pages/Reviews/ReviewList';

// ⚙️ Settings & Profile
import SystemConfig from './pages/Settings/SystemConfig';
import PaymentConfig from './pages/Settings/PaymentConfig';
import Profile from './pages/Profile';

// 🚫 Fallback
import NotFound from './pages/NotFound';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductVariantList from './pages/Products/ProductVariantList';
import BrandList from './pages/Brand/BrandList';

import CouponEditPage from './pages/Promotions/CouponEditPage';
import PromotionEditPage from './pages/Promotions/PromotionEditPage';
import CustomerAddressesPage from './pages/Customers/CustomerAddressesPage';
import CustomerForm from './pages/Customers/CustomerForm';
import BannerPage from './pages/BannerPage';
import ReportDashboard from './pages/ReportDashboard';

// ✅ Route bảo vệ (nếu chưa có token → login)
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 🧩 Route đăng nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* 🧩 Tất cả route sau đăng nhập nằm trong layout admin */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* ✅ Dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ✅ Products & Categories */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} /> {/* 🟣 chỉnh sửa */}
          <Route path="categories" element={<CategoryList />} />
          <Route path="/products/:id/variants" element={<ProductVariantList />} />
          <Route path="/brands" element={<BrandList />} />

          {/* ✅ Orders */}
          <Route path="orders" element={<OrderList />} />

          {/* ✅ Customers */}
<Route path="/customers" element={<CustomerList />} />
<Route path="/customers/:id" element={<CustomerForm />} />
<Route path="/customers/:id/addresses" element={<CustomerAddressesPage />} />
<Route path="/reviews" element={<ReviewList />} />


            {/* ✅ Promotions & Coupons */}
        <Route path="promotions" element={<PromotionList />} />
            <Route path="promotions/new" element={<PromotionEditPage />} />
            <Route path="promotions/:id/edit" element={<PromotionEditPage />} />
          <Route path="coupons/:id/edit" element={<CouponEditPage />} />
          <Route path="coupons/new" element={<CouponEditPage />} />
                    <Route path="banners" element={<BannerPage />} />

          {/* ✅ Reviews */}
<Route path="reports" element={<ReportDashboard />} />  {/* ✅ thêm tab mới */}

          {/* ✅ Settings */}
          <Route path="settings" element={<SystemConfig />} />
          <Route path="settings/payment" element={<PaymentConfig />} />

          {/* ✅ Users */}
          <Route path="users" element={<UserList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id" element={<UserForm />} />

          {/* ✅ Profile */}
          <Route path="profile" element={<Profile />} />


          {/* 🚫 Trang lỗi / fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
