import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
          "min-h-screen max-w-2xl mx-auto bg-gradient-to-b from-lightWhite to-vanilla h-screen font-sans antialiased text-default border-2 border-red-600",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
