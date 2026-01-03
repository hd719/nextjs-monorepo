import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout-container">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="app-layout-content-wrapper">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="app-layout-main">
          <div className="app-layout-main-inner">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
