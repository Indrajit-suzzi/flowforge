# Acceptance Criteria: Navbar & Landing Page 3D Redesign

**Spec:** `docs/superpowers/specs/2026-05-22-navbar-and-landing-redesign-design.md`
**Date:** 2026-05-22
**Status:** Draft

---

## Criteria

| ID | Description | Test Type | Preconditions | Expected Result |
|----|-------------|-----------|---------------|-----------------|
| AC-001 | Navbar items display both Lucide icon and text label | UI interaction | Browser at any page | Navbar link element contains an `svg` (icon) and `span` (text) |
| AC-002 | Navbar is transparent at the top of the landing page | UI interaction | Landing page loaded, scroll = 0 | Navbar computed `backgroundColor` has an alpha < 0.7 or is `transparent` |
| AC-003 | Navbar transitions to frosted glass on scroll | UI interaction | Landing page loaded, scroll > 40px | Navbar has `backdropFilter` containing `blur` and `backgroundColor` is darker |
| AC-004 | Navbar height decreases on scroll | UI interaction | Any page loaded, scroll transitions from 0 to > 40px | Navbar height changes from 64px (approx) to 56px (approx) |
| AC-005 | Parallax background blobs move with scroll | UI interaction | Landing page loaded, user scrolls | Glow blobs' CSS `transform` values change relative to scroll position |
| AC-006 | 3D Grid Floor perspective shifts with scroll | UI interaction | Landing page loaded, user scrolls | Grid floor container CSS `transform` (rotateX/perspective) changes based on scroll |
| AC-007 | Feature sections animate into view | UI interaction | Landing page, user scrolls to features | Section elements perform a 3D scale/slide animation (Opacity and Transform change) |
| AC-008 | Interactive Orb responds to scroll | UI interaction | Landing page, user scrolls near Hero | Orb canvas or container scale/rotation speed changes relative to scroll |
| AC-009 | Navigation links remain functional | UI interaction | Any page, click a link | Browser URL changes to the link's `to` path and content updates |
| AC-010 | User menu has 3D entry animation | UI interaction | Any page, click user menu button | Dropdown menu container animates with a 3D scale/rotate effect on entry |
