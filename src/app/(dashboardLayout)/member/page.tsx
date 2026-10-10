"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ListTodo,
  RefreshCw,
  ClipboardList,
  FolderKanban,
} from "lucide-react";
import { useGetMyTaskQuery } from "@/redux/api/taskApi";

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedToId: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    status: string;
  };
};

type MyTasksResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Task[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const statusStyles: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};

const formatDate = (date?: string | null) => {
  if (!date) return "No deadline";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "No deadline";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isOverdue = (task: Task) => {
  if (!task.dueDate) return false;

  return (
    new Date(task.dueDate).getTime() < Date.now() &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED"
  );
};

const MemberOverviewPage = () => {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyTaskQuery({ page: 1, limit: 10 });

  // Your API response wraps the task array inside `data`.
  const apiResponse = response as MyTasksResponse | undefined;
  const tasks = apiResponse?.data ?? [];

  const totalTasks = apiResponse?.meta?.total ?? tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "TODO",
  ).length;

  const overdueTasks = tasks.filter(isOverdue).length;

  const completionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      description: "Tasks assigned to you",
      icon: ListTodo,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      description: "Tasks currently in progress",
      icon: Clock3,
      iconStyle: "bg-orange-50 text-orange-600",
    },
    {
      title: "Completed",
      value: completedTasks,
      description: "Tasks successfully completed",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Overdue",
      value: overdueTasks,
      description: "Unfinished tasks past deadline",
      icon: AlertCircle,
      iconStyle: "bg-red-50 text-red-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Header */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#00224A] sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Welcome back! Here&apos;s an overview of your assigned work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle
              size={36}
              className="mx-auto mb-3 text-red-500"
            />

            <h2 className="font-semibold text-slate-800">
              Unable to load your dashboard
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              We couldn&apos;t retrieve your tasks. Please try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-[#00224A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-950"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard content */}
        {!isLoading && !isError && (
          <>
            {/* Statistics cards */}
            <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.title}
                        </p>

                        <p className="mt-3 text-3xl font-bold text-[#00224A]">
                          {stat.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                        <Icon size={22} />
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Completion banner */}
            <section className="mb-8 overflow-hidden rounded-2xl bg-[#00224A] p-6 text-white sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-medium text-blue-200">
                    YOUR PERFORMANCE
                  </p>

                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                    Keep up the great work!
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                    You&apos;ve completed {completedTasks} of {totalTasks}{" "}
                    assigned tasks. Keep making progress toward your goals.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-3 w-full min-w-32 overflow-hidden rounded-full bg-white/20 md:w-44">
                    <div
                      className="h-full rounded-full bg-[#EC620B] transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  <span className="text-2xl font-bold">
                    {completionRate}%
                  </span>
                </div>
              </div>
            </section>

            {/* Main grid */}
            <section className="grid gap-6 xl:grid-cols-3">
              {/* Recent tasks */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                  <div>
                    <h2 className="font-bold text-[#00224A]">
                      Recent Tasks
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your latest assigned tasks
                    </p>
                  </div>

                  <Link
                    href="/dashboard/tasks"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#EC620B] hover:underline"
                  >
                    View all
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {recentTasks.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <ClipboardList
                      size={42}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <h3 className="font-semibold text-slate-700">
                      No tasks assigned yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Your assigned tasks will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentTasks.map((task) => (
                      <article
                        key={task.id}
                        className="p-5 transition hover:bg-slate-50 sm:px-6"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800">
                              {task.title}
                            </h3>

                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                              <FolderKanban size={15} className="shrink-0" />
                              <span className="truncate">
                                {task.project?.name ?? "Project not available"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  statusStyles[task.status] ??
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {task.status.replaceAll("_", " ")}
                              </span>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  priorityStyles[task.priority] ??
                                  "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
                            <CalendarDays size={16} />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Task breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="font-bold text-[#00224A]">
                  Task Breakdown
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current task status distribution
                </p>

                {totalTasks === 0 ? (
                  <div className="py-12 text-center">
                    <CircleDashed
                      size={38}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm text-slate-500">
                      Your task progress will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="my-7 flex justify-center">
                      <div
                        className="relative flex h-40 w-40 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(#10b981 ${
                            (completedTasks / totalTasks) * 360
                          }deg, #e2e8f0 0deg)`,
                        }}
                      >
                        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                          <span className="text-3xl font-bold text-[#00224A]">
                            {completionRate}%
                          </span>

                          <span className="mt-1 text-xs text-slate-500">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          label: "To Do",
                          count: todoTasks,
                          color: "bg-slate-400",
                        },
                        {
                          label: "In Progress",
                          count: inProgressTasks,
                          color: "bg-blue-500",
                        },
                        {
                          label: "Completed",
                          count: completedTasks,
                          color: "bg-emerald-500",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                            />
                            <span className="text-sm text-slate-600">
                              {item.label}
                            </span>
                          </div>

                          <span className="text-sm font-semibold text-slate-800">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Link
                  href="/dashboard/tasks"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#00224A] transition hover:border-[#EC620B] hover:text-[#EC620B]"
                >
                  Manage Tasks
                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default MemberOverviewPage;

