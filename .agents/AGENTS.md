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
