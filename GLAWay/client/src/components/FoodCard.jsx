import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useUISettings } from "../context/UISettingsContext";
import { resolveAssetUrl } from "../services/api";
import Button from "./Button";

const FoodCard = ({ item, onAdd }) => {
  const { shouldAnimate } = useUISettings();
  const foodType = item.foodType || "Veg";
  const isVeg = foodType === "Veg";

  return (
    <motion.article
      layout
      whileHover={shouldAnimate ? { y: -8, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="group overflow-hidden rounded-[30px] border border-white/40 bg-white/80 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <motion.img
          src={resolveAssetUrl(item.image)}
          alt={item.name}
          className="h-full w-full object-cover"
          animate={
            shouldAnimate
              ? { y: [0, -7, 0], scale: [1, 1.03, 1] }
              : undefined
          }
          transition={{
            duration: 5.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-900/75 dark:text-slate-100">
          <SparklesIcon className="h-4 w-4 text-brand-500" />
          {item.category}
        </div>
        <div
          className={`absolute right-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
            isVeg
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isVeg ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          {foodType}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {item.description}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
            {item.rating} ★
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{item.price}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.prepTime}</p>
          </div>
          <motion.div
            whileHover={shouldAnimate ? { scale: 1.08 } : undefined}
            whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          >
            <Button onClick={() => onAdd(item)} disabled={!item.isAvailable}>
              {item.isAvailable ? "Add To Cart" : "Sold Out"}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

export default FoodCard;
