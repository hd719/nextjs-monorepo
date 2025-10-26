# Animated Search Bar Implementation Guide

## Overview

This guide documents the implementation of an animated search bar that transforms the entire navigation bar into a search interface. When activated, the search icon expands into a full-width search input that overlays the navigation, creating a seamless transformation effect.

## Architecture

The animated search consists of three main components:

1. **`useAnimatedSearch` Hook** - Manages state and animations
2. **`AnimatedSearch` Component** - The main search interface
3. **`Header` Component Integration** - Hosts the animated search

## File Structure

```
src/
├── hooks/
│   └── useAnimatedSearch.ts          # Animation state management
├── components/
│   ├── AnimatedSearch.tsx            # Main animated search component
│   ├── Header.tsx                    # Navigation with integrated search
│   └── RecipeSearch.tsx              # Static search component (fallback)
└── app/
    └── globals.css                   # Custom animations and transitions
```

## Component Breakdown

### 1. `useAnimatedSearch` Hook

**Location**: `src/hooks/useAnimatedSearch.ts`

**Purpose**: Manages the expansion/collapse state, focus handling, and click-outside detection.

#### Key Features:
- **State Management**: `isExpanded`, `isAnimating`
- **DOM References**: `searchRef`, `inputRef`
- **Animation Control**: `expandSearch()`, `collapseSearch()`
- **Event Handling**: Click outside, Escape key, focus management

#### Core Logic:
```typescript
const expandSearch = useCallback(() => {
  if (isExpanded || isAnimating) return;

  setIsAnimating(true);
  setIsExpanded(true);
  onExpandChange?.(true);

  // Focus input after DOM update
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);

  // Complete animation
  setTimeout(() => {
    setIsAnimating(false);
  }, 300);
}, [isExpanded, isAnimating, onExpandChange]);
```

#### Event Handlers:
- **Click Outside**: Automatically closes search when clicking elsewhere
- **Escape Key**: Closes search and clears input
- **Focus Management**: Proper keyboard navigation support

### 2. `AnimatedSearch` Component

**Location**: `src/components/AnimatedSearch.tsx`

**Purpose**: Renders the search interface with smooth animations.

#### Component States:

##### Collapsed State (Search Icon):
```tsx
{!isExpanded && (
  <button
    onClick={expandSearch}
    className="group flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all duration-200 hover:scale-110 hover:bg-white/20"
  >
    <SearchIcon className="h-5 w-5 text-appAccent-100" />
  </button>
)}
```

##### Expanded State (Full Search Bar):
```tsx
{isExpanded && (
  <div className="fixed inset-x-0 top-0 z-[60] bg-appAccent shadow-lg transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2">
    {/* Search Form */}
    {/* Search Results Dropdown */}
  </div>
)}
```

#### Key Features:
- **Fixed Positioning**: Overlays the entire header area
- **High Z-Index**: `z-[60]` ensures it appears above navigation (`z-50`)
- **Responsive Design**: Works on desktop and mobile
- **Search Results**: Real-time dropdown with autocomplete
- **Smooth Animations**: CSS-based transitions

### 3. Header Integration

**Location**: `src/components/Header.tsx`

**Purpose**: Integrates the animated search into the navigation bar.

#### Integration Points:

##### Desktop Navigation:
```tsx
<div className="hidden items-center gap-4 md:flex md:flex-1 md:justify-end lg:gap-6">
  <AnimatedSearch
    recipes={recipes}
    onExpandChange={handleSearchExpandChange}
    className="flex-shrink-0"
  />
  {/* Other nav items */}
</div>
```

##### Mobile Navigation:
```tsx
<div className="flex items-center gap-2 max-md:absolute max-md:-bottom-[54px] max-md:right-0 md:hidden">
  <AnimatedSearch
    recipes={recipes}
    onExpandChange={handleSearchExpandChange}
    className="flex-shrink-0"
  />
  {/* Mobile menu button */}
</div>
```

#### State Management:
```typescript
const [isSearchExpanded, setIsSearchExpanded] = useState(false);

const handleSearchExpandChange = (expanded: boolean) => {
  setIsSearchExpanded(expanded);

  // Close mobile nav when search expands
  if (expanded && showMobileNav) {
    setShowMobileNav(false);
  }
};
```

## Animation System

### CSS Animations

**Location**: `src/app/globals.css`

#### Custom Keyframes:
```css
@keyframes slideInFromTop {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideOutToTop {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
}
```

#### Tailwind Integration:
- **Entry Animation**: `animate-in fade-in slide-in-from-top-2`
- **Transition Classes**: `transition-all duration-300 ease-in-out`
- **State-based Classes**: Conditional opacity and scale transforms

### Animation Flow

1. **Click Search Icon**:
   - `expandSearch()` called
   - `isExpanded` set to `true`
   - Component mounts with entry animations
   - Input receives focus after 100ms delay

2. **Search Overlay Appears**:
   - Fixed positioned div slides down from top
   - Background overlay covers navigation
   - Search input becomes active

