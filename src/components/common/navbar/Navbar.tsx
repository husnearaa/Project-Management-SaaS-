"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
// import logo from "@/assets/logo.png";
const logo = "/logo.png";

const navLinks = [
{ href: "/", label: "Home" },
{ href: "/about", label: "About" },
{ href: "/features", label: "Features" },
{ href: "/pricing", label: "Pricing" },
{ href: "/contact", label: "Contact" },
];

export default function Navbar() {
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const pathname = usePathname();

const isActive = (href: string) => pathname === href;

const closeSidebar = () => setIsSidebarOpen(false);

return ( <nav className="fixed top-0 left-0 z-50 w-full border-b border-gray-100 bg-white"> <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
{/* Logo */} <Link
       href="/"
       onClick={closeSidebar}
       className="flex shrink-0 items-center gap-2.5"
     > <Image
         src={logo}
         alt="ProjectFlow logo"
         width={40}
         height={40}
         priority
         className="h-9 w-9 object-contain"
       />


      <div className="flex flex-col">
        <span className="text-[17px] leading-5 font-bold tracking-tight text-[#172033]">
          ProjectFlow
        </span>
        <span className="mt-0.5 text-[10px] leading-3 text-gray-500">
          Project Management SaaS
        </span>
      </div>
    </Link>

    {/* Desktop Navigation */}
    <div className="hidden items-center gap-7 lg:flex xl:gap-10">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          className={`text-[13px] font-semibold transition-colors duration-200 ${
            isActive(link.href)
              ? "text-[#075BE8]"
              : "text-[#172033] hover:text-[#075BE8]"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>

    {/* Desktop Buttons */}
    <div className="hidden shrink-0 items-center gap-7 lg:flex">
      <Link
        href="/login"
        className="text-[13px] font-semibold text-[#172033] transition-colors hover:text-[#075BE8]"
      >
        Login
      </Link>

      <Link
        href="/register"
        className="rounded-lg bg-[#075BE8] px-6 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#064ac0]"
      >
        Get Started Free
      </Link>
    </div>

    {/* Mobile Menu Toggle */}
    <button
      type="button"
      onClick={() => setIsSidebarOpen(true)}
      aria-label="Open navigation menu"
      aria-expanded={isSidebarOpen}
      className="rounded-md p-2 text-[#172033] transition-colors hover:bg-gray-100 lg:hidden"
    >
      <FaBars size={22} />
    </button>
  </div>

  {/* Mobile Overlay */}
  {isSidebarOpen && (
    <button
      type="button"
      onClick={closeSidebar}
      aria-label="Close navigation menu"
      className="fixed inset-0 z-40 bg-black/40 lg:hidden"
    />
  )}

  {/* Mobile Sidebar */}
  <aside
    id="mobile-navigation"
    aria-label="Mobile navigation"
    aria-hidden={!isSidebarOpen}
    className={`fixed top-0 right-0 z-50 h-dvh w-[min(85%,360px)] overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
      isSidebarOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    {/* Mobile Header */}
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
      <Link
        href="/"
        onClick={closeSidebar}
        tabIndex={isSidebarOpen ? 0 : -1}
        className="flex items-center gap-2.5"
      >
        <Image
          src={logo}
          alt="ProjectFlow logo"
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
        />

        <div className="flex flex-col">
          <span className="text-base leading-5 font-bold text-[#172033]">
            ProjectFlow
          </span>
          <span className="mt-0.5 text-[10px] text-gray-500">
            Project Management SaaS
          </span>
        </div>
      </Link>

      <button
        type="button"
        onClick={closeSidebar}
        aria-label="Close navigation menu"
        className="rounded-md p-2 text-[#172033] transition-colors hover:bg-gray-100"
      >
        <FaTimes size={21} />
      </button>
    </div>

    {/* Mobile Links */}
    <div className="flex flex-col px-5 py-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={closeSidebar}
          tabIndex={isSidebarOpen ? 0 : -1}
          aria-current={isActive(link.href) ? "page" : undefined}
          className={`border-b border-gray-100 py-4 text-sm font-semibold transition-colors duration-200 ${
            isActive(link.href)
              ? "text-[#075BE8]"
              : "text-[#172033] hover:text-[#075BE8]"
          }`}
        >
          {link.label}
        </Link>
      ))}

      {/* Mobile Login */}
      <Link
        href="/login"
        onClick={closeSidebar}
        tabIndex={isSidebarOpen ? 0 : -1}
        className="mt-5 rounded-lg border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-[#172033] transition-colors hover:bg-gray-50"
      >
        Login
      </Link>

      {/* Mobile CTA */}
      <Link
        href="/register"
        onClick={closeSidebar}
        tabIndex={isSidebarOpen ? 0 : -1}
        className="mt-3 rounded-lg bg-[#075BE8] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#064ac0]"
      >
        Get Started Free
      </Link>
    </div>
  </aside>
</nav>
);
}
