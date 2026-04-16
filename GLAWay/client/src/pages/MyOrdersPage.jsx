import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";

const formatPickupLabel = (order) => {
  const pickupDate = order?.scheduledPickupAt || order?.estimatedReadyAt;

  if (order?.pickupTimeLabel) {
    return order.pickupTimeLabel;
  }

  if (!pickupDate) {
    return "Will update";
  }

  return new Date(pickupDate).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
};

const MyOrdersPage = ({ onOrderAgain }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return <Loader label="Loading your orders..." variant="cards" />;
  }

  return (
    <div className="space-y-6">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Order history
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Track every campus order
        </h1>
      </AnimationWrapper>

      {orders.length === 0 ? (
        <AnimationWrapper className="surface-card rounded-[30px] border border-white/50 p-8 text-center dark:border-slate-800">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            No orders yet
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Place your first canteen order to track it here.
          </p>
        </AnimationWrapper>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <AnimationWrapper key={order._id} delay={index * 0.04}>
              <div className="surface-card rounded-[30px] border border-white/50 p-6 dark:border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {order.orderId}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {order.pickupToken} • ₹{order.totalAmount} • Pickup{" "}
                      {formatPickupLabel(order)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/order-status/${order._id}`}>
                    <Button>View Status</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    icon={<ArrowPathIcon className="h-4 w-4" />}
                    onClick={() => onOrderAgain(order.items)}
                  >
                    Order Again
                  </Button>
                </div>
              </div>
            </AnimationWrapper>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
