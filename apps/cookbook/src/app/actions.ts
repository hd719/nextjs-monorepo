"use server";

import { createClient } from "@/app/utils/supabase/server";
import { encodedRedirect } from "@/app/utils/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export const signUpAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { message: "Server Side error: Email password are required" };
  }

  // const { error } = await supabase.auth.signUp({
  //   email,
  //   password,
  //   options: {
  //     emailRedirectTo: `${origin}/auth/callback`,
  //   },
  // });

  // if (error) {
  //   console.error(error.code + " " + error.message);
  //   // encodedRedirect("error", "/sign-up", error.message);
  //   return { message: `Error: ${error.message}` };
  // } else {
  //   return {
  //     message: `Thanks ${email} for signing up! Please check your email for a verification link.`,
  //   };
  // }

  return {
    message: `Thanks ${email} for signing up! Please check your email for a verification link.`,
  };
};

export const signInAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  if (!email || !password) {
    return { message: "Server Side error: Email password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: `Error: ${error.message}` };
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
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
  const supabase = createClient();

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
  const supabase = createClient();
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
  const {
    data: { user },
  } = await createClient().auth.getUser();

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
