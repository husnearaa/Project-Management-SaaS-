
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import logo from "@/assets/logo.png";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Guides", href: "/guides" },
      { label: "API Docs", href: "/api-docs" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    Icon: Facebook,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/",
    Icon: Twitter,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    Icon: Linkedin,
  },
  {
    label: "GitHub",
    href: "https://github.com/",
    Icon: Github,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-10 pb-5 sm:px-8 sm:pt-12 lg:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 md:grid-cols-4 md:gap-x-6 md:gap-y-8 lg:grid-cols-[1.7fr_repeat(4,minmax(0,1fr))] lg:gap-10 xl:gap-14">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1">
            <Link
              href="/"
              className="mb-4 inline-flex items-center"
              aria-label="ProjectFlow home"
            >
              <Image
                src={logo}
                alt="ProjectFlow logo"
                width={500}
                height={500}
                priority
                className="h-16 w-48 object-contain object-left sm:h-20 sm:w-60"
              />
            </Link>

            <p className="max-w-[280px] text-sm leading-6 text-slate-600">
              Plan projects, manage tasks, collaborate and track progress in one
              place.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-5">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#172033] transition-colors duration-200 hover:text-blue-600"
                >
                  <Icon
                    size={18}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Navigation Columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h3 className="mb-4 text-sm font-bold text-[#172033]">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="break-words text-[13px] leading-5 text-slate-500 transition-colors duration-200 hover:text-blue-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-100 pt-5 text-center">
          <p className="text-xs leading-5 text-slate-500 sm:text-[13px]">
            © {new Date().getFullYear()} ProjectFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}