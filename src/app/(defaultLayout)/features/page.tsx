
import Link from "next/link";
import {
  FolderKanban,
  ListTodo,
  Users,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";


const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Create and organize projects, manage project details, and track progress in one place.",
  },
  {
    icon: ListTodo,
    title: "Task Management",
    description:
      "Create tasks, assign responsibilities, set priorities, and update task statuses.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Manage project members and help your team work together in an organized workspace.",
  },
  {
    icon: CalendarDays,
    title: "Deadline Management",
    description:
      "Keep task deadlines visible and organize work around important due dates.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Support different permissions for administrators, managers, and team members.",
  },
  {
    icon: CreditCard,
    title: "Subscription Management",
    description:
      "Access subscription plans and manage payments through the integrated Stripe checkout.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 mt-16">
      {/* Page Heading */}
      <section className="bg-gradient-to-br from-white to-blue-50 px-5 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
            Features
          </p>

          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight lg:text-5xl">
            Everything You Need to Manage Your Work
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
            Manage projects, organize tasks, collaborate with your team,
            and track work through one organized platform.
          </p>

          {/* <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Get Started <ArrowRight size={18} />
          </Link> */}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-extrabold tracking-tight md:text-2xl lg:text-4xl">
              Explore ProjectFlow Features
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Simple tools to help your team organize projects and
              keep tasks moving forward.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={25} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-7xl rounded-2xl bg-blue-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className=" text-xl md:text-2xl lg:text-3xl font-extrabold">
            Ready to Manage Your Projects?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
            Create your account and start organizing your projects
            and tasks in one workspace.
          </p>

          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}