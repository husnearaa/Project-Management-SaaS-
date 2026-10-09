"use client";

export default function PageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-6 h-6 rounded-full animate-pulse bg-[#075BE8]"></div>
        <div className="w-6 h-6 rounded-full animate-pulse bg-[#075BE8]"></div>
        <div className="w-6 h-6 rounded-full animate-pulse bg-[#075BE8]"></div>
      </div>
    </div>
  );
}