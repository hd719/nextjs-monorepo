import { cn } from "@/app/utils/utils";
import { LayoutWrapper } from "@/components/layout-wrapper";
import Nav from "@/components/Nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Cookbook",
  description: "Payal's Cookbook",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main
            className={cn(
              "flex min-h-screen flex-col items-center",
              process.env.NEXT_PUBLIC_DEBUG && "border-2 border-red-600"
            )}
          >
            <LayoutWrapper nav={<Nav />}>{children}</LayoutWrapper>
            <footer
              className={cn(
                "mx-auto flex w-full max-w-[1300px] items-center justify-center border-t text-center text-xs",
                process.env.NEXT_PUBLIC_DEBUG && "border-2 border-cyan-600"
              )}
            >
              <p>Footer</p>
              <ThemeSwitcher />
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
