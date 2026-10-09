
import {
  FolderKanban,
  ClipboardCheck,
  Users,
  Clock3,
  ChartNoAxesCombined,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

const features: Feature[] = [
  {
    title: "Project Management",
    description:
      "Create, organize, and manage projects effortlessly.",
    Icon: FolderKanban,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Task Management",
    description:
      "Create tasks, set deadlines, assign and prioritize work.",
    Icon: ClipboardCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    title: "Team Collaboration",
    description:
      "Work together, communicate, and share updates in real-time.",
    Icon: Users,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    title: "Time Tracking",
    description:
      "Track time spent on tasks and improve productivity.",
    Icon: Clock3,
    iconColor: "text-amber-600",
    iconBg: "bg-orange-100",
  },
  {
    title: "Reports & Analytics",
    description:
      "Get insights with powerful reports and visual analytics.",
    Icon: ChartNoAxesCombined,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
  },
  {
    title: "Secure & Reliable",
    description:
      "Your data is secure with role-based access control.",
    Icon: ShieldCheck,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-gradient-to-b from-white to-slate-50 py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Section Heading */}
        <div className="mb-8 text-center sm:mb-10 lg:mb-12">
          <span className="mb-2 inline-block text-xs font-bold tracking-wider text-blue-600 sm:text-sm">
            FEATURES
          </span>

          <h2 className="mx-auto max-w-3xl text-xl leading-tight font-bold tracking-tight text-[#071943] md:text-2xl lg:text-[34px]">
            Everything you need to manage projects efficiently
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 md:gap-5 xl:grid-cols-6 xl:gap-5">
          {features.map(
            ({ title, description, Icon, iconColor, iconBg }) => (
              <article
                key={title}
                className="group flex h-full flex-col items-center rounded-xl border border-slate-100 bg-white px-4 py-5 text-center shadow-[0_4px_18px_rgba(15,23,42,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:px-4 sm:py-6"
              >
                {/* Icon */}
                <div
                  className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg} transition-transform duration-300 group-hover:scale-105 sm:h-[60px] sm:w-[60px]`}
                >
                  <Icon
                    size={32}
                    strokeWidth={2.2}
                    className={iconColor}
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-sm leading-5 font-bold tracking-tight text-[#111b36]">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-[13px] leading-[1.75] text-slate-600">
                  {description}
                </p>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}