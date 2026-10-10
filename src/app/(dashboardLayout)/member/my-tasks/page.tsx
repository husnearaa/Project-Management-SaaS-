"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Search,
  SlidersHorizontal,
  XCircle,
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

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};

const formatDate = (date: string | null) => {
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

const TasksPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Existing RTK Query API: GET /tasks/my-tasks
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyTaskQuery({ page: 1, limit: 100 });

  const response = data as MyTasksResponse | undefined;
  const tasks = response?.data ?? [];

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description ?? "").toLowerCase().includes(query) ||
        (task.project?.name ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const stats = [
    {
      label: "Total Tasks",
      value: response?.meta?.total ?? tasks.length,
      icon: ListTodo,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "To Do",
      value: tasks.filter((task) => task.status === "TODO").length,
      icon: Clock3,
      style: "bg-slate-100 text-slate-600",
    },
    {
      label: "In Progress",
      value: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      icon: RefreshCw,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "Completed",
      value: tasks.filter((task) => task.status === "COMPLETED").length,
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Page heading */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#00224A] sm:text-3xl">
              My Tasks
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your assignments, priorities, and deadlines.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh Tasks
          </button>
        </header>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* API error */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
            <AlertCircle
              size={38}
              className="mx-auto mb-3 text-red-500"
            />

            <h2 className="font-semibold text-slate-800">
              Failed to load your tasks
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-[#00224A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Tasks dashboard */}
        {!isLoading && !isError && (
          <>
            {/* Summary cards */}
            <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.label}
                        </p>

                        <p className="mt-3 text-3xl font-bold text-[#00224A]">
                          {stat.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${stat.style}`}>
                        <Icon size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Search and filters */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal
                  size={18}
                  className="text-[#EC620B]"
                />
                <h2 className="font-semibold text-[#00224A]">
                  Search and Filter
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks or projects..."
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#EC620B] focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#EC620B]"
                >
                  <option value="ALL">All statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#EC620B]"
                >
                  <option value="ALL">All priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </section>

            {/* Task list */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h2 className="font-bold text-[#00224A]">
                    Assigned Tasks
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing {filteredTasks.length} of{" "}
                    {tasks.length} loaded tasks
                  </p>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  {tasks.length === 0 ? (
                    <ClipboardEmpty />
                  ) : (
                    <Search
                      size={40}
                      className="mx-auto mb-3 text-slate-300"
                    />
                  )}

                  <h3 className="font-semibold text-slate-800">
                    {tasks.length === 0
                      ? "No tasks assigned yet"
                      : "No matching tasks"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {tasks.length === 0
                      ? "Your assigned tasks will appear here."
                      : "Try another search term or change your filters."}
                  </p>

                  {(search ||
                    statusFilter !== "ALL" ||
                    priorityFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("ALL");
                        setPriorityFilter("ALL");
                      }}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#EC620B] hover:underline"
                    >
                      <XCircle size={16} />
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => (
                    <article
                      key={task.id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-800">
                              {task.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                statusStyles[task.status]
                              }`}
                            >
                              {task.status.replaceAll("_", " ")}
                            </span>
                          </div>

                          {task.description && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <FolderKanban
                                size={16}
                                className="shrink-0"
                              />
                              {task.project?.name ?? "Project unavailable"}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="shrink-0"
                              />
                              Due {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              priorityStyles[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>

                          {isOverdue(task) && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                              <AlertCircle size={14} />
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

function ClipboardEmpty() {
  return (
    <div className="mb-3 flex justify-center">
      <ListTodo size={42} className="text-slate-300" />
    </div>
  );
}

export default TasksPage;

