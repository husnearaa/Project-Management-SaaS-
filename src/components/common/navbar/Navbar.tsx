"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { initializeAuth, logout } from "@/redux/features/authSlice";


const logo = "/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

interface JwtPayload {
  id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  picture?: string;
  image?: string;
  avatar?: string;
  exp?: number;
}

interface LoggedInUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  picture?: string;
  image?: string;
  avatar?: string;
}

const getDashboardPath = (role?: string) => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return "/admin";
    case "MANAGER":
      return "/manager";
    case "MEMBER":
      return "/member";
    default:
      return "/dashboard";
  }
};

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<LoggedInUser | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { token, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const currentToken = token || Cookies.get("accessToken");

    if (!isAuthenticated || !currentToken) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(currentToken);

      if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
        dispatch(logout());
        setUser(null);
        return;
      }

      setUser({
        id: decoded.id || decoded.userId || decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        picture: decoded.picture,
        image: decoded.image,
        avatar: decoded.avatar,
      });
    } catch (error) {
      console.error("Failed to decode authentication token:", error);
      setUser(null);
    }
  }, [token, isAuthenticated, pathname, dispatch]);

  const handleLogout = () => {
    dispatch(logout());

    setUser(null);
    setIsUserMenuOpen(false);
    setIsSidebarOpen(false);

    toast.success("Logged out successfully!");

    router.push("/");
    router.refresh();
  };

  const userImage = user?.picture || user?.image || user?.avatar;

  const displayName =
    user?.name || user?.email?.split("@")[0] || "User";

  const dashboardPath = getDashboardPath(user?.role);

  const handleNavigation = () => {
    setIsSidebarOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleNavigation}
          className="flex shrink-0 items-center"
        >
          <Image
            src={logo}
            alt="ProjectFlow Logo"
            width={500}
            height={500}
            priority
            className="h-20 w-60 object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex xl:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-[#075BE8]"
                  : "text-gray-600 hover:text-[#075BE8]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth / User Menu */}
        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 transition hover:bg-gray-50"
                aria-expanded={isUserMenuOpen}
                aria-label="Open user menu"
              >
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={displayName}
                    width={36}
                    height={36}
                    unoptimized
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#075BE8] text-sm font-semibold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <span className="max-w-[120px] truncate text-sm font-semibold text-gray-700">
                  {displayName}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {displayName}
                    </p>
                    {user.email && (
                      <p className="truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    )}
                    {user.role && (
                      <p className="mt-1 text-xs font-medium capitalize text-[#075BE8]">
                        {user.role.toLowerCase()}
                      </p>
                    )}
                  </div>

                  <Link
                    href={dashboardPath}
                    onClick={handleNavigation}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-[#075BE8]"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 transition hover:text-[#075BE8]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-[#075BE8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-700 lg:hidden"
          aria-label="Open navigation menu"
        >
          <FaBars size={22} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          {/* Mobile Sidebar */}
          <aside
            className="absolute top-0 right-0 flex h-full w-[min(85%,360px)] flex-col bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-5">
              <Link
                href="/"
                onClick={handleNavigation}
                className="flex items-center gap-2"
              >
                <Image
                  src={logo}
                  alt="ProjectFlow Logo"
                  width={500}
                  height={500}
                  className="h-12 w-36 object-contain"
                />
              </Link>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-700"
                aria-label="Close navigation menu"
              >
                <FaTimes size={22} />
              </button>
            </div>

            <div className="border-b border-gray-100 px-5 py-4">
              <p className="text-base font-bold text-gray-900">
                ProjectFlow
              </p>
              <p className="text-xs text-gray-500">
                Project Management SaaS
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavigation}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-blue-50 text-[#075BE8]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#075BE8]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 p-5">
              {isAuthenticated && user ? (
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt={displayName}
                        width={44}
                        height={44}
                        unoptimized
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075BE8] font-semibold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {displayName}
                      </p>
                      {user.email && (
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      )}
                      {user.role && (
                        <p className="mt-1 text-xs font-medium capitalize text-[#075BE8]">
                          {user.role.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={dashboardPath}
                    onClick={handleNavigation}
                    className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={handleNavigation}
                    className="rounded-lg border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={handleNavigation}
                    className="rounded-lg bg-[#075BE8] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
