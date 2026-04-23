# Frontend Architecture Guide

The Genlogs Carrier Portal frontend is a modern, high-performance React application designed for clarity, responsiveness, and zero-trust data handling.

## Tech Stack
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 8 (HMR optimized)
- **State Management:** TanStack Query (v5) for asynchronous state.
- **Styling:** TailwindCSS 4 (Utility-first).
- **Icons:** Lucide React.
- **Mapping:** Leaflet & React-Leaflet (v5).

---

## 1. Directory Structure
```text
src/
├── api/             # API client definitions
├── components/      # Atomic and feature-based components
│   ├── ui/          # Reusable primitive components
│   └── features/    # Business-logic driven components (e.g., CarrierRanking)
├── hooks/           # Custom hooks (e.g., useCarrierSearch)
├── constants/       # Static data and configurations (e.g., CITY_DB)
├── types/           # Global TypeScript interfaces and Zod schemas
└── App.tsx          # Root layout and orchestration
```

## 2. Data Flow & State Management

### TanStack Query Implementation
We use `useQuery` within the `useCarrierSearch` hook to manage the lifecycle of API requests.
- **Caching:** Responses are cached based on the `[origin, destination]` query key.
- **Loading States:** Managed globally via the hook to provide skeleton loaders in the UI.

### Zero-Trust Validation (Zod)
Before data enters the component state, it is validated against a **Zod Schema**. This ensures the frontend never crashes due to unexpected API changes (Contract testing at runtime).

```typescript
// Example from types/index.ts
export const SearchResponseSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  carriers: z.array(CarrierSchema),
  execution_time_ms: z.number()
});
```

---

## 3. Geographic Visualization Logic

### RouteMap Component
The `RouteMap` component uses `react-leaflet` to visualize truck routes.
- **Dynamic Framing:** When a search is triggered, the map uses `L.latLngBounds().fitBounds()` to automatically zoom and center on the route.
- **Synthetic Route Generation:** Since the API provides point-to-point data, the frontend simulates the "3 fastest routes" by generating alternative Bézier-like curves for visual richness.

---

## 4. Design System
- **Theme:** "Dark Intelligence" (Deep blues, high-contrast whites, and emerald accents).
- **Responsiveness:** Mobile-first design using Tailwind breakpoints.
- **Accessibility:** Semantic HTML, ARIA labels for inputs, and focus states for keyboard navigation.
