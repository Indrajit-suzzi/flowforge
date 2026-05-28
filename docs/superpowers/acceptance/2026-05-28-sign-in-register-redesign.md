# Acceptance Criteria: Sign-In and Register Redesign

**Spec:** `docs/superpowers/specs/2026-05-28-sign-in-register-redesign-design.md`
**Date:** 2026-05-28
**Status:** PASSED

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result | Status |
|----|-------------|-----------|---------------|-----------------|--------|
| AC-001 | Page background matches "Immersive Glow" spec | UI interaction | User navigates to `/sign-in` | Background is `#080511` with a visible 50px grid pattern and two large blurred glow blobs (Peach top-left, Purple bottom-right). | PASS |
| AC-002 | Authentication card uses glassmorphism styling | UI interaction | User navigates to `/sign-in` | Card has `backdrop-filter: blur(24px)`, `border-radius: 32px`, and a subtle `1px` border. | PASS |
| AC-003 | Page entry transition is smooth | UI interaction | User navigates to `/sign-in` | Card fades in and slides up from `20px` below its final position. | PASS |
| AC-004 | Background blobs have "breathing" animation | UI interaction | Page is loaded | Glow blobs subtly scale and shift position over a `12-20s` period using CSS keyframes. | PASS |
| AC-005 | OAuth buttons are responsive to hover/active states | UI interaction | User hovers over/clicks Google or GitHub buttons | Buttons scale to `1.02x` on hover and `0.98x` on active/click. | PASS |
| AC-006 | Page copy adapts for "Sign In" route | UI interaction | User navigates to `/sign-in` | Heading is "Welcome back" and subtitle mentions "Access your automated workflows...". | PASS |
| AC-007 | Page copy adapts for "Sign Up" route | UI interaction | User navigates to `/sign-up` | Heading is "Create your account" and subtitle mentions "Join FlowForge and start building...". | PASS |
| AC-008 | Google OAuth functionality is preserved | UI interaction | User clicks Google Sign-In button | Google Auth client is initialized and the GSI script is loaded (or simulated in tests). | PASS |
| AC-009 | GitHub OAuth functionality is preserved | UI interaction | User clicks GitHub Sign-In button | User is redirected to the `/api/v1/auth/github` endpoint. | PASS |
| AC-010 | Component refactoring maintains app stability | Logic | Run project build/lint | Project builds without errors and `App.jsx` remains clean (if component was extracted). | PASS |
