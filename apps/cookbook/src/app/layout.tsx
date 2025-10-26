import Footer from "@/components/Footer";
import { LayoutWrapper } from "@/components/layout-wrapper";
import Nav from "@/components/Nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { generateSiteMetadata } from "@/lib/seo";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

import "./globals.css";

export const metadata = generateSiteMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="overflow-x-hidden bg-background bg-white text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col overflow-hidden">
            <LayoutWrapper nav={<Nav />}>
              <main className="flex flex-1 flex-col">{children}</main>
            </LayoutWrapper>
            <Footer />
            {/* Theme Switcher - Hidden in production, visible in debug mode */}
            {process.env.NEXT_PUBLIC_DEBUG && (
              <div className="fixed bottom-4 right-4 z-50">
                <ThemeSwitcher />
              </div>
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
