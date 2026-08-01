import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ThemeProvider } from "./lib/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.995 },
};

const pageTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-text-muted">
        <span className="w-5 h-5 border-2 border-text-primary/20 border-t-[#090909] rounded-full animate-spin" />
        <span className="uppercase tracking-widest text-xs">Loading</span>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const cart = useCart();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header cart={cart} />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname + location.search}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route
                  path="/product/:id"
                  element={<ProductDetail cart={cart} />}
                />
                <Route path="/cart" element={<Cart cart={cart} />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout cart={cart} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <SettingsProvider>
            <AuthProvider>
              <ProductsProvider>
                <WishlistProvider>
                  <CartProvider>
                    <BrowserRouter>
                      <AnimatedRoutes />
                    </BrowserRouter>
                  </CartProvider>
                </WishlistProvider>
              </ProductsProvider>
            </AuthProvider>
          </SettingsProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
