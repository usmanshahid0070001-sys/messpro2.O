# Project Context & Guidelines

Welcome to the `messpro2.O` project! This file serves as the definitive guide to the project's architecture, state management stack, file organization, and coding conventions. Any agent or developer working on this codebase should adhere strictly to these patterns.

## 1. Architecture Overview
This is a modern React/Vite web application using a feature-based folder architecture. 
- **Frontend Stack:** React, Vite, Tailwind CSS
- **Data Fetching & Caching:** TanStack Query (React Query)
- **Complex UI State Management:** Redux Toolkit
- **Simple UI State Management:** Zustand
- **Routing:** React Router

## 2. State Management Strategies

### TanStack Query
- **When to use:** For ALL server-state (data fetching, caching, synchronization, mutations).
- **Where to put:** Custom hooks wrapping TanStack Query should be placed in `src/hooks/queries/` and `src/hooks/mutations/` (e.g., `useSuperadminMutations.js`).
- **Convention:** Do not store API responses in global state (Redux/Zustand) if they can be handled directly by TanStack Query.

### Redux Toolkit (Complex UI)
- **When to use:** For complex, deeply nested, or globally shared UI state where multiple features need to react to state changes in non-trivial ways (e.g., complex multi-step wizards, global application state that involves heavy business logic).
- **Where to put:** Slice files and the store configuration go in `src/store/` or within the specific feature directory depending on scope.

### Zustand (Simple UI)
- **When to use:** For simple, lightweight UI states (e.g., modals, sidebars, theme toggles, simple user preferences).
- **Where to put:** Store files go in `src/store/` (e.g., `src/store/useUIStore.js`).

## 3. Directory Structure: Where to Put and Get Code

- **`src/api/`**: Centralized Axios/fetch client configuration and API endpoint definitions. Do not place UI logic here.
- **`src/assets/`**: Static assets like images, icons, and global stylesheets.
- **`src/components/`**: Shared, reusable presentational components (e.g., Buttons, Inputs, Modals) that are used across multiple features.
- **`src/context/`**: React Context providers for core application setup (e.g., `AuthContext.jsx`, ThemeContext). Prefer Zustand for UI state over Context to avoid re-renders.
- **`src/features/`**: The core domain logic of the application. 
  - **Rule:** Group code by feature rather than by type. A feature folder (e.g., `src/features/superadmin/`) should contain its own components, utils, and specific hooks related only to that domain (e.g., `ManageTenants.jsx`).
- **`src/hooks/`**: Shared custom hooks used across different features, particularly for data fetching (TanStack query wrappers) and reusable UI logic.
- **`src/pages/`**: Top-level route components. These should ideally be lean and mostly act as containers that assemble components from `src/features/` and `src/components/`.
- **`src/store/`**: Global state configuration (Redux store, Zustand stores like `useUIStore.js`).
- **`src/utils/`**: Shared helper functions, constants, and formatting utilities that do not contain React-specific logic.

## 4. Coding Conventions and Arrangement

- **Component Structure:**
  1. Imports (React -> Packages -> Internal -> Styles/Assets)
  2. Interface/Props definitions (if applicable)
  3. Component Definition
  4. Hooks (Contexts, Zustand, Redux, TanStack Queries/Mutations)
  5. Derived state and variables
  6. Helper functions/Handlers
  7. Return statement (JSX)
- **Styling:** Use Tailwind CSS utility classes directly in JSX. For highly complex or reusable patterns, extract them to standard CSS or create a shared component.
- **Modularity:** Keep files small and focused on a single responsibility. Extract complex logic into custom hooks or utility functions.

## 5. Instructions for Agents

- **Always Check Here First:** Use this document as the source of truth for architectural decisions.
- **Honor the Stack:** Do not mix up the state management tools. If it's API data, use TanStack Query. If it's a simple toggle, use Zustand.
- **Feature-First:** When adding new capabilities, default to placing them in the relevant `src/features/` folder rather than littering the global `src/components/` or `src/hooks/` directories.

## 6. Backend Module Architecture

From now on, whenever we create or edit a module in the backend, we must strictly follow this separation of concerns:
- **Business Logic:** Must be placed in the <module>.service.js file.
- **Database Calls:** Must be placed in the <module>.repository.js file.
- **Validations:** Must be placed in the <module>.validation.js file (using Zod or equivalent).
- **Controllers:** Should only handle request parsing, calling the service, and sending responses.
- **Routes:** Should only handle endpoint definitions and middleware chaining.

## 7. Mobile App (React Native / Expo) — Architecture & Performance Rules

