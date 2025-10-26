import React from "react";

import Feed from "@/components/Feed";
import HomeHero from "@/components/HomeHero";
import LetsTalkServer from "@/components/LetsTalkServer";

// Revalidate home page every 5 minutes to show fresh recipes
export const revalidate = 300;

export default async function Index() {
  return (
    <>
      <HomeHero />
      <Feed />
      <LetsTalkServer />
    </>
  );
}
