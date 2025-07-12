import { Message } from "@/components/form-message";
import { Card } from "@/components/ui/card";
import Link from "next/link";

import { SignUpForm } from "./SignUpForm";

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<Message> | undefined;
}) {
  return (
    <Card className="mx-auto min-w-[400px] rounded-lg p-6 shadow-lg sm:min-w-[600px]">
      <h2 className="mb-4 text-2xl font-bold">Sign Up</h2>
      <p className="mb-3 text-sm text-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-foreground underline" href="/sign-in">
          Sign In
        </Link>
      </p>
      <SignUpForm />
    </Card>
  );
}
