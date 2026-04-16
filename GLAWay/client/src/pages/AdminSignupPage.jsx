import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const { saveAdminSession } = useAuth();
  const [form, setForm] = useState({
    name: "",
    outlet: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await adminService.signup(form);
      saveAdminSession(data);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Staff onboarding
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
          Create an admin account
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Set up staff access for menu updates, live order handling, and animation controls.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
            type="text"
            name="name"
            placeholder="Admin name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
            type="text"
            name="outlet"
            placeholder="Outlet name (optional)"
            value={form.outlet}
            onChange={handleChange}
          />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 focus:outline-none dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
            type="email"
            name="email"
            placeholder="Admin email"
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
          <Button type="submit" variant="dark" className="w-full" disabled={submitting}>
            {submitting ? "Creating Admin..." : "Create Admin Account"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          Already have staff access?{" "}
          <Link to="/admin/login" className="font-semibold text-brand-600">
            Login here
          </Link>
        </p>
      </AnimationWrapper>

      <AnimationWrapper className="rounded-[36px] bg-slate-950 p-8 text-white shadow-card lg:p-10">
        <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-orange-200">
          Admin setup
        </p>
        <h2 className="mt-6 font-display text-4xl font-bold lg:text-5xl">
          Bring new canteen staff into the control deck in minutes.
        </h2>
        <p className="mt-4 max-w-lg text-slate-300">
          New admins can log in right after signup and start managing orders, menu items,
          and global motion settings.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            "Live order monitoring",
            "Food availability updates",
            "Campus-wide UI tuning"
          ].map((feature) => (
            <div key={feature} className="rounded-3xl bg-white/10 p-4 text-sm">
              {feature}
            </div>
          ))}
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default AdminSignupPage;
