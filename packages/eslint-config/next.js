import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * ESLint configuration for Next.js applications.
 *
 * USE THIS FOR:
 * - Next.js apps (apps using the Next.js framework)
 * - Apps in apps/cookbook, apps/portfolio, apps/web, etc.
 *
 * INCLUDES:
 * - ESLint recommended rules
 * - TypeScript support via typescript-eslint
 * - React and React Hooks rules
 * - Next.js specific rules (image optimization, link usage, etc.)
 * - Core Web Vitals rules
 * - Prettier compatibility
 * - Turbo plugin for monorepo env vars
 *
 * USAGE in app's eslint.config.mjs:
 *   import { nextJsConfig } from "@repo/eslint-config/next-js";
 *   export default [...nextJsConfig];
 */
export const nextJsConfig = [
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
        ...globals.serviceworker,
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

  // Next.js specific linting rules
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      // Recommended Next.js rules (proper Image, Link usage, etc.)
      ...nextPlugin.configs.recommended.rules,
      // Core Web Vitals rules (font optimization, no sync scripts, etc.)
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // Files/folders to ignore
  {
    ignores: ["node_modules/", ".next/", "dist/", "build/"],
  },
];
