import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useUISettings } from "./context/UISettingsContext";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import AnimationSettingsPage from "./pages/AnimationSettings";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CartPage from "./pages/CartPage";
import CustomerCarePage from "./pages/CustomerCarePage";
import FeedbackPage from "./pages/FeedbackPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ManageFoodPage from "./pages/ManageFoodPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import PolicyPage from "./pages/PolicyPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import SignupPage from "./pages/SignupPage";

const CART_KEY = "glaway_cart";

const routeVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  zoom: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 }
  }
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { animationSettings, shouldAnimate, duration } = useUISettings();
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((cartItem) => cartItem._id === item._id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, quantity) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => setCartItems([]);

  const handleOrderAgain = (orderItems) => {
    const nextCart = orderItems
      .map((item) => {
        if (!item.foodItem?._id) {
          return null;
        }

        return {
          _id: item.foodItem._id,
          name: item.name || item.foodItem.name,
          price: item.price,
          category: item.foodItem.category || "Campus Special",
          image: item.foodItem.image,
          quantity: item.quantity
        };
      })
      .filter(Boolean);

    if (!nextCart.length) {
      return;
    }

    setCartItems(nextCart);
    navigate("/cart");
  };

  const currentRouteVariants = useMemo(
    () => routeVariants[animationSettings.animationType] || routeVariants.slide,
    [animationSettings.animationType]
  );

  return (
    <div className="flex min-h-screen flex-col text-slate-900 dark:text-slate-100">
      <Navbar cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={shouldAnimate ? currentRouteVariants.initial : false}
            animate={shouldAnimate ? currentRouteVariants.animate : false}
            exit={shouldAnimate ? currentRouteVariants.exit : false}
            transition={
              shouldAnimate
                ? {
                    duration,
                    ease: [0.22, 1, 0.36, 1]
                  }
                : undefined
            }
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route
                path="/home"
                element={<HomePage onAddToCart={handleAddToCart} />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/policy" element={<PolicyPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/customer-care" element={<CustomerCarePage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/signup" element={<AdminSignupPage />} />
              <Route
                path="/cart"
                element={
                  <CartPage
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateQuantity}
                    onClearCart={handleClearCart}
                    setLatestOrder={setLatestOrder}
                  />
                }
              />
              <Route
                path="/order-success/:id"
                element={
                  <ProtectedRoute>
                    <OrderSuccessPage
                      latestOrder={latestOrder}
                      onOrderAgain={handleOrderAgain}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-status"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage onOrderAgain={handleOrderAgain} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-status/:id"
                element={
                  <ProtectedRoute>
                    <OrderStatusPage
                      latestOrder={latestOrder}
                      onOrderAgain={handleOrderAgain}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage onOrderAgain={handleOrderAgain} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderStatusPage
                      latestOrder={latestOrder}
                      onOrderAgain={handleOrderAgain}
                    />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute admin>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage-food"
                element={
                  <ProtectedRoute admin>
                    <ManageFoodPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/animation-settings"
                element={
                  <ProtectedRoute admin>
                    <AnimationSettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
