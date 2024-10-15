import { Message } from "@/components/form-message";
import { Card } from "@/components/ui/card";

import { SignUpForm } from "./SignUpForm";

export default function Signup({ searchParams }: { searchParams: Message }) {
  return (
    <Card className="mx-auto min-w-[400px] rounded-lg p-6 shadow-lg sm:min-w-[600px]">
      <h2 className="mb-4 text-2xl font-bold">Sign Up</h2>
      <SignUpForm />
    </Card>
  );
}
