/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

// Update this import path if your Redux API file is located elsewhere.
import { useRegisterMutation } from "@/redux/api/authApi";

// declare global {
//   interface Window {
//     google: any;
//   }
// }

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ApiResponse = {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "MANAGER" | "MEMBER";
    status: string;
    authProvider: string;
    emailVerified: boolean;
    createdAt: string;
  };
};

const RegisterPage = () => {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [registerUser, { isLoading }] = useRegisterMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Normal email/password registration
  const onSubmit = async (formData: RegisterFormData) => {
    console.log("Registration Form Data:", formData);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = (await registerUser(payload).unwrap()) as ApiResponse;

      console.log("Registration API Response:", response);

      if (!response.success) {
        toast.error(response.message || "Registration failed.");
        return;
      }

      toast.success(response.message || "User registered successfully!");

      // The backend returns user information but no access token here.
      // Send the user to login after successful registration.
      router.push("/login");
    } catch (error: any) {
      console.error("Registration Error:", error);

      const message =
        error?.data?.message ||
        error?.message ||
        "Unable to register. Please try again.";

      toast.error(message);
    }
  };

  // Google registration/login using the existing backend Google endpoint
  const handleGoogleRegister = async (response: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        toast.error("Backend API URL is not configured.");
        return;
      }

      setIsGoogleLoading(true);

      const res = await fetch(`${apiUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken: response.credential,
        }),
      });

      const data = await res.json();

      console.log("Google Authentication Response:", data);

      if (!res.ok || !data.success) {
        toast.error(data.message || "Google authentication failed.");
        return;
      }

      toast.success(data.message || "Google authentication successful!");

      // Change this destination if your backend returns tokens and
      // your login flow stores them in Redux or your chosen auth storage.
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Google registration error:", error);
      toast.error("Unable to connect to the server. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Initialize Google Identity Services button
  useEffect(() => {
    let isMounted = true;
    let script: HTMLScriptElement | null = null;

    const initializeGoogle = () => {
      if (!isMounted || !window.google || !googleButtonRef.current) {
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleRegister,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "rectangular",
        width: 300,
      });
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      );

      if (existingScript) {
        script = existingScript;
        existingScript.addEventListener("load", initializeGoogle);
      } else {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        script.onerror = () => {
          console.error("Failed to load Google Identity Services.");
        };

        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      script?.removeEventListener("load", initializeGoogle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
            <div className="mb-8 text-center">
              <Link
                href="/"
                className="mb-5 inline-block text-xl font-bold tracking-tight text-slate-950"
              >
                Project<span className="text-blue-600">Flow</span>
              </Link>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Start your journey with ProjectFlow by creating an account.
              </p>
            </div>

            {/* Registration form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className={inputClass}
                    {...register("name", {
                      required: "Full name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters.",
                      },
                    })}
                  />
                </div>

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                    {...register("email", {
                      required: "Email address is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address.",
                      },
                    })}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className={inputClass}
                    {...register("password", {
                      required: "Password is required.",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters.",
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className={inputClass}
                    {...register("confirmPassword", {
                      required: "Please confirm your password.",
                      validate: (value) =>
                        value === password || "Passwords do not match.",
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    {/* <ArrowRight size={18} /> */}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google button */}
            <div className="flex min-h-10 justify-center">
              <div ref={googleButtonRef} id="google-register-button" />
            </div>

            {isGoogleLoading && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin" />
                Connecting to Google...
              </p>
            )}

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Create your account to get started with ProjectFlow.
          </p>
        </div>
      </main>
    </>
  );
};

export default RegisterPage;
