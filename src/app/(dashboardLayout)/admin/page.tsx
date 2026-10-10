
"use client";

import { useGetAllDashboardStatsQuery } from "@/redux/api/adminApi";
import {
  Activity,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";



const COLORS = {
  blue: "#075BE8",
  green: "#16A34A",
  orange: "#F59E0B",
  red: "#EF4444",
  purple: "#8B5CF6",
  slate: "#94A3B8",
};

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    blocked: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  tasks: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
  };
  subscriptions: {
    active: number;
  };
}

interface DashboardStatsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardStats;
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function AdminOverviewPage() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllDashboardStatsQuery({});

  // Supports either a standard RTK Query response envelope or an API
  // transformResponse that returns the response's data directly.
  const result = response as DashboardStatsResponse | DashboardStats | undefined;

  const stats: DashboardStats | undefined =
    result && "data" in result ? result.data : (result as DashboardStats);

  const overviewCards = [
    {
      title: "Total Users",
      value: stats?.users.total,
      description: `${stats?.users.active ?? 0} active users`,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Projects",
      value: stats?.projects.total,
      description: `${stats?.projects.active ?? 0} active projects`,
      icon: FolderKanban,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Total Tasks",
      value: stats?.tasks.total,
      description: `${stats?.tasks.completed ?? 0} completed tasks`,
      icon: ListTodo,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Total Payments",
      value: stats?.payments.total,
      description: `${stats?.payments.paid ?? 0} successful payments`,
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const userStatusData = stats
    ? [
        { name: "Active", value: stats.users.active, color: COLORS.green },
        { name: "Inactive", value: stats.users.inactive, color: COLORS.orange },
        { name: "Blocked", value: stats.users.blocked, color: COLORS.red },
      ]
    : [];

  const taskStatusData = stats
    ? [
        { name: "To Do", tasks: stats.tasks.todo },
        { name: "In Progress", tasks: stats.tasks.inProgress },
        { name: "Completed", tasks: stats.tasks.completed },
      ]
    : [];

  const paymentStatusData = stats
    ? [
        { name: "Paid", value: stats.payments.paid, color: COLORS.green },
        { name: "Pending", value: stats.payments.pending, color: COLORS.orange },
        { name: "Failed", value: stats.payments.failed, color: COLORS.red },
      ]
    : [];

  const projectStatusData = stats
    ? [
        { name: "Active", value: stats.projects.active, color: COLORS.blue },
        {
          name: "Completed",
          value: stats.projects.completed,
          color: COLORS.green,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        {/* Page Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-wide text-[#075BE8]">
              ADMINISTRATION
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
              Admin Overview
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Monitor users, projects, tasks, payments, and platform activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-5 h-8 w-20 rounded bg-slate-200" />
                <div className="mt-4 h-3 w-36 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !stats && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-6 text-center"
          >
            <Activity className="mx-auto text-red-500" size={30} />
            <h2 className="mt-3 font-semibold text-[#172033]">
              Could not load dashboard statistics
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-[#075BE8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && stats && (
          <>
            {isError && (
              <p role="status" className="mb-4 text-sm text-amber-700">
                Refresh failed. Showing the last available statistics.
              </p>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {overviewCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {card.title}
                        </p>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-[#172033]">
                          {formatNumber(card.value ?? 0)}
                        </p>
                      </div>

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                      >
                        <Icon size={23} />
                      </div>
                    </div>

                    <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Subscription Summary */}
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#172033]">
                    Active Subscriptions
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Currently active platform subscriptions
                  </p>
                </div>
              </div>

              <p className="text-3xl font-bold text-[#172033]">
                {formatNumber(stats.subscriptions.active)}
              </p>
            </div>

            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Task Status Bar Chart */}
              <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#172033]">
                    Task Overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tasks grouped by current status
                  </p>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={taskStatusData}
                      margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#F1F5F9" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                        }}
                      />
                      <Bar
                        dataKey="tasks"
                        name="Tasks"
                        fill={COLORS.blue}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={64}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* User Status Pie Chart */}
              <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#172033]">
                    User Status
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Distribution of registered users
                  </p>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        innerRadius={48}
                        paddingAngle={3}
                      >
                        {userStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, "Users"]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Payment Status Pie Chart */}
              <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#172033]">
                    Payment Status
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Breakdown of payment records
                  </p>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        innerRadius={48}
                        paddingAngle={3}
                      >
                        {paymentStatusData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, "Payments"]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Project Status Bar Chart */}
              <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#172033]">
                    Project Overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Projects grouped by status
                  </p>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={projectStatusData}
                      margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#F1F5F9" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name="Projects"
                        fill={COLORS.purple}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={64}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}