import { motion } from "framer-motion";
import { useUISettings } from "../context/UISettingsContext";

const variants = {
  primary:
    "bg-gradient-to-r from-brand-500 to-red-500 text-white shadow-lg shadow-orange-200/60 dark:shadow-orange-900/40",
  secondary:
    "border border-slate-200 bg-white/90 text-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100",
  dark: "bg-slate-950 text-white dark:bg-white dark:text-slate-950",
  ghost:
    "bg-transparent text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800/70"
};

const Button = ({
  children,
  className = "",
  variant = "primary",
  type = "button",
  icon,
  ...props
}) => {
  const { shouldAnimate } = useUISettings();

  return (
    <motion.button
      type={type}
      whileHover={shouldAnimate ? { scale: 1.03, y: -1 } : undefined}
      whileTap={shouldAnimate ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;

