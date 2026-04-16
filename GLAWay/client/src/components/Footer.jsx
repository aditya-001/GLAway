import {
  ArrowUpRightIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { socialLinks, supportContacts } from "../content/siteInfo";
import { useUISettings } from "../context/UISettingsContext";

const exploreLinks = [
  { label: "Home", to: "/home" },
  { label: "Cart", to: "/cart" },
  { label: "Orders", to: "/order-status" },
  { label: "Admin", to: "/admin/login" }
];

const supportLinks = [
  { label: "Policy", to: "/policy" },
  { label: "Feedback", to: "/feedback" },
  { label: "Customer Care", to: "/customer-care" }
];

const Footer = () => {
  const { shouldAnimate } = useUISettings();

  return (
    <footer className="mt-12 border-t border-white/40 bg-white/50 dark:border-slate-800 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <motion.section
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[34px] bg-slate-950 px-6 py-8 text-white shadow-card"
        >
          <div className="floating-orb left-0 top-8 h-32 w-32 bg-orange-500/40" />
          <div className="floating-orb right-4 top-6 h-28 w-28 bg-red-500/30" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-orange-200">
                Help and trust
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">
                Campus ordering should feel reliable from payment to pickup.
              </h2>
              <p className="mt-3 text-sm text-slate-300">
                Reach customer care, share feedback, or review GLAWay policies anytime.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/feedback" className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950">
                  Share Feedback
                  <ArrowUpRightIcon className="h-4 w-4" />
                </span>
              </Link>
              <Link
                to="/customer-care"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white"
              >
                Contact Support
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <p className="font-display text-2xl font-bold text-slate-950 dark:text-white">
                GLAWay
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
                A smarter university canteen experience for faster ordering, smoother
                pickup, and better communication between students and staff.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={supportContacts.phoneHref}
                className="surface-card flex items-start gap-3 rounded-3xl border border-white/50 p-4 dark:border-slate-800"
              >
                <PhoneIcon className="mt-0.5 h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Customer care
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {supportContacts.phoneLabel}
                  </p>
                </div>
              </a>
              <a
                href={supportContacts.emailHref}
                className="surface-card flex items-start gap-3 rounded-3xl border border-white/50 p-4 dark:border-slate-800"
              >
                <EnvelopeIcon className="mt-0.5 h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {supportContacts.emailLabel}
                  </p>
                </div>
              </a>
              <div className="surface-card flex items-start gap-3 rounded-3xl border border-white/50 p-4 dark:border-slate-800">
                <MapPinIcon className="mt-0.5 h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Help desk
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {supportContacts.address}
                  </p>
                </div>
              </div>
              <div className="surface-card flex items-start gap-3 rounded-3xl border border-white/50 p-4 dark:border-slate-800">
                <ShieldCheckIcon className="mt-0.5 h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Support hours
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {supportContacts.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Explore
            </p>
            <div className="mt-4 space-y-2">
              {exploreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-900/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Support
            </p>
            <div className="mt-4 space-y-2">
              {supportLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-900/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
              Social handles
            </p>
            <div className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="surface-card flex items-center justify-between rounded-3xl border border-white/50 p-4 transition hover:-translate-y-0.5 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {link.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {link.handle}
                    </p>
                  </div>
                  <ArrowUpRightIcon className="h-4 w-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            Policy, customer care, and feedback routes are available from the footer on every page.
          </p>
          <p>GLAWay © {new Date().getFullYear()} • Built for modern campus food ordering</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
