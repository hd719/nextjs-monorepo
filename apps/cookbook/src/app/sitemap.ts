import { getPublishedRecipes } from "@/lib/recipes";
import { generateRecipeSitemapEntries } from "@/lib/seo";
import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // Get all published recipes for sitemap
  const recipesResult = await getPublishedRecipes({
    page: 1,
    limit: 1000, // Get all recipes for sitemap
    sort_by: "updated_at",
    sort_order: "desc",
  });

  const recipePages = recipesResult.data
    ? generateRecipeSitemapEntries(recipesResult.data)
    : [];

  return [...staticPages, ...recipePages];
}
