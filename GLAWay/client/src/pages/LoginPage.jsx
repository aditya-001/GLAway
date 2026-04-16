import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useState } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { saveUserSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await authService.login(form);
      saveUserSession(data);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <AnimationWrapper className="relative overflow-hidden rounded-[36px] bg-slate-950 p-8 text-white shadow-card lg:p-10">
        <div className="floating-orb left-10 top-12 h-36 w-36 bg-orange-500/45" />
        <div className="floating-orb right-12 top-24 h-28 w-28 bg-red-500/30" />
        <div className="relative space-y-6">
          <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-orange-200">
            Student login
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight lg:text-5xl">
            Skip the queue and order from anywhere on campus.
          </h1>
          <p className="max-w-lg text-base leading-7 text-slate-300">
            Browse canteens, pay in seconds, and collect your food with a smart
            QR token when it is ready.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Blocks", value: "A, B, Subway" },
              { label: "Pickup", value: "QR Enabled" },
              { label: "Updates", value: "Live Status" }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 * index }}
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
      </AnimationWrapper>

      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Welcome back
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Login to GLAWay
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Track your orders, reorder favorites, and pick up faster.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing In..." : "Login"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-brand-600">
            Create an account
          </Link>
        </p>
      </AnimationWrapper>
    </div>
  );
};

export default LoginPage;

