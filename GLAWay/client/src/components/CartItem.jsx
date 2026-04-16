import { AnimatePresence, motion } from "framer-motion";
import { resolveAssetUrl } from "../services/api";

const CartItem = ({ item, onUpdateQuantity }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 18, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -18, scale: 0.98 }}
    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/70 p-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between"
  >
    <div className="flex items-center gap-4">
      <motion.img
        layoutId={`cart-${item._id}`}
        src={resolveAssetUrl(item.image)}
        alt={item.name}
        className="h-20 w-20 rounded-2xl object-cover"
      />
      <div>
        <h2 className="font-bold text-slate-900 dark:text-white">{item.name}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
        <p className="mt-1 text-sm font-semibold text-brand-600">₹{item.price}</p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onUpdateQuantity(item._id, item.quantity - 1)}
        className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        -
      </motion.button>
      <div className="min-w-8 text-center font-semibold text-slate-900 dark:text-white">
        <AnimatePresence mode="wait">
          <motion.span
            key={item.quantity}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            transition={{ duration: 0.18 }}
            className="inline-block"
          >
            {item.quantity}
          </motion.span>
        </AnimatePresence>
      </div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onUpdateQuantity(item._id, item.quantity + 1)}
        className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        +
      </motion.button>
    </div>
  </motion.div>
);

export default CartItem;

