import Link from "next/link";
import {
  Check,
  ArrowRight,
  Zap,
  Building2,
  Sparkles,
} from "lucide-react";



const plans = [
  {
    name: "Pro",
    description: "For individuals and small teams managing their work.",
    icon: Zap,
    popular: false,
    features: [
      "Create and manage projects",
      "Organize and assign tasks",
      "Collaborate with team members",
      "Track task progress",
      "Project and task dashboards",
    ],
  },
  {
    name: "Business",
    description: "For growing teams that need more control and flexibility.",
    icon: Building2,
    popular: true,
    features: [
      "Everything included in Pro",
      "Advanced team collaboration",
      "Project and task management",
      "Role-based access control",
      "Centralized workspace management",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="px-5 pb-12 pt-20 sm:px-8 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-[1440px] text-center">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles size={16} />
            Simple and flexible plans
          </div>

          <h1 className="mx-auto max-w-3xl text-xl font-bold tracking-tight text-slate-950 md:text-3xl lg:text-4xl">
            Choose the right plan for your team
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Find the right tools to organize projects, manage tasks, and
            collaborate with your team using ProjectFlow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-9 ${
                  plan.popular
                    ? "border-blue-600 shadow-lg shadow-blue-100"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white">
                    Recommended
                  </span>
                )}

                <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon size={24} />
                </div>

                <h2 className="text-2xl font-bold text-slate-950">
                  {plan.name}
                </h2>

                <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>

                <div className="my-7 border-t border-slate-100" />

                <p className="mb-5 text-sm font-semibold text-slate-900">
                  What&apos;s included
                </p>

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-9 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  Get started with {plan.name}
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-slate-500">
          Ready to get started? Create your account and explore the
          ProjectFlow workspace. Subscription checkout will be connected
          to Stripe as part of the payment integration.
        </p>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px] overflow-hidden rounded-3xl bg-blue-600 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="text-xl font-bold text-white md:text-2xl lg:text-4xl">
            Bring your team&apos;s work together
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Keep projects organized, manage tasks efficiently, and help
            your team stay focused on what matters.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-blue-50"
          >
            Create your account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}