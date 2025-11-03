import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Box } from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import ProtectedRoute from "../components/ProtectedRoute";
import "../styles/routeTransition.css";

import Home from "../pages/Home";
import ProductList from "../pages/ProductList";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import NewProductsPage from "../pages/NewProductsPage";
import SalePage from "../pages/SalePage";
import ForgotPassword from "../pages/ForgotPassword";
import AboutUsPage from "../pages/AboutUsPage";
import ContactPage from "../pages/ContactPage";
import ConfirmEmail from "../pages/ConfirmEmail";
import ConfirmRegister from "../pages/ConfirmRegister";
import VoucherWalletPage from "../pages/VoucherWalletPage";
import LuckyWheelPage from "../pages/LuckyWheelPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import MyOrdersPage from "../pages/MyOrdersPage";
import WishlistPage from "../pages/WishlistPage";
import PromotionsPage from "../pages/Promotions";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="route-wrapper">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          timeout={600} // thời gian trùng với CSS transition
          classNames={{
            enter: "page-enter",
            enterActive: "page-enter-active",
            exit: "page-exit",
            exitActive: "page-exit-active",
          }}
          unmountOnExit
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/new-products" element={<NewProductsPage />} />
            <Route path="/sale" element={<SalePage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/confirm-register" element={<ConfirmRegister />} />
            <Route path="/voucher-wallet" element={<VoucherWalletPage />} />
            <Route path="/lucky-wheel" element={<LuckyWheelPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default function AppRouter() {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#fff",
            }}
          >
            <Header />
            <Box component="main" sx={{ flex: 1, overflowX: "hidden" }}>
              <AnimatedRoutes />
            </Box>
            <Footer />
          </Box>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  );
}
