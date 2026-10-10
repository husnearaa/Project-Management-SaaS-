
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  ListTodo,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAssignTaskMutation, useChangeTaskStatusMutation, useCreateTaskMutation, useDeleteTaskMutation, useGetAllTasksQuery, useGetTaskByIdQuery, useUpdateTaskMutation } from "@/redux/api/taskApi";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type TaskUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type TaskProject = {
  id: string;
  name: string;
  status?: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assignedToId: string | null;
  createdById: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project?: TaskProject;
  assignedTo?: TaskUser | null;
  createdBy?: TaskUser;
};

type ApiResponse<T> = {
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
};

type TaskFormValues = {
  title: string;
  description: string;
  projectId: string;
  assignedToId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
};

type AssignFormValues = {
  assignedToId: string;
};

type StatusFormValues = {
  status: TaskStatus;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "To do", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "DONE" },
] as const;

const PRIORITY_OPTIONS = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
] as const;

const EMPTY_FORM: TaskFormValues = {
  title: "",
  description: "",
  projectId: "",
  assignedToId: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d95608] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (
      error as {
        data?: {
          message?: string;
          errors?: { field?: string; message?: string }[];
        };
      }
    ).data;

    if (data?.errors?.length) {
      const firstError = data.errors[0];

      if (firstError?.message) {
        return `${firstError.field ? `${firstError.field}: ` : ""}${firstError.message}`;
      }
    }

    if (data?.message) return data.message;
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}

function formatDate(date?: string | null): string {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No deadline";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dateInputValue(date?: string | null): string {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
}

function statusLabel(status: TaskStatus): string {
  switch (status) {
    case "TODO":
      return "To do";
    case "IN_PROGRESS":
      return "In progress";
    case "DONE":
      return "Completed";
  }
}

function statusClasses(status: TaskStatus): string {
  switch (status) {
    case "TODO":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "DONE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
}

function priorityClasses(priority: TaskPriority): string {
  switch (priority) {
    case "LOW":
      return "bg-slate-100 text-slate-600";
    case "MEDIUM":
      return "bg-sky-50 text-sky-700";
    case "HIGH":
      return "bg-orange-50 text-orange-700";
    case "URGENT":
      return "bg-red-50 text-red-700";
  }
}

function overdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") return false;

  const dueDate = new Date(task.dueDate);
  dueDate.setHours(23, 59, 59, 999);

  return dueDate.getTime() < Date.now();
}

function FormError({ children }: { children?: string }) {
  if (!children) return null;

  return <p className="mt-1.5 text-xs text-red-600">{children}</p>;
}

