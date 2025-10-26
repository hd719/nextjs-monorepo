# **COOKBOOK DESIGN MIGRATION PLAN**

Migration from current design to recipes app aesthetic while maintaining Supabase backend functionality.

## **PROJECT OVERVIEW**

### **Goal**
Transform the cookbook application to use the vibrant, modern design from the recipes app while preserving all existing functionality including:
- Supabase authentication and database
- Admin interface and CRUD operations
- User management and recipe publishing
- All existing backend logic

### **Architecture Decisions**
- ✅ **Keep:** Supabase backend, authentication, admin features
- ✅ **Keep:** React Hook Form, Zod validation, existing logic
- 🔄 **Migrate:** Visual components and design system
- 🔄 **Replace:** Basic shadcn components with custom recipes-style components
- ❌ **No SCSS:** Use Tailwind CSS exclusively with custom design tokens

---

## **DETAILED COMPARISON: COOKBOOK vs RECIPES**

### **Architecture Differences**

| **Aspect** | **Cookbook (Current)** | **Recipes (Target)** | **Migration Strategy** |
|------------|------------------------|----------------------|------------------------|
| **CMS/Data** | Supabase (PostgreSQL) | BCMS (Headless CMS) | Keep Supabase, adapt components |
| **Styling** | Tailwind + shadcn/ui | Tailwind + Custom Design System | Replace with custom Tailwind classes |
| **Components** | Generic shadcn components | Custom-built cohesive design | Build custom components |
| **Color System** | Pastel colors (primary-50 to 900) | Vibrant appAccent/appGray system | Update Tailwind config |
| **Authentication** | Supabase Auth | None (static site) | Keep existing auth system |
| **Image Handling** | Next.js Image + Supabase Storage | BCMS Image components | Keep Next.js Image, adapt styling |
| **Forms** | react-hook-form + zod | Custom form handling | Keep react-hook-form, restyle |

### **Component Mapping**

| **Cookbook Components** | **Recipes Equivalent** | **Migration Strategy** |
|-------------------------|------------------------|------------------------|
| `Feed/FeedClient.tsx` | `home-page/Recipes.tsx` | Replace with recipes design |
| `RecipeSkeletonLoader.tsx` | None | Keep but restyle with recipes aesthetic |
| `Nav/NavServer.tsx` | `layout/Header.tsx` | Complete redesign with recipes styling |
| `ui/card.tsx` | `recipes/Card.tsx` | Replace with custom recipes card |
| `ui/button.tsx` | `Btn.tsx` | Replace with recipes button component |
| `RecipeForm.tsx` | None | Keep functionality, restyle completely |
| `layout-wrapper.tsx` | Layout structure | Adapt to recipes layout patterns |

### **Dependencies to Add**

```json
{
  "classnames": "^2.5.1",
  "react-transition-group": "^4.4.5"
}
```

### **Assets to Create/Port**
- SVG icons from recipes app (arrow-right, search, download, etc.)
- Custom Tailwind design tokens and utilities
- Color palette migration to Tailwind config

---

## **JIRA TICKETS - MIGRATION PLAN**

### **PHASE 1: FOUNDATION & DESIGN SYSTEM**

#### **TICKET CB-001: Setup Design System Foundation**
**Story Points:** 5
**Priority:** Highest
**Type:** Foundation
**Estimated Time:** 1 day

**Description:** Establish the visual foundation by setting up the recipes app color system and design tokens in Tailwind.

**Acceptance Criteria:**
- [ ] Add `classnames` and `react-transition-group` packages
- [ ] Update `tailwind.config.ts` with recipes color palette:
  ```js
  colors: {
    appAccent: {
      100: '#9FA8A3',
      DEFAULT: '#0A2213',
    },
    appGray: {
      100: '#F9F7F5',
      200: '#E6E9E7',
      300: '#D6D6D6',
      400: '#757182',
      500: '#686473',
      600: '#4A4752',
      700: '#37353D',
      800: '#121212',
    },
    appWarning: '#FC5E5E',
  }
  ```
