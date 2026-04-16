import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { useUISettings } from "../context/UISettingsContext";
import { animationService } from "../services/animationService";

const previewVariants = {
  fade: {
    initial: { opacity: 0.2 },
    animate: { opacity: 1 }
  },
  slide: {
    initial: { opacity: 0.2, x: -24 },
    animate: { opacity: 1, x: 0 }
  },
  zoom: {
    initial: { opacity: 0.2, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  }
};

const durationMap = {
  slow: 1,
  normal: 0.6,
  fast: 0.35
};

const AnimationSettingsPage = () => {
  const {
    animationSettings,
    refreshAnimationSettings,
    setAnimationSettings,
    settingsLoading
  } = useUISettings();
  const [form, setForm] = useState(animationSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(animationSettings);
  }, [animationSettings]);

  const preview = useMemo(
    () => previewVariants[form.animationType] || previewVariants.slide,
    [form.animationType]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const data = await animationService.updateSettings(form);
      setAnimationSettings(data);
      await refreshAnimationSettings();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading) {
    return <Loader label="Loading animation controls..." />;
  }

  return (
    <div className="space-y-8">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Motion system
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Animation Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
          Control how the student-facing UI feels across cards, routes, buttons,
          loaders, and live status transitions.
        </p>
      </AnimationWrapper>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <AnimationWrapper className="surface-card rounded-[32px] border border-white/50 p-6 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <label className="flex items-center justify-between rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Enable animations
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Turn the premium motion layer on or off for the entire app.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.animationEnabled}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    animationEnabled: event.target.checked
                  }))
                }
                className="h-5 w-5"
              />
            </label>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Animation type
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {["slide", "fade", "zoom"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, animationType: type }))
                    }
                    className={`rounded-3xl border px-4 py-5 text-left ${
                      form.animationType === type
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
                        : "border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <p className="font-semibold capitalize">{type}</p>
                    <p className="mt-1 text-sm opacity-75">
                      {type === "slide"
                        ? "Directional and lively"
                        : type === "fade"
                          ? "Minimal and calm"
                          : "Soft depth and scale"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Animation speed
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["slow", "normal", "fast"].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, animationSpeed: speed }))
                    }
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      form.animationSpeed === speed
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Animation Settings"}
            </Button>
          </form>
        </AnimationWrapper>

        <AnimationWrapper className="surface-card rounded-[32px] border border-white/50 p-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
            Live preview
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">
            Student UI motion sample
          </h2>

          <div className="mt-6 grid gap-4">
            {["Homepage hero", "Food card hover", "Order status updates"].map(
              (label, index) => (
                <motion.div
                  key={label}
                  initial={form.animationEnabled ? preview.initial : false}
                  animate={form.animationEnabled ? preview.animate : false}
                  transition={{
                    duration: durationMap[form.animationSpeed],
                    delay: index * 0.1
                  }}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {label}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {form.animationEnabled
                      ? `${form.animationType} animation at ${form.animationSpeed} speed`
                      : "Animations disabled"}
                  </p>
                </motion.div>
              )
            )}
          </div>
        </AnimationWrapper>
      </div>
    </div>
  );
};

export default AnimationSettingsPage;
