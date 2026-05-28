# Module Card: Frontend Authentication Page (`AuthPage`)

**Responsibility:** Handles all authentication entry points (Sign In, Register, OAuth callbacks).
**Files:** `frontend/src/pages/AuthPage.jsx`, `frontend/src/pages/AuthPage.css`

## Exports
- `default`: The main `AuthPage` component.

## Architecture
- **Route Awareness:** Uses `react-router-dom`'s `useLocation` to detect if the user is on `/sign-in` or `/sign-up`.
- **Styling:** Uses a dedicated CSS file for complex "Immersive Glow" visuals, glassmorphism, and animations.
- **Authentication:** Integrates with `useLocalAuth` context for Google and GitHub OAuth logic.

## Dependencies
- `react-router-dom`: Navigation and route detection.
- `lucide-react`: Icons for social login buttons.
- `AuthContext`: Backend authentication logic.

## Usage
Used as a route element in `App.jsx` for both `/sign-in` and `/sign-up` paths.

```jsx
<Route path="/sign-in/*" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
<Route path="/sign-up/*" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
```

**Last Updated:** 2026-05-28
**Commit ID:** 2f3013c