- [ ] Add custom container configuration matching recipes app
- [ ] Create fade transition utilities in Tailwind
- [ ] Update `globals.css` with new design tokens
- [ ] Verify all existing components still render without breaking

**Technical Notes:**
- Replace current pastel color system with vibrant recipes colors
- Maintain backward compatibility during transition
- Use CSS custom properties for dynamic theming

---

#### **TICKET CB-002: Create SVG Icon System**
**Story Points:** 3
**Priority:** High
**Type:** Assets
**Estimated Time:** 0.5 days

**Description:** Port all SVG icons from recipes app and create icon system.

**Acceptance Criteria:**
- [ ] Create `/src/assets/icons/` directory structure
- [ ] Port all SVG icons from recipes app:
  - `arrow-right.svg`
  - `search.svg`
  - `download.svg`
  - `email.svg`
  - `phone.svg`
  - `nav/menu.svg`
  - `nav/x.svg`
  - `chevron-down.svg`
- [ ] Configure SVG imports in Next.js config with @svgr/webpack
- [ ] Create icon component wrapper for consistent sizing
- [ ] Test icon rendering in existing components
- [ ] Document icon usage patterns

**Technical Notes:**
- Use @svgr/webpack for SVG-as-component imports
- Ensure icons are optimized and accessible
- Create consistent sizing classes

---

#### **TICKET CB-003: Create Custom Button Component**
**Story Points:** 3
**Priority:** High
**Type:** Component
**Estimated Time:** 0.5 days

**Description:** Replace shadcn button with recipes-style button component using Tailwind.

**Acceptance Criteria:**
- [ ] Create new `components/Btn.tsx` component matching recipes design
- [ ] Support themes with Tailwind classes:
  - `light`: `bg-appGray-200 text-appAccent hover:bg-appAccent hover:text-appGray-200`
  - `dark`: `bg-appAccent text-appGray-200 hover:bg-appGray-200 hover:text-appAccent`
  - `gray`: `bg-[#F2F2F2] text-appGray-600 hover:border-appAccent`
- [ ] Support sizes: `regular` and `sm`
- [ ] Handle both Link and button variants
- [ ] Add proper focus states and transitions
- [ ] Maintain existing button functionality
- [ ] Create migration guide for updating button usages

**Technical Notes:**
- Use classnames library for conditional styling
- Implement proper TypeScript interfaces
- Ensure accessibility compliance

---

### **PHASE 2: LAYOUT & NAVIGATION**

#### **TICKET CB-004: Redesign Header/Navigation**
**Story Points:** 8
**Priority:** High
**Type:** Component
**Estimated Time:** 1.5 days

**Description:** Complete redesign of header to match recipes app aesthetic with mobile navigation.

**Acceptance Criteria:**
- [ ] Create new header with recipes styling (`bg-appAccent`)
- [ ] Implement mobile hamburger menu with smooth animations
- [ ] Add logo support (use existing or placeholder)
- [ ] Style navigation links with recipes colors:
  - Desktop: `text-appAccent-100 hover:text-white`
  - Mobile: `text-appAccent/70 hover:text-appAccent`
- [ ] Implement click-outside functionality for mobile menu
- [ ] Add proper z-index layering (`z-50`)
- [ ] Maintain existing navigation structure and auth links
- [ ] Ensure responsive design matches recipes app
- [ ] Add smooth transitions for mobile menu toggle

**Technical Notes:**
- Use react-transition-group for menu animations
- Implement useEffect for click-outside detection
- Maintain existing auth state handling

---

#### **TICKET CB-005: Create Hero Section Component**
**Story Points:** 8
**Priority:** Medium
**Type:** Component
**Estimated Time:** 1.5 days

**Description:** Create stunning hero section similar to recipes app for homepage.

