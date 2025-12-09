# TanStack Start Demo - Modern Full-Stack Framework

> **Experimental application exploring the cutting-edge TanStack Start framework**

This application demonstrates TanStack Start capabilities and provides a direct comparison with Next.js for modern web development.

---

## **Purpose & Goals**

### **Learning Objectives:**
- **Explore TanStack Start** - Understand the latest full-stack React framework
- **Compare with Next.js** - See differences in routing, data fetching, and build tools
- **Modern React 19** - Experience the latest React features in a new framework
- **Developer Experience** - Compare development speed and tooling

### **Why TanStack Start?**
- **Type Safety First**: End-to-end TypeScript with better inference
- **Vite Powered**: Lightning-fast development and builds
- **Flexible Deployment**: Deploy anywhere JavaScript runs
- **Modern Architecture**: Built for React 19 and future web standards

---

## **Tech Stack**

### **Core Framework:**
- **TanStack Start**: Latest RC version - Full-stack React framework
- **React 19.2.0**: Latest React with Compiler and new features
- **TypeScript 5.7.2**: Latest TypeScript for maximum type safety
- **Vite 7.1.7**: Ultra-fast build tool and development server

### **Routing & Navigation:**
- **TanStack Router 1.132.0**: File-based routing with incredible type safety
- **Type-safe Navigation**: Compile-time route validation
- **Nested Layouts**: Powerful layout composition
- **Route Guards**: Built-in authentication and authorization patterns

### **Styling & UI:**
- **Tailwind CSS 4.0.6**: Latest major version with new features
- **Lucide React**: Beautiful, consistent icon library
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Built-in theme support

### **Development Tools:**
- **TanStack DevTools**: Router and React debugging
- **Vite HMR**: Instant hot module replacement
- **TypeScript Integration**: Full IDE support with path mapping
- **ESLint & Prettier**: Code quality and formatting

### **Server-Side Features:**
- **Server Functions**: Type-safe server-side operations
- **SSR & Streaming**: Multiple rendering strategies
- **API Routes**: Built-in API endpoint creation
- **Middleware Support**: Request/response processing

---

## **Getting Started**

### **Prerequisites:**
- Node.js 22+ (same as other apps in monorepo)
- pnpm (workspace package manager)
- Basic React and TypeScript knowledge

### **Development Commands:**

#### **Run TanStack Start App:**
```bash
# From monorepo root
pnpm dev --filter=healthmetrics

# Or from app directory
cd apps/healthmetrics
pnpm dev
```

#### **Build for Production:**
```bash
# From monorepo root
pnpm build --filter=healthmetrics

# Or from app directory
cd apps/healthmetrics
pnpm build
```

#### **Preview Production Build:**
```bash
cd apps/healthmetrics
pnpm serve
```

### **Access URLs:**
- **Development**: http://localhost:3003
- **Production Preview**: http://localhost:4173 (default Vite preview port)

---

## **Project Structure**

```
apps/healthmetrics/
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── public/                # Static assets
│   ├── favicon.ico
│   ├── tanstack-*.svg        # TanStack logos
│   └── manifest.json
├── src/                   # Source code
│   ├── components/        # Reusable components
│   │   └── Header.tsx        # Navigation header
│   ├── data/              # Mock data and utilities
│   │   └── demo.punk-songs.ts
│   ├── routes/            # File-based routing
│   │   ├── __root.tsx        # Root layout component
│   │   ├── index.tsx         # Home page (/)
│   │   └── demo/             # Demo routes
│   │       ├── api.names.ts  # API route example
│   │       └── start/        # TanStack Start demos
│   │           ├── server-funcs.tsx
│   │           ├── api-request.tsx
│   │           └── ssr/      # SSR examples
│   ├── styles.css         # Global styles
│   └── router.tsx         # Router configuration
└── README.md              # Original TanStack Start docs
```

---

## **Key Features & Demos**

### **Home Page (`/`)**
- **Beautiful Landing**: Modern gradient design with TanStack branding
- **Feature Showcase**: Cards highlighting key TanStack Start capabilities
- **Responsive Layout**: Mobile-first design with smooth animations
- **Navigation**: Sidebar with demo route links

### **Server Functions (`/demo/start/server-funcs`)**
- **Type-safe Server Logic**: Server functions with full TypeScript support
- **Data Fetching**: Examples of server-side data processing
- **Error Handling**: Proper error boundaries and fallbacks
- **Performance**: Streaming and progressive enhancement

### **API Routes (`/demo/start/api-request`)**
- **RESTful APIs**: Built-in API route creation
- **Type Safety**: End-to-end type safety from client to server
- **Request Handling**: GET, POST, PUT, DELETE examples
- **Middleware**: Request/response processing pipeline

### **SSR Demos (`/demo/start/ssr`)**
- **Multiple Strategies**: Different SSR and rendering approaches
- **Streaming**: Progressive content loading
- **Hydration**: Client-side enhancement of server-rendered content
- **Performance**: Core Web Vitals optimization

---

## **TanStack Start vs Next.js Comparison**

### **Architecture Differences:**

| Aspect | Next.js 15 | TanStack Start |
|--------|------------|----------------|
| **Build Tool** | Webpack/Turbopack | Vite |
| **Routing** | App Router (file-based) | TanStack Router (type-safe) |
| **Data Fetching** | Server Actions | Server Functions |
| **Type Safety** | Good | Excellent |
| **Bundle Size** | Larger | Smaller |
| **Dev Server** | Fast | Ultra Fast |
| **Deployment** | Vercel-optimized | Platform agnostic |

