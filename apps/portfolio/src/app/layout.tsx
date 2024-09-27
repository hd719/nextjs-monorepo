import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/app/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Hamel Desai",
  description: "Software Engineer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "mx-auto min-h-screen max-w-2xl bg-gradient-to-b from-white to-vanilla font-sans text-default antialiased",
          process.env.NEXT_PUBLIC_DEBUG && "border-2 border-red-600",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
