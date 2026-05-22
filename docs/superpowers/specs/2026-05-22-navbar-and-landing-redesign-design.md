# Design Spec: Navbar & Landing Page 3D Redesign

**Date:** 2026-05-22
**Topic:** Redesigning the website navbar for better usability and aesthetics, and adding modern 3D scroll-response effects to the landing page.

## 1. Overview
The current navbar is icon-only and feels "minimalist but lacking" (per user feedback). The redesign will move to a "Modern Glass Rail" approach that combines icons with text labels in a sleek, low-profile bar. Additionally, the landing page will be enhanced with 3D scroll-response effects to create a more immersive and "alive" experience.

## 2. Architecture & Layout

### 2.1 Navbar: Modern Glass Rail
- **Component:** `frontend/src/components/Navbar.jsx`
- **Structure:**
    - Fixed top bar with `z-index: 100`.
    - Content max-width: `1400px`.
    - Layout: Left (Logo), Center (Nav Links), Right (User Menu).
- **Visual Style:**
    - **Initial State (Top of page):** Fully transparent background or very light tint, minimal border.
    - **Scrolled State:** Transition to `rgba(8, 5, 17, 0.8)` with `backdrop-filter: blur(16px)`. Border bottom `1px solid rgba(255,255,255,0.04)`.
    - **Height:** Transitions from `64px` (idle) to `56px` (scrolled).
- **Navigation Links:**
    - Each link contains a Lucide icon and a text label.
    - Font: `fontSize: 13px`, `fontWeight: 500`.
    - Active state: Subtle background highlight `rgba(255,255,255,0.05)` and accent color transition for both icon and text.

### 2.2 Landing Page: 3D Scroll Response
- **Component:** `frontend/src/pages/Landing.jsx` & `frontend/src/pages/Landing.css`
- **Effects:**
    - **Parallax Background Blobs:** Adjust `translateY` and `translateX` based on scroll position using `framer-motion`'s `useScroll` and `useTransform`.
    - **3D Floor Grid Persistence:** The 3D grid floor will have a perspective tilt that shifts slightly as the user scrolls, giving an "infinite floor" feeling.
    - **Scroll-Triggered Section Reveals:** Use `motion.div` with `whileInView` and `initial` props to create 3D slide-and-scale entries for major sections.
    - **Interactive Orb Scaling:** The central 3D orb will respond to scroll position (e.g., slightly scaling or increasing rotation speed as you scroll toward it).

## 3. Interactions & Animations

### 3.1 Navbar Interactions
- **Hover:** Gentle lift effect on nav items (`translateY(-1px)`).
- **Active Link:** High-contrast color (Peach/Purple gradient) and a subtle bottom indicator or background glow.
- **User Menu:** Refined dropdown with a 3D "flip" or "scale" entry animation.

### 3.2 Landing Page Animations
- **Smooth Scroll:** Implement or ensure smooth scroll behavior across sections.
- **Micro-interactions:** Buttons will have a "glow follow" effect or a subtle 3D tilt on hover.

## 4. Technical Constraints & Patterns
- **Framework:** React (Vite).
- **Styling:** Vanilla CSS + Inline styles (maintaining current project pattern).
- **Animations:** `framer-motion` (already in use in `Landing.jsx`).
- **Icons:** `lucide-react`.

## 5. Success Criteria
- Navbar is more readable and feels "premium" while staying minimal.
- Landing page feels significantly more interactive and modern through scroll-based depth.
- Zero regressions in navigation functionality or responsive behavior.