> **Applies to:** Everything under `e:\messpro2.O\mobile\`. These rules are MANDATORY when working on the mobile app. The stack is: Expo SDK 57, React Native 0.86, React 19, NativeWind v2, expo-router.

### 7.1 What Is Already Active — Do NOT Re-configure

These are on by default and require zero action:
- **New Architecture (Fabric + TurboModules + JSI):** Mandatory default since Expo SDK 55. Synchronous C++ bridge, no serialization overhead.
- **Hermes V1 Engine:** Default in RN 0.86. Pre-compiled bytecode, 25–55% faster JS execution.
- **Reanimated:** Already wired in `babel.config.js`. Just import and use.

### 7.2 State Management — Mobile Decision Tree

```
Is it SERVER data? (API response, needs caching/refetch)
  → YES → TanStack Query (hooks in src/hooks/queries/ or src/hooks/mutations/)
  → NO → Is it SIMPLE UI state? (modal, tab, theme)
      → YES → Zustand store in src/store/
      → NO → Complex multi-step UI logic?
          → YES → Redux Toolkit slice in src/store/
```

**NEVER use raw `useEffect + useState` to fetch API data.** Always use TanStack Query.

**NEVER use React Context API for new global state.** The existing `AuthContext` is a known legacy issue — it will be migrated to Zustand. Do not replicate this pattern.

### 7.3 Known Issue — AuthContext Re-render Problem

`src/context/AuthContext.tsx` passes an inline object literal to `Provider.value`. This causes every `useAuth()` consumer to re-render on any auth state change (including the `loading` flip on startup). **Do not add more Context-based global state.** The migration plan is to replace it with `src/store/useAuthStore.ts` (Zustand).

### 7.4 Memoization Rules

- Use `React.memo` on components that receive the same props from frequently re-rendering parents (e.g., list item cards, tab icons).
- Use `useMemo` only for genuinely expensive derivations (filtering/sorting large arrays, permission checks). Not for cheap operations.
- Use `useCallback` only when passing callbacks as props to memoized children.
- **Never define arrays or objects inline in JSX props** — they create new references every render.

```tsx
// ❌ New array reference every render
const enabledFeatures = [{ name: 'X', isEnabled: true }];

