"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LoaderCircle,
  Mail,
  CalendarDays,
  Shield,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

// Change this import path if your admin API file has a different name.
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} from "@/redux/api/adminApi";

type UserRole = "ADMIN" | "MANAGER" | "MEMBER";
type UserStatus = "ACTIVE" | "INACTIVE";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  authProvider: "CREDENTIAL" | "GOOGLE" | string;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AdminUser[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const roleOptions: UserRole[] = ["ADMIN", "MANAGER", "MEMBER"];

const formatDate = (date: string) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const getInitials = (name: string) => {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "U"
  );
};

const getRoleStyle = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "MANAGER":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    default:
      return "bg-gray-100 text-gray-700 ring-gray-200";
  }
};

const getStatusStyle = (status: UserStatus) => {
  return status === "ACTIVE"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : "bg-red-50 text-red-700 ring-red-200";
};

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(roleFilter !== "ALL" ? { role: roleFilter } : {}),
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    }),
    [page, limit, search, roleFilter, statusFilter],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllUsersQuery(queryParams) as {
    data: UsersResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => unknown;
  };

  const [updateUserRole, { isLoading: isUpdatingRole }] =
    useUpdateUserRoleMutation();

  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();

  const users = response?.data ?? [];
  const meta = response?.meta;

  const totalUsers = meta?.total ?? users.length;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? page;

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE",
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE",
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "ADMIN",
  ).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleRoleUpdate = async (
    user: AdminUser,
    newRole: UserRole,
  ) => {
    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Change ${user.name}'s role from ${user.role} to ${newRole}?`,
    );

    if (!confirmed) return;

    try {
      await updateUserRole({
        id: user.id,
        role: newRole,
      }).unwrap();

      toast.success(`${user.name}'s role updated successfully.`);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to update user role.";

      toast.error(message);
    }
  };

  const handleStatusUpdate = async (user: AdminUser) => {
    const newStatus: UserStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const action = newStatus === "ACTIVE" ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}'s account?`,
    );

    if (!confirmed) return;

    try {
      await updateUserStatus({
        id: user.id,
        status: newStatus,
      }).unwrap();

      toast.success(
        `${user.name}'s account ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`,
      );
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to update user status.";

      toast.error(message);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalUsers);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            {/* <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-[#075BE8]">
                User Management
              </span>
            </div> */}

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              User Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage user accounts, assign roles, and control access to
              your ProjectFlow workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            description="Registered workspace users"
            icon={<Users size={21} />}
            iconStyle="bg-blue-50 text-[#075BE8]"
          />

          <StatCard
            title="Active Users"
            value={activeUsers}
            description="On the current page"
            icon={<UserCheck size={21} />}
            iconStyle="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Inactive Users"
            value={inactiveUsers}
            description="On the current page"
            icon={<UserX size={21} />}
            iconStyle="bg-red-50 text-red-600"
          />

          <StatCard
            title="Administrators"
            value={adminUsers}
            description="On the current page"
            icon={<ShieldCheck size={21} />}
            iconStyle="bg-violet-50 text-violet-600"
          />
        </div>

        {/* User Table Container */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Table Heading */}
          <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-gray-900">
              All Users
            </h2>
            <p className="text-sm text-gray-500">
              Review user details and update their permissions or account
              status.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:px-6 lg:flex-row lg:items-center">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search by name or email..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-4 pl-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#075BE8] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={roleFilter}
                  onChange={(event) =>
                    handleRoleFilterChange(event.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pr-9 pl-9 text-sm text-gray-700 outline-none focus:border-[#075BE8] sm:w-40"
                  aria-label="Filter by role"
                >
                  <option value="ALL">All roles</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  handleStatusFilterChange(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#075BE8] sm:w-40"
                aria-label="Filter by status"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              {(search || roleFilter !== "ALL" || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-[#075BE8] transition hover:bg-blue-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12">
              <LoaderCircle
                size={32}
                className="animate-spin text-[#075BE8]"
              />
              <p className="text-sm text-gray-500">
                Loading users...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && isError && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <XCircle size={24} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Unable to load users
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-[#075BE8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* User Table */}
          {!isLoading && !isError && (
            <>
              <div className="relative overflow-x-auto">
                {isFetching && (
                  <div className="absolute top-0 left-0 z-10 h-0.5 w-full overflow-hidden bg-blue-100">
                    <div className="h-full w-1/3 animate-pulse bg-[#075BE8]" />
                  </div>
                )}

                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Authentication
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                      const isUpdating =
                        isUpdatingRole || isUpdatingStatus;

                      return (
                        <tr
                          key={user.id}
                          className="transition-colors hover:bg-gray-50/80"
                        >
                          {/* User Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#075BE8]">
                                {getInitials(user.name)}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
                                  {user.name}
                                </p>

                                <p className="mt-1 flex max-w-[240px] items-center gap-1.5 truncate text-xs text-gray-500">
                                  <Mail
                                    size={13}
                                    className="shrink-0"
                                  />
                                  <span className="truncate">
                                    {user.email}
                                  </span>
                                </p>

                                {user.emailVerified && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                    <CheckCircle2 size={12} />
                                    Email verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getRoleStyle(user.role)}`}
                              >
                                <Shield size={12} />
                                {user.role}
                              </span>

                              <select
                                value={user.role}
                                disabled={isUpdating}
                                onChange={(event) =>
                                  handleRoleUpdate(
                                    user,
                                    event.target.value as UserRole,
                                  )
                                }
                                className="h-8 max-w-36 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none focus:border-[#075BE8] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label={`Change role for ${user.name}`}
                              >
                                {roleOptions.map((role) => (
                                  <option key={role} value={role}>
                                    {role.charAt(0) +
                                      role.slice(1).toLowerCase()}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(user.status)}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  user.status === "ACTIVE"
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {user.status}
                            </span>
                          </td>

                          {/* Auth Provider */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600">
                              {user.authProvider === "GOOGLE"
                                ? "Google"
                                : "Email & Password"}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarDays
                                size={15}
                                className="shrink-0 text-gray-400"
                              />
                              {formatDate(user.createdAt)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(user)}
                              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                user.status === "ACTIVE"
                                  ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                                  : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              {user.status === "ACTIVE" ? (
                                <>
                                  <UserX size={14} />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} />
                                  Activate
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {users.length === 0 && (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <Users size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    No users found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try changing your search or filter options.
                  </p>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-4 text-sm font-semibold text-[#075BE8] hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {users.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {startItem}–{endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-800">
                      {totalUsers}
                    </span>{" "}
                    users
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isFetching}
                      onClick={() =>
                        setPage((previous) => Math.max(1, previous - 1))
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#075BE8] px-3 text-sm font-semibold text-white">
                      {currentPage}
                    </span>

                    <button
                      type="button"
                      disabled={
                        currentPage >= totalPages || isFetching
                      }
                      onClick={() =>
                        setPage((previous) =>
                          Math.min(totalPages, previous + 1),
                        )
                      }
                      className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="mt-5 text-xs leading-5 text-gray-400">
          User role and status changes are saved through the admin API.
          Changes to access permissions should be made carefully.
        </p>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconStyle: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconStyle,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-gray-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;

