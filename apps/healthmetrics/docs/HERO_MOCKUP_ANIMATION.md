# Hero Mockup Animation Documentation

This document explains the animated dashboard mockup displayed on the landing page hero section. The animation creates an engaging visual showcase that demonstrates the app's core features.

---

## Table of Contents

1. [Overview](#overview)
2. [Component Architecture](#component-architecture)
3. [Animation Breakdown](#animation-breakdown)
   - [Floating Icons](#1-floating-icons)
   - [Circular Progress Ring](#2-circular-progress-ring)
   - [Animated Numbers](#3-animated-numbers)
   - [Macro Progress Bars](#4-macro-progress-bars)
   - [Water Glass Fill](#5-water-glass-fill)
   - [Background Glow](#6-background-glow)
4. [Intersection Observer Trigger](#intersection-observer-trigger)
5. [CSS Animation Keyframes](#css-animation-keyframes)
6. [Responsive Behavior](#responsive-behavior)
7. [Accessibility Considerations](#accessibility-considerations)
8. [File References](#file-references)

---

## Overview

The HeroMockup component (`src/components/landing/HeroMockup.tsx`) renders an animated phone-style frame containing a dashboard preview. Six fitness-themed icons float around the frame, and the dashboard content animates when the component enters the viewport.

Key visual elements:
- Phone frame with header bar
- Circular calorie progress ring (SVG-based)
- Horizontal macro progress bars (protein, carbs, fat)
- Water intake glasses visualization
- Floating icons with staggered animations
- Pulsing glow effect behind the mockup

---

## Component Architecture

The component is composed of four sub-components:

### AnimatedNumber

Animates a number from 0 to a target value using `requestAnimationFrame`.

```tsx
function AnimatedNumber({ value, duration = 2000, suffix = "" })
```

- Uses easeOutQuart easing for natural deceleration
- Duration controls animation length in milliseconds
- Suffix allows appending text like "g" or "cal"

### CircularProgress

Renders an SVG circular progress ring.

```tsx
function CircularProgress({ percentage, size = 120, strokeWidth = 8, color = "var(--accent)" })
```

- Uses `stroke-dasharray` and `stroke-dashoffset` for the fill effect
- The ring is rotated -90 degrees so progress starts from the top
- CSS transition handles the animation

### FloatingIcon

Wraps a Lucide icon with positioning and animation delay.

```tsx
function FloatingIcon({ icon, className, delay = 0 })
```

- Accepts a Lucide icon component
- Position class determines placement around the mockup
- Delay creates staggered wave effect across multiple icons

### HeroMockup (Main)

Assembles all pieces and manages visibility state via Intersection Observer.

---

## Animation Breakdown

### 1. Floating Icons

Six icons are positioned around the mockup using absolute positioning. Each icon floats with a gentle bobbing motion.

**CSS Class:** `.hero-floating-icon`

```css
/* src/styles/components/landing.css lines 574-586 */
.hero-floating-icon {
  @apply absolute flex items-center justify-center rounded-full;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  box-shadow:
    0 10px 40px color-mix(in srgb, var(--accent) 40%, transparent),
    0 4px 12px rgba(0, 0, 0, 0.15);
  animation: icon-float 6s ease-in-out infinite;
}
```

**Positioning classes** (lines 597-625):
- `.hero-float-pos-1` - Top left (Apple icon)
- `.hero-float-pos-2` - Top right (Dumbbell icon)
- `.hero-float-pos-3` - Right side (Heart icon)
- `.hero-float-pos-4` - Bottom right (Droplets icon)
- `.hero-float-pos-5` - Bottom left (TrendingUp icon)
- `.hero-float-pos-6` - Left side (Flame icon)

**Stagger Effect:**
Each icon receives a different `animationDelay` via inline style:
- Icon 1: 0s
- Icon 2: 0.5s
- Icon 3: 1s
- Icon 4: 1.5s
- Icon 5: 2s
- Icon 6: 2.5s

This creates a wave-like effect where icons bob at different times.

---

### 2. Circular Progress Ring

The main calorie display uses an SVG-based circular progress indicator.

**How it works:**

The ring is drawn using two SVG `<circle>` elements:
1. Background circle (grey track)
2. Foreground circle (colored progress)

The progress effect is achieved through `stroke-dasharray` and `stroke-dashoffset`:

```javascript
// Calculate SVG circle properties
const radius = (size - strokeWidth) / 2;
const circumference = radius * 2 * Math.PI;
const offset = circumference - (percentage / 100) * circumference;
```

- `stroke-dasharray` is set to the full circumference
- `stroke-dashoffset` controls how much of the stroke is "hidden"
- At 0% progress, offset equals circumference (fully hidden)
- At 100% progress, offset equals 0 (fully visible)

**CSS Class:** `.hero-mockup-ring-progress`

```css
/* src/styles/components/landing.css lines 728-731 */
.hero-mockup-ring-progress {
  transition: stroke-dashoffset 2s ease-out;
}
```

The ring is rotated -90 degrees via SVG `transform` so progress starts from the top instead of the right:

```tsx
transform={`rotate(-90 ${size / 2} ${size / 2})`}
```

---

### 3. Animated Numbers

Numbers animate from 0 to their target value using `requestAnimationFrame`.

**Implementation highlights:**

```javascript
const animate = (timestamp: number) => {
  if (!startTime.current) {
    startTime.current = timestamp;
  }

  // Calculate progress (0 to 1)
  const progress = Math.min((timestamp - startTime.current) / duration, 1);

  // easeOutQuart for smooth deceleration
  const easeOutQuart = 1 - Math.pow(1 - progress, 4);

  setDisplayValue(Math.floor(easeOutQuart * value));

  if (progress < 1) {
    animationFrame.current = requestAnimationFrame(animate);
  }
};
```

**Easing function:** `easeOutQuart`
- Formula: `1 - Math.pow(1 - progress, 4)`
- Effect: Numbers accelerate quickly then slow down as they approach the target
- This creates a natural "settling" feel rather than an abrupt stop

**Durations used:**
- Calories (1847): 2500ms
- Protein (98g): 2000ms
- Carbs (156g): 2200ms
- Fat (52g): 1800ms

---

### 4. Macro Progress Bars

Three horizontal progress bars show protein, carbs, and fat percentages.

**CSS Classes:**

Track (background):
```css
/* src/styles/components/landing.css lines 774-777 */
.hero-mockup-macro-bar {
  @apply h-2 rounded-full overflow-hidden;
  background: var(--muted);
}
```

Fill (animated portion):
```css
/* src/styles/components/landing.css lines 780-784 */
.hero-mockup-macro-fill {
  @apply h-full rounded-full;
  transition: width 1.5s ease-out;
}
```

**Color variations:**
```css
/* lines 787-797 */
.hero-mockup-macro-fill-protein {
  background: linear-gradient(90deg, #3b82f6, #60a5fa); /* Blue */
}

.hero-mockup-macro-fill-carbs {
  background: linear-gradient(90deg, #f59e0b, #fbbf24); /* Amber */
}

.hero-mockup-macro-fill-fat {
  background: linear-gradient(90deg, #ec4899, #f472b6); /* Pink */
}
```

**Animation trigger:**
Width is set via inline style and toggles between "0%" and the target percentage based on the `isVisible` state:

```tsx
style={{ width: isVisible ? "65%" : "0%" }}
```

The CSS `transition: width 1.5s ease-out` handles the smooth animation.

---

### 5. Water Glass Fill

Eight water glasses are rendered. Six are filled (highlighted), two are empty.

**CSS Classes:**

Base glass:
```css
/* src/styles/components/landing.css lines 825-833 */
.hero-mockup-water-glass {
  @apply flex-1 h-8 rounded-md;
  background: var(--muted);
  border: 1px solid var(--border);
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}
```

Filled glass:
```css
/* lines 836-841 */
.hero-mockup-water-glass-filled {
  background: linear-gradient(180deg, var(--accent-light), var(--accent));
  border-color: var(--accent);
  animation: glass-fill 0.5s ease-out forwards;
}
```

**Stagger effect:**
Each glass receives an incremental animation delay:

```tsx
style={{
  animationDelay: isVisible ? `${i * 0.15}s` : "0s",
}}
```

This creates a left-to-right filling effect.

---

### 6. Background Glow

A pulsing radial gradient glow appears behind the mockup.

**CSS Class:** `.hero-mockup-glow`

```css
/* src/styles/components/landing.css lines 861-879 */
.hero-mockup-glow {
  @apply absolute rounded-full pointer-events-none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent) 20%, transparent) 0%,
    transparent 70%
  );
  z-index: 0;
  animation: glow-pulse 4s ease-in-out infinite;
}
```

The glow pulses between 60% and 80% opacity while scaling from 1x to 1.1x.

---

## Intersection Observer Trigger

Animations only play when the mockup enters the viewport. This is controlled by the Intersection Observer API.

```javascript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 } // Trigger when 30% visible
  );

  if (mockupRef.current) {
    observer.observe(mockupRef.current);
  }

  return () => observer.disconnect();
}, []);
```

**Key behaviors:**
- Threshold of 0.3 means animations trigger when 30% of the component is visible
- Once triggered, the observer stops watching (animations only play once)
- The `isVisible` state gates all animated values (numbers, progress bars, etc.)

---

## CSS Animation Keyframes

### icon-float (Floating Icons)

```css
/* src/styles/components/landing.css lines 632-646 */
@keyframes icon-float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-12px) translateX(4px);
  }
  50% {
    transform: translateY(-6px) translateX(-4px);
  }
  75% {
    transform: translateY(-14px) translateX(2px);
  }
}
```

Duration: 6s, infinite loop, ease-in-out timing

### glass-fill (Water Glasses)

```css
/* src/styles/components/landing.css lines 843-852 */
@keyframes glass-fill {
  from {
    opacity: 0.5;
    transform: scaleY(0.8);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
```

Duration: 0.5s, ease-out timing, forwards fill mode

### glow-pulse (Background Glow)

```css
/* src/styles/components/landing.css lines 881-891 */
@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
```

Duration: 4s, infinite loop, ease-in-out timing

---

## Responsive Behavior

On screens smaller than 768px:

```css
/* src/styles/components/landing.css lines 899-926 */
@media (max-width: 768px) {
  /* Hide side floating icons to reduce clutter */
  .hero-float-pos-3,
  .hero-float-pos-6 {
    display: none;
  }

  /* Reduce floating icon size */
  .hero-floating-icon {
    width: 48px;
    height: 48px;
  }

  .hero-floating-icon-svg {
    @apply w-5 h-5;
  }

  /* Smaller glow on mobile */
  .hero-mockup-glow {
    width: 300px;
    height: 300px;
  }

  /* Adjust container padding */
  .hero-mockup-container {
    padding: 3rem 2rem;
  }
}
```

---

## Accessibility Considerations

### Reduced Motion Support

Users who prefer reduced motion will see no animations:

```css
/* src/styles/components/landing.css lines 932-953 */
@media (prefers-reduced-motion: reduce) {
  .hero-floating-icon,
  .hero-mockup-glow {
    animation: none;
  }

  .hero-mockup-ring-progress,
  .hero-mockup-macro-fill,
  .hero-mockup-water-glass {
    transition: none;
  }
}
```

### ARIA Attributes

Decorative elements are hidden from screen readers:

```tsx
// Floating icons container
<div className="hero-floating-icons" aria-hidden="true">

// Individual floating icons
<div ... aria-hidden="true">

// Glow effect
<div className="hero-mockup-glow" aria-hidden="true" />
```

---

## File References

| File | Description |
|------|-------------|
| `src/components/landing/HeroMockup.tsx` | Main component with React logic |
| `src/styles/components/landing.css` | All CSS styles and animations (lines 534-953) |

### Key CSS Class Reference

| Class | Purpose | Lines |
|-------|---------|-------|
| `.hero-mockup-container` | Main container with padding | 545-551 |
| `.hero-floating-icon` | Individual floating icon style | 574-586 |
| `.hero-float-pos-1` through `.hero-float-pos-6` | Icon positions | 597-625 |
| `.hero-mockup-frame` | Phone frame container | 655-671 |
| `.hero-mockup-ring-progress` | SVG progress ring animation | 728-731 |
| `.hero-mockup-macro-fill` | Progress bar fill | 780-784 |
| `.hero-mockup-water-glass` | Water glass base | 825-833 |
| `.hero-mockup-water-glass-filled` | Filled water glass | 836-841 |
| `.hero-mockup-glow` | Background glow effect | 861-879 |
