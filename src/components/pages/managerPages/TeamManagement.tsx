
"use client";

import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  LoaderCircle,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetAllProjectsQuery,
  useAddMemberMutation,
  useDeleteMemberMutation,
} from "@/redux/api/managerApi";

type TeamMember = {
  id: string;
  userId?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  joinedAt?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
  members?: TeamMember[];
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

type MemberFormValues = {
  userId: string;
};

const PAGE_SIZE = 6;

const getInitials = (name?: string | null) => {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeRole = (role?: string | null) => {
  if (!role) return "Member";

  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      data?: { message?: string };
      error?: string;
    };

    return (
      apiError.data?.message ||
      apiError.error ||
      fallback
    );
  }

  return fallback;
};

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: ElementType;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[#00224A]">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#EC620B]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon size={26} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[#00224A]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-72 items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <LoaderCircle className="animate-spin" size={21} />
        Loading team information...
      </div>
    </div>
  );
}

export default function TeamManagementPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{
    project: Project;
    member: TeamMember;
  } | null>(null);

  const {
    data: projectsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllProjectsQuery({
    page: 1,
    limit: 100,
  });

  const [addMember, { isLoading: isAddingMember }] =
    useAddMemberMutation();

  const [deleteMember, { isLoading: isDeletingMember }] =
    useDeleteMemberMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    defaultValues: {
      userId: "",
    },
  });

  const response = projectsResponse as
    | ApiResponse<Project[]>
    | undefined;

  const projects = Array.isArray(response?.data)
    ? response.data
    : [];

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return projects;

    return projects.filter((project) => {
      const projectName = project.name?.toLowerCase() || "";
      const description =
        project.description?.toLowerCase() || "";

      const memberMatches = (project.members || []).some(
        (member) => {
          const user = member.user;

          return (
            user?.name?.toLowerCase().includes(query) ||
            user?.email?.toLowerCase().includes(query) ||
            member.name?.toLowerCase().includes(query) ||
            member.email?.toLowerCase().includes(query)
          );
        },
      );

      return (
        projectName.includes(query) ||
        description.includes(query) ||
        memberMatches
      );
    });
  }, [projects, search]);

  const totalMembers = useMemo(() => {
    const memberIds = new Set<string>();

    projects.forEach((project) => {
      (project.members || []).forEach((member) => {
        const id = member.user?.id || member.userId;

        if (id) memberIds.add(id);
      });
    });

    return memberIds.size;
  }, [projects]);

  const totalMemberships = projects.reduce(
    (total, project) =>
      total + (project.members?.length || 0),
    0,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PAGE_SIZE),
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedProjects = filteredProjects.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const openAddMember = (project: Project) => {
    setSelectedProject(project);
    reset({ userId: "" });
  };

  const closeAddMember = () => {
    setSelectedProject(null);
    reset({ userId: "" });
  };

  const onAddMember = async (values: MemberFormValues) => {
    if (!selectedProject) return;

    const userId = values.userId.trim();

    if (!userId) {
      toast.error("Please enter a user ID.");
      return;
    }

    try {
      const result = await addMember({
        id: selectedProject.id,
        data: { userId },
      }).unwrap();

      toast.success(
        result?.message || "Member added successfully.",
      );

      closeAddMember();
      refetch();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to add member."),
      );
    }
  };

  const onRemoveMember = async () => {
    if (!memberToRemove) return;

    const { project, member } = memberToRemove;
    const userId = member.user?.id || member.userId;

    if (!userId) {
      toast.error(
        "Could not identify this member. Please refresh the page.",
      );
      return;
    }

    try {
      const result = await deleteMember({
        id: project.id,
        userId,
      }).unwrap();

      toast.success(
        result?.message || "Member removed successfully.",
      );

      setMemberToRemove(null);
      refetch();
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to remove member."),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        <LoadingState />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#00224A] sm:text-3xl">
            Team Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage project teams, add members, and control
            project membership from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-[#00224A] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Total Projects"
          value={projects.length}
          description="Projects available to you"
        />

        <StatCard
          icon={Users}
          label="Unique Members"
          value={totalMembers}
          description="Across projects with member data"
        />

        <StatCard
          icon={UserPlus}
          label="Memberships"
          value={totalMemberships}
          description="Project-member assignments"
        />

        <StatCard
          icon={CheckCircle2}
          label="Projects With Teams"
          value={
            projects.filter(
              (project) =>
                (project.members?.length || 0) > 0,
            ).length
          }
          description="Projects with at least one member"
        />
      </section>

      {/* Search and project list */}
      <section className="mt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#00224A]">
              Project teams
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search projects and manage their members.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search projects or members..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#EC620B] focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {isError ? (
          <div className="mt-6">
            <EmptyState
              icon={AlertCircle}
              title="Unable to load project teams"
              description="The projects request failed. Check your permissions or connection and try again."
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-xl bg-[#00224A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00346d]"
                >
                  Try again
                </button>
              }
            />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={FolderKanban}
              title={
                search
                  ? "No matching projects"
                  : "No projects found"
              }
              description={
                search
                  ? "Try another project name or member name."
                  : "Projects available to your account will appear here."
              }
              action={
                search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-sm font-semibold text-[#EC620B] hover:underline"
                  >
                    Clear search
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {paginatedProjects.map((project) => {
                const members = project.members || [];

                return (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="border-b border-slate-100 p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#EC620B]">
                            <FolderKanban size={23} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words text-base font-bold text-[#00224A]">
                              {project.name}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                              {project.description ||
                                "No project description provided."}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {members.length}{" "}
                          {members.length === 1
                            ? "member"
                            : "members"}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays size={15} />
                          <span>
                            Created {formatDate(project.createdAt)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => openAddMember(project)}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white transition hover:bg-blue-600"
                        >
                          <Plus size={15} />
                          Add member
                        </button>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#00224A]">
                          Team members
                        </h4>

                        <span className="text-xs text-slate-400">
                          {members.length} assigned
                        </span>
                      </div>

                      {members.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center">
                          <Users
                            size={23}
                            className="mx-auto text-slate-400"
                          />
                          <p className="mt-2 text-sm font-medium text-slate-600">
                            No members assigned yet
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Add a member to get this team started.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {members.map((member) => {
                            const user = member.user;
                            const name =
                              user?.name ||
                              member.name ||
                              "Unnamed member";
                            const email =
                              user?.email || member.email;
                            const role =
                              user?.role || member.role;

                            return (
                              <div
                                key={
                                  user?.id ||
                                  member.userId ||
                                  member.id
                                }
                                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00224A] text-xs font-bold text-white">
                                  {getInitials(name)}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {name}
                                  </p>

                                  {email && (
                                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                                      <Mail
                                        size={12}
                                        className="shrink-0"
                                      />
                                      <span className="truncate">
                                        {email}
                                      </span>
                                    </p>
                                  )}

                                  {role && (
                                    <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                      {normalizeRole(role)}
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  title={`Remove ${name}`}
                                  aria-label={`Remove ${name} from ${project.name}`}
                                  onClick={() =>
                                    setMemberToRemove({
                                      project,
                                      member,
                                    })
                                  }
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(
                    safePage * PAGE_SIZE,
                    filteredProjects.length,
                  )}{" "}
                  of {filteredProjects.length} projects
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1),
                      )
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft size={15} />
                    Previous
                  </button>

                  <span className="px-2 text-sm font-semibold text-[#00224A]">
                    {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1),
                      )
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Add member modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddMember();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-member-title"
            className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#EC620B]">
                  <UserPlus size={22} />
                </div>

                <h2
                  id="add-member-title"
                  className="mt-4 text-xl font-bold text-[#00224A]"
                >
                  Add team member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a user to{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedProject.name}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddMember}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close add member form"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onAddMember)}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="userId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  User ID
                </label>

                <input
                  id="userId"
                  type="text"
                  placeholder="Enter the user's ID"
                  autoComplete="off"
                  {...register("userId", {
                    required: "User ID is required.",
                    validate: (value) =>
                      value.trim().length > 0 ||
                      "User ID cannot be empty.",
                  })}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#EC620B] focus:ring-2 focus:ring-orange-100"
                />

                {errors.userId && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.userId.message}
                  </p>
                )}

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Enter the existing user&apos;s ID. This form
                  does not call the admin-only user directory.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddMember}
                  disabled={isAddingMember}
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isAddingMember}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EC620B] px-5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAddingMember ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Add member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove member confirmation */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-member-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2
              id="remove-member-title"
              className="mt-4 text-xl font-bold text-[#00224A]"
            >
              Remove team member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Remove{" "}
              <span className="font-semibold text-slate-700">
                {memberToRemove.member.user?.name ||
                  memberToRemove.member.name ||
                  "this member"}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-slate-700">
                {memberToRemove.project.name}
              </span>
              ? This action affects this project&apos;s
              membership.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeletingMember}
                onClick={() => setMemberToRemove(null)}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeletingMember}
                onClick={onRemoveMember}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingMember ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Remove member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}