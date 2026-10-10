
"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

const PaymentSuccessPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[#00224A]">
          Payment Successful!
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your payment has been completed successfully. Your booking is now
          confirmed.
        </p>

        <Link
          href="/"
          className="mt-3 block text-sm font-medium text-slate-500 transition hover:text-[#EC620B]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
};

export default PaymentSuccessPage;