**Acceptance Criteria:**
- [ ] Create `components/HomeHero.tsx` component
- [ ] Full-screen background image support with Next.js Image
- [ ] Gradient overlay using Tailwind: `bg-gradient-to-t from-[#1E1E1E] to-[#1E1E1E]/0`
- [ ] Large typography with recipes styling:
  - Mobile: `text-xl leading-[1.2] font-medium text-white`
  - Desktop: `lg:text-7xl lg:leading-[1.1]`
- [ ] CTA button integration using new Btn component
- [ ] Search bar overlay for desktop (`absolute z-10 top-10 right-0`)
- [ ] Responsive design with proper spacing
- [ ] Integrate with existing homepage layout
- [ ] Support for dynamic background images

**Technical Notes:**
- Use absolute positioning for overlay elements
- Implement proper responsive breakpoints
- Ensure image optimization and loading

---

#### **TICKET CB-006: Update Layout Wrapper**
**Story Points:** 5
**Priority:** Medium
**Type:** Component
**Estimated Time:** 1 day

**Description:** Update layout wrapper to match recipes app structure and spacing.

**Acceptance Criteria:**
- [ ] Update container styles to match recipes app:
  ```js
  container: {
    center: true,
    padding: {
      DEFAULT: '1rem',
      lg: '2rem',
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1360px',
    },
  }
  ```
- [ ] Adjust spacing and padding to recipes standards
- [ ] Maintain admin route handling logic
- [ ] Update responsive breakpoints in Tailwind config
- [ ] Test all existing pages render correctly
- [ ] Ensure proper content centering and max-widths

**Technical Notes:**
- Update Tailwind container configuration
- Maintain existing conditional logic for admin routes
- Test across all breakpoints

---

### **PHASE 3: RECIPE COMPONENTS**

#### **TICKET CB-007: Redesign Recipe Cards**
**Story Points:** 8
**Priority:** High
**Type:** Component
**Estimated Time:** 1.5 days

**Description:** Replace current recipe cards with beautiful recipes app design using Tailwind.

**Acceptance Criteria:**
- [ ] Create new recipe card component with recipes styling
- [ ] Implement card design with Tailwind classes:
  - Container: `rounded-lg border border-gray-300 bg-white/20 backdrop-blur-lg backdrop-filter`
  - Image: `rounded-lg aspect-square overflow-hidden object-cover`
  - Content: Proper spacing and typography matching recipes
- [ ] Category badges with recipes colors:
  - `bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800`
  - `bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800`
- [ ] Hover effects and smooth transitions
- [ ] Title and description styling with proper line clamping
- [ ] CTA buttons using new Btn component
- [ ] Maintain existing functionality (links, data structure)
- [ ] Update `FeedClient.tsx` to use new card design
- [ ] Ensure responsive grid layout

**Technical Notes:**
- Use backdrop-blur for glassmorphism effect
- Implement proper image aspect ratios
- Maintain existing recipe data structure

---

#### **TICKET CB-008: Create Advanced Search Component**
**Story Points:** 8
**Priority:** Medium
**Type:** Component
**Estimated Time:** 1.5 days

**Description:** Implement recipes-style search with autocomplete and transitions using Tailwind.

**Acceptance Criteria:**
- [ ] Create `components/RecipeSearch.tsx` component
- [ ] Search input with recipes styling:
  - Container: `bg-white rounded-lg px-4 border focus-within:border-appAccent`
  - Input: `text-sm font-medium tracking-[-0.41px] placeholder:text-appGray-400`
  - Drop shadow: `drop-shadow(0px 0px 8px rgba(10, 34, 19, 0.25))`
- [ ] Real-time filtering functionality
- [ ] Autocomplete suggestions with tab completion
- [ ] Dropdown results with react-transition-group animations
- [ ] Search icon integration from new icon system
- [ ] Focus states and smooth transitions
- [ ] Mobile/desktop responsive design
- [ ] Integrate with existing recipe data structure
- [ ] Results dropdown with proper z-index and positioning