### **Performance Comparison:**

#### **Development Speed:**
- **Next.js**: ~3-5 seconds cold start
- **TanStack Start**: ~1-2 seconds cold start

#### **Build Speed:**
- **Next.js**: ~15-20 seconds (full build)
- **TanStack Start**: ~5-10 seconds (Vite build)

#### **Bundle Size:**
- **Next.js**: ~157KB (First Load JS)
- **TanStack Start**: ~120KB (estimated)

### **Developer Experience:**

#### **Type Safety:**
```typescript
// Next.js - Good type safety
const params = await params; // Need to await in React 19
const { id } = params;

// TanStack Start - Excellent type safety
const { id } = Route.useParams(); // Fully typed, no await needed
//    ^? string (inferred from route definition)
```

#### **Routing:**
```typescript
// Next.js - File-based, runtime validation
<Link href="/user/123">User</Link>

// TanStack Start - Type-safe, compile-time validation
<Link to="/user/$userId" params={{ userId: "123" }}>User</Link>
//                                    ^? Type error if wrong type
```

#### **Data Fetching:**
```typescript
// Next.js - Server Actions
async function updateUser(formData: FormData) {
  'use server'
  // Server logic here
}

// TanStack Start - Server Functions
const updateUser = createServerFn()
  .validator(userSchema)
  .handler(async ({ data }) => {
    // Fully typed server logic
  });
```

---

## **Configuration & Customization**

### **Vite Configuration (`vite.config.ts`):**
```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // Path aliases for imports
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // Tailwind CSS integration
    tailwindcss(),
    // TanStack Start framework
    tanstackStart(),
    // React support
    viteReact(),
  ],
})
```

### **Router Configuration (`src/router.tsx`):**
```typescript
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// Create router with type-safe route tree
export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent', // Preload on hover/focus
})

// Type-safe router instance
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

### **Tailwind Configuration:**
```javascript
// Tailwind CSS 4.0 with new features
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom design system
    }
  }
}
```

---

## **Docker Deployment**

### **Build Docker Image:**
```bash
# From monorepo root
docker build -f Dockerfile.tanstack -t tanstack-start:latest .
```

### **Run Container:**
```bash
# Run standalone
docker run -p 3003:3003 tanstack-start:latest

# Or with docker-compose (includes all apps)
docker-compose up -d
```

### **Docker Configuration:**
- **Multi-stage Build**: Optimized for production
- **Static Serving**: Uses `serve` for lightweight hosting
- **Port 3003**: Consistent with development
- **Alpine Linux**: Minimal base image for security

---

## **Learning Resources**

### **Official Documentation:**
- **[TanStack Start Docs](https://tanstack.com/start)**: Official framework documentation
- **[TanStack Router](https://tanstack.com/router)**: Type-safe routing system
- **[React 19 Guide](https://react.dev/blog/2024/04/25/react-19)**: Latest React features

### **Key Concepts to Explore:**
1. **File-based Routing**: How routes are defined and organized
2. **Server Functions**: Type-safe server-side operations
3. **Type Safety**: End-to-end TypeScript integration
4. **Performance**: Vite vs Webpack build comparisons
5. **Deployment**: Platform-agnostic deployment strategies

### **Recommended Learning Path:**
1. **Start with Home Page**: Understand the basic structure
2. **Explore Routing**: See how TanStack Router works
3. **Try Server Functions**: Compare with Next.js Server Actions
4. **Test API Routes**: Build type-safe APIs
5. **Experiment with SSR**: Different rendering strategies
6. **Customize Configuration**: Modify Vite and router settings

---

## **Contributing to Learning**

### **Experiment Ideas:**
- **Add New Routes**: Create custom pages with different layouts
- **Server Function Examples**: Build CRUD operations
- **API Integration**: Connect to external services
- **Performance Testing**: Compare build and runtime performance
- **Deployment Testing**: Try different hosting platforms

### **Comparison Projects:**
- **Build Same Feature**: Implement identical functionality in both Next.js and TanStack Start
- **Performance Benchmarks**: Measure and compare metrics
- **Developer Experience**: Document differences in development workflow

---

## **Next Steps**

### **Immediate Actions:**
1. **Run the App**: `pnpm dev --filter=healthmetrics`
2. **Explore Demo Routes**: Visit each demo page
3. **Read the Code**: Understand the implementation patterns
4. **Compare Performance**: Notice the development speed difference

### **Advanced Exploration:**
1. **Build Custom Features**: Add your own routes and components
2. **Integrate with Monorepo**: Use shared packages from `@repo/*`
3. **Performance Analysis**: Compare bundle sizes and load times
4. **Deploy Experiments**: Test different deployment strategies

---

## **Key Takeaways**

### **When to Choose TanStack Start:**
- **Type Safety Priority**: Need maximum TypeScript integration
- **Performance Critical**: Ultra-fast development and builds required
- **Flexible Deployment**: Need to deploy to various platforms
- **Modern Stack**: Want cutting-edge React and web technologies

### **When to Stick with Next.js:**
- **Mature Ecosystem**: Need extensive third-party integrations
- **Vercel Deployment**: Optimized for Vercel platform
- **Team Familiarity**: Team already experienced with Next.js
- **Stable Production**: Need battle-tested framework for critical apps

---

<div align="center">

**Happy Exploring with TanStack Start!**

*Experience the future of React development*

</div>
