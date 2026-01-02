import { createRouter } from "@tanstack/react-router";

// Import CSS early to prevent FOUC
import "./styles.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};