3. **Close Search**:
   - `collapseSearch()` called
   - `isExpanded` set to `false`
   - Component unmounts with CSS exit transitions

## Search Functionality

### Real-time Search Integration

The animated search integrates with the existing `useRecipeSearch` hook:

```typescript
const {
  currentSearchValue,
  isPending,
  filteredRecipes,
  placeholderSuggestion,
  handleSearchAction,
  handleInputChange,
  handleKeyDown,
  clearSearch,
  hasResults,
  hasQuery,
} = useRecipeSearch({
  recipes,
  initialValue: "",
  onInput: undefined,
  onEnter: undefined,
});
```

### Search Results Dropdown

#### Features:
- **Real-time filtering** as user types
- **Autocomplete suggestions** with ghost text
- **Recipe previews** with title, description, category, and cuisine
- **Keyboard navigation** support
- **Click to navigate** to recipe pages

#### Styling:
```tsx
<div className={classNames(
  "absolute left-4 right-4 top-full z-50 mt-2 max-h-96 overflow-hidden overflow-y-auto rounded-lg border border-white/20 bg-white shadow-xl transition-all duration-200 ease-in-out",
  {
    "pointer-events-none scale-95 opacity-0": !hasResults,
    "pointer-events-auto scale-100 opacity-100": hasResults,
  }
)}>
```

## Responsive Design

### Desktop Behavior:
- Search icon appears in the main navigation
- Expands to full-width search bar
- Results dropdown positioned below search input

### Mobile Behavior:
- Search icon appears next to mobile menu button
- Full-screen overlay when expanded
- Touch-friendly interface with proper spacing

### Breakpoint Strategy:
```css
/* Desktop */
.hidden.md:flex         /* Show on desktop */

/* Mobile */
.md:hidden              /* Hide on desktop */
.max-md:absolute        /* Mobile positioning */
```

## Accessibility Features

### Keyboard Navigation:
- **Tab Navigation**: Proper focus management
- **Escape Key**: Closes search and returns focus
- **Enter Key**: Submits search or navigates to results
- **Arrow Keys**: Navigate through search results

### ARIA Labels:
```tsx
<button aria-label="Open search">
<input aria-label="Search for recipes">
<button aria-label="Close search">
```

### Focus Management:
- Input automatically focused when search opens
- Focus returned to trigger when search closes
- Proper focus trapping within search interface

## Performance Considerations

### Optimizations:
1. **CSS Transitions**: Hardware-accelerated animations
2. **Conditional Rendering**: Components only mount when needed
3. **Debounced Search**: Prevents excessive API calls
4. **Result Limiting**: Maximum 6 results shown
5. **Lazy Loading**: Search results load on demand

### Memory Management:
- Event listeners properly cleaned up
- Timeouts cleared on unmount
- Refs nullified when components unmount

## Browser Compatibility

### Supported Features:
- **CSS Transitions**: All modern browsers
- **Fixed Positioning**: Universal support
- **Flexbox Layout**: IE11+ support
- **CSS Custom Properties**: Modern browsers only

### Fallbacks:
- Graceful degradation for older browsers
- Static search component as fallback
- Progressive enhancement approach

## Troubleshooting

### Common Issues:

#### Search Not Opening:
- Check `isExpanded` state in React DevTools
- Verify `expandSearch` function is being called
- Ensure no JavaScript errors in console

#### Animation Glitches:
- Check CSS transition classes are applied
- Verify z-index stacking context
- Ensure no conflicting animations

#### Focus Issues:
- Check input ref is properly set
- Verify focus timeout is not being cleared
- Ensure no other elements stealing focus

#### Mobile Issues:
- Check responsive classes are correct
- Verify touch events are working
- Ensure viewport meta tag is set

### Debug Tools:
```typescript
// Add to useAnimatedSearch hook for debugging
console.log('Search State:', { isExpanded, isAnimating });

// Add to AnimatedSearch component
console.log('Search Props:', { hasQuery, hasResults, filteredRecipes });
```

## Future Enhancements

### Potential Improvements:
1. **Voice Search**: Add speech-to-text functionality
2. **Search History**: Remember recent searches
3. **Advanced Filters**: Category, cuisine, difficulty filters
4. **Search Analytics**: Track popular searches
5. **Keyboard Shortcuts**: Global hotkeys for search
6. **Search Suggestions**: Popular/trending recipes

### Performance Optimizations:
1. **Virtual Scrolling**: For large result sets
2. **Search Caching**: Cache frequent searches
3. **Prefetching**: Preload popular results
4. **Service Worker**: Offline search capability

## Conclusion

The animated search bar provides a modern, intuitive search experience that seamlessly integrates with the navigation. The modular architecture makes it easy to maintain and extend, while the comprehensive animation system ensures smooth user interactions across all devices.

The implementation prioritizes accessibility, performance, and user experience, making it a robust solution for recipe discovery in the cookbook application.
