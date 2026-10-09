// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { FaBars, FaTimes } from "react-icons/fa";

// import logo from "@/assets/logo.png";

// export default function Navbar() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const pathname = usePathname();

//   const navLinks = [
//     { href: "/", label: "Home" },
//     { href: "/services", label: "Services" },
//     { href: "/technicians", label: "Technicians" },
//     // { href: "/how-it-works", label: "How It Works" },
//   ];

//   return (
//     <nav className="fixed top-0 left-0 z-50 w-full bg-white shadow-sm">
//       <div className="container mx-auto flex items-center justify-between px-4 py-3">
//         {/* ==================== Logo ==================== */}
//         <Link href="/" className="flex items-center">
//           <Image
//             src={logo}
//             alt="FixItNow Logo"
//             width={500}
//             height={500}
//             priority
//             className="h-14 w-40"
//           />
//         </Link>

//         {/* ==================== Desktop Navigation ==================== */}
//         <div className="hidden items-center gap-8 lg:flex">
//           {/* Navigation Links */}
//           <div className="flex items-center gap-8">
//             {navLinks.map((link) => {
//               const isActive = pathname === link.href;

//               return (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`font-medium transition-colors duration-200 text-sm ${
//                     isActive
//                       // ? "text-[#EC620B]"
//                       ? "text-button-bg"
//                       : "text-[#00214C] hover:text-[#EC620B]"
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               );
//             })}
//           </div>

//           {/* Login Button */}
//           <Link
//             href="/login"
//             className="flex items-center gap-2 rounded-md bg-button-bg px-5 py-2.5 font-medium text-white transition-all duration-200 hover:bg-[#d95608]"
//           >
//             <span>Login</span>
//           </Link>
//         </div>

//         {/* ==================== Mobile Menu Button ==================== */}
//         <button
//           onClick={() => setIsSidebarOpen(true)}
//           className="text-[#00214C] transition-colors hover:text-[#EC620B] lg:hidden"
//           aria-label="Open menu"
//         >
//           <FaBars size={24} />
//         </button>
//       </div>

//       {/* ==================== Mobile Sidebar ==================== */}
//       <div
//         className={`fixed top-0 left-0 z-50 h-screen w-full bg-white shadow-xl transition-transform duration-300 ease-in-out ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         }`}
//       >
//         <div className="p-5">
//           {/* Mobile Header */}
//           <div className="mb-8 flex items-center justify-between">
//             <Link
//               href="/"
//               onClick={() => setIsSidebarOpen(false)}
//               className="flex items-center"
//             >
//               <Image
//                 src={logo}
//                 alt="FixItNow Logo"
//                 width={500}
//                 height={500}
//                 priority
//                 className="h-12 w-38"
//               />
//             </Link>

//             <button
//               onClick={() => setIsSidebarOpen(false)}
//               className="text-[#00214C] transition-colors hover:text-[#EC620B]"
//               aria-label="Close menu"
//             >
//               <FaTimes size={24} />
//             </button>
//           </div>

//           {/* Mobile Navigation Links */}
//           <div className="flex flex-col">
//             {navLinks.map((link) => {
//               const isActive = pathname === link.href;

//               return (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   onClick={() => setIsSidebarOpen(false)}
//                   className={`border-b border-gray-200 py-4 font-medium transition-colors duration-200 ${
//                     isActive
//                       ? "text-[#EC620B]"
//                       : "text-[#00214C] hover:text-[#EC620B]"
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               );
//             })}

//             {/* Mobile Login Button */}
//             <Link
//               href="/login"
//               onClick={() => setIsSidebarOpen(false)}
//               className="mt-6 flex items-center justify-center gap-2 rounded-md bg-[#EC620B] px-5 py-3 font-medium text-white transition-all duration-200 hover:bg-[#d95608]"
//             >
//               <span>Login</span>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* ==================== Mobile Overlay ==================== */}
//       {isSidebarOpen && (
//         <div
//           onClick={() => setIsSidebarOpen(false)}
//           className="fixed inset-0 z-40 bg-black/30 lg:hidden"
//         />
//       )}
//     </nav>
//   );
// }





import React from 'react';

const Navbar = () => {
  return (
    <div>
      navbar
    </div>
  );
};

export default Navbar;