function Modal({
  title,
  description,
  onClose,
  children,
  size = "max-w-xl",
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`my-auto w-full ${size} overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-150px)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`rounded-xl p-2.5 ${iconClass}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function TaskManagement() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [changingStatusTask, setChangingStatusTask] = useState<Task | null>(
    null,
  );

  const {
    data: taskResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAllTasksQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const {
    data: detailsResponse,
    isLoading: detailsLoading,
    isError: detailsIsError,
    error: detailsError,
    refetch: refetchDetails,
  } = useGetTaskByIdQuery(viewingTaskId ?? "", {
    skip: !viewingTaskId,
  });

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();
  const [assignTask, { isLoading: assigning }] = useAssignTaskMutation();
  const [changeTaskStatus, { isLoading: changingStatus }] =
    useChangeTaskStatusMutation();

  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    reset: resetTask,
    formState: { errors: taskErrors },
  } = useForm<TaskFormValues>({ defaultValues: EMPTY_FORM });

  const {
    register: registerAssignment,
    handleSubmit: handleAssignmentSubmit,
    reset: resetAssignment,
    formState: { errors: assignmentErrors },
  } = useForm<AssignFormValues>({
    defaultValues: { assignedToId: "" },
  });

  const {
    register: registerStatus,
    handleSubmit: handleStatusSubmit,
    reset: resetStatus,
    formState: { errors: statusErrors },
  } = useForm<StatusFormValues>({
    defaultValues: { status: "TODO" },
  });

  const tasks = useMemo(() => {
    const response = taskResponse as ApiResponse<Task[]> | undefined;
    return Array.isArray(response?.data) ? response.data : [];
  }, [taskResponse]);

  const meta = (taskResponse as ApiResponse<Task[]> | undefined)?.meta;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const totalTasks = meta?.total ?? tasks.length;

  const taskDetails = (
    detailsResponse as ApiResponse<Task> | undefined
  )?.data;

  const stats = useMemo(
    () => ({
      total: totalTasks,
      todo: tasks.filter((task) => task.status === "TODO").length,
      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      completed: tasks.filter((task) => task.status === "DONE").length,
    }),
    [tasks, totalTasks],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter]);

  function openCreateModal() {
    setEditingTask(null);
    resetTask(EMPTY_FORM);
    setTaskModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);

    resetTask({
      title: task.title ?? "",
      description: task.description ?? "",
      projectId: task.projectId ?? "",
      assignedToId: task.assignedToId ?? "",
      priority: task.priority ?? "MEDIUM",
      status: task.status ?? "TODO",
      dueDate: dateInputValue(task.dueDate),
    });

    setTaskModalOpen(true);
  }

  function closeTaskModal() {
    setTaskModalOpen(false);
    setEditingTask(null);
    resetTask(EMPTY_FORM);
  }

  async function submitTask(values: TaskFormValues) {
    let dueDate: string | null = null;

    if (values.dueDate) {
      const parsed = new Date(`${values.dueDate}T23:59:59`);

      if (Number.isNaN(parsed.getTime())) {
        toast.error("Please enter a valid due date.");
        return;
      }

      dueDate = parsed.toISOString();
    }

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      projectId: values.projectId.trim(),
      assignedToId: values.assignedToId.trim() || null,
      priority: values.priority,
      status: values.status,
      dueDate,
    };

    try {
      if (editingTask) {
        await updateTask({
          id: editingTask.id,
          data: payload,
        }).unwrap();

        toast.success("Task updated successfully.");
      } else {
        await createTask(payload).unwrap();

        toast.success("Task created successfully.");
      }

      closeTaskModal();
      await refetch();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          editingTask ? "Failed to update task." : "Failed to create task.",
        ),
      );
    }
  }

  async function submitDelete() {
    if (!deletingTask) return;

    try {
      await deleteTask({ id: deletingTask.id }).unwrap();

      toast.success("Task deleted successfully.");

      const deletedId = deletingTask.id;
      setDeletingTask(null);

      if (viewingTaskId === deletedId) setViewingTaskId(null);

      if (tasks.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refetch();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete task."));
    }
  }

  function openAssignModal(task: Task) {
    setAssigningTask(task);
    resetAssignment({ assignedToId: task.assignedToId ?? "" });
  }

  async function submitAssignment(values: AssignFormValues) {
    if (!assigningTask) return;

    const assignedToId = values.assignedToId.trim();

    if (!assignedToId) {
      toast.error("Please enter a member ID.");
      return;
    }

    try {
      await assignTask({
        id: assigningTask.id,
        data: { assignedToId },
      }).unwrap();

      toast.success("Task assigned successfully.");

      const assignedTaskId = assigningTask.id;
      setAssigningTask(null);
      resetAssignment();

      await refetch();

      if (viewingTaskId === assignedTaskId) await refetchDetails();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to assign task."));
    }
  }

  function openStatusModal(task: Task) {
    setChangingStatusTask(task);
    resetStatus({ status: task.status });
  }

  async function submitStatus(values: StatusFormValues) {
    if (!changingStatusTask) return;

    try {
      await changeTaskStatus({
        id: changingStatusTask.id,
        data: { status: values.status },
      }).unwrap();

      toast.success("Task status updated successfully.");

      const changedTaskId = changingStatusTask.id;
      setChangingStatusTask(null);

      await refetch();

      if (viewingTaskId === changedTaskId) await refetchDetails();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update task status."));
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Task Management
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Create tasks, manage assignments, and track project progress.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className={primaryButton}
          >
            <Plus size={18} />
            Create task
          </button>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total tasks"
            value={stats.total}
            icon={ListTodo}
            iconClass="bg-orange-50 text-[#EC620B]"
          />
          <StatCard
            title="To do"
            value={stats.todo}
            icon={Clock3}
            iconClass="bg-slate-100 text-slate-600"
          />
          <StatCard
            title="In progress"
            value={stats.inProgress}
            icon={RefreshCw}
            iconClass="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={Check}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All tasks</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your tasks and assignments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className={secondaryButton}
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_190px_190px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search tasks..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">All priorities</option>
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-4 py-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-slate-200 p-5"
                >
                  <div className="mb-4 h-4 w-24 rounded bg-slate-200" />
                  <div className="mb-3 h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mb-2 h-3 w-full rounded bg-slate-100" />
                  <div className="mb-6 h-3 w-2/3 rounded bg-slate-100" />
                  <div className="h-9 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="mb-4 rounded-2xl bg-red-50 p-4 text-red-600">
                <AlertTriangle size={26} />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">
                Unable to load tasks
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                {getErrorMessage(error, "Something went wrong while loading tasks.")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className={`${primaryButton} mt-5`}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="mb-4 rounded-2xl bg-orange-50 p-4 text-[#EC620B]">
                    <ListTodo size={28} />
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">
                    No tasks found
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">
                    {search || statusFilter || priorityFilter
                      ? "Try changing your search or filters."
                      : "Create your first task to start managing your work."}
                  </p>
                  {!search && !statusFilter && !priorityFilter && (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className={`${primaryButton} mt-5`}
                    >
                      <Plus size={17} />
                      Create task
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {tasks.map((task) => (
                      <article
                        key={task.id}
                        className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
                      >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(task.status)}`}
                          >
                            {statusLabel(task.status)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                          {task.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                          {task.description || "No description provided."}
                        </p>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                          <div className="flex items-start gap-2.5 text-sm">
                            <ListTodo
                              size={16}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400">Project</p>
                              <p className="truncate font-medium text-slate-700">
                                {task.project?.name || "Project"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-sm">
                            <UserRound
                              size={16}
                              className="mt-0.5 shrink-0 text-slate-400"
                            />
                            <div className="min-w-0">
                              <p className="text-xs text-slate-400">
                                Assigned to
                              </p>
                              <p className="truncate font-medium text-slate-700">
                                {task.assignedTo?.name || "Unassigned"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 text-sm">
                            <CalendarDays
                              size={16}
                              className={`shrink-0 ${overdue(task) ? "text-red-500" : "text-slate-400"}`}
                            />
                            <span
                              className={
                                overdue(task)
                                  ? "font-medium text-red-600"
                                  : "text-slate-600"
                              }
                            >
                              {overdue(task)
                                ? `Overdue · ${formatDate(task.dueDate)}`
                                : formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => setViewingTaskId(task.id)}
                            className={secondaryButton}
                          >
                            <Eye size={15} />
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className={secondaryButton}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openAssignModal(task)}
                            className={secondaryButton}
                          >
                            <Users size={15} />
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusModal(task)}
                            className={secondaryButton}
                          >
                            <RefreshCw size={15} />
                            Status
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTask(task)}
                            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={15} />
                            Delete task
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Showing {tasks.length} of {totalTasks} tasks
                      {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1 || isFetching}
                        onClick={() => setPage((current) => current - 1)}
                        className={secondaryButton}
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={page >= totalPages || isFetching}
                        onClick={() => setPage((current) => current + 1)}
                        className={secondaryButton}
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      {/* Create and edit form */}
      {taskModalOpen && (
        <Modal
          title={editingTask ? "Edit task" : "Create a new task"}
          description={
            editingTask
              ? "Update the task information below."
              : "Add a task to one of your projects."
          }
          onClose={closeTaskModal}
          size="max-w-2xl"
        >
          <form onSubmit={handleTaskSubmit(submitTask)} className="space-y-5">
            <div>
              <label className={labelClass} htmlFor="task-title">
                Task title *
              </label>
              <input
                id="task-title"
                {...registerTask("title", {
                  required: "Please enter a task title.",
                  validate: (value) =>
                    value.trim().length > 0 || "Title cannot be empty.",
                  maxLength: {
                    value: 150,
                    message: "Title cannot exceed 150 characters.",
                  },
                })}
                placeholder="e.g. Build authentication system"
                className={inputClass}
              />
              <FormError>{taskErrors.title?.message}</FormError>
            </div>

            <div>
              <label className={labelClass} htmlFor="task-description">
                Description *
              </label>
              <textarea
                id="task-description"
                rows={4}
                {...registerTask("description", {
                  required: "Please enter a description.",
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Description cannot be empty.",
                  maxLength: {
                    value: 3000,
                    message: "Description cannot exceed 3000 characters.",
                  },
                })}
                placeholder="Describe what needs to be done..."
                className={`${inputClass} resize-y`}
              />
              <FormError>{taskErrors.description?.message}</FormError>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="task-project">
                  Project ID *
                </label>
                <input
                  id="task-project"
                  {...registerTask("projectId", {
                    required: "Please enter a project ID.",
                    validate: (value) =>
                      value.trim().length > 0 || "Project ID is required.",
                  })}
                  placeholder="Paste project UUID"
                  className={inputClass}
                />
                <FormError>{taskErrors.projectId?.message}</FormError>
              </div>

              <div>
                <label className={labelClass} htmlFor="task-assignee">
                  Assigned member ID
                </label>
                <input
                  id="task-assignee"
                  {...registerTask("assignedToId")}
                  placeholder="Paste member UUID (optional)"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="task-priority">
                  Priority
                </label>
                <select
                  id="task-priority"
                  {...registerTask("priority")}
                  className={inputClass}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="task-status">
                  Status
                </label>
                <select
                  id="task-status"
                  {...registerTask("status")}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="task-due-date">
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                {...registerTask("dueDate")}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeTaskModal}
                disabled={creating || updating}
                className={secondaryButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || updating}
                className={primaryButton}
              >
                {creating || updating ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Check size={17} />
                )}
                {creating
                  ? "Creating..."
                  : updating
                    ? "Saving..."
                    : editingTask
                      ? "Save changes"
                      : "Create task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Task details */}
      {viewingTaskId && (
        <Modal
          title="Task details"
          description="Review task information and assignment."
          onClose={() => setViewingTaskId(null)}
          size="max-w-2xl"
        >
          {detailsLoading ? (
            <div className="flex items-center justify-center py-14">
              <LoaderCircle
                className="animate-spin text-[#EC620B]"
                size={28}
              />
              <span className="ml-3 text-sm text-slate-500">
                Loading task details...
              </span>
            </div>
          ) : detailsIsError ? (
            <div className="py-10 text-center">
              <AlertTriangle
                className="mx-auto mb-3 text-red-500"
                size={28}
              />
              <p className="font-semibold text-slate-900">
                Unable to load task details
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {getErrorMessage(detailsError, "Please try again.")}
              </p>
              <button
                type="button"
                onClick={() => refetchDetails()}
                className={`${secondaryButton} mt-4`}
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          ) : taskDetails ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusClasses(taskDetails.status)}`}
                >
                  {statusLabel(taskDetails.status)}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${priorityClasses(taskDetails.priority)}`}
                >
                  {taskDetails.priority} priority
                </span>
                {overdue(taskDetails) && (
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                    Overdue
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {taskDetails.title}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {taskDetails.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Project</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {taskDetails.project?.name || "Project"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    {taskDetails.projectId}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Assigned member
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {taskDetails.assignedTo?.name || "Unassigned"}
                  </p>
                  {taskDetails.assignedTo?.email && (
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {taskDetails.assignedTo.email}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">Due date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {formatDate(taskDetails.dueDate)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Created by
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {taskDetails.createdBy?.name || "Unknown"}
                  </p>
                  {taskDetails.createdBy?.email && (
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {taskDetails.createdBy.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    openEditModal(taskDetails);
                    setViewingTaskId(null);
                  }}
                  className={primaryButton}
                >
                  <Pencil size={16} />
                  Edit task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAssignModal(taskDetails);
                    setViewingTaskId(null);
                  }}
                  className={secondaryButton}
                >
                  <Users size={16} />
                  Assign member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openStatusModal(taskDetails);
                    setViewingTaskId(null);
                  }}
                  className={secondaryButton}
                >
                  <RefreshCw size={16} />
                  Change status
                </button>
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Task details are unavailable.
            </p>
          )}
        </Modal>
      )}

      {/* Assignment form */}
      {assigningTask && (
        <Modal
          title="Assign task"
          description={`Assign "${assigningTask.title}" to a team member.`}
          onClose={() => setAssigningTask(null)}
        >
          <form
            onSubmit={handleAssignmentSubmit(submitAssignment)}
            className="space-y-5"
          >
            <div>
              <label className={labelClass} htmlFor="member-id">
                Member ID *
              </label>
              <input
                id="member-id"
                {...registerAssignment("assignedToId", {
                  required: "Please enter a member ID.",
                  validate: (value) =>
                    value.trim().length > 0 || "Member ID is required.",
                })}
                placeholder="Paste the member's UUID"
                className={inputClass}
              />
              <FormError>{assignmentErrors.assignedToId?.message}</FormError>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Enter the UUID of an existing member who is allowed to work on
                this project.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAssigningTask(null)}
                disabled={assigning}
                className={secondaryButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={assigning}
                className={primaryButton}
              >
                {assigning && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {assigning ? "Assigning..." : "Assign task"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Status form */}
      {changingStatusTask && (
        <Modal
          title="Change task status"
          description={`Update the progress of "${changingStatusTask.title}".`}
          onClose={() => setChangingStatusTask(null)}
        >
          <form
            onSubmit={handleStatusSubmit(submitStatus)}
            className="space-y-5"
          >
            <div>
              <label className={labelClass} htmlFor="new-task-status">
                Status
              </label>
              <select
                id="new-task-status"
                {...registerStatus("status", {
                  required: "Please select a status.",
                })}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FormError>{statusErrors.status?.message}</FormError>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setChangingStatusTask(null)}
                disabled={changingStatus}
                className={secondaryButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingStatus}
                className={primaryButton}
              >
                {changingStatus && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {changingStatus ? "Updating..." : "Update status"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deletingTask && (
        <Modal
          title="Delete task"
          description="This action cannot be undone."
          onClose={() => {
            if (!deleting) setDeletingTask(null);
          }}
        >
          <div className="flex items-start gap-4">
            <span className="shrink-0 rounded-xl bg-red-50 p-3 text-red-600">
              <AlertTriangle size={23} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                Are you sure you want to delete this task?
              </p>
              <p className="mt-2 break-words text-sm text-slate-500">
                &quot;{deletingTask.title}&quot; will be removed from the task
                list.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeletingTask(null)}
              disabled={deleting}
              className={secondaryButton}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {deleting ? "Deleting..." : "Delete task"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}