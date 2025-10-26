# Cookbook Application for my wife

## Description

- This is a full-featured cookbook application that allows users to create, manage, and share recipes
- Recipes are stored in a Supabase PostgreSQL database with full CRUD functionality
- Features authentication, admin dashboard, public recipe viewing, and responsive design

## Tech Stack

- **Next.js 15** with React 19, TypeScript, and Tailwind CSS
  - Server Actions for form handling
  - App Router with dynamic routing
- **Supabase** for authentication and PostgreSQL database
  - Row Level Security (RLS) policies
  - Real-time subscriptions
- **Shadcn/ui** component library with Radix UI primitives
- **React Hook Form** with Zod validation
- **Optimistic UI updates** for better UX

## Environment Variables

- 1password for secret management run the app with `op run --env-file="./.env.development.local" -- pnpm run dev`

## Deployment

- Containerized with Docker
  - side note: this app lives in a monorepo structure with other nextjs/javsacript apps and for that I am using [TurboRepo](https://turbo.build/repo/docs), all the apps in here are containerized
- Porkbun: Domain name management
- Virtual Private Server (VPS) I am going back and fourth between Hostinger and Hertzer (the terraform files will be coming soon)

### Checklist

- [x] Create the app
- [x] Add Supabase
- [x] Add Auth (Sign up/in, Password reset)
- [x] Add Database (PostgreSQL with RLS)
- [x] Recipe image URLs support
- [x] Add Docker File (Dockerfile.cookbook)
- [x] Components (Complete UI component library)
- [x] Add CRUD functionality (Create, Read, Update, Delete recipes)
- [] Domain Name
- [] VPS
- [] Terraform
- [] CI/CD
- [] TLS/HTTPS
- [] Open SSH Hardening
  - Setting up Tailscale to access the VM Server
- [] Firewall (ufw)
- [] Monitoring
- [Load Balancer] (traefik also as a reverse proxy)

Design Template: https://thebcms.com/blog/announcing-nextjs-recipes-starter

Explaination of this onSubmit={form.handleSubmit(() => formRef.current?.submit())} in react-hook-form

Explanation of the Code
form.handleSubmit():

form.handleSubmit is a method provided by react-hook-form that helps handle the form submission event.
It takes a callback function as its argument, which will be executed if the form data passes validation successfully.
If validation fails, form.handleSubmit will prevent the form from submitting and display error messages based on the validation schema.
The Callback Function: () => formRef.current?.submit():

This anonymous function is the callback that will run when the form validation passes.
It attempts to submit the form using the native HTML form submission mechanism by calling formRef.current?.submit().
formRef is a useRef hook pointing to the HTML form element. This reference allows direct access to the form's native submit method.
The ?. (optional chaining) ensures that formRef.current is not null or undefined before calling the submit() method, which prevents runtime errors if the reference is not set.
What Happens During Submission?
When the user clicks the "Submit" button, the onSubmit event is triggered.
form.handleSubmit first runs the validation against the form fields using the schema defined in react-hook-form and Zod.
If the validation passes, the callback function (() => formRef.current?.submit()) is executed.
This callback uses the submit() method on the form element itself to submit the form natively.
Why Use formRef.current?.submit()?
Normally, when working with react-hook-form, you don't need to use the native submit() method, as react-hook-form takes care of form submission and validation logic internally. However, there might be specific scenarios where you want to trigger a native form submission or handle submission in a more traditional way, such as:

Server-side form submission: You might want to handle the form submission using a server-side action, which is triggered by a native form submission. Legacy Code Integration: If you're working with code that requires a traditional form submission, using the native submit() method might be necessary.