**Technical Notes:**
- Use react-transition-group for smooth animations
- Implement debounced search for performance
- Ensure proper keyboard navigation

---

#### **TICKET CB-009: Update Recipe Form Styling**
**Story Points:** 5
**Priority:** Medium
**Type:** Component
**Estimated Time:** 1 day

**Description:** Restyle existing recipe form to match recipes app aesthetic using Tailwind.

**Acceptance Criteria:**
- [ ] Update form inputs with recipes styling:
  - Input containers: `border rounded-lg overflow-hidden transition-colors duration-300`
  - Focus states: `focus-within:border-appAccent`
  - Error states: `border-red-500`
- [ ] Update button styling to use new Btn component
- [ ] Improve form layout and spacing with recipes patterns
- [ ] Add recipes-style validation styling
- [ ] Update textarea styling to match input design
- [ ] Maintain all existing functionality (validation, submission)
- [ ] Test form submission still works correctly
- [ ] Ensure responsive form layout

**Technical Notes:**
- Keep existing react-hook-form and zod validation
- Update only visual styling, not logic
- Ensure form accessibility is maintained

---

### **PHASE 4: ADVANCED FEATURES**

#### **TICKET CB-010: Create About Us Section**
**Story Points:** 5
**Priority:** Low
**Type:** Component
**Estimated Time:** 1 day

**Description:** Add About Us section component similar to recipes app using Tailwind.

**Acceptance Criteria:**
- [ ] Create `components/AboutUs.tsx` component
- [ ] Background image with overlay using Tailwind:
  - Container: `relative rounded-[20px] overflow-hidden`
  - Overlay: `bg-white/90 backdrop-blur-sm rounded-2xl`
- [ ] Stats grid layout with proper responsive design
- [ ] Backdrop blur effects using Tailwind utilities
- [ ] Typography matching recipes app styling
- [ ] Content management support for dynamic content
- [ ] Add to homepage with proper integration
- [ ] Responsive design for mobile and desktop

**Technical Notes:**
- Use backdrop-blur utilities for glassmorphism
- Implement proper image optimization
- Ensure content is easily editable

---

#### **TICKET CB-011: Create Contact/Let's Talk Section**
**Story Points:** 6
**Priority:** Low
**Type:** Component
**Estimated Time:** 1 day

**Description:** Add contact form section with recipes styling using Tailwind.

**Acceptance Criteria:**
- [ ] Create `components/LetsTalk.tsx` component
- [ ] Contact form with recipes styling:
  - Form container: `border border-[#E0E0E0] rounded-lg p-4 lg:p-8`
  - Input styling matching recipes design patterns
  - Custom placeholder positioning
- [ ] Form validation and error states with recipes colors
- [ ] Contact information display with proper typography
- [ ] Icons for phone/email from new icon system
- [ ] Form submission handling (can be placeholder)
- [ ] Responsive two-column layout
- [ ] Smooth transitions and focus states

**Technical Notes:**
- Implement custom form validation styling
- Use absolute positioning for custom placeholders
- Ensure form accessibility compliance

---

#### **TICKET CB-012: Add Recipe Pagination**
**Story Points:** 4
**Priority:** Medium
**Type:** Component
**Estimated Time:** 0.5 days

**Description:** Implement recipes-style pagination for recipe lists using Tailwind.

**Acceptance Criteria:**
- [ ] Create pagination component matching recipes design
- [ ] Page number styling with recipes color scheme
- [ ] Previous/next navigation with arrow icons
- [ ] Active state styling: `bg-appAccent text-white`
- [ ] Hover effects: `hover:bg-appGray-200`
- [ ] Integrate with existing pagination logic
- [ ] Mobile responsive design with proper spacing
- [ ] Smooth transitions between states

**Technical Notes:**
- Maintain existing pagination functionality
- Use new icon system for navigation arrows
- Ensure proper keyboard navigation

---

