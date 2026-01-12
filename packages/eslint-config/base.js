import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * Base ESLint configuration for all packages in the monorepo.
 *
 * USE THIS FOR:
 * - Node.js packages/libraries
 * - Utility packages
 * - Any non-React, non-Next.js code
 *
 * INCLUDES:
 * - ESLint recommended rules
 * - TypeScript support via typescript-eslint
 * - Prettier compatibility (disables formatting rules)
 * - Turbo plugin (warns about undeclared env vars)
 * - Only-warn plugin (converts errors to warnings)
 */
export const baseConfig = [
  // ESLint's built-in recommended rules
  js.configs.recommended,

  // TypeScript support - parser and recommended rules
  ...tseslint.configs.recommended,

  // Disables ESLint rules that conflict with Prettier formatting
  eslintConfigPrettier,

  // Monorepo-specific plugins
  {
    plugins: {
      turbo: turboPlugin,
      "only-warn": onlyWarn,
    },
    rules: {
      // Ensures env vars used in code are declared in turbo.json
      "turbo/no-undeclared-env-vars": "warn",
    },
  },

  // Files/folders to ignore across all packages
  {
    ignores: ["node_modules/", "dist/", ".next/", "build/"],
  },
];
