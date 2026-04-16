import { CheckCircleIcon, StarIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import Button from "../components/Button";
import { feedbackTopics, supportContacts } from "../content/siteInfo";
import { useAuth } from "../context/AuthContext";
import { feedbackService } from "../services/feedbackService";

const initialForm = {
  name: "",
  email: "",
  orderId: "",
  category: feedbackTopics[0],
  rating: 5,
  message: ""
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:focus:ring-brand-500/10";

const FeedbackPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: user?.name || current.name,
      email: user?.email || current.email
    }));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        ...form,
        rating: Number(form.rating)
      };
      const response = await feedbackService.create(payload);
      setSuccessMessage(response.message || "Feedback submitted successfully.");
      setForm((current) => ({
        ...initialForm,
        name: user?.name || current.name,
        email: user?.email || current.email
      }));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to submit feedback right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Voice of campus
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">
          Share Feedback
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
          Tell us what worked, what slowed you down, or what the canteen should add
          next. We use this feedback to improve ordering, support, and menu quality.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Name
              </label>
              <input
                className={inputClassName}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email
              </label>
              <input
                className={inputClassName}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Topic
              </label>
              <select
                className={inputClassName}
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {feedbackTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Order ID
              </label>
              <input
                className={inputClassName}
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                placeholder="Optional: GLA-XXXX"
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Rating
            </label>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, rating: value }))}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    form.rating === value
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <StarIcon className="h-4 w-4" />
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Message
            </label>
            <textarea
              className={`${inputClassName} min-h-[170px] resize-y`}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe the issue, suggestion, or support request..."
              required
            />
          </div>

          {successMessage && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              {errorMessage}
            </div>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </AnimationWrapper>

      <AnimationWrapper className="rounded-[36px] bg-slate-950 p-8 text-white shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200">
          Feedback promise
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold">
          Real comments, real service improvements.
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Students can use this form for app issues, payment trouble, food concerns,
          or new menu suggestions.
        </p>

        <div className="mt-6 space-y-4">
          {[
            "Tell us the order ID if the feedback is tied to a purchase.",
            "Choose the right category so support can triage faster.",
            "Urgent payment or pickup issues should also be escalated to customer care."
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4"
            >
              <CheckCircleIcon className="mt-0.5 h-5 w-5 text-orange-200" />
              <p className="text-sm text-slate-200">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl bg-white/10 p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-200">
            Need immediate help
          </p>
          <p className="mt-3 text-lg font-semibold">{supportContacts.phoneLabel}</p>
          <a href={supportContacts.emailHref} className="mt-2 block text-sm text-slate-200">
            {supportContacts.emailLabel}
          </a>
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default FeedbackPage;
