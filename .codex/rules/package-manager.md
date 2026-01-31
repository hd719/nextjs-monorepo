# Package Manager Rules

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
