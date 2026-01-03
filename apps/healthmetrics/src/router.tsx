import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
