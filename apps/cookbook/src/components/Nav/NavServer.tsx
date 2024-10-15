import { createClient } from "@/app/utils/supabase/server";
import { cn } from "@/app/utils/utils";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";

export default async function NavServer(): Promise<JSX.Element> {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <nav
      className={cn(
        "flex h-16 w-full justify-center border-b border-b-foreground/10",
        process.env.NEXT_PUBLIC_DEBUG && "border-2 border-green-600"
      )}
    >
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
        <div className="flex items-center gap-5 font-semibold">
          <HeaderAuth />
        </div>
      </div>
    </nav>
  );
}
