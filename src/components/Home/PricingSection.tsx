
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

type PricingPlan = {
  name: string;
  subtitle: string;
  features: string[];
  buttonText: string;
  href: string;
  popular?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "Pro",
    subtitle: "For growing teams",
    features: [
      "Unlimited Projects",
      "Up to 20 Team Members",
      "Advanced Features",
      "Reports & Analytics",
    ],
    buttonText: "View Pro Plan",
    href: "/pricing/pro",
    popular: true,
  },
  {
    name: "Business",
    subtitle: "For larger organizations",
    features: [
      "Everything in Pro",
      "Priority Support",
      "Custom Integrations",
      "Advanced Security",
    ],
    buttonText: "View Business Plan",
    href: "/pricing/business",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-gradient-to-b from-white to-slate-50 py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Section Heading */}
        <div className="mb-9 text-center sm:mb-12">
          <span className="mb-2 inline-block text-xs font-bold tracking-wider text-blue-600 sm:text-sm">
            PRICING
          </span>

          <h2 className="mx-auto text-xl leading-tight font-bold tracking-tight text-[#071943] md:text-2xl lg:text-[34px]">
            Choose the perfect plan for your team
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-[760px] grid-cols-1 items-stretch gap-7 sm:gap-8 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex h-full flex-col rounded-xl bg-white p-5 shadow-[0_5px_24px_rgba(15,23,42,0.055)] transition-shadow duration-300 hover:shadow-[0_10px_32px_rgba(15,23,42,0.09)] sm:p-6 lg:p-7 ${
                plan.popular
                  ? "border-2 border-[#83a5ff]"
                  : "border border-slate-100"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1558ed] px-5 py-1.5 text-xs font-semibold text-white shadow-sm">
                  Most Popular
                </span>
              )}

              {/* Plan Details */}
              <div className="mb-5">
                <h3 className="text-xl font-bold tracking-tight text-[#111b36] sm:text-2xl">
                  {plan.name}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {plan.subtitle}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <Check
                      size={18}
                      strokeWidth={3}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />

                    <span className="leading-5">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Plan Button */}
              <Link
                href={plan.href}
                className={`mt-auto flex min-h-10 w-full items-center justify-center rounded-lg border-2 px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "border-[#1558ed] bg-[#1558ed] text-white hover:border-[#0847d4] hover:bg-[#0847d4]"
                    : "border-[#83a5ff] bg-white text-[#1558ed] hover:bg-blue-50"
                }`}
              >
                {plan.buttonText}
              </Link>
            </article>
          ))}
        </div>

        {/* Trust Note */}
        <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-slate-500 sm:mt-9 sm:text-sm">
          <ShieldCheck
            size={17}
            className="shrink-0 text-blue-600"
            aria-hidden="true"
          />
          <span>Simple plans for teams of every size</span>
        </div>
      </div>
    </section>
  );
}