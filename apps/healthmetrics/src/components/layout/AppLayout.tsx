import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import styles from "./AppLayout.module.css";

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.container}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className={styles.contentWrapper}>
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className={styles.main}>
          <div className={styles.mainInner}>{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