#### **TICKET CB-013: Create Footer Component**
**Story Points:** 4
**Priority:** Low
**Type:** Component
**Estimated Time:** 0.5 days

**Description:** Add footer component matching recipes app design using Tailwind.

**Acceptance Criteria:**
- [ ] Create footer with recipes styling: `bg-appGray-100`
- [ ] Logo and description section with proper typography
- [ ] Navigation columns with responsive grid
- [ ] Copyright information with recipes text styling
- [ ] Link styling with hover effects: `hover:underline focus-visible:underline`
- [ ] Responsive grid layout: `lg:grid-cols-[auto,1fr]`
- [ ] Proper spacing and padding matching recipes app

**Technical Notes:**
- Use CSS Grid for responsive layout
- Implement proper link accessibility
- Ensure footer sticks to bottom of page

---

### **PHASE 5: POLISH & OPTIMIZATION**

#### **TICKET CB-014: Add Animations & Transitions**
**Story Points:** 5
**Priority:** Low
**Type:** Enhancement
**Estimated Time:** 1 day

**Description:** Add smooth animations and transitions throughout the app using Tailwind and react-transition-group.

**Acceptance Criteria:**
- [ ] Implement fade transitions for components using react-transition-group
- [ ] Add hover animations for cards and buttons:
  - Cards: `transition-transform hover:scale-105`
  - Buttons: `transition-colors duration-300`
- [ ] Smooth page transitions where appropriate
- [ ] Loading animations for skeleton components
- [ ] Mobile menu animations with proper timing
- [ ] Search dropdown animations matching recipes app
- [ ] Ensure all animations are performant and accessible

**Technical Notes:**
- Use CSS transforms for performance
- Implement proper animation timing functions
- Consider reduced motion preferences

---

#### **TICKET CB-015: Mobile Optimization**
**Story Points:** 6
**Priority:** Medium
**Type:** Enhancement
**Estimated Time:** 1 day

**Description:** Ensure all components are fully responsive and mobile-optimized.

**Acceptance Criteria:**
- [ ] Test all components on mobile devices (320px to 768px)
- [ ] Fix any responsive issues with proper Tailwind breakpoints
- [ ] Optimize touch interactions with proper touch targets
- [ ] Ensure proper mobile navigation functionality
- [ ] Test performance on mobile devices
- [ ] Cross-browser testing (Safari, Chrome, Firefox)
- [ ] Ensure text is readable on all screen sizes
- [ ] Optimize image loading for mobile

**Technical Notes:**
- Use Chrome DevTools for responsive testing
- Implement proper touch target sizes (44px minimum)
- Test on actual devices when possible

---

#### **TICKET CB-016: Performance & SEO Optimization**
**Story Points:** 4
**Priority:** Medium
**Type:** Enhancement
**Estimated Time:** 0.5 days

**Description:** Optimize the app for performance and SEO after design migration.

**Acceptance Criteria:**
- [ ] Optimize image loading and sizing with Next.js Image
- [ ] Minimize CSS bundle size by purging unused Tailwind classes
- [ ] Improve Core Web Vitals scores (LCP, FID, CLS)
- [ ] Update meta tags and SEO elements to match new design
- [ ] Test loading performance with Lighthouse
- [ ] Optimize for accessibility (WCAG 2.1 AA compliance)
- [ ] Ensure proper semantic HTML structure
- [ ] Test with screen readers

**Technical Notes:**
- Use Next.js built-in optimization features
- Implement proper image sizing and lazy loading
- Ensure semantic HTML and ARIA labels

---

## **MIGRATION EXECUTION PLAN**

### **Recommended Execution Order:**

1. **Phase 1: Foundation** (3-4 days)
   - CB-001: Design System Foundation
   - CB-002: SVG Icon System
   - CB-003: Custom Button Component

2. **Phase 2: Layout** (4-5 days)
   - CB-004: Header/Navigation Redesign
   - CB-005: Hero Section Component
   - CB-006: Layout Wrapper Updates

