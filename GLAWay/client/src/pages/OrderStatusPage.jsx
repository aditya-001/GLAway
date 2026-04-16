import { ClockIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";

const statusSteps = ["Pending", "Preparing", "Ready"];

const getProgress = (status) => {
  const index = statusSteps.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / statusSteps.length) * 100;
};

const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

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

const OrderStatusPage = ({ latestOrder, onOrderAgain }) => {
  const { id } = useParams();
  const [order, setOrder] = useState(
    latestOrder?._id === id ? latestOrder : null
  );
  const [loading, setLoading] = useState(!order);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const loadOrder = async () => {
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
    const intervalId = window.setInterval(loadOrder, 5000);

    return () => window.clearInterval(intervalId);
  }, [id, latestOrder]);

  useEffect(() => {
    if (!order?.estimatedReadyAt || order.status === "Ready") {
      setCountdown(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(order.estimatedReadyAt).getTime() - Date.now()) / 1000)
      );
      setCountdown(diff);
    };

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [order]);

  const progress = useMemo(() => getProgress(order?.status), [order?.status]);
  const pickupTimeLabel = useMemo(() => formatPickupLabel(order), [order]);

  if (loading) {
    return <Loader label="Loading your order..." />;
  }

  if (!order) {
    return <p className="text-slate-600">Order not found.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-600">
              Live status tracking
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {order.orderId}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Pickup token: {order.pickupToken}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Selected pickup: {pickupTimeLabel}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-8 rounded-[30px] bg-slate-50 p-5 dark:bg-slate-800/70">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-slate-900 dark:text-white">Progress</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round(progress)}%
            </p>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-3 rounded-full bg-gradient-to-r from-brand-500 to-red-500"
            />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {statusSteps.map((status, index) => {
              const currentIndex = statusSteps.indexOf(order.status);
              const isComplete = index <= currentIndex;

              return (
                <motion.div
                  key={status}
                  layout
                  className={`rounded-3xl border p-4 ${
                    isComplete
                      ? "border-brand-200 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/10"
                      : "border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900/70"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {status}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <ClockIcon className="h-4 w-4" />
              <p className="text-sm font-semibold">ETA countdown</p>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {order.status === "Ready" ? "00:00" : formatCountdown(countdown)}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Payment
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">
              ₹{order.totalAmount}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {order.paymentStatus}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Pickup slot
            </p>
            <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">
              {pickupTimeLabel}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Saved with your order
            </p>
          </div>
        </div>

        {order.status === "Ready" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10"
          >
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
              Your order is ready for pickup
            </h2>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-200/80">
              Head to the counter with your QR code or pickup token.
            </p>
          </motion.div>
        )}

        <div className="mt-8 space-y-4">
          {order.items.map((item, index) => (
            <motion.div
              key={`${item.name}-${index}`}
              layout
              className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Qty {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                ₹{item.price * item.quantity}
              </p>
            </motion.div>
          ))}
        </div>
      </AnimationWrapper>

      <AnimationWrapper className="rounded-[36px] bg-slate-950 p-8 text-white shadow-card">
        <h2 className="font-display text-2xl font-bold">QR Pickup Pass</h2>
        <p className="mt-2 text-sm text-slate-300">
          Show this QR code or token to collect your order at the canteen.
        </p>

        <div className="mt-6 flex justify-center rounded-[28px] bg-white p-6">
          <QRCodeSVG value={order.qrPayload} size={220} />
        </div>

        <div className="mt-6 space-y-3">
          <Link to="/order-status" className="block">
            <Button variant="secondary" className="w-full">
              Back to Orders
            </Button>
          </Link>
          <Button variant="secondary" className="w-full" onClick={() => onOrderAgain(order.items)}>
            Order Again
          </Button>
          <Link to="/home" className="block">
            <Button variant="secondary" className="w-full">
              Order More Food
            </Button>
          </Link>
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default OrderStatusPage;
