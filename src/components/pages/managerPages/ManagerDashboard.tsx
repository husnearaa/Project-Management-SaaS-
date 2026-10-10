"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  LoaderCircle,
  RefreshCw,
  Target,
  Users,
  AlertTriangle,
} from "lucide-react";
import {
  useGetAllProjectsQuery,
  useGetAllTasksQuery,
} from "@/redux/api/managerApi";

type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus | string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  } | null;
  creator?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    members: number;
    tasks: number;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  projectId: string;
  assignedToId?: string | null;
  createdById?: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    status: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const PAGE_SIZE = 100;

const formatDate = (date: string | null | undefined) => {
  if (!date) return "No deadline";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const getDaysRemaining = (date: string | null | undefined) => {
  if (!date) return null;

  const deadline = new Date(date);

  if (Number.isNaN(deadline.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  return Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "PLANNING":
    case "TODO":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "BLOCKED":
    case "ON_HOLD":
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority.toUpperCase()) {
    case "URGENT":
      return "bg-rose-50 text-rose-700";
    case "HIGH":
      return "bg-orange-50 text-orange-700";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const humanize = (value: string) =>
  value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  href,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  iconClass: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#075BE8]">
        View details
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function SectionHeading({
  title,
  description,
  href,
  linkLabel = "View all",
}: {
  title: string;
  description: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#075BE8] hover:text-blue-800"
      >
        {linkLabel}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <LoaderCircle className="animate-spin text-[#075BE8]" size={26} />
    </div>
  );
}

function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-rose-700">{message}</p>

        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isFetching: projectsFetching,
    isError: projectsError,
    refetch: refetchProjects,
  } = useGetAllProjectsQuery({
    page: 1,
    limit: PAGE_SIZE,
  }) as {
    data: ApiResponse<Project[]> | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    isError: tasksError,
    refetch: refetchTasks,
  } = useGetAllTasksQuery({
    page: 1,
    limit: PAGE_SIZE,
  }) as {
    data: ApiResponse<Task[]> | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const projects = projectsResponse?.data ?? [];
  const tasks = tasksResponse?.data ?? [];

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(
      (task) => task.status.toUpperCase() === "COMPLETED",
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status.toUpperCase() === "IN_PROGRESS",
    ).length;

    const todoTasks = tasks.filter(
      (task) => task.status.toUpperCase() === "TODO",
    ).length;

    const blockedTasks = tasks.filter(
      (task) => task.status.toUpperCase() === "BLOCKED",
    ).length;

    const overdueTasks = tasks.filter((task) => {
      const days = getDaysRemaining(task.dueDate);

      return (
        days !== null &&
        days < 0 &&
        task.status.toUpperCase() !== "COMPLETED" &&
        task.status.toUpperCase() !== "CANCELLED"
      );
    }).length;

    const activeProjects = projects.filter((project) => {
      const status = project.status.toUpperCase();
      return status !== "COMPLETED" && status !== "CANCELLED";
    }).length;

    return {
      totalProjects: projectsResponse?.meta?.total ?? projects.length,
      activeProjects,
      totalTasks: tasksResponse?.meta?.total ?? tasks.length,
      completedTasks,
      inProgressTasks,
      todoTasks,
      blockedTasks,
      overdueTasks,
      completionRate:
        tasks.length > 0
          ? Math.round((completedTasks / tasks.length) * 100)
          : 0,
    };
  }, [projects, tasks, projectsResponse, tasksResponse]);

  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter((project) => {
        const days = getDaysRemaining(project.deadline);
        const status = project.status.toUpperCase();

        return (
          days !== null &&
          days >= 0 &&
          days <= 30 &&
          status !== "COMPLETED" &&
          status !== "CANCELLED"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.deadline!).getTime() -
          new Date(b.deadline!).getTime(),
      )
      .slice(0, 4);
  }, [projects]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime(),
      )
      .slice(0, 4);
  }, [projects]);

  const isRefreshing = projectsFetching || tasksFetching;

  const refreshDashboard = () => {
    refetchProjects();
    refetchTasks();
  };

  const anyMainError = projectsError || tasksError;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Manager Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Track your projects, manage tasks, and keep your team moving
              forward.
            </p>
          </div>

          <button
            onClick={refreshDashboard}
            disabled={isRefreshing}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {anyMainError && (
          <div className="mb-6">
            <ErrorMessage
              message="Some dashboard information could not be loaded. Please retry."
              onRetry={refreshDashboard}
            />
          </div>
        )}

        {/* Statistics */}
        <section className="mb-9">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Workspace Overview
            </h2>
            <span className="text-xs text-slate-400">
              Based on loaded task records
            </span>
          </div>

          {projectsLoading || tasksLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Projects"
                value={stats.totalProjects}
                description={`${stats.activeProjects} active or ongoing projects`}
                icon={FolderKanban}
                iconClass="bg-blue-50 text-[#075BE8]"
                href="/manager/projects"
              />

              <StatCard
                title="Total Tasks"
                value={stats.totalTasks}
                description={`${stats.inProgressTasks} currently in progress`}
                icon={ListTodo}
                iconClass="bg-violet-50 text-violet-700"
                href="/manager/tasks"
              />

              <StatCard
                title="Completed Tasks"
                value={stats.completedTasks}
                description={`${stats.completionRate}% of loaded tasks completed`}
                icon={CheckCircle2}
                iconClass="bg-emerald-50 text-emerald-700"
                href="/manager/tasks"
              />

              <StatCard
                title="Overdue Tasks"
                value={stats.overdueTasks}
                description={
                  stats.overdueTasks > 0
                    ? "Tasks past their due date"
                    : "No overdue tasks in the loaded records"
                }
                icon={AlertTriangle}
                iconClass="bg-rose-50 text-rose-700"
                href="/manager/deadlines"
              />
            </div>
          )}
        </section>

        {/* Task summary and completion */}
        <section className="mb-9 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Task Progress
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Status breakdown of the tasks returned by the API
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-[#075BE8]">
                <Target size={21} />
              </div>
            </div>

            {tasksLoading ? (
              <div className="mt-6 flex h-32 items-center justify-center">
                <LoaderCircle
                  className="animate-spin text-[#075BE8]"
                  size={25}
                />
              </div>
            ) : tasks.length === 0 ? (
              <div className="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center">
                <ListTodo
                  className="mx-auto text-slate-400"
                  size={28}
                />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No tasks available
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tasks will appear here once they have been created.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-7 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.completionRate}%
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Completion rate
                    </p>
                  </div>

                  <p className="text-right text-sm text-slate-500">
                    {stats.completedTasks} of {tasks.length} loaded tasks
                  </p>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#075BE8] transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "To do",
                      value: stats.todoTasks,
                      color: "bg-amber-500",
                    },
                    {
                      label: "In progress",
                      value: stats.inProgressTasks,
                      color: "bg-blue-600",
                    },
                    {
                      label: "Completed",
                      value: stats.completedTasks,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Blocked",
                      value: stats.blockedTasks,
                      color: "bg-rose-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                        />
                        <span className="text-xs text-slate-500">
                          {item.label}
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-bold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Jump to a common manager task
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/manager/projects"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <span className="rounded-lg bg-blue-50 p-2.5 text-[#075BE8]">
                  <FolderKanban size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Manage Projects
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Create and organize projects
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#075BE8]"
                />
              </Link>

              <Link
                href="/manager/tasks"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-violet-200 hover:bg-violet-50/60"
              >
                <span className="rounded-lg bg-violet-50 p-2.5 text-violet-700">
                  <ListTodo size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Manage Tasks
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Assign and track task status
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-700"
                />
              </Link>

              <Link
                href="/manager/team"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-emerald-200 hover:bg-emerald-50/60"
              >
                <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                  <Users size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    Team & Members
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Review project team members
                  </span>
                </span>
                <ArrowRight
                  size={16}
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Projects and deadlines */}
        <section className="mb-9 grid grid-cols-1 gap-5 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-3">
            <SectionHeading
              title="Recent Projects"
              description="Projects and their current status"
              href="/manager/projects"
            />

            {projectsLoading ? (
              <div className="mt-5 flex h-32 items-center justify-center">
                <LoaderCircle
                  className="animate-spin text-[#075BE8]"
                  size={25}
                />
              </div>
            ) : projects.length === 0 ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center">
                <FolderKanban
                  className="mx-auto text-slate-400"
                  size={28}
                />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No projects found
                </p>
                <Link
                  href="/manager/projects"
                  className="mt-3 inline-flex text-sm font-semibold text-[#075BE8]"
                >
                  Go to projects <ArrowRight size={15} className="ml-1" />
                </Link>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {recentProjects.map((project) => {
                  const taskCount = project._count?.tasks ?? 0;
                  const memberCount = project._count?.members ?? 0;

                  return (
                    <Link
                      key={project.id}
                      href={`/manager/projects/${project.id}`}
                      className="group flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-blue-50 p-2.5 text-[#075BE8]">
                          <FolderKanban size={19} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-[#075BE8]">
                            {project.name}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {project.description || "No description provided"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>{taskCount} tasks</span>
                            <span>{memberCount} members</span>
                            <span>{formatDate(project.deadline)}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(project.status)}`}
                      >
                        {humanize(project.status)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
            <SectionHeading
              title="Upcoming Deadlines"
              description="Projects due within the next 30 days"
              href="/manager/deadlines"
            />

            {projectsLoading ? (
              <div className="mt-5 flex h-32 items-center justify-center">
                <LoaderCircle
                  className="animate-spin text-[#075BE8]"
                  size={25}
                />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">
                <CalendarDays
                  className="mx-auto text-slate-400"
                  size={26}
                />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No upcoming deadlines
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  No active projects are due in the next 30 days.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {upcomingDeadlines.map((project) => {
                  const days = getDaysRemaining(project.deadline);

                  return (
                    <Link
                      key={project.id}
                      href={`/manager/projects/${project.id}`}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                        <CalendarDays size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-800">
                          {project.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(project.deadline)}
                        </p>
                        <p
                          className={`mt-2 text-xs font-semibold ${
                            days === 0
                              ? "text-rose-600"
                              : days !== null && days <= 7
                                ? "text-amber-700"
                                : "text-slate-500"
                          }`}
                        >
                          {days === 0
                            ? "Due today"
                            : days === 1
                              ? "Due tomorrow"
                              : `${days} days remaining`}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <p className="flex items-center gap-2">
            <Activity size={14} />
            Dashboard data comes from your project and task APIs.
          </p>
          <p>ProjectFlow Manager Workspace</p>
        </div>
      </div>
    </main>
  );
}

