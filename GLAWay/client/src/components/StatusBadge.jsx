import { motion } from "framer-motion";

const statusStyles = {
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
  Preparing: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200",
  Ready:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
};

const statusLabels = {
  Pending: "Pending",
  Preparing: "Preparing",
  Ready: "Ready for Pickup"
};

const StatusBadge = ({ status }) => (
  <motion.span
    layout
    transition={{ type: "spring", stiffness: 320, damping: 22 }}
    className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}
  >
    {statusLabels[status] || status}
  </motion.span>
);

export default StatusBadge;

