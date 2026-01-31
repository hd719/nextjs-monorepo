# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

**Always use Bun.** Never use npm, yarn, or pnpm.

```bash
bun install              # Install dependencies
bun add <package>        # Add dependency
bun add -d <package>     # Add dev dependency
bun run <script>         # Run script
```

## Common Commands

```bash
# Development (from monorepo root)
bun run dev                           # All apps
bun run dev --filter=healthmetrics    # Single app
bun run dev --filter=cookbook         # Single app

# Build
bun run build                         # All apps
bun run build --filter=<app>          # Single app

# Lint & Format
bun run lint                          # All apps
bun run lint:fix                      # Fix lint issues
bun run format                        # Prettier format

# Test
bun run test                          # All packages
cd apps/healthmetrics && bun test     # Run healthmetrics tests

# Database (healthmetrics only - requires 1Password)
cd apps/healthmetrics
op run --env-file="./.env.development.local" -- bunx prisma studio
op run --env-file="./.env.development.local" -- bunx prisma migrate dev
```

## Monorepo Structure

```
apps/
  cookbook/           # Next.js 16 - Recipe management (Supabase Auth)
  healthmetrics/      # TanStack Start - Fitness tracking (Better Auth, Prisma)
  healthmetrics-services/  # Go microservice - Barcode scanning API
  portfolio/          # Next.js 16 - Personal website
  web/                # Next.js 16 - Starter template

packages/
  ui/                 # @repo/ui - Shared React components
  eslint-config/      # @repo/eslint-config - ESLint 9 flat config
  typescript-config/  # @repo/typescript-config - Shared TS configs
  logger/             # @repo/logger - Logging utilities
  jest-presets/       # @repo/jest-presets - Test configuration
```

## Build System

- **Turbo** orchestrates builds across workspaces
- Tasks defined in `turbo.json`: build, test, lint, dev, clean
- Filter to specific apps: `--filter=<app-name>`

## Local Development with Secrets

This repo uses **Devbox + 1Password** for local development. Apps that need secrets (like healthmetrics) require 1Password CLI:

```bash
# From monorepo root - uses devbox.json scripts
devbox run hm:dev              # healthmetrics dev server
devbox run hm:prisma:studio    # Prisma Studio
devbox run pf:dev              # portfolio dev server
```

## Key Architecture Notes

**Two auth approaches:**
- Cookbook uses Supabase Auth (managed, simpler)
- HealthMetrics uses Better Auth (framework-agnostic, self-hosted)

**Two framework approaches:**
- Cookbook/Portfolio/Web: Next.js 15 (App Router)
- HealthMetrics: TanStack Start (Vite-based, file-system routing)

**Testing:**
- HealthMetrics: Vitest 3 with React Testing Library
- Logger package: Jest

**Linting:**
- ESLint 9 with flat config (`eslint.config.mjs`)
- Three presets in @repo/eslint-config: base, next-js, react-internal

## Workspace Dependencies

Reference workspace packages with `workspace:*`:
```json
"@repo/ui": "workspace:*",
"@repo/eslint-config": "workspace:*"
```

## Monorepo Devbox Workflow

A streamlined workflow for running commands in a Next.js monorepo with Devbox and 1Password secrets.

## The Problem

Running commands in a monorepo app required multiple steps:

```bash
# Old workflow (tedious)
cd apps/healthmetrics
devbox shell                    # Enter devbox environment (for bun, etc.)
op run --env-file="./.env.development.local" -- bun run dev
```

**Issues:**

- `bun` is only available inside devbox shell (not globally)
- `devbox run` executes from monorepo root (where `devbox.json` lives), not the app directory
- 1Password secrets need to be injected via `op run`

## The Solution

Define scripts in `devbox.json` that handle:

1. `cd` into the correct app directory
2. Inject 1Password secrets (if needed)
3. Run the actual command

Then create simple zsh aliases that call `devbox run <script>`.

## Setup

### 1. Devbox Scripts (`devbox.json`)

