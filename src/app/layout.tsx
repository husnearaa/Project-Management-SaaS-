import type { Metadata } from "next";
 
import "./globals.css";
import { Toaster } from "sonner";

import ReduxProvider from "@/redux/ReduxProvider";
import { Lexend_Deca } from "next/font/google";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export const metadata: Metadata = {
  title: "Project Management SaaS",
   icons: {
    icon: "/logo.png",
  },
  description:
    "A SaaS platform for project management, task tracking, and team collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexendDeca.className} antialiased`}>
        <Toaster position="bottom-right" richColors />

        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
