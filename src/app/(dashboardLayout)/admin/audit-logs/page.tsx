"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Search,
  RefreshCw,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserRound,
  ShieldCheck,
  CreditCard,
  Users,
  FileClock,
  X,
  Eye,
  Globe,
  Database,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
  ArrowRight,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

// Update this path if your audit API is defined in another file.
import { useGetAllAuditLogsQuery } from "@/redux/api/adminApi";

type AuditUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: AuditUser | null;
};

type AuditLogsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: AuditLog[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 10;

const actionOptions = [
  "USER_LOGIN",
  "USER_ROLE_CHANGED",
  "USER_STATUS_CHANGED",
  "PAYMENT_CREATED",
  "PAYMENT_COMPLETED",
  "SUBSCRIPTION_UPDATED",
];

const entityOptions = ["USER", "PAYMENT", "SUBSCRIPTION", "PROJECT", "TASK"];

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

const getInitials = (name?: string) =>
  name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "S";

const getActionStyle = (action: string) => {
  if (action.includes("LOGIN")) {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (action.includes("ROLE")) {
    return "bg-violet-50 text-violet-700 ring-violet-200";
  }

  if (action.includes("STATUS")) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (action.includes("PAYMENT_COMPLETED")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (action.includes("PAYMENT")) {
    return "bg-indigo-50 text-indigo-700 ring-indigo-200";
  }

  if (action.includes("SUBSCRIPTION")) {
    return "bg-purple-50 text-purple-700 ring-purple-200";
  }

  return "bg-gray-100 text-gray-700 ring-gray-200";
};

const getEntityIcon = (entity: string) => {
  switch (entity) {
    case "USER":
      return <Users size={15} />;
    case "PAYMENT":
      return <CreditCard size={15} />;
    case "SUBSCRIPTION":
      return <ShieldCheck size={15} />;
    default:
      return <Database size={15} />;
  }
};

const getActionDescription = (log: AuditLog) => {
  const actor = log.user?.name || "Unknown user";

  switch (log.action) {
    case "USER_LOGIN":
      return `${actor} signed in`;
    case "USER_ROLE_CHANGED":
      return `${actor} changed a user's role`;
    case "USER_STATUS_CHANGED":
      return `${actor} changed a user's account status`;
    case "PAYMENT_CREATED":
      return `${actor} initiated a payment`;
    case "PAYMENT_COMPLETED":
      return `${actor} completed a payment`;
    case "SUBSCRIPTION_UPDATED":
      return `${actor} updated a subscription`;
    default:
      return `${actor} performed ${formatLabel(log.action).toLowerCase()}`;
  }
};

const getChangeSummary = (log: AuditLog) => {
  if (!log.oldData && !log.newData) {
    return "No change details recorded";
  }

  const oldData = log.oldData ?? {};
  const newData = log.newData ?? {};
  const changedKeys = Array.from(
    new Set([...Object.keys(oldData), ...Object.keys(newData)]),
  ).filter(
    (key) =>
      JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]),
  );

  if (changedKeys.length === 0) {
    return "Change details available";
  }

  return changedKeys
    .slice(0, 2)
    .map((key) => {
      const value = newData[key];
      return `${formatLabel(key)}: ${
        value === undefined ? "Updated" : String(value)
      }`;
    })
    .join(" · ");
};

const AuditLogsPage = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(actionFilter !== "ALL" ? { action: actionFilter } : {}),
      ...(entityFilter !== "ALL" ? { entity: entityFilter } : {}),
    }),
    [page, search, actionFilter, entityFilter],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllAuditLogsQuery(queryParams) as {
    data: AuditLogsResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => unknown;
  };

  const logs = response?.data ?? [];
  const meta = response?.meta;

  const totalLogs = meta?.total ?? logs.length;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);
  const currentPage = meta?.page ?? page;

  // These summaries describe the records returned for the current page.
  const loginCount = logs.filter((log) =>
    log.action.includes("LOGIN"),
  ).length;

  const userChangeCount = logs.filter(
    (log) =>
      log.action.includes("USER_ROLE") ||
      log.action.includes("USER_STATUS"),
  ).length;

  const paymentCount = logs.filter((log) =>
    log.action.includes("PAYMENT"),
  ).length;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("ALL");
    setEntityFilter("ALL");
    setPage(1);
  };

  const copyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Unable to copy. Please copy the value manually.");
    }
  };

  const startItem = totalLogs === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalLogs);

  return (
    <div className=" bg-[#F7F9FC]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Audit Logs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Monitor account activity, permission changes, payments, and
              other recorded events across ProjectFlow.
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
            Refresh logs
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Events"
            value={totalLogs}
            description="Matching audit records"
            icon={<Activity size={21} />}
            iconStyle="bg-blue-50 text-[#075BE8]"
          />

          <StatCard
            title="Login Events"
            value={loginCount}
            description="On the current page"
            icon={<UserRound size={21} />}
            iconStyle="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            title="User Changes"
            value={userChangeCount}
            description="Role and status changes on this page"
            icon={<ShieldCheck size={21} />}
            iconStyle="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Payment Events"
            value={paymentCount}
            description="On the current page"
            icon={<CreditCard size={21} />}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Activity Panel */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#075BE8]">
                <FileClock size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Activity History
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  A record of actions captured by the audit system.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:px-6 xl:flex-row xl:items-center">
            <div className="relative w-full xl:max-w-md">
              <Search
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search action, user, or entity ID..."
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
                  value={actionFilter}
                  onChange={(event) => {
                    setActionFilter(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by action"
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pr-9 pl-9 text-sm text-gray-700 outline-none focus:border-[#075BE8] sm:w-56"
                >
                  <option value="ALL">All actions</option>
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {formatLabel(action)}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={entityFilter}
                onChange={(event) => {
                  setEntityFilter(event.target.value);
                  setPage(1);
                }}
                aria-label="Filter by entity"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#075BE8] sm:w-44"
              >
                <option value="ALL">All entities</option>
                {entityOptions.map((entity) => (
                  <option key={entity} value={entity}>
                    {formatLabel(entity)}
                  </option>
                ))}
              </select>

              {(search || actionFilter !== "ALL" || entityFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-[#075BE8] transition hover:bg-blue-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12">
              <LoaderCircle
                size={32}
                className="animate-spin text-[#075BE8]"
              />
              <p className="text-sm text-gray-500">
                Loading audit logs...
              </p>
            </div>
          )}

          {/* Error */}
          {!isLoading && isError && (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <XCircle size={24} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Unable to load audit logs
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

          {/* Logs Table */}
          {!isLoading && !isError && (
            <>
              <div className="relative overflow-x-auto">
                {isFetching && (
                  <div className="absolute top-0 left-0 z-10 h-0.5 w-full overflow-hidden bg-blue-100">
                    <div className="h-full w-1/3 animate-pulse bg-[#075BE8]" />
                  </div>
                )}

                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Event
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Performed By
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Entity
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Change Details
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Details
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-gray-50/80"
                      >
                        {/* Event */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex max-w-max items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getActionStyle(log.action)}`}
                            >
                              {formatLabel(log.action)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ID: {log.id.slice(0, 8)}...
                            </span>
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#075BE8]">
                              {getInitials(log.user?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[190px] truncate text-sm font-semibold text-gray-900">
                                {log.user?.name || "Unknown user"}
                              </p>
                              <p className="mt-1 max-w-[200px] truncate text-xs text-gray-500">
                                {log.user?.email || "No email recorded"}
                              </p>
                              {log.user?.role && (
                                <span className="mt-1 inline-block text-[11px] font-medium text-gray-400">
                                  {formatLabel(log.user.role)}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Entity */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 text-gray-400">
                              {getEntityIcon(log.entity)}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700">
                                {formatLabel(log.entity)}
                              </p>
                              <button
                                type="button"
                                title={log.entityId}
                                onClick={() =>
                                  copyValue(log.entityId, "Entity ID")
                                }
                                className="mt-1 flex max-w-[150px] items-center gap-1 text-xs text-gray-400 transition hover:text-[#075BE8]"
                              >
                                <span className="truncate">
                                  {log.entityId}
                                </span>
                                <Copy size={12} className="shrink-0" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Change Summary */}
                        <td className="max-w-[230px] px-6 py-4">
                          <p className="line-clamp-2 text-sm leading-5 text-gray-600">
                            {getChangeSummary(log)}
                          </p>
                        </td>

                        {/* Timestamp */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <CalendarDays
                              size={15}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />
                            <div>
                              <p className="whitespace-nowrap text-sm text-gray-700">
                                {formatDate(log.createdAt)}
                              </p>
                              <p className="mt-1 whitespace-nowrap text-xs text-gray-400">
                                {new Intl.DateTimeFormat("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                }).format(new Date(log.createdAt))}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#075BE8]"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {logs.length === 0 && (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <FileClock size={24} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    No audit logs found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-sm font-semibold text-[#075BE8] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {logs.length > 0 && (
                <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {startItem}–{endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-800">
                      {totalLogs}
                    </span>{" "}
                    events
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

                    <span className="text-sm text-gray-400">
                      of {totalPages}
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

        <p className="mt-5 text-xs leading-5 text-gray-400">
          Audit records are read-only. Details depend on the information
          recorded by the backend when each event occurred.
        </p>
      </div>

      {/* Audit Log Details Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLog(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-5 py-5 sm:px-6">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#075BE8]">
                  <Activity size={15} />
                  AUDIT EVENT DETAILS
                </div>
                <h2
                  id="audit-modal-title"
                  className="text-xl font-bold text-gray-900"
                >
                  {formatLabel(selectedLog.action)}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {getActionDescription(selectedLog)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Close audit log details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-6">
              {/* Event Information */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Event information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailField
                    label="Action"
                    value={formatLabel(selectedLog.action)}
                  />
                  <DetailField
                    label="Entity"
                    value={formatLabel(selectedLog.entity)}
                  />
                  <DetailField
                    label="Date and time"
                    value={formatDateTime(selectedLog.createdAt)}
                    icon={<Clock3 size={15} />}
                  />
                  <DetailField
                    label="IP address"
                    value={selectedLog.ipAddress || "Not recorded"}
                    icon={<Globe size={15} />}
                  />
                </div>

                <CopyableField
                  label="Audit log ID"
                  value={selectedLog.id}
                  onCopy={copyValue}
                />

                <CopyableField
                  label="Entity ID"
                  value={selectedLog.entityId}
                  onCopy={copyValue}
                />
              </section>

              {/* User Information */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Performed by
                </h3>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#075BE8]">
                    {getInitials(selectedLog.user?.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {selectedLog.user?.name || "Unknown user"}
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-500">
                      {selectedLog.user?.email || "No email recorded"}
                    </p>
                  </div>

                  {selectedLog.user?.role && (
                    <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      {formatLabel(selectedLog.user.role)}
                    </span>
                  )}
                </div>

                {selectedLog.user?.id && (
                  <CopyableField
                    label="User ID"
                    value={selectedLog.user.id}
                    onCopy={copyValue}
                  />
                )}
              </section>

              {/* Change Details */}
              <section>
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Change details
                </h3>

                {selectedLog.oldData || selectedLog.newData ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <XCircle size={16} className="text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          Previous data
                        </span>
                      </div>
                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-5 text-gray-600">
                        {selectedLog.oldData
                          ? JSON.stringify(selectedLog.oldData, null, 2)
                          : "No previous data recorded"}
                      </pre>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50 px-4 py-3">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-800">
                          New data
                        </span>
                      </div>
                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-5 text-gray-600">
                        {selectedLog.newData
                          ? JSON.stringify(selectedLog.newData, null, 2)
                          : "No new data recorded"}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                    <Database
                      size={22}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-sm font-medium text-gray-700">
                      No change data recorded
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      This event does not include previous or new data.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-[#075BE8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
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
          <p className="mt-2 text-xs leading-5 text-gray-400">
            {description}
          </p>
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

interface DetailFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function DetailField({ label, value, icon }: DetailFieldProps) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3">
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      <div className="flex items-start gap-2">
        {icon && <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>}
        <p className="break-words text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

interface CopyableFieldProps {
  label: string;
  value: string;
  onCopy: (value: string, label: string) => void;
}

function CopyableField({ label, value, onCopy }: CopyableFieldProps) {
  return (
    <div className="mt-3 rounded-xl border border-gray-200 px-3 py-3">
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 flex-1 break-all font-mono text-xs text-gray-700">
          {value}
        </p>
        <button
          type="button"
          onClick={() => onCopy(value, label)}
          aria-label={`Copy ${label}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-blue-50 hover:text-[#075BE8]"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

export default AuditLogsPage;

