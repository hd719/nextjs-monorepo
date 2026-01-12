import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * ESLint configuration for internal React packages/libraries.
 *
 * USE THIS FOR:
 * - Shared React component libraries (e.g., packages/ui)
 * - Internal React packages that are consumed by apps
 * - Any React code that is NOT a full Next.js application
 *
 * INCLUDES:
 * - ESLint recommended rules
 * - TypeScript support via typescript-eslint
 * - React and React Hooks rules
 * - Prettier compatibility
 * - Turbo plugin for monorepo env vars
 *
 * DOES NOT INCLUDE:
 * - Next.js specific rules (use next.js for Next.js apps)
 *
 * USAGE in package's eslint.config.mjs:
 *   import { reactInternalConfig } from "@repo/eslint-config/react-internal";
 *   export default [...reactInternalConfig];
 */
export const reactInternalConfig = [
  // ESLint's built-in recommended rules
  js.configs.recommended,

  // TypeScript support - parser and recommended rules
  ...tseslint.configs.recommended,

  // Disables ESLint rules that conflict with Prettier formatting
  eslintConfigPrettier,

  // React plugin configuration
  {
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      // React 17+ doesn't require importing React in JSX files
      "react/react-in-jsx-scope": "off",
      // TypeScript handles prop validation, no need for PropTypes
      "react/prop-types": "off",
    },
  },

  // React Hooks rules
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: reactHooksPlugin.configs.recommended.rules,
  },

  // Monorepo-specific plugins (Turbo + only-warn)
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

  // Files/folders to ignore
  {
    ignores: ["node_modules/", "dist/", "build/"],
  },
];
