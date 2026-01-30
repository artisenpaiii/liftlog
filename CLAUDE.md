# LiftLog – Design, Frontend, and Backend Guidelines

This document defines how LiftLog should be designed, structured, and built across UI, frontend architecture, and backend services. It’s the single source of truth for visual design, Next.js development, and Express API standards.

---

# Design Guidelines

## Design Philosophy

Design must feel:

* Clean and intentional
* Calm and readable
* Fast and responsive
* Human-centered
* Structured, not decorative

Everything exists to support clarity and usability. If a visual element doesn’t improve understanding or flow, it doesn’t belong.

---

## Layout

* Use CSS Grid and Flexbox as primary layout systems
* Strong spacing rhythm using consistent spacing tokens
* Section-based page structure
* Clear visual hierarchy
* Logical content grouping
* Predictable layout patterns

---

## Typography

* Modern sans-serif font family only
* Clear type scale (H1–H6, body, labels, captions)
* High contrast between text levels
* Limited font weights
* Prioritize readability over style

---

## Color System

* Minimal palette
* Neutral base colors
* One primary accent color
* One secondary accent max
* High contrast for accessibility
* No decorative gradients

---

## UI Components

* Simple, consistent buttons
* Soft rounded corners
* Subtle shadows
* Clear interaction states
* Visual consistency across components
* Reusable design tokens

---

## UX Principles

* Intuitive navigation
* Clear user flows
* Obvious actions
* Predictable interactions
* Minimal cognitive load
* No hidden complexity

---

## Motion

* Subtle animations only
* Purpose-driven transitions
* Feedback for interactions
* No decorative animation

---

## Responsiveness

* Mobile-first design
* Adaptive layouts
* Touch-friendly spacing
* Flexible components
* Breakpoints defined in design system

---

## Performance Design

* Lightweight UI
* Minimal DOM complexity
* No visual noise
* Fast perceived load times
* Progressive loading patterns

---

# Next.js Guidelines (Latest App Router Standards)

## Architecture

* Use **App Router** (`/app` directory)
* Server Components by default
* Client Components only when required
* File-based routing
* Layout-based composition

---

## Rendering Strategy

* Prefer Server Components
* Use Client Components for:

  * Forms
  * Interactivity
  * State-heavy UI
  * Browser APIs

---

## Data Fetching

* Fetch data in Server Components, pass to Client Components as props
* Use server actions for mutations
* Use `fetch()` with caching strategies
* Prefer server-side data loading
* Avoid client-side fetching unless required for real-time updates

### Pattern: Server → Client Data Flow

```tsx
// page.tsx (Server Component)
async function Page() {
  const data = await fetchData();
  return <ClientComponent initialData={data} />;
}

// ClientComponent.tsx ("use client")
function ClientComponent({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  // Handle mutations, refetch as needed
}
```

---

## State Management

* Local state first
* URL state second
* Global state only when necessary
* Avoid heavy global stores unless justified

---

## Styling

* Tailwind as primary styling system
* Design tokens for spacing, colors, typography
* Component-based styling
* No inline styles
* No CSS duplication

---

## Performance

* Code splitting by default
* Lazy loading for heavy components
* Image optimization via `next/image`
* Font optimization via `next/font`
* Route-level loading states

---

## Folder Structure

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
├── components/
├── features/
├── hooks/
├── lib/
├── styles/
└── types/
```

---

## Component Rules

* Small, focused components
* Single responsibility
* Reusable logic
* Predictable props
* No business logic in UI components

---

# Express Backend Guidelines

## Architecture

Layered structure:

* Routes → Controllers → Services → Data Layer

Responsibilities:

* Routes: routing only
* Controllers: request/response handling
* Services: business logic
* Utils: helpers
* Middleware: cross-cutting concerns

---

## API Design

* RESTful structure
* Resource-based endpoints
* Predictable naming
* Consistent response format
* Proper HTTP status codes

---

## Validation

* Centralized validation middleware
* Input validation on every endpoint
* Schema-based validation
* Never trust client input

---

## Error Handling

* Centralized error middleware
* Structured error responses
* No raw stack traces to clients
* Logged server-side only

---

## Authentication

* JWT-based auth
* Middleware-protected routes
* Role-based access control
* Token rotation support

---

## Prisma Usage

* Prisma as single DB access layer
* No raw SQL unless necessary
* Centralized DB logic
* Transaction-based operations

---

## Redis Usage

* Session storage
* Caching layer
* Rate limiting
* Background job queues

---

## Configuration

* Env-based config only
* No hardcoded secrets
* Central config loader
* Environment separation

---

## Logging

* Structured logs
* Request logging
* Error logging
* Performance logging

---

## Folder Structure

```
backend/src/
├── controllers/
├── services/
├── routes/
├── middleware/
├── utils/
├── config/
└── index.ts
```

---

# Engineering Principles

## Build Rules

* Clarity over cleverness
* Predictability over abstraction
* Structure over shortcuts
* Maintainability over speed

---

## System Qualities

* Scalable
* Testable
* Observable
* Secure
* Maintainable

---

# Product Rule

Every feature must answer:

Does this make the system clearer?
Does this make it easier to use?
Does this reduce friction?
Does this improve flow?

If not — it doesn’t ship.
