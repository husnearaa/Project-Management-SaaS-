
import {
  UserRoundPlus,
  FolderKanban,
  ClipboardCheck,
  ChartNoAxesCombined,
  type LucideIcon,
} from "lucide-react";

type Step = {
  number: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

const steps: Step[] = [
  {
    number: "1",
    title: "Sign Up",
    description: "Create your free account in just a few seconds.",
    Icon: UserRoundPlus,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    number: "2",
    title: "Create Project",
    description: "Add your project and invite your team.",
    Icon: FolderKanban,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    number: "3",
    title: "Manage Tasks",
    description: "Create tasks, assign team members and set priorities.",
    Icon: ClipboardCheck,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
  },
  {
    number: "4",
    title: "Track Progress",
    description: "Monitor progress, get reports and deliver success.",
    Icon: ChartNoAxesCombined,
    iconColor: "text-amber-600",
    iconBg: "bg-orange-50",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-white to-slate-50 py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Section Heading */}
        <div className="mb-10 text-center sm:mb-12 lg:mb-14">
          <span className="mb-2 inline-block text-xs font-bold tracking-wider text-blue-600 sm:text-sm">
            HOW IT WORKS
          </span>

          <h2 className="text-xl leading-tight font-bold tracking-tight text-[#071943] md:text-2xl lg:text-[34px]">
            Simple steps to get started
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-6 xl:gap-8">
          {steps.map(({ number, title, description, Icon, iconColor, iconBg }, index) => (
            <div key={number} className="relative flex items-start gap-4 sm:gap-5">
              {/* Step Icon */}
              <div
                className={`relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.07)] sm:h-[82px] sm:w-[82px] ${iconBg}`}
              >
                <Icon
                  size={34}
                  strokeWidth={2}
                  className={iconColor}
                  aria-hidden="true"
                />

                {/* Number Badge */}
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#1558ed] text-xs font-bold text-white shadow-sm">
                  {number}
                </span>
              </div>

              {/* Step Content */}
              <div className="min-w-0 flex-1 pt-6">
                <h3 className="mb-2 text-sm font-bold text-[#111b36] sm:text-[15px]">
                  {title}
                </h3>

                <p className="max-w-[230px] text-[13px] leading-[1.8] text-slate-600 sm:text-sm">
                  {description}
                </p>
              </div>

              {/* Dotted Connector — desktop only */}
              {index !== steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute top-[38px] left-[calc(100%-4px)] hidden w-6 border-t-2 border-dotted border-blue-300 lg:block xl:w-8"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}