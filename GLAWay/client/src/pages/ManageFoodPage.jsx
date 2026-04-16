import {
  AnimatePresence,
  motion
} from "framer-motion";
import {
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { resolveAssetUrl } from "../services/api";
import { foodService } from "../services/foodService";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "Block A",
  foodType: "Veg",
  rating: "4.5",
  prepTime: "10-15 mins",
  image: "",
  isAvailable: true
};

const ManageFoodPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await foodService.getItems();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load food items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setSelectedFile(null);
    setError("");
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const buildPayload = () => {
    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value);
    });

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = buildPayload();

      if (editingId) {
        await foodService.updateItem(editingId, payload);
      } else {
        await foodService.createItem(payload);
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save food item");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setSelectedFile(null);
    setError("");
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setSelectedFile(null);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      foodType: item.foodType || "Veg",
      rating: String(item.rating ?? 4.5),
      prepTime: item.prepTime || "10-15 mins",
      image: item.image?.startsWith("/uploads") ? "" : item.image || "",
      isAvailable: item.isAvailable
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await foodService.deleteItem(id);

      if (editingId === id) {
        resetForm();
      }

      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete food item");
    }
  };

  return (
    <div className="space-y-8">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Menu control
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
              Manage Food
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Add, edit, hide, or delete dishes with image uploads and polished modals.
            </p>
          </div>
          <Button icon={<PlusIcon className="h-4 w-4" />} onClick={openCreateModal}>
            Add Food Item
          </Button>
        </div>
      </AnimationWrapper>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <section>
        {loading ? (
          <Loader label="Loading menu items..." variant="cards" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const foodType = item.foodType || "Veg";
              const isVeg = foodType === "Veg";

              return (
                <AnimationWrapper key={item._id} delay={index * 0.03}>
                  <article className="overflow-hidden rounded-[30px] border border-white/50 bg-white/80 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                    <img
                      src={resolveAssetUrl(item.image)}
                      alt={item.name}
                      className="aspect-[16/11] w-full object-cover"
                    />
                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs uppercase tracking-[0.25em] text-brand-600">
                              {item.category}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isVeg
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
                              }`}
                            >
                              {foodType}
                            </span>
                          </div>
                          <h2 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </h2>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isAvailable
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Hidden"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                          ₹{item.price}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.prepTime}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          icon={<PencilSquareIcon className="h-4 w-4" />}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-red-500 dark:text-red-300"
                          icon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </article>
                </AnimationWrapper>
              );
            })}
          </div>
        )}
      </section>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
              onClick={resetForm}
              aria-label="Close modal overlay"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.24 }}
              className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl dark:bg-slate-950"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
                    {editingId ? "Edit dish" : "Create dish"}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
                    {editingId ? "Update food item" : "Add a new menu item"}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 p-2 dark:border-slate-700"
                >
                  <XMarkIcon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                </button>
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <input
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="name"
                  placeholder="Food name"
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="price"
                  placeholder="Price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={handleChange}
                />
                <select
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Subway">Subway</option>
                </select>
                <select
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="foodType"
                  value={form.foodType}
                  onChange={handleChange}
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
                <input
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="prepTime"
                  placeholder="Prep time"
                  value={form.prepTime}
                  onChange={handleChange}
                />
                <input
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="rating"
                  placeholder="Rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                />
                <input
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="image"
                  placeholder="Image URL (optional)"
                  value={form.image}
                  onChange={handleChange}
                />
                <textarea
                  className="md:col-span-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                  name="description"
                  rows="4"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                />
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <PhotoIcon className="h-4 w-4" />
                    Upload food image
                  </label>
                  <input
                    className="mt-2 block w-full text-sm text-slate-500 dark:text-slate-300"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setSelectedFile(event.target.files?.[0] || null)
                    }
                  />
                </div>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={form.isAvailable}
                    onChange={handleChange}
                  />
                  Available for ordering
                </label>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Food Item"
                        : "Add Food Item"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageFoodPage;
