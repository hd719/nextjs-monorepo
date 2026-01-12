# `@repo/eslint-config`

Shared ESLint configurations for the monorepo using ESLint v9 flat config format.

## Available Configurations

| Config | Import Path | Use For |
|--------|-------------|---------|
| **Base** | `@repo/eslint-config/base` | Node.js packages, utilities, non-React code |
| **Next.js** | `@repo/eslint-config/next-js` | Next.js applications |
| **React Internal** | `@repo/eslint-config/react-internal` | Shared React component libraries |

## Usage

### Next.js Applications

Create `eslint.config.mjs` in your app:

```javascript
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [...nextJsConfig];
```

### React Libraries (e.g., packages/ui)

```javascript
import { reactInternalConfig } from "@repo/eslint-config/react-internal";

export default [...reactInternalConfig];
```

### Node.js Packages

```javascript
import { baseConfig } from "@repo/eslint-config/base";

export default [...baseConfig];
```

## What's Included

All configs include:
- ESLint recommended rules
- TypeScript support via `typescript-eslint`
- Prettier compatibility (disables conflicting rules)
- Turbo plugin (env var validation)
- Only-warn plugin (errors → warnings for better DX)

**Next.js config additionally includes:**
- `eslint-plugin-react` and `eslint-plugin-react-hooks`
- `@next/eslint-plugin-next` (Core Web Vitals rules)

## Adding App-Specific Rules

```javascript
import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [
  ...nextJsConfig,
  {
    rules: {
      // Your custom rules here
      "no-console": "warn",
    },
  },
];
```
