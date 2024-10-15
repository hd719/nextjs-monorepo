"use client";

import { useRef } from "react";

import { signInAction } from "@/app/actions";
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
import Link from "next/link";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SmtpMessage } from "../smtp-message";
import { schema } from "./SignInFormSchema";

type OurSchema = z.infer<typeof schema>;

export const SignInForm = () => {
  const form = useForm<OurSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [state, formAction] = useFormState(signInAction, {
    message: "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={formAction}
        onSubmit={form.handleSubmit(() => {
          event?.preventDefault();
          return formRef.current?.submit();
        })}
        className={cn(
          "flex w-full flex-col space-y-5 border-2",
          process.env.NEXT_PUBLIC_DEBUG && "border-2 border-orange-600"
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
        <Button type="submit">Submit</Button>
      </form>
      {state.message ? (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <SmtpMessage />
    </Form>
  );
};
