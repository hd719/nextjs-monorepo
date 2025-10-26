"use client";

import { useActionState, useTransition } from "react";

import { signInAction } from "@/app/actions";
import { cn } from "@/app/utils/utils";
import { FormMessage as ServerFormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SmtpMessage } from "../smtp-message";
import { schema } from "./SignInFormSchema";

type SignInFormData = z.infer<typeof schema>;

export const SignInForm = () => {
  // React Hook Form setup with Zod validation
  // This handles client-side validation and form state management
  const form = useForm<SignInFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [state, formAction] = useActionState(signInAction, {
    message: "",
    type: "error" as const,
  });

  // React transition for non-blocking UI updates
  // This provides loading states and keeps the UI responsive during submission
  const [isPending, startTransition] = useTransition();

  /**
   * Handle form submission with hybrid approach:
   * 1. React Hook Form validates the data client-side first
   * 2. If validation passes, we manually create Web API FormData for the server action
   * 3. startTransition makes the server call non-blocking for better UX
   * 4. FormData is a browser built-in that creates key-value pairs representing form fields and their values. It's designed for sending form data to servers.
   */
  const onSubmit = (validatedData: SignInFormData) => {
    startTransition(() => {
      // Convert React Hook Form data to Web API FormData for server action
      const serverFormData = new FormData();
      serverFormData.append("email", validatedData.email);
      serverFormData.append("password", validatedData.password);

      // Call the server action with the Web API FormData
      formAction(serverFormData);
    });
  };

  return (
    <div className="relative">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "flex w-full flex-col space-y-5"
            // process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
          )}
        >
          <div className="gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-3 w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-3 w-full">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <Link
                className="text-xs text-foreground underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-m w-full text-white transition duration-300 marker:py-2 hover:bg-blue-600"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        {/* Fixed height container to prevent layout shift */}
        <div className="mt-2 flex h-16 items-start">
          {state.message && (
            <ServerFormMessage message={{ error: state.message }} />
          )}
        </div>
        <SmtpMessage />
      </Form>
    </div>
  );
};
