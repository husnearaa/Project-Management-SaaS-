
import Link from "next/link";
import {
  Rocket,
  ArrowRight,
} from "lucide-react";

export default function CallToActionSection() {
  return (
    <section className="bg-white px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="relative overflow-hidden rounded-xl border border-blue-300/30 bg-gradient-to-r from-[#0649ed] via-[#1049e8] to-[#063bd8] px-5 py-7 text-white shadow-[0_8px_24px_rgba(21,88,237,0.15)] sm:px-8 sm:py-8 lg:px-10 lg:py-7">
          {/* Background Decoration */}
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-300/10 blur-2xl" />

          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:gap-6 md:text-left lg:gap-7">
            {/* Rocket Icon */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-700/50 ring-1 ring-white/5 sm:h-24 sm:w-24">
              <Rocket
                size={48}
                strokeWidth={1.8}
                className="rotate-[-12deg] text-white sm:h-12 sm:w-12"
                aria-hidden="true"
              />
            </div>

            {/* Text Content */}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl leading-tight font-bold tracking-tight sm:text-2xl">
                Ready to transform the way you work?
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-blue-50 sm:text-base md:mx-0">
                Join thousands of teams already using ProjectFlow
                <br className="hidden lg:block" /> to deliver their best work.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex w-full shrink-0 flex-col gap-3 min-[420px]:w-auto min-[420px]:flex-row md:ml-auto">
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#0649ed] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 sm:px-6"
              >
                Get Started Free
              </Link>

              <Link
                href="/features"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:px-6"
              >
                Explore Features
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}