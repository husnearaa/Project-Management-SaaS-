
import Link from "next/link";
import {
  FolderKanban,
  ListTodo,
  Users,
  ArrowRight,
} from "lucide-react";


const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Organize projects, manage project details, and keep your work on track.",
  },
  {
    icon: ListTodo,
    title: "Task Management",
    description:
      "Create tasks, set priorities, assign responsibilities, and track progress.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Help managers and team members work together in an organized workspace.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* About Hero */}
      <section className="bg-gradient-to-br from-white to-blue-50 px-5 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
            About Us
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-5xl">
            About <span className="text-blue-600">ProjectFlow</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            ProjectFlow is a project management platform that helps teams
            organize projects, manage tasks, and collaborate in one
            workspace. Our goal is to make everyday work simpler and
            more organized.
          </p>

          {/* <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Get Started <ArrowRight size={18} />
          </Link> */}
        </div>
      </section>

      {/* About Features */}
      <section className="px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-extrabold tracking-tight md:text-2xl lg:text-4xl">
              What You Can Do with ProjectFlow
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Everything is organized to help you manage your work and
              collaborate with your team.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-7xl rounded-2xl bg-blue-600 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold">
            Ready to organize your work?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
            Start managing your projects and tasks in one organized workspace.
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