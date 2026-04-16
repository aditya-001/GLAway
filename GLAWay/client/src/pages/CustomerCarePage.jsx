import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import AnimationWrapper from "../components/AnimationWrapper";
import {
  careHighlights,
  customerCareFaqs,
  socialLinks,
  supportContacts
} from "../content/siteInfo";

const actionClassName =
  "inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition";

const CustomerCarePage = () => {
  return (
    <div className="space-y-8">
      <AnimationWrapper className="surface-card rounded-[36px] border border-white/50 p-8 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Support desk
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-slate-900 dark:text-white">
          Customer Care
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Reach the GLAWay support desk for order issues, payment concerns, token
          problems, or canteen service questions.
        </p>
      </AnimationWrapper>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: PhoneIcon,
            label: "Call us",
            value: supportContacts.phoneLabel,
            href: supportContacts.phoneHref
          },
          {
            icon: EnvelopeIcon,
            label: "Email us",
            value: supportContacts.emailLabel,
            href: supportContacts.emailHref
          },
          {
            icon: MapPinIcon,
            label: "Support desk",
            value: supportContacts.address
          },
          {
            icon: ClockIcon,
            label: "Hours",
            value: supportContacts.hours
          }
        ].map((item, index) => {
          const Icon = item.icon;

          const content = (
            <AnimationWrapper
              delay={index * 0.03}
              className="surface-card block h-full rounded-[30px] border border-white/50 p-6 dark:border-slate-800"
            >
              <Icon className="h-6 w-6 text-brand-600" />
              <p className="mt-4 text-sm uppercase tracking-[0.25em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                {item.value}
              </p>
            </AnimationWrapper>
          );

          if (item.href) {
            return (
              <a key={item.label} href={item.href}>
                {content}
              </a>
            );
          }

          return <div key={item.label}>{content}</div>;
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <AnimationWrapper className="surface-card rounded-[32px] border border-white/50 p-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
            Why reach out
          </p>
          <div className="mt-5 space-y-4">
            {careHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/feedback"
              className={`${actionClassName} gap-2 bg-gradient-to-r from-brand-500 to-red-500 text-white shadow-lg shadow-orange-200/60 dark:shadow-orange-900/40`}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Send Feedback
            </Link>
            <a
              href={supportContacts.phoneHref}
              className={`${actionClassName} border border-slate-200 bg-white/90 text-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100`}
            >
              Call Customer Care
            </a>
          </div>
        </AnimationWrapper>

        <AnimationWrapper className="surface-card rounded-[32px] border border-white/50 p-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
            Frequently asked
          </p>
          <div className="mt-5 space-y-4">
            {customerCareFaqs.map((item, index) => (
              <div
                key={item.question}
                className={`rounded-3xl border p-5 ${
                  index === 0
                    ? "border-brand-200 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/10"
                    : "border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70"
                }`}
              >
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.question}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </AnimationWrapper>
      </div>

      <AnimationWrapper className="surface-card rounded-[32px] border border-white/50 p-6 dark:border-slate-800">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
          Social support handles
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-slate-200 bg-white/80 p-5 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <p className="font-semibold text-slate-900 dark:text-white">{link.label}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {link.handle}
              </p>
            </a>
          ))}
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default CustomerCarePage;
