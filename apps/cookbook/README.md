# Cookbook Application for my wife

## Description

- This is a simple cookbook application that allows my wife to store her recipes
- All of her recipes are stored in a mdx file
- There is an auth section where she can login/logout and when she logs in she can add/edit/delete her recipes

## Tech Stack

- Next.js (with React, Typescript, and Tailwind CSS)
  - Using server actions
- MDX for the recipes
  - `@next/mdx` plugin for Next.js
- Shadcn component library (might switch this over to something else but for now it works, Pigment is another option)
- Supabase for authentication and database (postgres)
  - Was using NextAuth.js, Prisma, and Suppabase but I decided to use Suppabase for everything - might switch to Auth.js and Prisma later

## Environment Variables

- 1password for secret management run the app with `op run --env-file="./.env.development.local" -- pnpm run dev`

## Deployment

- Containerized with Docker
  - side note: this app lives in a monorepo structure with other nextjs/javsacript apps and for that I am using [TurboRepo](https://turbo.build/repo/docs), all the apps in here are containerized
- Porkbun: Domain name management
- Virtual Private Server (VPS) I am going back and fourth between Hostinger and Hertzer (the terraform files will be coming soon)

### Checklist

- [x] Create the app
- [x] Add Suppabase
- [x] Add Auth
- [x] Add Database
- [x] File uploads
- [] Add Docker File
- [] Components
- [] Add CRUD functionality
- [x] Domain Name
- [] VPS
- [] Terraform
- [] CI/CD
- [] TLS/HTTPS
- [] Open SSH Hardening
  - Setting up Tailscale to access the VM Server
- [] Firewall (ufw)
- [] Monitoring
- [Load Balancer] (traefik also as a reverse proxy)
