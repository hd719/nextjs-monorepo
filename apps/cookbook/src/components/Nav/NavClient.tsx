"use client";

import { signOutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import Link from "next/link";

type NavClientProps = {
  userEmail: string;
};

export default function NavClient({
  userEmail,
}: NavClientProps): React.JSX.Element {
  return userEmail ? (
    <div className="flex items-center gap-4">
      <div className="flex items-center md:hidden">
        <span className="mr-3">Hey, {userEmail}!</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="p-2">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Button variant="outline">
                <Link href="/protected/upload-recipe">Upload Recipe</Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button variant="outline">
                <Link href="/protected/add-recipe">Add New Recipe</Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={signOutAction}>
                <Button variant="outline" type="submit">
                  Sign out
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="hidden items-center gap-4 md:flex">
        Hey, {userEmail}!
        <Button variant="outline">
          <Link href="/protected/upload-recipe">Upload Recipe</Link>
        </Button>
        <Button type="submit" variant="outline">
          <Link href="/protected/add-recipe">Add New Recipe</Link>
        </Button>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