```json
{
  "shell": {
    "scripts": {
      "hm:dev": "cd apps/healthmetrics && op run --env-file=\"./.env.development.local\" -- bun run dev",
      "hm:build": "cd apps/healthmetrics && op run --env-file=\"./.env.development.local\" -- bun run build",
      "hm:prisma:studio": "cd apps/healthmetrics && op run --env-file=\"./.env.development.local\" -- bunx prisma studio",
      "hm:prisma:migrate": "cd apps/healthmetrics && op run --env-file=\"./.env.development.local\" -- bunx prisma migrate dev",
      "hm:prisma:generate": "cd apps/healthmetrics && op run --env-file=\"./.env.development.local\" -- bunx prisma generate",

      "pf:dev": "cd apps/portfolio && bun run dev",
      "pf:build": "cd apps/portfolio && bun run build",
      "pf:start": "cd apps/portfolio && bun run start",
      "pf:lint": "cd apps/portfolio && bun run lint"
    }
  }
}
```

### 2. ZSH Aliases (`alias.zsh`)

```bash
# HealthMetrics (with 1Password secrets)
alias hm-dev='devbox run hm:dev'
alias hm-build='devbox run hm:build'
alias hm-prisma-studio='devbox run hm:prisma:studio'
alias hm-prisma-migrate='devbox run hm:prisma:migrate'
alias hm-prisma-generate='devbox run hm:prisma:generate'

# Portfolio (no secrets needed)
alias pf-dev='devbox run pf:dev'
alias pf-build='devbox run pf:build'
alias pf-start='devbox run pf:start'
alias pf-lint='devbox run pf:lint'
```

## Usage

Run from the **monorepo root**:

```bash
# HealthMetrics
hm-dev                # Start dev server with secrets
hm-build              # Build the app
hm-prisma-studio      # Open Prisma Studio
hm-prisma-migrate     # Run database migrations
hm-prisma-generate    # Generate Prisma client

# Portfolio
pf-dev                # Start Next.js dev server
pf-build              # Build the app
pf-start              # Start production server
pf-lint               # Run ESLint
```

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  hm-dev                                                             │
│    ↓                                                                │
│  devbox run hm:dev                                                  │
│    ↓                                                                │
│  [devbox.json script]                                               │
│  cd apps/healthmetrics &&                                           │
│  op run --env-file="./.env.development.local" -- bun run dev        │
│    ↓                                                                │
│  1. Enters devbox environment (bun available)                       │
│  2. Changes to app directory                                        │
│  3. 1Password injects secrets from .env.development.local           │
│  4. Runs bun dev server                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Benefits

| Before | After |
|--------|-------|
| 3 commands | 1 command |
| Manual cd into app | Automatic |
| Remember op run syntax | Just `hm-dev` |
| Team needs to know setup | Scripts in repo |

## Adding New Apps

1. Add scripts to `devbox.json`:

   ```json
   "newapp:dev": "cd apps/newapp && bun run dev"
   ```

2. Add alias to `alias.zsh`:

   ```bash
   alias na-dev='devbox run newapp:dev'
   ```

3. Reload: `reload` or `source ~/.zshrc`

## Package Manager Rules

## Always Use Bun

- **Always use `bun` instead of `npm`, `pnpm`, or `yarn`** for all package management operations
- Use `bun install` instead of `npm install` or `pnpm install`
- Use `bun add` instead of `npm install <package>` or `pnpm add <package>`
- Use `bun remove` instead of `npm uninstall` or `pnpm remove`
- Use `bun run` instead of `npm run` or `pnpm run`
- Use `bun dev` instead of `npm run dev` or `pnpm dev`
- Use `bun build` instead of `npm run build` or `pnpm build`
- Use `bun test` instead of `npm test` or `pnpm test`

## Script Execution

- When suggesting terminal commands, always use `bun` as the package manager
- When creating package.json scripts, assume they will be run with `bun run`
- When installing dependencies, always use `bun add` for production dependencies and `bun add -d` for dev dependencies

## Monorepo Operations

- Use `bun install` at the root to install all workspace dependencies
- Use `bun --filter <workspace>` for workspace-specific operations when needed
- Respect the existing workspace configuration in package.json and pnpm-workspace.yaml

## Terminal Commands

- Never suggest `npm`, `pnpm`, or `yarn` commands
- Always default to `bun` for any package management task
- When running scripts, use `bun <script-name>` or `bun run <script-name>`
