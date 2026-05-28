# Decision: Route-Aware Content for Authentication Pages

**Date:** 2026-05-28
**Topic:** Frontend Architecture
**Decision:** Use a single `AuthPage` component for both Sign-In and Register routes, dynamically updating copy and metadata based on the URL path.

## Context
FlowForge previously used a minimalist Sign-In card that lacked a dedicated Registration page. The user requested a "better look" for both Sign In and Register while keeping the existing OAuth-only backend logic.

## Options Considered
1. **Separate Pages:** Create dedicated `SignIn.jsx` and `SignUp.jsx` files. (Rejected: High code duplication since the functional logic—OAuth—is identical for both).
2. **Generic Mode Prop:** Pass a `mode="signin"` or `mode="signup"` prop to a single component. (Rejected: Requires duplicate route definitions and manual prop passing).
3. **Route-Aware Component:** Use a single component that detects its context via the URL. (Selected: Cleanest implementation, single source of truth for auth logic).

## Rationale
- **DRY:** Social login initialization (Google GSI, GitHub redirect) is identical for both flows.
- **UX:** Provides a tailored experience ("Welcome back" vs "Create account") without the overhead of maintaining two pages.
- **Simplicity:** One component handles all authentication entry points, simplifying `App.jsx`.

## Consequences
- Functional logic (OAuth) must be generic enough to serve both entry points.
- Copy must be carefully mapped to the `isSignUp` flag.
- Metadata (like page titles) should ideally be handled within the component or via a common helper.

**Status:** Approved
**Commit ID:** 2f3013c
