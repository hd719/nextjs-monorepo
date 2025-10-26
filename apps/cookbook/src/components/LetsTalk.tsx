"use client";

import React, { startTransition, useOptimistic, useTransition } from "react";

import { EmailIcon, PhoneIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { ContactFormData, ContactFormSchema } from "@/schemas/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "classnames";
import { useForm } from "react-hook-form";

interface LetsTalkProps {
  title?: string;
  description?: string;
  phone: string;
  email: string;
}

const LetsTalk: React.FC<LetsTalkProps> = ({
  title = "Let's Talk",
  description = "Have a question about a recipe or want to share your cooking experience? I'd love to hear from you!",
  phone,
  email,
}) => {
  const { toast, toasts, removeToast } = useToast();
  const [isPending, startContactTransition] = useTransition();
  const [optimisticSubmission, setOptimisticSubmission] = useOptimistic(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      question: "",
    },
  });

  const handleContactAction = async (formData: FormData) => {
    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      question: formData.get("question") as string,
    };

    startContactTransition(() => {
      setOptimisticSubmission(true);

      // Validate the data
      const result = ContactFormSchema.safeParse(contactData);

      if (!result.success) {
        // Set form errors
        result.error.errors.forEach((error) => {
          form.setError(error.path[0] as keyof ContactFormData, {
            message: error.message,
          });
        });
        setOptimisticSubmission(false);
        return;
      }

      // Simulate form submission (replace with actual API call)
      setTimeout(() => {
        toast.success(
          "Message sent successfully!",
          "Thank you for reaching out. I'll get back to you soon.",
          5000
        );
        form.reset();
        setOptimisticSubmission(false);
      }, 1000);
    });
  };

  // Handle form submission with validation
  const handleSubmit = (data: ContactFormData) => {
    startTransition(() => {
      // Create FormData for the action
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("question", data.question);

      handleContactAction(formData);
    });
  };

  const isSubmitting = isPending || optimisticSubmission;

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <section className="relative pb-8 lg:pb-20 xl:pb-[120px]">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-20 xl:gap-[114px] xl:pr-20">
            {/* Contact Information */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <h2 className="mb-[14px] font-semibold leading-none tracking-[-0.41px] text-appGray-700 lg:mb-6 lg:text-4xl lg:leading-none">
                {title}
              </h2>
              <p className="mb-6 text-sm font-medium leading-normal tracking-[-0.41px] text-appGray-500 lg:mb-14 lg:text-lg lg:leading-normal">
                {description}
              </p>

              <div className="grid grid-cols-1 gap-5 lg:gap-10">
                {/* Phone */}
                <div className="flex flex-col items-center lg:items-start">
                  <div className="mb-2 flex items-center lg:mb-4">
                    <PhoneIcon className="mr-1.5 h-3 w-3 text-appGray-500 lg:h-[18px] lg:w-[18px]" />
                    <div className="text-xs font-medium leading-none tracking-[-0.41px] text-appGray-500 lg:text-lg lg:leading-none">
                      Telephone
                    </div>
                  </div>
                  <a
                    href={`tel:${phone}`}
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appGray-600 transition-colors duration-300 hover:text-appAccent lg:text-2xl lg:leading-none"
                  >
                    {phone}
                  </a>
                </div>

                {/* Email */}
                <div className="flex flex-col items-center lg:items-start">
                  <div className="mb-2 flex items-center lg:mb-4">
                    <EmailIcon className="mr-1.5 h-3 w-3 text-appGray-500 lg:h-[18px] lg:w-[18px]" />
                    <div className="text-xs font-medium leading-none tracking-[-0.41px] text-appGray-500 lg:text-lg lg:leading-none">
                      Email
                    </div>
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="text-sm font-medium leading-none tracking-[-0.41px] text-appGray-600 transition-colors duration-300 hover:text-appAccent lg:text-2xl lg:leading-none"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form
              action={handleContactAction}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="rounded-lg border border-[#E0E0E0] p-4 transition-colors duration-300 focus-within:border-appAccent lg:p-8"
            >
              {/* Name Field */}
              <label
                className={classNames(
                  "relative mb-3 flex w-full overflow-hidden rounded-lg border transition-colors duration-300 lg:mb-6",
                  {
                    "border-appWarning": form.formState.errors.name,
                    "border-[#F0F0F0] focus-within:border-appAccent":
                      !form.formState.errors.name,
                  }
                )}
              >
                <input
                  {...form.register("name")}
                  name="name"
                  type="text"
                  className="w-full bg-transparent px-4 py-[14px] text-xs font-medium leading-none tracking-[-0.41px] text-appGray-700 focus:outline-none lg:px-6 lg:py-[15px] lg:text-base lg:leading-none"
                  disabled={isSubmitting}
                />
                {!form.watch("name")?.length && (
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium leading-none tracking-[-0.41px] text-appGray-500 lg:left-6 lg:text-base lg:leading-none">
                    Full name
                    <span className="text-appWarning">*</span>
                  </span>
                )}
              </label>
              {form.formState.errors.name && (
                <p className="mb-3 text-xs font-medium text-appWarning lg:mb-6">
                  {form.formState.errors.name.message}
                </p>
              )}

              {/* Email Field */}
              <label
                className={classNames(
                  "relative mb-3 flex w-full overflow-hidden rounded-lg border transition-colors duration-300 lg:mb-6",
                  {
                    "border-appWarning": form.formState.errors.email,
                    "border-[#F0F0F0] focus-within:border-appAccent":
                      !form.formState.errors.email,
                  }
                )}
              >
                <input
                  {...form.register("email")}
                  name="email"
                  type="email"
                  className="w-full bg-transparent px-4 py-[14px] text-xs font-medium leading-none tracking-[-0.41px] text-appGray-700 focus:outline-none lg:px-6 lg:py-[15px] lg:text-base lg:leading-none"
                  disabled={isSubmitting}
                />
                {!form.watch("email")?.length && (
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium leading-none tracking-[-0.41px] text-appGray-500 lg:left-6 lg:text-base lg:leading-none">
                    Email
                    <span className="text-appWarning">*</span>
                  </span>
                )}
              </label>
              {form.formState.errors.email && (
                <p className="mb-3 text-xs font-medium text-appWarning lg:mb-6">
                  {form.formState.errors.email.message}
                </p>
              )}

              {/* Question Field */}
              <label
                className={classNames(
                  "relative mb-6 flex w-full overflow-hidden rounded-lg border transition-colors duration-300 lg:mb-8",
                  {
                    "border-appWarning": form.formState.errors.question,
                    "border-[#F0F0F0] focus-within:border-appAccent":
                      !form.formState.errors.question,
                  }
                )}
              >
                <textarea
                  {...form.register("question")}
                  name="question"
                  className="h-[140px] w-full resize-none bg-transparent px-4 py-[14px] text-xs font-medium leading-none tracking-[-0.41px] text-appGray-700 focus:outline-none lg:h-[260px] lg:px-6 lg:py-[15px] lg:text-base lg:leading-none"
                  disabled={isSubmitting}
                />
                {!form.watch("question")?.length && (
                  <span className="pointer-events-none absolute left-4 top-5 -translate-y-1/2 text-xs font-medium leading-none tracking-[-0.41px] text-appGray-500 lg:left-6 lg:top-6 lg:text-base lg:leading-none">
                    Question
                    <span className="text-appWarning">*</span>
                  </span>
                )}
              </label>
              {form.formState.errors.question && (
                <p className="mb-6 text-xs font-medium text-appWarning lg:mb-8">
                  {form.formState.errors.question.message}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center border border-transparent bg-appAccent text-appGray-200 hover:border-appAccent hover:bg-appGray-200 hover:text-appAccent"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default LetsTalk;
