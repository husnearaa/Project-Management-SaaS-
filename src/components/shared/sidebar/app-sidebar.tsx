"use client";

import Logo from "@/assets/logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  CalendarCheck,
  CalendarDays,
  ChartBarStacked,
  LayoutDashboard,
  LogOut,
  Wrench,
} from "lucide-react";

import Image from "next/image";
import { NavMain } from "./nav-main";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TbUsersGroup } from "react-icons/tb";
import { MdOutlineEventNote } from "react-icons/md";

const data = {
  admin: {
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "User Management",
        url: "/admin/users",
        icon: TbUsersGroup,
      },
      {
        title: "Category Management",
        url: "/admin/categories",
        icon: ChartBarStacked,
      },
    ],
  },

  customer: {
    navMain: [
      {
        title: "Dashboard",
        url: "/customer",
        icon: LayoutDashboard,
      },
      {
        title: "Booking Service",
        url: "/customer/booking-service",
        icon: MdOutlineEventNote,
      },
      {
        title: "Payments and Reviews",
        url: "/customer/payments-reviews",
        icon: MdOutlineEventNote,
      },
    ],
  },

  technician: {
    navMain: [
      {
        title: "Dashboard",
        url: "/technician",
        icon: LayoutDashboard,
      },
      {
        title: "Service Management",
        url: "/technician/services",
        icon: Wrench,
      },
      {
        title: "Availability",
        url: "/technician/availability",
        icon: CalendarDays,
      },
      {
        title: "Booking Management",
        url: "/technician/booking",
        icon: CalendarCheck,
      },
    ],
  },
};

interface AppSidebarProps {
  role: string;
}

export default function AppSidebar({
  role,
  ...props
}: AppSidebarProps) {
  const router = useRouter();

  const sidebarData =
    data[role?.toLowerCase() as keyof typeof data];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="w-60 bg-white border-r border-white"
      {...props}
    >
      <SidebarHeader className="bg-white">
        <Link
          href="/"
          className="flex items-center w-[210px] px-4 max-h-40 justify-center mb-5"
        >
          <Image
            src={Logo.src}
            alt="Logo"
            width={300}
            height={300}
            className="size-auto"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-white text-primary border-t border-gray-200 px-2">
        <NavMain items={sidebarData?.navMain} />
      </SidebarContent>

      <SidebarFooter className="bg-white p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}