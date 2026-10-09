"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowRight,
  Mail,
  MessageSquare,
  MapPin,
  Send,
} from "lucide-react";



type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log("Contact Form Data:", data);

      toast.success("Your message has been submitted successfully!");
      reset();
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit your message. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 mt-10">
      {/* Hero */}
      <section className="px-5 pb-12 pt-20 sm:px-8 sm:pt-24 lg:px-12">
        <div className="mx-auto max-w-[1440px] text-center">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <MessageSquare size={16} />
            We&apos;re here to help
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-950 md:text-3xl lg:text-4xl">
            Get in touch with us
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Have a question about ProjectFlow? We&apos;d love to hear
            from you. Send us a message and let&apos;s connect.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Contact Information */}
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold text-slate-950 md:text-2xl">
              Let&apos;s talk about your work
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-slate-600">
              Whether you need help getting started or want to learn
              more about our platform, you can reach out using the
              contact options below.
            </p>

            <div className="mt-9 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Email us
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    For questions and general inquiries.
                  </p>
                  <a
                    href="mailto:support@projectflow.com"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    support@projectflow.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Product support
                  </h3>
                  <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">
                    Need help with projects, tasks, team members, or
                    subscriptions? Send us a message.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Work from anywhere
                  </h3>
                  <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">
                    Manage projects and collaborate with your team
                    from one organized workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-semibold text-slate-950">
                New to ProjectFlow?
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Create your account to start organizing projects
                and managing tasks with your team.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Get started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
                  ✓
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-950">
                  Thank you for reaching out!
                </h2>
                <p className="mt-3 max-w-sm leading-7 text-slate-600">
                  Your form was validated successfully. This demo
                  currently logs the submitted data in your browser
                  console.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-950">
                    Send us a message
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Fill out the form below and tell us how we can help.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      {...register("name", {
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters",
                        },
                        maxLength: {
                          value: 80,
                          message: "Name cannot exceed 80 characters",
                        },
                      })}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      {...register("subject", {
                        required: "Please select a subject",
                      })}
                      defaultValue=""
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="" disabled>
                        Select a subject
                      </option>
                      <option value="general">General inquiry</option>
                      <option value="support">Technical support</option>
                      <option value="billing">Subscription and billing</option>
                      <option value="feedback">Feedback and suggestions</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      {...register("message", {
                        required: "Message is required",
                        minLength: {
                          value: 10,
                          message: "Message must be at least 10 characters",
                        },
                        maxLength: {
                          value: 2000,
                          message: "Message cannot exceed 2000 characters",
                        },
                      })}
                      placeholder="Tell us how we can help..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    Send message
                  </button>

                  {/* <p className="text-center text-xs leading-5 text-slate-500">
                    Demo form: submitted data is logged in the browser
                    console and is not sent to a server.
                  </p> */}
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}