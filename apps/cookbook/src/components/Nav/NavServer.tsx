import { Suspense } from "react";

import { createClient } from "@/app/utils/supabase/server";
import { cn } from "@/app/utils/utils";
import NavClient from "@/components/Nav/NavClient";
import Link from "next/link";

export default function NavServer(): React.JSX.Element {
  return (
    <nav
      className={cn(
        "flex h-16 w-full justify-center border-b border-b-foreground/10",
        process.env.NEXT_PUBLIC_DEBUG && "border-2 border-green-600"
      )}
    >
      <div className="flex w-full items-center justify-between text-sm">
        <StaticNav />
        <Suspense fallback={<div>Loading user...</div>}>
          <DynamicNav />
        </Suspense>
      </div>
    </nav>
  );
}

function StaticNav() {
  return (
    <div className="flex items-center gap-5 font-semibold">
      <Link href={"/"}>Payal's Cookbook</Link>
    </div>
  );
}

async function DynamicNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NavClient userEmail={user?.email as string} />;
}
