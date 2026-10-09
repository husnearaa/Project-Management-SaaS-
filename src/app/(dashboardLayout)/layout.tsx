"use client";

import AppSidebar from "@/components/shared/sidebar/app-sidebar";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useAppSelector } from "@/redux/hooks";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector((state) => state.auth.token);

  const decodedToken = useDecodedToken(token);

  // Get the user's role dynamically from the JWT token
  const role =
    typeof decodedToken?.role === "string"
      ? decodedToken.role
      : typeof decodedToken?.activeRole === "string"
        ? decodedToken.activeRole
        : "CUSTOMER";

  return (
    <SidebarProvider>
      {/* Pass the user's actual role dynamically */}
      <AppSidebar role={role} />

      <SidebarInset>
        <header
          className="flex justify-between items-center gap-2 
                 h-20 shrink-0 px-4 lg:px-8 
                 sticky top-0 z-50 bg-white shadow-xs
                 transition-[width,height] ease-linear
                 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>

          {/* Right Section: Profile */}
          <div className="flex flex-col lg:flex-row gap-5 lg:pr-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-primary rounded-full">
                {/* Profile content */}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 pt-0 bg-slate-100 min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}