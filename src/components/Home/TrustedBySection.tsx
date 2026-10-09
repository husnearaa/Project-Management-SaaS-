import { Box, Settings, Package, ShieldCheck, Workflow } from "lucide-react";

const companies = [
  {
    name: "techcorp",
    Icon: Box,
  },
  {
    name: "ideaflow",
    Icon: Settings,
  },
  {
    name: "productx",
    Icon: Package,
  },
  {
    name: "devstack",
    Icon: ShieldCheck,
  },
  {
    name: "creativelab",
    Icon: Workflow,
  },
];

export default function TrustedBySection() {
  return (
    <section className="w-full border-y border-gray-100 bg-white px-4 py-7 sm:px-6 sm:py-8">
      {" "}
      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}{" "}
        <p className="mb-5 text-center text-xs font-medium tracking-wide text-slate-500 sm:mb-6 sm:text-sm">
          Trusted by teams from{" "}
        </p>
        {/* Company Logos */}
        <div className="grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-x-8 md:grid-cols-5 md:gap-y-0">
          {companies.map(({ name, Icon }) => (
            <div
              key={name}
              className={`flex items-center justify-center gap-2.5 text-[#172c59] transition-opacity duration-200 hover:opacity-70 ${
                name === "creativelab" ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <Icon
                size={23}
                strokeWidth={2.2}
                className="shrink-0 text-[#263e78]"
                aria-hidden="true"
              />

              <span className="whitespace-nowrap text-sm font-bold tracking-tight sm:text-base">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
