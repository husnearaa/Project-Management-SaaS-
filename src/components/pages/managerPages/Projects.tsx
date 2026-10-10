"use client";

import { useMemo, useState } from "react";
import {
  useForm,
} from "react-hook-form";
import {
  useAddMemberMutation,
  useCreateProjectMutation,
  useDeleteMemberMutation,
  useDeleteProjectMutation,
  useGetAllProjectsQuery,
  useGetProjectByIdQuery,
  useUpdateProjectMutation,
} from "@/redux/api/managerApi";
import { useAppSelector } from "@/redux/hooks";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Eye,
  FolderKanban,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  ListTodo,
} from "lucide-react";
import { toast } from "sonner";

type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ON_HOLD";

type ProjectUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type ProjectMember = {
  id: string;
  projectId?: string;
  userId: string;
  joinedAt?: string;
  user?: ProjectUser;
};

type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  managerId?: string;
  creatorId?: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  manager?: ProjectUser;
  creator?: ProjectUser;
  members?: ProjectMember[];
  _count?: {
    members: number;
    tasks: number;
  };
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

type ProjectFormValues = {
  name: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
};

type MemberFormValues = {
  userId: string;
};

const PAGE_SIZE = 9;

const STATUS_OPTIONS: {
  label: string;
  value: ProjectStatus;
}[] = [
  { label: "Planning", value: "PLANNING" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On hold", value: "ON_HOLD" },
];

const EMPTY_FORM: ProjectFormValues = {
  name: "",
  description: "",
  status: "PLANNING",
  deadline: "",
};

function formatDate(date?: string | null) {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "No deadline";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getDateInputValue(date?: string | null) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PLANNING: "Planning",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    ON_HOLD: "On hold",
  };

  return labels[status] ?? status.replaceAll("_", " ");
}

