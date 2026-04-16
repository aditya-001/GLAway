import { AnimatePresence, motion } from "framer-motion";
import { useDeferredValue, useEffect, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";

const statuses = ["All", "Pending", "Preparing", "Ready"];

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

const AdminDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAdminOrders({
        status: statusFilter,
        search: deferredSearch
      });
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, deferredSearch]);

  const handleStatusChange = async (orderId, status) => {
    await orderService.updateStatus(orderId, status);
    loadOrders();
  };

  const metrics = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "Pending").length,
    preparing: orders.filter((order) => order.status === "Preparing").length,
    ready: orders.filter((order) => order.status === "Ready").length
  };

  return (
    <div className="space-y-6">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Live canteen operations
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
      </AnimationWrapper>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Orders", value: metrics.total },
          { label: "Pending", value: metrics.pending },
          { label: "Preparing", value: metrics.preparing },
          { label: "Ready", value: metrics.ready }
        ].map((metric, index) => (
          <AnimationWrapper
            key={metric.label}
            delay={index * 0.05}
            className="surface-card rounded-[30px] border border-white/50 p-5 dark:border-slate-800"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {metric.value}
            </p>
          </AnimationWrapper>
        ))}
      </section>

      <AnimationWrapper className="surface-card rounded-[30px] border border-white/50 p-5 dark:border-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  statusFilter === status
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order, token, user, or item"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-white lg:max-w-sm"
          />
        </div>
      </AnimationWrapper>

      {loading ? (
        <Loader label="Loading live orders..." />
      ) : orders.length === 0 ? (
        <AnimationWrapper className="surface-card rounded-[30px] border border-white/50 p-8 text-center dark:border-slate-800">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            No orders found
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Try another filter or search term.
          </p>
        </AnimationWrapper>
      ) : (
        <AnimationWrapper className="surface-card overflow-hidden rounded-[30px] border border-white/50 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-sm uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.tr
                      key={order._id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.24 }}
                      className="align-top"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {order.orderId}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {order.pickupToken}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Pickup {formatPickupLabel(order)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {order.user?.name || "Student"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {order.user?.email}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <p
                              key={`${order._id}-${index}`}
                              className="text-sm text-slate-600 dark:text-slate-300"
                            >
                              {item.name} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {statuses.slice(1).map((status) => (
                            <motion.button
                              key={status}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(order._id, status)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                order.status === status
                                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                              }`}
                            >
                              {status}
                            </motion.button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </AnimationWrapper>
      )}
    </div>
  );
};

export default AdminDashboardPage;
