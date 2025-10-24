import { Recipe } from "@/types/recipe";
import { Metadata } from "next";

const SITE_NAME = "Payal's Cookbook";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_DESCRIPTION =
  "Discover delicious recipes and cooking inspiration from Payal's kitchen. Learn to cook amazing dishes with step-by-step instructions.";

/**
 * Generate comprehensive metadata for recipe pages
 */
export function generateRecipeMetadata(
  recipe: Recipe,
  authorName: string = "Chef"
): Metadata {
  // Ensure recipe properties exist with fallbacks
  const recipeTitle = recipe?.title || "Recipe";
  const recipeDescription =
    recipe?.description || `Learn how to make ${recipeTitle}`;
  const recipeSlug = recipe?.slug || "recipe";

  const title = `${recipeTitle} - ${SITE_NAME}`;
  const description = `${recipeDescription} - from Payal's Cookbook.`;
  const imageUrl = recipe?.images?.[0] || `${SITE_URL}/images/main.jpeg`;
  const recipeUrl = `${SITE_URL}/recipes/${recipeSlug}`;

  return {
    title,
    description,
    keywords: [
      recipeTitle,
      recipe?.category,
      recipe?.cuisine,
      "recipe",
      "cooking",
      "food",
      "kitchen",
      "homemade",
      authorName,
      SITE_NAME,
    ].filter(Boolean) as string[],

    // Canonical URL
    alternates: {
      canonical: recipeUrl,
    },

    // Open Graph for social sharing
    openGraph: {
      title,
      description,
      url: recipeUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Photo of ${recipe.title}`,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: recipe?.published_at || recipe?.created_at,
      modifiedTime: recipe?.updated_at,
      authors: [authorName],
      section: recipe?.category || "Recipes",
      tags: [recipe?.category, recipe?.cuisine, "recipe", "cooking"].filter(
        Boolean
      ) as string[],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: `@${(authorName || "payal").toLowerCase().replace(/\s+/g, "")}`, // Convert name to handle format
    },

    // Additional meta tags
    other: {
      "article:author": authorName,
      "article:published_time": recipe?.published_at || recipe?.created_at,
      "article:modified_time": recipe?.updated_at,
      "article:section": recipe?.category || "Recipes",
      "article:tag": [recipe?.category, recipe?.cuisine]
        .filter(Boolean)
        .join(", "),
    },

    // Robots
    robots: {
      index: recipe?.is_published ?? false,
      follow: recipe?.is_published ?? false,
      googleBot: {
        index: recipe?.is_published ?? false,
        follow: recipe?.is_published ?? false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for recipes
 */
export function generateRecipeStructuredData(
  recipe: Recipe,
  authorName: string = "Payal"
) {
  const baseUrl = SITE_URL;
  const imageUrl = recipe.images?.[0] || `${baseUrl}/images/main.jpeg`;

  // Calculate nutrition info if available (placeholder for future enhancement)
  const nutrition = recipe.servings
    ? {
        "@type": "NutritionInformation",
        servingSize: `1 serving (serves ${recipe.servings})`,
      }
    : undefined;

  // Calculate total time
  const totalTimeMinutes =
    (recipe.prep_minutes || 0) + (recipe.cook_minutes || 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: Array.isArray(recipe.images) ? recipe.images : [imageUrl],

    // Author information
    author: {
      "@type": "Person",
      name: authorName,
      url: baseUrl,
    },

    // Publisher information
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/images/main.jpeg`,
      },
    },

    // Dates
    datePublished: recipe.published_at || recipe.created_at,
    dateModified: recipe.updated_at,

    // Recipe details
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,

    // Times (ISO 8601 duration format)
    prepTime: recipe.prep_minutes ? `PT${recipe.prep_minutes}M` : undefined,
    cookTime: recipe.cook_minutes ? `PT${recipe.cook_minutes}M` : undefined,
    totalTime: totalTimeMinutes > 0 ? `PT${totalTimeMinutes}M` : undefined,

    // Ingredients
    recipeIngredient: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((ingredient) =>
          typeof ingredient === "string"
            ? ingredient
            : `${ingredient.amount || ""} ${ingredient.unit || ""} ${ingredient.name}`.trim()
        )
      : [],

    // Instructions
    recipeInstructions: Array.isArray(recipe.steps)
      ? recipe.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: typeof step === "string" ? step : String(step),
          name: `Step ${index + 1}`,
        }))
      : [],

    // Additional properties
    keywords: [
      recipe.title,
      recipe.category,
      recipe.cuisine,
      "recipe",
      "cooking",
    ]
      .filter(Boolean)
      .join(", "),

    // Nutrition (if available)
    ...(nutrition && { nutrition }),

    // Aggregated rating (placeholder for future reviews feature)
    // aggregateRating: {
    //   "@type": "AggregateRating",
    //   ratingValue: "4.5",
    //   reviewCount: "10"
    // },

    // Recipe video (placeholder for future video feature)
    // video: {
    //   "@type": "VideoObject",
    //   name: recipe.title,
    //   description: recipe.description,
    //   thumbnailUrl: imageUrl,
    //   contentUrl: "https://example.com/video.mp4",
    //   embedUrl: "https://example.com/embed/video",
    //   uploadDate: recipe.created_at,
    //   duration: "PT10M",
    // },
  };

  // Remove undefined values
  return JSON.parse(JSON.stringify(structuredData));
}

/**
 * Generate sitemap data for all published recipes
 */
export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

export function generateRecipeSitemapEntries(
  recipes: Recipe[]
): SitemapEntry[] {
  const baseUrl = SITE_URL;

  return recipes
    .filter((recipe) => recipe.is_published)
    .map((recipe) => ({
      url: `${baseUrl}/recipes/${recipe.slug}`,
      lastModified: recipe.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
}

/**
 * Generate default site metadata
 */
export function generateSiteMetadata(): Metadata {
  return {
    title: {
      default: SITE_NAME,
      template: `%s - ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [
      "recipes",
      "cooking",
      "food",
      "kitchen",
      "homemade",
      "Payal",
      "cookbook",
      "culinary",
    ],
    authors: [{ name: "Payal" }],
    creator: "Payal",
    publisher: SITE_NAME,

    // Canonical URL
    metadataBase: new URL(SITE_URL),

    // Open Graph
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: `${SITE_URL}/images/main.jpeg`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [`${SITE_URL}/images/main.jpeg`],
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Verification (add your verification codes here)
    verification: {
      // google: "your-google-verification-code",
      // yandex: "your-yandex-verification-code",
      // yahoo: "your-yahoo-verification-code",
    },
  };
}
