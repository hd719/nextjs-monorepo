import { Message } from "@/components/form-message";
import Link from "next/link";

import { SignInForm } from "./SignInForm";

export default function SignIn({ searchParams }: { searchParams: Message }) {
  return (
    <>
      <h1 className="mb-3 text-2xl font-medium">Sign in</h1>
      <p className="mb-3 text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="font-medium text-foreground underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <SignInForm />
    </>
  );
}
