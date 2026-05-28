# Design Spec: Sign-In and Register Redesign (Immersive Glow)

**Date:** 2026-05-28  
**Topic:** Frontend Visual Redesign  
**Status:** Draft

## 1. Overview
Redesign the authentication entry points (Sign In and Register) to align with FlowForge's premium "Peach/Indigo" design system. The goal is a high-impact, atmospheric experience that feels modern and professional while maintaining the existing OAuth-only authentication flow.

## 2. Goals
- Implement a "premium" aesthetic using high-blur glassmorphism and dynamic lighting.
- Create a unified visual experience that adapts dynamically between "Sign In" and "Create Account" modes.
- Maintain strict separation between UI/UX improvements and backend authentication logic.

## 3. Visual Design (Approach 1: Immersive Glow)
- **Background:** 
  - Base: `#080511` (Deep Space).
  - Overlay: 50px structural grid using `rgba(255, 255, 255, 0.02)`.
  - Atmospheric Lighting: Two large animated glow blobs in corners.
    - Top-Left: Peach (`rgba(255, 126, 95, 0.15)`).
    - Bottom-Right: Purple (`rgba(139, 92, 246, 0.12)`).
- **The Authentication Card:**
  - Background: `rgba(18, 11, 28, 0.7)` with `backdrop-filter: blur(24px)`.
  - Border: 1px solid `rgba(255, 255, 255, 0.08)`.
  - Radius: `32px`.
  - Box Shadow: Deep shadow with a subtle purple glow accent.
- **Typography:**
  - Headings: `Outfit` (800 weight), white (`#f8fafc`).
  - Body/Subtitles: `Plus Jakarta Sans`, muted blue-gray (`#94a3b8`).

## 4. Interaction & Animation
- **Entry Transition:** The authentication card should fade in and glide up 20px on mount (0.6s ease-out).
- **Breathing Background:** Corner blobs should use CSS keyframes to slowly pulse (scale 0.95 to 1.05) and shift position slightly (12-20s duration).
- **Responsive OAuth Buttons:**
  - Hover: 1.02x scale, border-color brightening, intensified internal glow.
  - Active: 0.98x scale.

## 5. Component Logic
- **Dynamic Content:** The page will detect the current URL path (`/sign-in` vs `/sign-up`).
  - `/sign-in`: Heading "Welcome back", subtitle "Access your automated workflows...".
  - `/sign-up`: Heading "Create your account", subtitle "Join FlowForge and start building...".
- **Refactoring:** The `SignInPage` component currently in `App.jsx` will be extracted or heavily updated to support these styles.

## 6. Constraints & Security
- **Backend Integrity:** No changes to API endpoints, controllers, or database models.
- **Auth Flow:** Google and GitHub OAuth remain the only supported methods.
- **Secrets:** No API keys or sensitive configurations are modified or exposed.

## 7. Success Criteria
- The Sign In page matches the approved "Immersive Glow" mockup.
- Animations are "Subtle & Elegant" as requested.
- Navigating to `/sign-up` shows the registration-focused copy while remaining functionally identical to `/sign-in`.