// ✅ Outside component or wrapped in useMemo
const ENABLED_FEATURES = [{ name: 'X', isEnabled: true }]; // static → outside
const enabledFeatures = useMemo(() => [...], [dep]);        // dynamic → useMemo
```

### 7.5 List Rendering — Always Use FlashList

| List Size | Use | Required Props |
|---|---|---|
| < 20 items (static) | `ScrollView` + `.map()` | — |
| 20–500 items | **`FlashList`** (`@shopify/flash-list`) | `estimatedItemSize`, `keyExtractor`, `getItemType` |
| 500+ items | **`FlashList`** + `useInfiniteQuery` | All above + `onEndReached` pagination |

**Do not use `FlatList` as the default.** FlashList recycles views instead of creating/destroying them.

### 7.6 Animation Rules

- For **opacity/transform animations** with the classic Animated API: always `useNativeDriver: true`.
- For **gesture-driven UI, complex sequences, or layout-affecting animations** (height, backgroundColor): use **Reanimated worklets** — they run entirely on the UI thread.
- For **expensive work after navigation** (loading charts, large data): wrap in `InteractionManager.runAfterInteractions()` to let the navigation animation complete first.

### 7.7 Image Handling

- **Always use `expo-image`** (not RN's built-in `Image`) for remote images — it handles memory + disk caching automatically.
- Serve images as **WebP** format, sized to their rendered dimensions. Never load a 1200×1200 source for a 48×48 avatar.

### 7.8 Production Hygiene

- **Remove all `console.log` / `console.error` calls** from component files before any production build.
- **Never trust Expo Go performance metrics** — dev builds are 2–5x slower. All optimization validation must be done on a production build (`eas build --profile production`).
- Profile with **Hermes Profiler** (Android) and **Xcode Instruments** (iOS), not React DevTools alone.

### 7.9 Recommended Packages (Install Before Building Related Features)

```bash
npx expo install zustand                  # Auth store migration + UI state
npx expo install @tanstack/react-query    # All API data fetching
npx expo install @shopify/flash-list      # All list screens
npx expo install expo-image               # All remote image rendering
npx expo install react-native-gesture-handler  # Swipe/gesture interactions
npx expo install react-native-reanimated  # Complex animations (plugin already wired)
```

## 8. Frontend Development Rulebook — Performance-First Upgrades
**Project:** Hostel Management System (multi-feature, low-end mobile users)
**Purpose:** Rules for any developer/agent making frontend changes — UI library upgrades (shadcn/ui or otherwise), new features, redesigns, or refactors.

---

## 8.0 Core Principle

> **Never load more than the current screen needs.**
> Every byte of JS/CSS shipped to a hostelite on a low-end Android phone costs them real time and battery. Default to "load nothing, load late, load only what's used."

Before writing code, the agent must ask: *"Does this page/component need this right now, or can it wait/split/skip?"*

---

## 8.1 No Full-Site Loading

- [ ] **Never bundle the entire app into one JS file.** Every route/page must be its own chunk.
- [ ] Use route-based code splitting (`React.lazy` + `Suspense`, or framework-native routing like Next.js App Router / dynamic imports) for **every** page-level component.
- [ ] Shared layout (navbar, footer, auth wrapper) can be in the main bundle — everything else is lazy-loaded per route.
- [ ] Verify with a bundle analyzer after every major feature: no single route chunk should silently pull in unrelated feature code (e.g., "Room Booking" page must not include "Admin Reports" code).

**Check command (whatever bundler is used):**
```bash
# Example for Vite/webpack — must be run before merging any large feature
npx vite-bundle-visualizer   # or webpack-bundle-analyzer
```

---

## 8.2 Component-Level Lazy Loading

- [ ] Heavy/interactive components (modals, dialogs, command palettes, rich tables, charts, calendars, carousels) must be **lazy-loaded**, not imported at the top of the file, even if used on that page.
  ```js
  // ❌ Don't
  import { Dialog } from "@/components/ui/dialog";

  // ✅ Do — load only when the user actually opens it
  const Dialog = React.lazy(() => import("@/components/ui/dialog"));
  ```
- [ ] If a component only appears after a user action (click "Book Room", open "Edit Profile"), it must NOT be in the initial page bundle.
- [ ] Static/presentational components (Card, Badge, Avatar, Table row, Typography) are fine to import normally — they're cheap.

---

## 8.3 shadcn/ui-Specific Rules

- [ ] Only run `npx shadcn add <component>` for components actually used on a page being built **right now**. No pre-adding "just in case."
- [ ] Before adding a component, check if a simpler custom Tailwind element can do the job (e.g., a static badge doesn't need the full shadcn Badge primitive machinery if a plain `<span>` with Tailwind classes works).
- [ ] Mark shadcn components as `"use client"` **only** where interactivity is required. Static usages (e.g., Card as a layout wrapper) should stay server-rendered if the framework supports it (Next.js RSC).
- [ ] Radix primitives (which shadcn wraps) should not be imported redundantly across files — reuse the shared component in `components/ui/`, don't recreate variants.
- [ ] Audit `components/ui/` folder monthly — delete any component file no longer referenced anywhere (`grep -r "ComponentName"` across `src/`).

---

## 8.4 Images & Media

- [ ] All images must be served in modern formats (WebP/AVIF) with fallbacks, and lazy-loaded (`loading="lazy"`) unless above the fold.
- [ ] Use responsive `srcset`/`sizes` — never ship a 1200px desktop image to a 360px mobile screen.
- [ ] No auto-playing videos/GIFs on load. Defer until user interaction.
- [ ] Icons: use `lucide-react` with **named imports only**, never `import * as Icons`.
  ```js
  // ✅
  import { Bed, User } from "lucide-react";
  // ❌
  import * as Icons from "lucide-react";
  ```

---

## 8.5 CSS Rules

- [ ] Tailwind's purge/content config must include every file path where classes are used — verify no unused CSS ships to production (`npx tailwindcss --minify` output size check).
- [ ] No duplicate global CSS files across features. One source of design tokens (colors, spacing, radius) shared app-wide.
- [ ] Avoid deeply nested custom CSS-in-JS unless necessary — prefer Tailwind utility classes for consistency and smaller runtime cost.

---

## 8.6 JavaScript Bundle Discipline

- [ ] Every new dependency added to `package.json` must be justified: check its size on [bundlephobia.com](https://bundlephobia.com) before installing.
- [ ] Prefer native browser APIs over libraries where reasonable (e.g., `Intl.DateTimeFormat` instead of a large date library, unless already using one project-wide).
- [ ] No duplicate libraries doing the same job (e.g., don't have both `date-fns` and `moment` in the project).
- [ ] Tree-shake-friendly imports only — never `import _ from "lodash"`; use `import debounce from "lodash/debounce"` or a lighter alternative.

---

## 8.7 Low-End Device Targets (Mandatory Testing)

Before marking any feature "done," test on:
- [ ] Chrome DevTools **4x CPU throttle** + **Slow 4G** network
- [ ] A real low-end Android device if available (or a similarly throttled emulator)
- [ ] Confirm: page becomes interactive in a reasonable time even under these constraints (agent should note actual measured time in PR/commit description)

Performance budget per page load (throttled conditions) — treat as a hard ceiling to flag, not silently exceed:
- JS shipped per route: keep as small as reasonably possible; flag any route that grows noticeably vs. its previous size
- Total page weight (JS+CSS+images) on first load: flag anything unusually heavy for a hostel-management page
- Time to Interactive: should feel usable on a throttled connection, not sluggish

*(Exact numeric budgets should be set once a baseline is measured — the rule is: measure, record, and don't silently regress.)*

---

## 8.8 Data & API Loading

- [ ] Never fetch data for tabs/sections the user hasn't opened yet. Fetch on-demand (e.g., "Payment History" tab fetches only when clicked, not on page load).
- [ ] Paginate or virtualize any long list (student lists, room lists, complaint logs) — never render hundreds of DOM rows at once. Use pagination or a virtualized list (e.g., `react-window`) for anything over ~50 rows.
- [ ] Debounce search/filter inputs (300ms minimum) to avoid firing requests on every keystroke.
- [ ] Cache repeated API responses client-side (React Query / SWR or equivalent) so re-navigating doesn't re-fetch unchanged data.

---

## 8.9 Progressive Enhancement / Skeletons

- [ ] Every async section shows a lightweight skeleton/placeholder, not a blank screen or full-page spinner.
- [ ] Critical content (e.g., "your room number," "fee due date") should render first; secondary widgets (announcements, charts) load after.

---

## 8.10 Pre-Merge Checklist (Agent Must Confirm Before Any Frontend PR)

```
[ ] New route is code-split (not in main bundle)
[ ] No unused shadcn/Radix components imported
[ ] Images optimized + lazy-loaded
[ ] No new heavy dependency without bundlephobia check
[ ] Long lists paginated/virtualized
[ ] Tested under 4x CPU + Slow 4G throttle
[ ] Bundle analyzer shows no unexpected size jump for touched routes
[ ] No data fetched before it's needed on screen
[ ] Skeleton/loading state present for async content
```

---

## 8.11 Migration Strategy Note (for the shadcn Rollout Specifically)

- Do **not** redesign the whole site at once.
- Roll out page by page, starting with highest-traffic pages (login, dashboard, room booking, complaints).
- Each migrated page must pass the Section 10 checklist before moving to the next.
- Old and new design systems can coexist temporarily — don't rush parallel-run cleanup at the cost of shipping bloat.

---

## 9. Frontend UI Design Tokens, Color Hierarchy & Layout Standards

To maintain visual cohesion, clarity, and scannability across all web pages and dashboards:

### 9.1 Semantic Category Color Mapping
Never use a single default color (e.g. blue) on all cards or icons. Map colors strictly by functional domain:
- **People & Access:** Brand Blue (`bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20`, hover: `group-hover:bg-blue-600`)
- **Residence & Rooms:** Teal / Cyan (`bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20`, hover: `group-hover:bg-teal-600`)
- **Food & Meals:** Emerald Green (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`, hover: `group-hover:bg-emerald-600`)
- **Finance & Dues:** Purple / Violet (`bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20`, hover: `group-hover:bg-purple-600`)
- **Attendance & System Config:** Neutral Slate (`bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20`, hover: `group-hover:bg-slate-700`)
- **Alerts & Complaints:** Warm Amber (`bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`, hover: `group-hover:bg-amber-600`)

### 9.2 Typographic Hierarchy & Contrast Scale
- **Label / Category:** `text-[13px] font-medium text-muted-foreground`
- **Metric / Primary Value:** `text-3xl font-bold tracking-tight text-foreground` (crisp and high-contrast)
- **Subtext / Helper Text:** `text-[11px] font-normal text-muted-foreground/80`

### 9.3 Layout & Padding Consistency
- **Uniform Card Padding:** Standardize cards and interactive tiles to `p-5` (20px).
- **Asymmetric Grids:** Use `items-start` on multi-column grid layouts with sticky side widgets (`lg:sticky lg:top-16`) to prevent vertical stretching or container cutoffs.
- **Outer vs Inner Padding:** Let the layout shell handle outer margin/padding; do not apply duplicate large margins/padding in child page containers.

