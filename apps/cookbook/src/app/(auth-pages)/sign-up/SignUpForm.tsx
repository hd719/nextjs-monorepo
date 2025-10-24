"use client";

import { useActionState, useTransition } from "react";

import { signUpAction } from "@/app/actions";
import { cn } from "@/app/utils/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SmtpMessage } from "../smtp-message";
import { schema } from "./SignUpFormSchema";

type SignUpFormData = z.infer<typeof schema>;

export const SignUpForm = () => {
  // React Hook Form setup with Zod validation
  // This handles client-side validation and form state management
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first: "",
      last: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [state, formAction] = useActionState(signUpAction, {
    message: "",
    type: "error" as const,
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (validatedData: SignUpFormData) => {
    startTransition(() => {
      // Convert React Hook Form data to Web API FormData for server action
      const serverFormData = new FormData();
      serverFormData.append("first", validatedData.first);
      serverFormData.append("last", validatedData.last);
      serverFormData.append("email", validatedData.email);
      serverFormData.append("password", validatedData.password);

      formAction(serverFormData);
    });
  };

  return (
    <div className="relative">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "flex w-full flex-col space-y-3"
            // process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
          )}
        >
          <div className="gap-2">
            <FormField
              control={form.control}
              name="first"
              render={({ field }) => (
                <FormItem className="mb-3 w-full">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last"
              render={({ field }) => (
                <FormItem className="mb-3 w-full">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your last name." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-m w-full text-white transition duration-300 marker:py-2 hover:bg-blue-600"
          >
            {isPending ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
        {/* Fixed height container to prevent layout shift */}
        <div className="mt-2 flex h-16 items-start">
          {state.message ? (
            <Alert
              variant={state.type === "success" ? "default" : "destructive"}
              className={`w-full ${state.type === "success" ? "border-green-200 bg-green-50 text-green-800" : ""}`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {state.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <SmtpMessage />
      </Form>
    </div>
  );
};
