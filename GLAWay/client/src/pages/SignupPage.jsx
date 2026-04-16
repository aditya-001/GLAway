import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

const SignupPage = () => {
  const navigate = useNavigate();
  const { saveUserSession } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const data = await authService.signup(form);
      saveUserSession(data);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Join the queue-free campus
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Create your GLAWay account
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Order from Block A, Block B, and Subway with one smart account.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
          />
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
            {submitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600">
            Login
          </Link>
        </p>
      </AnimationWrapper>

      <AnimationWrapper className="rounded-[36px] bg-gradient-to-br from-orange-500 via-red-500 to-slate-950 p-8 text-white shadow-card lg:p-10">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-orange-100">
            Why students love it
          </p>
          <h2 className="font-display text-4xl font-bold lg:text-5xl">
            Faster pickup, cleaner menus, smoother campus food runs.
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Animated live order tracking",
              "Dark mode for late-night cravings",
              "Order again in one tap"
            ].map((feature) => (
              <div key={feature} className="rounded-3xl bg-white/10 p-4 text-sm">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default SignupPage;

