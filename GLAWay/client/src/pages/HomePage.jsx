import { ArrowRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import FoodCard from "../components/FoodCard";
import Loader from "../components/Loader";
import { resolveAssetUrl } from "../services/api";
import { foodService } from "../services/foodService";

const categories = ["All", "Block A", "Block B", "Subway"];
const foodTypeOptions = [
  {
    value: "All",
    eyebrow: "Full menu",
    title: "Everything on one screen",
    description: "Browse the complete menu, then narrow it down whenever you want.",
    accentClass:
      "border-slate-200 bg-white/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
  },
  {
    value: "Veg",
    eyebrow: "Green pick",
    title: "Pure veg section",
    description: "Paneer, snacks, drinks, and all the campus vegetarian favorites.",
    accentClass:
      "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
  },
  {
    value: "Non-Veg",
    eyebrow: "Protein pick",
    title: "Non-veg section",
    description: "Chicken and egg options grouped separately for faster selection.",
    accentClass:
      "border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100"
  }
];

const HomePage = ({ onAddToCart }) => {
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFoodType, setSelectedFoodType] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);

      try {
        const params = {};
        if (selectedCategory !== "All") params.category = selectedCategory;
        if (selectedFoodType !== "All") params.foodType = selectedFoodType;
        if (deferredSearch) params.search = deferredSearch;
        const data = await foodService.getItems(params);
        setItems(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [selectedCategory, selectedFoodType, deferredSearch]);

  const featuredItems = useMemo(() => items.slice(0, 6), [items]);

  return (
    <div className="space-y-10">
      <AnimationWrapper className="relative overflow-hidden rounded-[38px] bg-slate-950 px-6 py-10 text-white shadow-card md:px-10 lg:py-12">
        <div className="floating-orb left-4 top-8 h-40 w-40 bg-orange-500/45" />
        <div className="floating-orb right-10 top-16 h-28 w-28 bg-red-500/35" />
        <div className="floating-orb bottom-10 right-24 h-36 w-36 bg-blue-500/15" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-orange-200">
              Premium campus ordering
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Order from your canteen with Swiggy-style speed and smoother campus UX.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              Search across Block A, Block B, and Subway, add favorites with animated
              cards, pay instantly, and track your pickup token in real time.
            </p>

            <div className="flex max-w-2xl items-center gap-3 rounded-[28px] border border-white/10 bg-white/10 p-3 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <MagnifyingGlassIcon className="h-5 w-5 text-orange-200" />
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dosa, wraps, coffee, sandwiches..."
                className="w-full bg-transparent text-white placeholder:text-slate-300 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Pickup", value: "QR + token" },
                { label: "Experience", value: "Dark mode" },
                { label: "Control", value: "Admin tuned motion" }
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-white/10 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-orange-200">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-bold">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
              Campus picks
            </p>
            <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="min-w-[230px] rounded-[28px] bg-white/10 p-4 backdrop-blur"
                >
                  <img
                    src={resolveAssetUrl(item.image)}
                    alt={item.name}
                    className="h-32 w-full rounded-3xl object-cover"
                  />
                  <p className="mt-4 text-sm uppercase tracking-[0.25em] text-orange-200">
                    {item.category}
                  </p>
                  <p className="mt-2 text-xl font-bold">{item.name}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                    <span>{item.prepTime}</span>
                    <span>₹{item.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </AnimationWrapper>

      <AnimationWrapper className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Explore by outlet
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
              Sliding categories
            </h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 md:flex">
            Swipe or scroll <ArrowRightIcon className="h-4 w-4" />
          </div>
        </div>

        <motion.div layout className="hide-scrollbar flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              layout
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "bg-white/80 text-slate-700 shadow-sm dark:bg-slate-900/80 dark:text-slate-200"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      </AnimationWrapper>

      <AnimationWrapper className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Food preference
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
              Veg / Non-Veg section
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Quickly switch between vegetarian and non-vegetarian dishes without
            losing your outlet or search selection.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {foodTypeOptions.map((option) => {
            const isActive = selectedFoodType === option.value;

            return (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedFoodType(option.value)}
                className={`rounded-[28px] border p-5 text-left transition ${
                  isActive
                    ? "border-slate-950 bg-slate-950 text-white shadow-card dark:border-white dark:bg-white dark:text-slate-950"
                    : option.accentClass
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                    isActive
                      ? "text-orange-200 dark:text-slate-500"
                      : option.value === "Veg"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : option.value === "Non-Veg"
                          ? "text-rose-600 dark:text-rose-300"
                          : "text-brand-600 dark:text-slate-400"
                  }`}
                >
                  {option.eyebrow}
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold">{option.title}</h3>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    isActive ? "text-slate-200 dark:text-slate-600" : ""
                  }`}
                >
                  {option.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </AnimationWrapper>

      <AnimationWrapper>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Menu
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
              {selectedFoodType === "All" ? "Popular right now" : `${selectedFoodType} picks`}
            </h2>
          </div>
        </div>

        {loading ? (
          <Loader label="Loading menu..." variant="cards" />
        ) : items.length === 0 ? (
          <div className="surface-card rounded-[30px] border border-white/50 p-8 text-center dark:border-slate-800">
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              No items found
            </h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Try another search, switch canteen block, or change the veg/non-veg
              selection.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <AnimationWrapper key={item._id} delay={index * 0.03}>
                <FoodCard item={item} onAdd={onAddToCart} />
              </AnimationWrapper>
            ))}
          </div>
        )}
      </AnimationWrapper>
    </div>
  );
};

export default HomePage;
