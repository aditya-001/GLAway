import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";

const confetti = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: `${6 + index * 6.4}%`,
  delay: index * 0.04
}));

const formatPickupLabel = (order) => {
  const pickupDate = order?.scheduledPickupAt || order?.estimatedReadyAt;

  if (order?.pickupTimeLabel) {
    return order.pickupTimeLabel;
  }

  if (!pickupDate) {
    return "Will update shortly";
  }

  return new Date(pickupDate).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
};

const OrderSuccessPage = ({ latestOrder, onOrderAgain }) => {
  const { id } = useParams();
  const [order, setOrder] = useState(
    latestOrder?._id === id ? latestOrder : null
  );
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    const loadOrder = async () => {
      if (latestOrder?._id === id) {
        setOrder(latestOrder);
        setLoading(false);
        return;
      }

      try {
        const data = await orderService.getById(id);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, latestOrder]);

  const etaText = useMemo(() => {
    if (!order?.estimatedReadyAt) {
      return "Campus canteen ETA will update shortly.";
    }

    return `Estimated pickup by ${new Date(order.estimatedReadyAt).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    )}`;
  }, [order]);

  const pickupTimeText = useMemo(() => formatPickupLabel(order), [order]);

  if (loading) {
    return <Loader label="Loading your confirmation..." />;
  }

  if (!order) {
    return <p className="text-slate-600">Order not found.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
      <AnimationWrapper className="relative overflow-hidden rounded-[36px] bg-white/85 p-8 shadow-card backdrop-blur-xl dark:bg-slate-900/85">
        {confetti.map((piece) => (
          <motion.span
            key={piece.id}
            className="absolute top-0 h-3 w-3 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500"
            style={{ left: piece.left }}
            initial={{ opacity: 0, y: -10, rotate: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, 80, 160, 220], rotate: 240 }}
            transition={{ duration: 2.4, delay: piece.delay, repeat: Infinity, repeatDelay: 1.4 }}
          />
        ))}

        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
          >
            <CheckCircleIcon className="h-12 w-12" />
          </motion.div>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
            <SparklesIcon className="h-4 w-4" />
            Payment successful
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold text-slate-900 dark:text-white">
            Order confirmed and queued.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
            Save your order ID and pickup token for quick collection. Your animated
            pickup pass is ready below.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Order ID
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {order.orderId}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Pickup Token
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {order.pickupToken}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/70">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Current Status
              </p>
              <div className="mt-2">
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Selected pickup: {pickupTimeText}
            </p>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200/80">{etaText}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={`/order-status/${order._id}`}>
              <Button>Track Order Status</Button>
            </Link>
            <Button variant="secondary" onClick={() => onOrderAgain(order.items)}>
              Order Again
            </Button>
          </div>
        </div>
      </AnimationWrapper>

      <AnimationWrapper className="rounded-[36px] bg-slate-950 p-8 text-white shadow-card">
        <h2 className="font-display text-2xl font-bold">Pickup QR Pass</h2>
        <p className="mt-2 text-sm text-slate-300">
          Present this QR code at the pickup counter for quick verification.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 flex justify-center rounded-[28px] bg-white p-6"
        >
          <QRCodeSVG value={order.qrPayload} size={220} />
        </motion.div>

        <p className="mt-6 text-sm text-slate-300">
          Total paid: <span className="font-semibold text-white">₹{order.totalAmount}</span>
        </p>
      </AnimationWrapper>
    </div>
  );
};

export default OrderSuccessPage;