3. **Phase 3: Core Components** (5-6 days)
   - CB-007: Recipe Cards Redesign
   - CB-008: Advanced Search Component
   - CB-009: Recipe Form Styling

4. **Phase 4: Advanced Features** (3-4 days)
   - CB-012: Recipe Pagination (moved up for core functionality)
   - CB-010: About Us Section
   - CB-011: Contact Section
   - CB-013: Footer Component

5. **Phase 5: Polish** (2-3 days)
   - CB-015: Mobile Optimization (moved up for importance)
   - CB-014: Animations & Transitions
   - CB-016: Performance & SEO

### **Timeline Estimates:**
- **Total Story Points:** 89
- **Estimated Development Time:** 17-22 days
- **With Testing & Reviews:** 20-25 days

### **Success Metrics:**
- [ ] All existing functionality preserved
- [ ] Visual design matches recipes app aesthetic
- [ ] Mobile responsiveness maintained
- [ ] Performance metrics improved or maintained
- [ ] Accessibility compliance maintained
- [ ] SEO performance maintained or improved

### **Risk Mitigation:**
- Each ticket is designed as a single, atomic commit
- Maintain backward compatibility during migration
- Comprehensive testing after each phase
- Keep existing Supabase functionality intact
- Regular visual comparisons with recipes app

### **Dependencies:**
- Phase 1 must be completed before any other phases
- CB-003 (Button Component) must be completed before CB-004, CB-005
- CB-002 (Icon System) must be completed before CB-004, CB-008
- All Phase 2 tickets should be completed before Phase 3

### **Testing Strategy:**
- Visual regression testing after each ticket
- Functional testing of all existing features
- Cross-browser testing for each major component
- Mobile device testing throughout development
- Performance testing after major changes

---

## **TECHNICAL NOTES**

### **Tailwind Configuration Updates**
The migration will require significant updates to `tailwind.config.ts`:

```javascript
// Key additions to tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        appAccent: {
          100: '#9FA8A3',
          DEFAULT: '#0A2213',
        },
        appGray: {
          100: '#F9F7F5',
          200: '#E6E9E7',
          300: '#D6D6D6',
          400: '#757182',
          500: '#686473',
          600: '#4A4752',
          700: '#37353D',
          800: '#121212',
        },
        appWarning: '#FC5E5E',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          lg: '2rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1360px',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
}
```

### **Component Architecture**
- All new components will follow recipes app patterns
- Maintain existing TypeScript interfaces where possible
- Use classnames library for conditional styling
- Implement proper error boundaries and loading states

### **Performance Considerations**
- Use Tailwind's JIT mode for optimal bundle size
- Implement proper code splitting for new components
- Optimize images with Next.js Image component
- Use React.memo for expensive components

---

## **POST-MIGRATION CHECKLIST**

### **Functionality Verification:**
- [ ] User authentication works correctly
- [ ] Recipe CRUD operations function properly
- [ ] Admin interface is fully functional
- [ ] Image uploads work correctly
- [ ] Search functionality operates as expected
- [ ] Pagination works on all pages
- [ ] Form validation works correctly
- [ ] Mobile navigation functions properly

### **Visual Verification:**
- [ ] Color scheme matches recipes app
- [ ] Typography is consistent throughout
- [ ] Spacing and layout match target design
- [ ] Hover states work correctly
- [ ] Focus states are visible and accessible
- [ ] Loading states are properly styled
- [ ] Error states are clearly visible

### **Performance Verification:**
- [ ] Lighthouse scores are acceptable
- [ ] Core Web Vitals are within targets
- [ ] Bundle size is optimized
- [ ] Images are properly optimized
- [ ] Animations are smooth and performant

### **Accessibility Verification:**
- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Alt text is present for images

---

*This migration plan maintains all existing functionality while transforming the visual design to match the recipes app aesthetic. Each ticket is designed to be completed independently while building toward the final goal.*
