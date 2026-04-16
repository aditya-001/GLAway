import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import CartItem from "../components/CartItem";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";

const DEFAULT_PREP_MINUTES = 15;
const PICKUP_SLOT_INTERVAL = 10;
const PICKUP_SLOT_COUNT = 4;

const extractPrepMinutes = (prepTime = "") => {
  const values = String(prepTime)
    .match(/\d+/g)
    ?.map(Number);

  if (!values?.length) {
    return DEFAULT_PREP_MINUTES;
  }

  return Math.max(...values);
};

const roundToNextSlot = (date) => {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);

  const remainder = rounded.getMinutes() % PICKUP_SLOT_INTERVAL;
  if (remainder !== 0) {
    rounded.setMinutes(rounded.getMinutes() + PICKUP_SLOT_INTERVAL - remainder);
  }

  return rounded;
};

const formatPickupTime = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);

const createPickupTimeOptions = (cartItems) => {
  if (!cartItems.length) {
    return [];
  }

  const prepMinutes = cartItems.reduce(
    (max, item) => Math.max(max, extractPrepMinutes(item.prepTime)),
    DEFAULT_PREP_MINUTES
  );
  const firstSlot = roundToNextSlot(new Date(Date.now() + prepMinutes * 60 * 1000));

  return Array.from({ length: PICKUP_SLOT_COUNT }, (_, index) => {
    const slot = new Date(firstSlot.getTime() + index * PICKUP_SLOT_INTERVAL * 60 * 1000);
    const minutesAway = Math.max(
      prepMinutes,
      Math.round((slot.getTime() - Date.now()) / (60 * 1000))
    );

    return {
      value: slot.toISOString(),
      title: index === 0 ? `Earliest • ${formatPickupTime(slot)}` : formatPickupTime(slot),
      timeLabel: formatPickupTime(slot),
      helper:
        index === 0
          ? `Recommended for this cart • about ${minutesAway} mins`
          : `${minutesAway} mins from now`
    };
  });
};

const CartPage = ({ cartItems, onUpdateQuantity, onClearCart, setLatestOrder }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPickupTime, setSelectedPickupTime] = useState("");

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      subtotal,
      platformFee: subtotal ? 8 : 0,
      total: subtotal ? subtotal + 8 : 0
    };
  }, [cartItems]);

  const pickupTimeOptions = useMemo(
    () => createPickupTimeOptions(cartItems),
    [cartItems]
  );

  const selectedPickupOption = pickupTimeOptions.find(
    (option) => option.value === selectedPickupTime
  );

  useEffect(() => {
    if (!pickupTimeOptions.length) {
      setSelectedPickupTime("");
      return;
    }

    if (!pickupTimeOptions.some((option) => option.value === selectedPickupTime)) {
      setSelectedPickupTime(pickupTimeOptions[0].value);
    }
  }, [pickupTimeOptions, selectedPickupTime]);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedPickupOption) {
      setError("Please select a pickup time before checkout.");
      return;
    }

    let shouldResetLoading = true;

    try {
      setLoading(true);
      setError("");

      const finalizeOrder = async (paymentMeta) => {
        const order = await orderService.placeOrder({
          items: cartItems.map((item) => ({
            foodItem: item._id,
            quantity: item.quantity
          })),
          requestedPickupAt: selectedPickupOption.value,
          paymentMethod: "Razorpay",
          paymentStatus: "Paid",
          ...paymentMeta
        });

        setLatestOrder(order);
        onClearCart();
        navigate(`/order-success/${order._id}`);
      };

      const razorpayOrder = await paymentService.createOrder(totals.total);

      if (razorpayOrder.isMock) {
        await finalizeOrder({
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: `mock_payment_${Date.now()}`
        });
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "GLAway",
        description: "Campus canteen order",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verification = await paymentService.verify(response);

            if (!verification.verified) {
              throw new Error("Payment verification failed");
            }

            await finalizeOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: verification.razorpayPaymentId
            });
          } catch (handlerError) {
            setError(
              handlerError.response?.data?.message ||
                handlerError.message ||
                "Payment verification failed"
            );
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: "#f97316"
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      razorpay.open();
      shouldResetLoading = false;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Checkout failed. Add Razorpay keys and backend services first."
      );
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  };

  if (!cartItems.length) {
    return (
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-10 text-center dark:border-slate-800">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Add some campus favorites and come back for checkout.
        </p>
        <Link to="/home" className="mt-6 inline-block">
          <Button>Browse Menu</Button>
        </Link>
      </AnimationWrapper>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-6 dark:border-slate-800">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Cart
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
              Almost there
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cartItems.length} items ready for checkout
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
              />
            ))}
          </div>
        </AnimatePresence>
      </AnimationWrapper>

      <AnimationWrapper className="overflow-hidden rounded-[36px] bg-slate-950 p-6 text-white shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
          Smart checkout
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold">Bill details</h2>

        <motion.div layout className="mt-6 space-y-4 text-sm text-slate-300">
          <div className="flex justify-between">
            <span>Items total</span>
            <span>₹{totals.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform fee</span>
            <span>₹{totals.platformFee}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
            <span>To pay</span>
            <span>₹{totals.total}</span>
          </div>
        </motion.div>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
            Select pickup time
          </p>
          <div className="mt-4 grid gap-3">
            {pickupTimeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedPickupTime(option.value)}
                className={`rounded-[24px] border p-4 text-left transition ${
                  selectedPickupTime === option.value
                    ? "border-orange-300 bg-orange-400/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-200"
                }`}
              >
                <p className="font-semibold">{option.title}</p>
                <p className="mt-1 text-sm text-slate-300">{option.helper}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm text-slate-200">
          Your pickup token, QR pass, and selected pickup slot will be saved right
          after payment.
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <Button onClick={handleCheckout} className="mt-6 w-full" disabled={loading}>
          {loading ? "Processing..." : "Pay with Razorpay"}
        </Button>
      </AnimationWrapper>
    </div>
  );
};

export default CartPage;
