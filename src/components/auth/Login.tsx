
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  FolderKanban,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

type LoginFormData = {
  email: string;
  password: string;
};

type UserRole = "ADMIN" | "MANAGER" | "MEMBER";

type AuthResponse = {
  success?: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
    user?: {
      id?: string;
      email?: string;
      role?: UserRole;
      [key: string]: unknown;
    };
  };
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              shape?: string;
              width?: number;
              text?: string;
            },
          ) => void;
        };
      };
    };
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const demoAccounts: {
  role: UserRole;
  label: string;
  email: string;
  password: string;
}[] = [
  {
    role: "ADMIN",
    label: "Admin",
    email: "superadmin@example.com",
    password: "Super@admin12345",
  },
  {
    role: "MANAGER",
    label: "Manager",
    email: "manager@example.com",
    password: "Manager@12345",
  },
  {
    role: "MEMBER",
    label: "Member",
    email: "member@example.com",
    password: "Member@12345",
  },
];

function getDashboardPath(role?: string) {
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
}

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const finishLogin = useCallback(
    (result: AuthResponse) => {
      const data = result.data;
      const accessToken =
        data?.accessToken ?? data?.tokens?.accessToken ?? data?.token;
      const refreshToken =
        data?.refreshToken ?? data?.tokens?.refreshToken;
      const user = data?.user;

      if (!result.success || !accessToken) {
        throw new Error(result.message || "Login failed.");
      }

      localStorage.setItem("accessToken", accessToken);

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast.success(result.message || "Login successful!");
      router.replace(getDashboardPath(user?.role));
    },
    [router],
  );

  const loginWithCredentials = async (
    credentials: LoginFormData,
    role?: UserRole,
  ) => {
    if (!API_URL) {
      toast.error("API URL is missing. Check your .env.local file.");
      return;
    }

    setLoadingRole(role ?? null);

    try {
      console.log("Login Form Data:", credentials);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = (await response.json()) as AuthResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid email or password.");
      }

      finishLogin(result);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.",
      );
    } finally {
      setLoadingRole(null);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    console.log("Submitted Login Form Data:", data);
    await loginWithCredentials(data);
  };

  const handleGoogleCredential = async (credential: string) => {
    if (!API_URL) {
      toast.error("API URL is missing. Check your .env.local file.");
      return;
    }

    setGoogleLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const result = (await response.json()) as AuthResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Google login failed.");
      }

      finishLogin(result);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Google login failed. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const initializeGoogle = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId || !window.google) return;

    const button = document.getElementById("google-login-button");

    if (!button) return;

    button.replaceChildren();

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          void handleGoogleCredential(response.credential);
        } else {
          toast.error("Google did not return a credential.");
        }
      },
    });

    window.google.accounts.id.renderButton(button, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      width: Math.max(260, Math.floor(button.clientWidth)),
      text: "continue_with",
    });
  }, []);

  useEffect(() => {
    if (window.google) initializeGoogle();
  }, [initializeGoogle]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      {/* Centered Login Form */}
      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="mb-5 inline-block text-xl font-bold tracking-tight text-slate-950"
            >
              Project<span className="text-blue-600">Flow</span>
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Sign in
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter your details to access your workspace.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
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
                  {...register("email", {
                    required: "Email address is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loadingRole !== null || googleLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  {/* <ArrowRight size={17} /> */}
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google Login */}
          <div className="relative">
            <div
              id="google-login-button"
              className="flex min-h-11 w-full justify-center"
            />

            {googleLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                <LoaderCircle
                  size={22}
                  className="animate-spin text-blue-600"
                />
              </div>
            )}

            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="mt-2 text-center text-xs text-amber-600">
                Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google login.
              </p>
            )}
          </div>

          {/* Demo Accounts */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Try a demo account
              </h2>
              <span className="text-xs text-slate-500">One-click login</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((account) => {
                const Icon =
                  account.role === "ADMIN"
                    ? ShieldCheck
                    : account.role === "MANAGER"
                      ? FolderKanban
                      : Users;

                return (
                  <button
                    key={account.role}
                    type="button"
                    disabled={
                      isSubmitting ||
                      loadingRole !== null ||
                      googleLoading
                    }
                    onClick={() => {
                      setValue("email", account.email);
                      setValue("password", account.password);

                      void loginWithCredentials(
                        {
                          email: account.email,
                          password: account.password,
                        },
                        account.role,
                      );
                    }}
                    className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingRole === account.role ? (
                      <LoaderCircle
                        size={19}
                        className="animate-spin text-blue-600"
                      />
                    ) : (
                      <Icon size={19} className="text-blue-600" />
                    )}

                    {account.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-7 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 transition hover:text-blue-600"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}