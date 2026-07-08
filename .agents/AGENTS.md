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
