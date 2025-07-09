import { Suspense } from "react";

import { createClient } from "@/app/utils/supabase/server";
import { cn } from "@/app/utils/utils";
import NavClient from "@/components/Nav/NavClient";
import Link from "next/link";

export default function NavServer(): JSX.Element {
  return (
    <nav
      className={cn(
        "flex h-16 w-full justify-center border-b border-b-foreground/10",
        process.env.NEXT_PUBLIC_DEBUG && "border-2 border-green-600"
      )}
    >
      <StaticNav />
      <Suspense fallback={<div>Loading user...</div>}>
        <DynamicNav />
      </Suspense>
    </nav>
  );
}

function StaticNav() {
  return (
    <div
      className={cn(
        "flex w-full max-w-5xl items-center justify-between text-sm",
        process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
      )}
    >
      <div className="flex items-center gap-5 font-semibold">
        <Link href={"/"}>Payal's Cookbook</Link>
        <div className="flex items-center gap-2"></div>
      </div>
    </div>
  );
}

async function DynamicNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Simulating a slow network request
  // async function getUser() {
  //   await new Promise((resolve) => setTimeout(resolve, 3000));
  //   return {
  //     email: "hameldesai93@gmail.com",
  //   };
  // }

  // const user = await getUser();

  return (
    <div className="flex items-center gap-5 font-semibold">
      <NavClient userEmail={user?.email as string} />
    </div>
  );
}
