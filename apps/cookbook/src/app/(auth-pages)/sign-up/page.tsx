import { Message } from "@/components/form-message";

import { SignUpForm } from "./SignUpForm";

export default function Signup({ searchParams }: { searchParams: Message }) {
  return (
    <>
      <h1 className="mb-3 text-2xl font-medium">Sign up</h1>
      <SignUpForm />
    </>
  );
}
