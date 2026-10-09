
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import dashboardImage from "@/assets/images/overviewImg.png";

const dashboardFeatures = [
  "Real-time project status",
  "Task tracking and management",
  "Team workload overview",
  "Deadline reminders",
];

export default function DashboardOverviewSection() {
  return (
    <section
      id="dashboard-overview"
      className="overflow-hidden bg-gradient-to-b from-slate-50 to-white py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.65fr_1fr] lg:gap-12 lg:px-12 xl:gap-16">
        {/* Left: Dashboard Image */}
        <div className="relative min-w-0">
          {/* Decorative glow */}
          <div className="absolute -inset-3 -z-10 rounded-3xl bg-blue-100/50 blur-2xl sm:-inset-5" />

          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] sm:rounded-2xl">
            <Image
              src={dashboardImage}
              alt="ProjectFlow dashboard showing project statistics, progress, team members, due dates, and task statuses"
              priority
              placeholder="blur"
              sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 65vw, 850px"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* Right: Dashboard Information */}
        <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
          <span className="mb-3 inline-block text-xs font-bold tracking-wider text-blue-600 sm:text-sm">
            DASHBOARD OVERVIEW
          </span>

          <h2 className="max-w-md text-xl leading-tight font-bold tracking-tight text-[#071943] md:text-2xl lg:text-[34px] xl:text-[38px]">
            All your projects
            <br className="hidden sm:block" /> in one place
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
            Get a clear overview of your projects, tasks, team performance and
            deadlines.
          </p>

          {/* Feature List */}
          <ul className="mt-5 space-y-3.5">
            {dashboardFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <CheckCircle2
                  size={19}
                  strokeWidth={2.5}
                  className="shrink-0 fill-blue-600 text-white"
                  aria-hidden="true"
                />

                <span className="text-sm leading-6 text-slate-600 sm:text-[15px]">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* Explore Dashboard Link */}
          <Link
            href="/dashboard"
            className="group mt-7 inline-flex items-center gap-2 border-b-2 border-blue-600 pb-1 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:border-blue-800 hover:text-blue-800 sm:text-base"
          >
            Explore Dashboard

            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}