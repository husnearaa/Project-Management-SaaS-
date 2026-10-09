"use client";

import Image from "next/image";
import Link from "next/link";
import dashboardImage from "@/assets/images/heroImg.png";
import { FaArrowRight, FaCheckCircle, FaStar } from "react-icons/fa";

export default function HeroSection() {
  const benefits = ["No credit card required", "Easy to use", "Cancel anytime"];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-white to-[#f1f5ff] mt-12">
      {/* Background Decorations */}{" "}
      <div className="pointer-events-none absolute -right-24 top-40 -z-10 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />{" "}
      <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-64 w-64 rounded-full bg-indigo-100/40 blur-3xl" />
      <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-[1440px] grid-cols-1 items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:px-12 lg:py-16 xl:gap-14">
        {/* Left Content */}
        <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dce5ff] bg-[#f0f4ff] px-3 py-1.5 text-xs font-medium text-[#263b63] sm:mb-6">
            <FaStar className="text-amber-400" size={13} />
            <span>All-in-one Project Management Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl leading-[1.15] font-extrabold tracking-tight text-[#071943] md:text-4xl lg:text-[42px] xl:text-[48px]">
            Plan. Organize.
            <br />
            Track. Deliver
            <br />
            <span className="text-[#1458ee]">Success.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#475569] sm:text-base lg:mx-0 lg:text-[14px]">
            ProjectFlow helps teams plan projects, manage tasks, collaborate in
            real-time, and track progress – all in one powerful workspace.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 min-[420px]:flex-row min-[420px]:items-center lg:justify-start">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-[#1558ed] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0847d4] hover:shadow-lg"
            >
              Get Started Free
              <FaArrowRight size={14} />
            </Link>

            <Link
              href="/features"
              className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border-2 border-[#8eafff] bg-white px-5 py-3 text-sm font-semibold text-[#1558ed] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1558ed] hover:bg-blue-50"
            >
              Explore Features
              <FaArrowRight size={14} />
            </Link>
          </div>

          {/* Benefits */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 lg:justify-start xl:gap-x-6">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-1.5 text-xs font-medium text-[#475569]"
              >
                <FaCheckCircle className="shrink-0 text-[#1558ed]" size={14} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Dashboard Image */}
        <div className="relative mx-auto w-full max-w-[760px] lg:ml-auto lg:max-w-none">
          {/* Image Glow */}
          <div className="absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-br from-blue-100/70 to-indigo-100/50 blur-xl sm:-inset-5" />

          {/* Dashboard Image Card */}
          <div className="overflow-hidden rounded-xl border border-[#e7ecf5] bg-white shadow-[0_12px_40px_rgba(30,64,175,0.10)] sm:rounded-2xl">
            <Image
              src={dashboardImage}
              alt="ProjectFlow project management dashboard showing project statistics, progress charts, task status, and recent tasks"
              priority
              placeholder="blur"
              sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 58vw, 760px"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
      {/* Decorative Dots */}
      <div className="pointer-events-none absolute right-3 top-[58%] -z-10 hidden grid-cols-3 gap-3 opacity-50 lg:grid">
        {Array.from({ length: 15 }).map((_, index) => (
          <span key={index} className="h-1.5 w-1.5 rounded-full bg-[#b7caff]" />
        ))}
      </div>
    </section>
  );
}
