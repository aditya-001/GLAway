import { LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import AnimationWrapper from "../components/AnimationWrapper";
import { policySections } from "../content/siteInfo";

const PolicyPage = () => {
  return (
    <div className="space-y-8">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Trust center
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">
              GLAWay Policy
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
              Clear rules help students order confidently and help canteen staff resolve
              payment, pickup, and service issues fairly.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-brand-50 p-4 dark:bg-brand-500/10">
              <ShieldCheckIcon className="h-6 w-6 text-brand-600" />
              <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                Pickup transparency
              </p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800">
              <LockClosedIcon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
              <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                Safer account handling
              </p>
            </div>
          </div>
        </div>
      </AnimationWrapper>

      <div className="grid gap-6">
        {policySections.map((section, index) => (
          <AnimationWrapper
            key={section.title}
            delay={index * 0.04}
            className="surface-card rounded-[32px] border border-white/50 p-7 dark:border-slate-800"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Section {index + 1}
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">
              {section.title}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              {section.description}
            </p>
            <div className="mt-5 grid gap-3">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </AnimationWrapper>
        ))}
      </div>
    </div>
  );
};

export default PolicyPage;
