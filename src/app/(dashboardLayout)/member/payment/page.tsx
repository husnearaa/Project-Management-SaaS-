"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  History,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetMyPaymentQuery,
  useCreatePaymentMutation,
} from "@/redux/api/paymentApi";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";
type PlanName = "PRO" | "BUSINESS";

type Payment = {
  id: string;
  amount: string | number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    id: string;
    plan: string;
    status: string;
  } | null;
};

type PaymentHistoryResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Payment[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CreatePaymentResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    paymentId: string;
    checkoutUrl: string;
    sessionId: string;
    plan: PlanName;
  };
};

const plans = [
  {
    name: "PRO" as const,
    title: "Pro",
    description: "For individuals managing their work efficiently.",
    price: 29.99,
    icon: Sparkles,
    features: [
      "Personal task management",
      "Track task progress",
      "Organize your workflow",
      "Secure Stripe checkout",
    ],
    style: "border-slate-200",
    buttonStyle:
      "border border-[#00224A] text-[#00224A] hover:bg-blue-50",
  },
  {
    name: "BUSINESS" as const,
    title: "Business",
    description: "For growing teams and advanced collaboration.",
    price: 59.99,
    icon: Crown,
    features: [
      "Everything in Pro",
      "Advanced project workflows",
      "Team collaboration features",
      "Secure Stripe checkout",
    ],
    style: "border-blue-700 ring-1 ring-blue-700",
    buttonStyle: "bg-blue-700 text-white hover:bg-blue-600",
  },
];

const paymentStatusStyles: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatAmount = (
  amount: string | number,
  currency: string,
) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return `${amount} ${currency.toUpperCase()}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency.toUpperCase()}`;
  }
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      data?: { message?: string };
      error?: string;
    };

    return (
      apiError.data?.message ??
      apiError.error ??
      "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
};

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);

  // Existing API: GET /payments/my-payments
  const {
    data: paymentResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyPaymentQuery({ page: 1, limit: 100 });

  // Existing API: POST /payments/create-checkout-session
  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreatePaymentMutation();

  const response = paymentResponse as
    | PaymentHistoryResponse
    | undefined;

  const payments = response?.data ?? [];
  const totalPayments = response?.meta?.total ?? payments.length;

  const paidPayments = payments.filter(
    (payment) => payment.status === "PAID",
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING",
  );

  const latestPaidPayment = [...paidPayments].sort(
    (a, b) =>
      new Date(b.paidAt ?? b.createdAt).getTime() -
      new Date(a.paidAt ?? a.createdAt).getTime(),
  )[0];

  const activeSubscription = payments.find(
    (payment) =>
      payment.subscription?.status === "ACTIVE" &&
      payment.status === "PAID",
  )?.subscription;

  const handleCreatePayment = async (plan: PlanName) => {
    if (isCreatingPayment) return;

    setSelectedPlan(plan);

    try {
      // Change `plan` to the backend's expected request field
      // if its Zod schema requires a different property name.
      const result = (await createPayment({ plan }).unwrap()) as
        | CreatePaymentResponse
        | undefined;

      const checkoutUrl = result?.data?.checkoutUrl;

      if (!result?.success || !checkoutUrl) {
        toast.error(
          result?.message ?? "Unable to create Stripe checkout session.",
        );
        return;
      }

      toast.success("Redirecting to secure Stripe Checkout...");

      // Stripe handles payment on its hosted checkout page.
      window.location.assign(checkoutUrl);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#00224A] sm:text-3xl">
              Plans & Billing
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your subscription and review your payment history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Payment summary */}
        <section className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Payments",
              value: totalPayments,
              icon: History,
              style: "bg-blue-50 text-blue-600",
            },
            {
              title: "Successful Payments",
              value: paidPayments.length,
              icon: CheckCircle2,
              style: "bg-emerald-50 text-emerald-600",
            },
            {
              title: "Pending Payments",
              value: pendingPayments.length,
              icon: Clock3,
              style: "bg-amber-50 text-amber-600",
            },
            {
              title: "Current Plan",
              value: activeSubscription?.plan ?? "None",
              icon: Crown,
              style: "bg-orange-50 text-orange-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <div className={`rounded-xl p-3 ${item.style}`}>
                    <Icon size={20} />
                  </div>
                </div>

                <p className="mt-4 truncate text-2xl font-bold text-[#00224A]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Current subscription */}
        <section className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#00224A] p-3 text-white">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#00224A]">
                  Current Subscription
                </h2>

                {isLoading ? (
                  <div className="mt-2 h-4 w-40 animate-pulse rounded bg-slate-200" />
                ) : activeSubscription ? (
                  <>
                    <p className="mt-1 text-sm text-slate-600">
                      You are subscribed to the{" "}
                      <span className="font-semibold">
                        {activeSubscription.plan}
                      </span>{" "}
                      plan.
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Status: {activeSubscription.status}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    No active subscription was found in your payment history.
                  </p>
                )}
              </div>
            </div>

            {latestPaidPayment && (
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Latest successful payment
                </p>

                <p className="mt-1 font-semibold text-[#00224A]">
                  {formatAmount(
                    latestPaidPayment.amount,
                    latestPaidPayment.currency,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(
                    latestPaidPayment.paidAt ??
                      latestPaidPayment.createdAt,
                  )}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Available plans */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#00224A] sm:text-2xl">
              Choose Your Plan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a plan to continue to secure Stripe Checkout.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan =
                activeSubscription?.plan === plan.name;

              const isProcessing =
                isCreatingPayment && selectedPlan === plan.name;

              return (
                <article
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm sm:p-8 ${plan.style}`}
                >
                  {plan.name === "BUSINESS" && (
                    <span className="absolute right-5 top-5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#EC620B]">
                      Business plan
                    </span>
                  )}

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#00224A]">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-[#00224A]">
                    {plan.title}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm leading-6 text-slate-500">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-[#00224A]">
                      {formatAmount(plan.price, "USD")}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Example display price — confirm it matches your backend.
                  </p>

                  <div className="my-7 h-px bg-slate-100" />

                  <ul className="mb-8 flex-1 space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <Check
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleCreatePayment(plan.name)}
                    disabled={isCreatingPayment || isCurrentPlan}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${plan.buttonStyle}`}
                  >
                    {isProcessing ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Preparing Checkout...
                      </>
                    ) : isCurrentPlan ? (
                      <>
                        <CheckCircle2 size={18} />
                        Current Plan
                      </>
                    ) : (
                      <>
                        Continue to Checkout
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* Payment history */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
            <div>
              <h2 className="text-lg font-bold text-[#00224A]">
                Payment History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review your recorded transactions and subscription details.
              </p>
            </div>

            <span className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              {payments.length} loaded
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="p-10 text-center">
              <AlertCircle
                size={36}
                className="mx-auto mb-3 text-red-500"
              />

              <h3 className="font-semibold text-slate-800">
                Unable to load payment history
              </h3>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl bg-[#00224A] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <h3 className="font-semibold text-slate-800">
                No payment records yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your transactions will appear here after you start checkout.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Provider</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-800">
                          {payment.subscription?.plan ?? "Subscription"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          ID: {payment.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold text-[#00224A]">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {payment.provider}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatDate(
                          payment.paidAt ?? payment.createdAt,
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            paymentStatusStyles[payment.status] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {payment.status === "PAID" ? (
                            <CheckCircle2 size={14} />
                          ) : payment.status === "PENDING" ? (
                            <Clock3 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <p className="text-sm leading-6 text-blue-900">
            Payments are processed through Stripe Checkout. Your subscription
            status should update after the backend confirms payment through
            its webhook.
          </p>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;

