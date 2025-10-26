import { Card } from "@/components/ui/card";
import Link from "next/link";

import { SignInForm } from "./SignInForm";

export default async function SignIn() {
  return (
    <Card className="mx-auto min-w-[400px] rounded-lg p-6 shadow-lg sm:min-w-[600px]">
      <h2 className="mb-4 text-2xl font-bold">Sign In</h2>
      <p className="mb-3 text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="font-medium text-foreground underline" href="/sign-up">
          Sign Up
        </Link>
      </p>
      <SignInForm />
    </Card>
  );
}
