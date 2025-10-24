"use server";

import { createClient } from "@/app/utils/supabase/server";
import { encodedRedirect } from "@/app/utils/utils";
// import { revalidatePath } from "next/cache"; // TODO: Use when implementing revalidation
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export const signUpAction = async (
  prevState: { message: string; type?: "success" | "error" },
  formData: FormData
): Promise<{ message: string; type: "success" | "error" }> => {
  const first = formData.get("first")?.toString();
  const last = formData.get("last")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");

  if (!email || !password) {
    return {
      message: "Server Side error: Email and password are required",
      type: "error" as const,
    };
  }

  if (!first || !last) {
    return {
      message: "Server Side error: First and last name are required",
      type: "error" as const,
    };
  }

  // Attempt to sign up the user with Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: first,
        last_name: last,
        full_name: `${first} ${last}`,
      },
    },
  });

  if (error) {
    console.error("Signup error:", error.code, error.message);
    return {
      message: `Error: ${error.message}`,
      type: "error" as const,
    };
  }

  return {
    message: `Thanks ${first} ${last} (${email}) for signing up! Please check your email for a verification link.`,
    type: "success" as const,
  };
};

export const signInAction = async (
  prevState: { message: string; type?: "success" | "error" },
  formData: FormData
) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  if (!email || !password) {
    return {
      message: "Server Side error: Email and password are required",
      type: "error" as const,
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: `Error: ${error.message}`,
      type: "error" as const,
    };
  }

  return redirect("/admin");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

interface AddRecipeFormState {
  errors: {
    title?: string[];
    ingredients?: string[];
    directions?: string[];
    extraNotes?: string[];
    nutritionalValue?: string[];
    content?: string[];
    _form?: string[];
  };
}

const AddRecipeSchema = z.object({
  title: z.string().min(2),
  ingredients: z.string().optional(),
  directions: z.string().optional(),
  extraNotes: z.string().optional(),
  nutritionalValue: z.string().optional(),
});

export async function addRecipeAction(
  formState: AddRecipeFormState,
  formData: FormData
): Promise<AddRecipeFormState> {
  // Check for auth using supabase server
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      errors: {
        _form: ["You must be signed in to add a recipe"],
      },
    };
  }

  const result = AddRecipeSchema.safeParse({
    title: formData.get("title") as string,
    ingredients: formData.get("ingredients") as string,
    directions: formData.get("directions") as string,
    extraNotes: formData.get("extraNotes") as string,
    nutritionalValue: formData.get("nutritionalValue") as string,
  });

  if (result.error) {
    console.log("result.data", result.error.flatten().fieldErrors);
  }

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Send to server
    // recipe = await createRecipe(result.data);
    console.log("Recipe data", result.data);
    console.log("Recipe added");
    return {
      errors: {},
    };
  } catch (error: unknown) {
    console.error("Error creating recipe", error);
    return {
      errors: {
        _form: ["Error adding recipe"],
      },
    };
  }

  // redirect(`/recipes/${recipe.id}`);
}

export async function updateRecipe() {}

export async function deleteTodoAction() {}