function getStatusClasses(status: string) {
  const classes: Record<string, string> = {
    PLANNING: "bg-blue-50 text-blue-700 ring-blue-600/20",
    IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-600/20",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    ON_HOLD: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return classes[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
}

function isOverdue(
  deadline?: string | null,
  status?: string,
) {
  if (!deadline || status === "COMPLETED") return false;

  return new Date(deadline).getTime() < Date.now();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as {
      message?: string;
      errors?: { field?: string; message?: string }[];
    };

    if (data.errors?.length) {
      return data.errors
        .map((item) => item.message)
        .filter(Boolean)
        .join(" ");
    }

    if (typeof data.message === "string") {
      return data.message;
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

function getInitials(name?: string) {
  if (!name) return "NA";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getMemberUser(member: ProjectMember): ProjectUser {
  return (
    member.user ?? {
      id: member.userId,
      name: "Project member",
      email: "",
    }
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function FieldError({ children }: { children?: string }) {
  if (!children) return null;

  return (
    <p className="mt-1.5 text-xs font-medium text-red-600">
      {children}
    </p>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-auto w-full ${
          wide ? "max-w-2xl" : "max-w-lg"
        } overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </section>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function CountBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-3">
      <span className="shrink-0 text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function Projects() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [detailsProjectId, setDetailsProjectId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [memberLoading, setMemberLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // The logged-in manager is required by your current create-project schema.
  const user = useAppSelector((state) => state.auth.user);

  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    reset: resetProjectForm,
    formState: { errors: projectErrors },
  } = useForm<ProjectFormValues>({
    defaultValues: EMPTY_FORM,
  });

  const {
    register: registerMember,
    handleSubmit: handleMemberSubmit,
    reset: resetMemberForm,
    formState: { errors: memberErrors },
  } = useForm<MemberFormValues>({
    defaultValues: { userId: "" },
  });

  const {
    data: projectsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllProjectsQuery({
    page,
    limit: PAGE_SIZE,
  });

  const {
    data: projectDetailsResponse,
    isLoading: detailsLoading,
    isFetching: detailsFetching,
    refetch: refetchDetails,
  } = useGetProjectByIdQuery(detailsProjectId ?? "", {
    skip: !detailsProjectId,
  });

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();

  const [deleteProject, { isLoading: deletingProject }] =
    useDeleteProjectMutation();

  const [addMember] = useAddMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();

  const projectsEnvelope = projectsResponse as
    | ApiResponse<Project[]>
    | undefined;

  const projects = projectsEnvelope?.data ?? [];
  const meta = projectsEnvelope?.meta;
  const total = meta?.total ?? projects.length;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  const projectDetails = (
    projectDetailsResponse as ApiResponse<Project> | undefined
  )?.data;

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        (project.description ?? "").toLowerCase().includes(normalizedSearch) ||
        (project.manager?.name ?? "").toLowerCase().includes(normalizedSearch) ||
        (project.manager?.email ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total,
      inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
      planning: projects.filter((p) => p.status === "PLANNING").length,
      completed: projects.filter((p) => p.status === "COMPLETED").length,
    }),
    [projects, total],
  );

  function openCreateDialog() {
    setEditingProject(null);
    resetProjectForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditDialog(project: Project) {
    setEditingProject(project);

    resetProjectForm({
      name: project.name ?? "",
      description: project.description ?? "",
      status: project.status ?? "PLANNING",
      deadline: getDateInputValue(project.deadline),
    });

    setFormOpen(true);
  }

  function closeFormDialog() {
    if (formLoading) return;

    setFormOpen(false);
    setEditingProject(null);
    resetProjectForm(EMPTY_FORM);
  }

  async function handleSubmitProject(values: ProjectFormValues) {
    const commonPayload = {
      name: values.name.trim(),
      description: values.description.trim(),
      status: values.status,
      deadline: values.deadline
        ? new Date(`${values.deadline}T23:59:59`).toISOString()
        : null,
    };

    if (!commonPayload.name || !commonPayload.description) {
      toast.error("Project name and description are required.");
      return;
    }

    setFormLoading(true);

    try {
      if (editingProject) {
        // Update sends only editable fields.
        await updateProject({
          id: editingProject.id,
          data: commonPayload,
        }).unwrap();

        toast.success("Project updated successfully.");
      } else {
        if (!user?.id) {
          toast.error(
            "Unable to identify the logged-in manager. Please log in again.",
          );
          return;
        }

        // Your backend currently requires managerId in the create request.
        await createProject({
          ...commonPayload,
          managerId: user.id,
        }).unwrap();

        toast.success("Project created successfully.");
        setPage(1);
      }

      setFormOpen(false);
      setEditingProject(null);
      resetProjectForm(EMPTY_FORM);
      await refetch();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          editingProject
            ? "Failed to update project."
            : "Failed to create project.",
        ),
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteProject() {
    if (!deleteTarget) return;

    try {
      await deleteProject({ id: deleteTarget.id }).unwrap();

      toast.success("Project deleted successfully.");

      const deletedId = deleteTarget.id;
      setDeleteTarget(null);

      if (detailsProjectId === deletedId) {
        setDetailsProjectId(null);
      }

      if (projects.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await refetch();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete project."));
    }
  }

  async function handleAddMember(values: MemberFormValues) {
    if (!detailsProjectId) return;

    const userId = values.userId.trim();

    if (!userId) {
      toast.error("Enter the user's ID.");
      return;
    }

    setMemberLoading(true);

    try {
      await addMember({
        id: detailsProjectId,
        data: { userId },
      }).unwrap();

      toast.success("Project member added successfully.");

      resetMemberForm({ userId: "" });
      await refetchDetails();
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add project member."));
    } finally {
      setMemberLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!detailsProjectId) return;

    setRemovingMemberId(userId);

    try {
      await deleteMember({
        id: detailsProjectId,
        userId,
      }).unwrap();

      toast.success("Project member removed successfully.");

      await refetchDetails();
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove project member."));
    } finally {
      setRemovingMemberId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Projects
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Organize projects, manage team members, and keep track of
              deadlines and progress.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/20"
          >
            <Plus size={18} />
            New project
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total projects"
            value={stats.total}
            description="Projects across all pages"
            icon={<FolderKanban size={20} />}
            iconClass="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="In progress"
            value={stats.inProgress}
            description="On the current page"
            icon={<Clock3 size={20} />}
            iconClass="bg-amber-50 text-amber-700"
          />
          <StatCard
            title="Planning"
            value={stats.planning}
            description="On the current page"
            icon={<CalendarDays size={20} />}
            iconClass="bg-violet-50 text-violet-700"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            description="On the current page"
            icon={<Check size={20} />}
            iconClass="bg-emerald-50 text-emerald-700"
          />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All projects
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {total} {total === 1 ? "project" : "projects"} in total
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-64 lg:w-72">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects..."
                  aria-label="Search projects"
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by project status"
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="ALL">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-4 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
                <div className="mt-7 h-20 rounded-xl bg-slate-100" />
                <div className="mt-5 h-10 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <CircleAlert size={23} />
            </div>
            <h3 className="mt-4 font-bold text-slate-900">
              Unable to load projects
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {filteredProjects.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <FolderKanban size={26} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {search || statusFilter !== "ALL"
                    ? "No matching projects"
                    : "No projects yet"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search || statusFilter !== "ALL"
                    ? "Try another search term or change the status filter."
                    : "Create your first project to start organizing your team's work."}
                </p>
                {search || statusFilter !== "ALL" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openCreateDialog}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    <Plus size={17} />
                    Create project
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => {
                  const overdue = isOverdue(
                    project.deadline,
                    project.status,
                  );

                  return (
                    <article
                      key={project.id}
                      className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <FolderKanban size={21} />
                        </div>
                        <span
                          className={`inline-flex max-w-[65%] items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(project.status)}`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </div>

                      <h3 className="mt-5 break-words text-lg font-bold leading-6 text-slate-900">
                        {project.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 min-h-10 break-words text-sm leading-5 text-slate-500">
                        {project.description || "No description provided."}
                      </p>

                      <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-slate-400">
                            <CalendarDays size={17} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-500">
                              Deadline
                            </p>
                            <p
                              className={`mt-1 break-words text-sm font-semibold ${overdue ? "text-red-600" : "text-slate-800"}`}
                            >
                              {formatDate(project.deadline)}
                              {overdue && (
                                <span className="ml-2 text-xs font-medium">
                                  Overdue
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {getInitials(project.manager?.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-500">
                              Project manager
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {project.manager?.name ?? "Not assigned"}
                            </p>
                            {project.manager?.email && (
                              <p className="truncate text-xs text-slate-500">
                                {project.manager.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <CountBox
                            icon={<Users size={16} />}
                            label="Members"
                            value={project._count?.members ?? 0}
                          />
                          <CountBox
                            icon={<ListTodo size={16} />}
                            label="Tasks"
                            value={project._count?.tasks ?? 0}
                          />
                        </div>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => {
                            resetMemberForm({ userId: "" });
                            setDetailsProjectId(project.id);
                          }}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          <Eye size={16} />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditDialog(project)}
                          aria-label={`Edit ${project.name}`}
                          title="Edit project"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(project)}
                          aria-label={`Delete ${project.name}`}
                          title="Delete project"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-800">{page}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || isFetching}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    Next
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit project */}
      {formOpen && (
        <Modal
          title={editingProject ? "Edit project" : "Create a project"}
          subtitle={
            editingProject
              ? "Update your project's information."
              : "Add a project to organize your team's work."
          }
          onClose={closeFormDialog}
          wide
        >
          <form
            onSubmit={handleProjectSubmit(handleSubmitProject)}
            className="space-y-5"
          >
            <FormField label="Project name">
              <input
                {...registerProject("name", {
                  required: "Project name is required.",
                  maxLength: {
                    value: 150,
                    message: "Project name cannot exceed 150 characters.",
                  },
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Project name cannot be empty.",
                })}
                placeholder="e.g. Project Management SaaS"
                className={inputClass}
              />
              <FieldError>{projectErrors.name?.message}</FieldError>
            </FormField>

            <FormField label="Description">
              <textarea
                {...registerProject("description", {
                  required: "Description is required.",
                  maxLength: {
                    value: 2000,
                    message: "Description cannot exceed 2000 characters.",
                  },
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Description cannot be empty.",
                })}
                rows={4}
                placeholder="Describe the project and its goals..."
                className={`${inputClass} resize-y`}
              />
              <FieldError>{projectErrors.description?.message}</FieldError>
            </FormField>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Project status">
                <div className="relative">
                  <select
                    {...registerProject("status", {
                      required: "Please select a status.",
                    })}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
                <FieldError>{projectErrors.status?.message}</FieldError>
              </FormField>

              <FormField label="Deadline">
                <input
                  type="date"
                  {...registerProject("deadline", {
                    validate: (value) => {
                      if (!value) return true;

                      return (
                        !Number.isNaN(
                          new Date(`${value}T23:59:59`).getTime(),
                        ) || "Please enter a valid deadline."
                      );
                    },
                  })}
                  className={inputClass}
                />
                <FieldError>{projectErrors.deadline?.message}</FieldError>
              </FormField>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={formLoading}
                onClick={closeFormDialog}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formLoading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Check size={17} />
                )}
                {formLoading
                  ? "Saving..."
                  : editingProject
                    ? "Save changes"
                    : "Create project"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Project details and member management */}
      {detailsProjectId && (
        <Modal
          title="Project details"
          subtitle="View project information and manage its members."
          onClose={() => {
            if (!memberLoading && !removingMemberId) {
              setDetailsProjectId(null);
              resetMemberForm({ userId: "" });
            }
          }}
          wide
        >
          {detailsLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading project details...
            </div>
          ) : !projectDetails ? (
            <div className="py-10 text-center">
              <CircleAlert size={28} className="mx-auto text-amber-500" />
              <p className="mt-3 font-semibold text-slate-800">
                Project details unavailable
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The project may have been deleted, or the request failed.
              </p>
              <button
                type="button"
                onClick={() => refetchDetails()}
                className="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(projectDetails.status)}`}
                  >
                    {getStatusLabel(projectDetails.status)}
                  </span>
                  <h3 className="mt-3 break-words text-xl font-bold text-slate-900">
                    {projectDetails.name}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                    {projectDetails.description || "No description provided."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    openEditDialog(projectDetails);
                    setDetailsProjectId(null);
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={15} />
                  Edit project
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DetailBox
                  label="Deadline"
                  value={formatDate(projectDetails.deadline)}
                />
                <DetailBox
                  label="Team members"
                  value={projectDetails._count?.members ?? 0}
                />
                <DetailBox
                  label="Total tasks"
                  value={projectDetails._count?.tasks ?? 0}
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                    {getInitials(projectDetails.manager?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      Project manager
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {projectDetails.manager?.name ?? "Not assigned"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {projectDetails.manager?.email ?? ""}
                    </p>
                  </div>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Project members
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {projectDetails.members?.length ?? 0} member records
                    </p>
                  </div>
                  {detailsFetching && (
                    <LoaderCircle
                      size={17}
                      className="animate-spin text-slate-400"
                    />
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {(projectDetails.members ?? []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center">
                      <Users size={24} className="mx-auto text-slate-400" />
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        No members added yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Add a member using their user ID below.
                      </p>
                    </div>
                  ) : (
                    (projectDetails.members ?? []).map((member) => {
                      const memberUser = getMemberUser(member);

                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {getInitials(memberUser.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {memberUser.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {memberUser.email || memberUser.id}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={removingMemberId === memberUser.id}
                            onClick={() => handleRemoveMember(memberUser.id)}
                            aria-label={`Remove ${memberUser.name}`}
                            title="Remove member"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {removingMemberId === memberUser.id ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={handleMemberSubmit(handleAddMember)}
                  className="mt-5 rounded-xl bg-slate-50 p-4"
                >
                  <label
                    htmlFor="member-user-id"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Add a member
                  </label>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Enter the existing user&apos;s ID. Your member API expects a
                    userId field.
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <input
                        id="member-user-id"
                        {...registerMember("userId", {
                          required: "User ID is required.",
                          validate: (value) =>
                            value.trim().length > 0 ||
                            "User ID cannot be empty.",
                        })}
                        placeholder="Enter user ID"
                        className={inputClass}
                      />
                      <FieldError>{memberErrors.userId?.message}</FieldError>
                    </div>
                    <button
                      type="submit"
                      disabled={memberLoading}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {memberLoading ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Plus size={17} />
                      )}
                      Add member
                    </button>
                  </div>
                </form>
              </section>

              <div className="border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDetailsProjectId(null);
                    resetMemberForm({ userId: "" });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close details
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal
          title="Delete project?"
          subtitle="This action cannot be undone."
          onClose={() => {
            if (!deletingProject) setDeleteTarget(null);
          }}
        >
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-red-600">
              <AlertTriangle size={21} />
            </div>
            <div className="min-w-0">
              <p className="break-words text-sm font-bold text-slate-900">
                {deleteTarget.name}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                Are you sure you want to delete this project? This action
                cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deletingProject}
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingProject}
              onClick={handleDeleteProject}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingProject ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Trash2 size={17} />
              )}
              {deletingProject ? "Deleting..." : "Delete project"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}