# `@repo/typescript-config`

Shared TypeScript configurations for the monorepo.

## Available Configurations

| Config | File | Use For |
|--------|------|---------|
| **Base** | `base.json` | Foundation config, extended by others |
| **Next.js** | `nextjs.json` | Next.js applications |
| **Vite** | `vite.json` | Vite/TanStack Start applications |
| **React Library** | `react-library.json` | Shared React component libraries |

## Usage

### Next.js Applications

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Vite/TanStack Applications

```json
{
  "extends": "@repo/typescript-config/vite.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### React Libraries

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
