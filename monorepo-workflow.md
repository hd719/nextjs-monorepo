# Monorepo Devbox Workflow

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
