import { motion } from "framer-motion";

const shimmer = {
  backgroundImage:
    "linear-gradient(90deg, rgba(148,163,184,0.14) 0%, rgba(255,255,255,0.55) 50%, rgba(148,163,184,0.14) 100%)",
  backgroundSize: "200% 100%"
};

const Loader = ({ label = "Loading...", variant = "default" }) => {
  if (variant === "cards") {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[28px] border border-white/30 bg-white/70 p-4 shadow-card dark:border-slate-800 dark:bg-slate-900/70"
          >
            <motion.div
              className="aspect-[16/11] rounded-3xl bg-slate-200/70 dark:bg-slate-800"
              style={shimmer}
              animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
            />
            <div className="mt-5 space-y-3">
              <motion.div
                className="h-5 rounded-full bg-slate-200/70 dark:bg-slate-800"
                style={shimmer}
                animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="h-4 w-4/5 rounded-full bg-slate-200/70 dark:bg-slate-800"
                style={shimmer}
                animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="h-10 rounded-2xl bg-slate-200/70 dark:bg-slate-800"
                style={shimmer}
                animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-slate-500 dark:text-slate-300">
      <div className="relative">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-brand-200 dark:border-brand-900"
          animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
        <motion.span
          className="relative block h-12 w-12 rounded-full border-4 border-brand-100 border-t-brand-500 dark:border-slate-800 dark:border-t-brand-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        />
      </div>
      <p className="text-sm font-semibold tracking-[0.18em] uppercase">{label}</p>
    </div>
  );
};

export default Loader;

