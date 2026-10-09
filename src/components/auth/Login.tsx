// /* eslint-disable @typescript-eslint/no-explicit-any */

// "use client";

// import { useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// declare global {
//   interface Window {
//     google: any;
//   }
// }

// const GoogleLoginButton = () => {
//   const router = useRouter();
//   const buttonRef = useRef<HTMLDivElement>(null);

//   const handleGoogleLogin = async (response: any) => {
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL;

//       if (!apiUrl) {
//         toast.error("Backend API URL is not configured.");
//         return;
//       }

//       const res = await fetch(`${apiUrl}/auth/google`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           idToken: response.credential,
//         }),
//       });

//       const data = await res.json();

//       console.log("Google Login Response:", data);

//       if (!res.ok || !data.success) {
//         toast.error(data.message || "Google login failed.");
//         return;
//       }

//       toast.success("Google login successful!");

//       setTimeout(() => {
//         router.push("/product");
//         router.refresh();
//       }, 1000);
//     } catch (error) {
//       console.error("Google login error:", error);
//       toast.error("Unable to connect to the server. Please try again.");
//     }
//   };

//   useEffect(() => {
//     let script: HTMLScriptElement | null = null;
//     let isMounted = true;

//     const initializeGoogle = () => {
//       if (!isMounted || !window.google || !buttonRef.current) {
//         return;
//       }

//       const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

//       if (!clientId) {
//         console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
//         toast.error("Google login is not configured.");
//         return;
//       }

//       window.google.accounts.id.initialize({
//         client_id: clientId,
//         callback: handleGoogleLogin,
//       });

//       buttonRef.current.innerHTML = "";

//       window.google.accounts.id.renderButton(buttonRef.current, {
//         theme: "outline",
//         size: "large",
//         text: "signin_with",
//         shape: "rectangular",
//         width: 300,
//       });
//     };

//     if (window.google) {
//       initializeGoogle();
//     } else {
//       const existingScript = document.querySelector<HTMLScriptElement>(
//         'script[src="https://accounts.google.com/gsi/client"]',
//       );

//       if (existingScript) {
//         script = existingScript;

//         if (window.google) {
//           initializeGoogle();
//         } else {
//           existingScript.addEventListener("load", initializeGoogle);
//         }
//       } else {
//         script = document.createElement("script");
//         script.src = "https://accounts.google.com/gsi/client";
//         script.async = true;
//         script.defer = true;
//         script.onload = initializeGoogle;
//         script.onerror = () => {
//           console.error("Failed to load Google Identity Services.");
//           toast.error("Unable to load Google login.");
//         };

//         document.head.appendChild(script);
//       }
//     }

//     return () => {
//       isMounted = false;
//       script?.removeEventListener("load", initializeGoogle);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
//       <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg sm:p-10">
//         <h1 className="mb-2 text-center text-3xl font-bold text-gray-900">
//           Login
//         </h1>

//         <p className="mb-8 text-center text-sm text-gray-500">
//           Sign in to your account to continue
//         </p>

//         <form
//           className="space-y-5"
//           onSubmit={(event) => event.preventDefault()}
//         >
//           <div>
//             <label
//               htmlFor="email"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               Email address
//             </label>

//             <input
//               id="email"
//               type="email"
//               placeholder="Enter your email"
//               autoComplete="email"
//               className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block text-sm font-medium text-gray-700"
//             >
//               Password
//             </label>

//             <input
//               id="password"
//               type="password"
//               placeholder="Enter your password"
//               autoComplete="current-password"
//               className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//             />
//           </div>

//           <button
//             type="button"
//             className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
//           >
//             Login
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="h-px flex-1 bg-gray-200" />
//             <span className="text-sm text-gray-400">OR</span>
//             <div className="h-px flex-1 bg-gray-200" />
//           </div>

//           <div className="flex justify-center">
//             <div ref={buttonRef} id="google-login-button" />
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default GoogleLoginButton;




import React from 'react';

const Login = () => {
  return (
    <div>
      login page
      
    </div>
  );
};

export default Login;