import slugifyPackage from "slugify";

import { isSlugAvailable } from "./recipes";

export function slugify(text: string): string {
  // Handle null, undefined, or empty strings
  if (!text || typeof text !== "string") {
    return "";
  }

  return slugifyPackage(text, {
    lower: true, // Convert to lowercase
    strict: true, // Remove special characters
    trim: true, // Trim whitespace
  });
}

export async function generateUniqueSlug(
  title: string,
  excludeRecipeId?: string
): Promise<{ slug: string; error: string | null }> {
  try {
    // Validate input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return {
        slug: "",
        error: "Title is required to generate slug",
      };
    }

    // Generate base slug from title
    const baseSlug = slugify(title);

    // Validate base slug
    if (!baseSlug || baseSlug.length === 0) {
      return {
        slug: "",
        error: "Cannot generate slug from title",
      };
    }

    // Check if base slug is available
    const availabilityResult = await isSlugAvailable(baseSlug, excludeRecipeId);

    if (availabilityResult.error) {
      return {
        slug: "",
        error: availabilityResult.error.message,
      };
    }

    // If base slug is available, use it
    if (availabilityResult.data === true) {
      return {
        slug: baseSlug,
        error: null,
      };
    }

    // If base slug is taken, try with a few numbered versions first
    for (let counter = 2; counter <= 5; counter++) {
      const numberedSlug = `${baseSlug}-${counter}`;
      const result = await isSlugAvailable(numberedSlug, excludeRecipeId);

      if (result.error) {
        return {
          slug: "",
          error: result.error.message,
        };
      }

      if (result.data === true) {
        return {
          slug: numberedSlug,
          error: null,
        };
      }
    }

    // If numbered versions are taken, use timestamp for guaranteed uniqueness
    const timestamp = Date.now();
    const timestampSlug = `${baseSlug}-${timestamp}`;

    const timestampResult = await isSlugAvailable(
      timestampSlug,
      excludeRecipeId
    );

    if (timestampResult.error) {
      return {
        slug: "",
        error: timestampResult.error.message,
      };
    }

    // Timestamp should virtually guarantee uniqueness
    return {
      slug: timestampSlug,
      error: null,
    };
  } catch (error) {
    return {
      slug: "",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error generating slug",
    };
  }
}

export function validateSlug(slug: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if slug is empty
  if (!slug || slug.trim().length === 0) {
    errors.push("Slug cannot be empty");
    return { isValid: false, errors };
  }

  // Check length constraints
  if (slug.length < 1) {
    errors.push("Slug must be at least 1 character long");
  }

  if (slug.length > 100) {
    errors.push("Slug must be less than 100 characters long");
  }

  // Check for valid characters (lowercase letters, numbers, hyphens only)
  const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!validSlugRegex.test(slug)) {
    errors.push(
      "Slug must contain only lowercase letters, numbers, and hyphens"
    );
  }

  // Check for consecutive hyphens
  if (slug.includes("--")) {
    errors.push("Slug cannot contain consecutive hyphens");
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith("-") || slug.endsWith("-")) {
    errors.push("Slug cannot start or end with hyphens");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function generateSlugSuggestions(title: string): string[] {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    return [];
  }

  const suggestions: string[] = [baseSlug];

  // Add variations
  const words = title.toLowerCase().split(/\s+/);

  if (words.length > 1) {
    // First two words
    if (words.length >= 2) {
      const shortSlug = slugify(words.slice(0, 2).join(" "));
      if (shortSlug && shortSlug !== baseSlug) {
        suggestions.push(shortSlug);
      }
    }

    // First three words
    if (words.length >= 3) {
      const mediumSlug = slugify(words.slice(0, 3).join(" "));
      if (
        mediumSlug &&
        mediumSlug !== baseSlug &&
        !suggestions.includes(mediumSlug)
      ) {
        suggestions.push(mediumSlug);
      }
    }

    // Remove common words and create abbreviated version
    const commonWords = [
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "with",
      "for",
      "to",
      "of",
      "in",
      "on",
      "at",
    ];
    const filteredWords = words.filter((word) => !commonWords.includes(word));

    if (filteredWords.length > 0 && filteredWords.length !== words.length) {
      const filteredSlug = slugify(filteredWords.join(" "));
      if (filteredSlug && !suggestions.includes(filteredSlug)) {
        suggestions.push(filteredSlug);
      }
    }
  }

  // Remove duplicates and empty strings
  return Array.from(new Set(suggestions)).filter((slug) => slug.length > 0);
}

export function updateSlugFromTitle(
  title: string,
  currentSlug: string,
  autoUpdate: boolean = true
): string {
  // If auto-update is disabled, keep current slug
  if (!autoUpdate) {
    return currentSlug;
  }

  // If current slug is empty or matches the old title's slug, generate new one
  const newSlug = slugify(title);

  // If title is empty, clear the slug
  if (!title.trim()) {
    return "";
  }

  // If current slug is empty, generate from title
  if (!currentSlug.trim()) {
    return newSlug;
  }

  // If current slug looks auto-generated (simple slugified version), update it
  // This is a heuristic - if the current slug is exactly what we'd generate from some title
  const titleWords = title.toLowerCase().split(/\s+/);
  const slugWords = currentSlug.split("-");

  // If slug seems to match the title structure, update it
  if (
    titleWords.length === slugWords.length ||
    currentSlug === slugify(title)
  ) {
    return newSlug;
  }

  // Otherwise, keep the current slug (user might have customized it)
  return currentSlug;
}

export function sanitizeSlugInput(input: string): string {
  if (!input) return "";

  return slugify(input);
}
