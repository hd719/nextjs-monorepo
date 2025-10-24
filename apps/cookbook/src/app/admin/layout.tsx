import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  // Extract user info for client components
  const userInfo = {
    id: user.id,
    email: user.email || "Unknown",
    name: user.user_metadata?.name || user.email?.split("@")[0] || "Admin",
  };

  return <AdminLayoutClient user={userInfo}>{children}</AdminLayoutClient>;
}
