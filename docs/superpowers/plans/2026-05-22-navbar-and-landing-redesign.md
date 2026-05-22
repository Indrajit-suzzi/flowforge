# Navbar & Landing Page 3D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the navbar to a "Modern Glass Rail" style and add 3D scroll-response effects to the landing page.

**Architecture:** 
- Refactor `Navbar.jsx` to use a low-profile glass design with icons and labels.
- Update `Landing.jsx` and `Landing.css` to include parallax background blobs, perspective grid shifts, and scroll-triggered 3D animations using `framer-motion`.
- Maintain existing responsive behavior and branding.

**Tech Stack:** React, Framer Motion, Lucide-React, Vanilla CSS.

---

### Task 1: Navbar Visual Redesign (Modern Glass Rail)

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`

- [ ] **Step 1: Update Navbar component for icon+label layout and scroll response**

```jsx
// Replace internal styles and layout in frontend/src/components/Navbar.jsx
// Main changes: 
// 1. Add text labels to allNavLinks
// 2. Update styles for "Modern Glass Rail" (lower profile, glass effect)
// 3. Dynamic height and background based on 'scrolled' state

// Update allNavLinks to include labels in the render
{navLinks.map((link) => (
  <Link 
    key={link.to} 
    to={link.to} 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '6px 12px',
      fontSize: '13px', 
      fontWeight: '500',
      color: isActive(link.to) ? '#fff' : '#94a3b8',
      background: isActive(link.to) ? 'rgba(255,255,255,0.05)' : 'transparent',
      borderRadius: '8px',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
    }}
  >
    <link.icon style={{ width: '16px', height: '16px' }} />
    <span>{link.label}</span>
  </Link>
))}
```

- [ ] **Step 2: Verify AC-001, AC-004**
Run the frontend and check if labels appear next to icons and if height shrinks on scroll.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/Navbar.jsx
git commit -m "feat(navbar): redesign to modern glass rail with icon+labels"
```

---

### Task 2: Landing Page Parallax Background Blobs

**Files:**
- Modify: `frontend/src/pages/Landing.jsx`
- Modify: `frontend/src/pages/Landing.css`

- [ ] **Step 1: Implement useScroll and useTransform for background blobs**
In `Landing.jsx`, use `useScroll()` to track scroll progress and `useTransform()` to map it to translateY values for the `.glow-blob` elements.

- [ ] **Step 2: Apply scroll-linked transforms to blobs**
```jsx
const { scrollY } = useScroll();
const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

// Apply to blobs:
<motion.div className="glow-blob glow-peach" style={{ y: y1, ... }} />
<motion.div className="glow-blob glow-purple" style={{ y: y2, ... }} />
```

- [ ] **Step 3: Verify AC-005**
Scroll the landing page and observe if background blobs move at different speeds.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/pages/Landing.jsx
git commit -m "feat(landing): add parallax scroll response to background blobs"
```

---

### Task 3: 3D Grid Floor & Orb Scroll Response

**Files:**
- Modify: `frontend/src/pages/Landing.jsx`

- [ ] **Step 1: Link 3D Grid Floor perspective to scroll**
Transform the `grid-3d-floor` rotation or perspective based on `scrollY`.

```jsx
const gridRotateX = useTransform(scrollY, [0, 500], [75, 80]);
// Apply to .grid-3d-floor motion.div
```

- [ ] **Step 2: Link Orb scale/rotation to scroll**
Pass `scrollY` to `InteractiveOrb` or transform the wrapper.

- [ ] **Step 3: Verify AC-006, AC-008**
Verify grid floor perspective shift and orb response near hero.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/pages/Landing.jsx
git commit -m "feat(landing): add scroll response to 3D grid and orb"
```

---

### Task 4: Section Reveals & 3D Transitions

**Files:**
- Modify: `frontend/src/pages/Landing.jsx`

- [ ] **Step 1: Wrap sections in motion.div with whileInView**
Apply 3D scale and slide animations to `features`, `playground`, and `how-it-works` sections.

```jsx
<motion.section
  initial={{ opacity: 0, y: 50, rotateX: 10, scale: 0.95 }}
  whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  {/* section content */}
</motion.section>
```

- [ ] **Step 2: Verify AC-007**
Check that sections smoothly animate into view with 3D perspective as you scroll.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/pages/Landing.jsx
git commit -m "feat(landing): add scroll-triggered 3D reveals for sections"
```

---

### Task 5: Final Polishing & User Menu Animation

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`

- [ ] **Step 1: Add 3D entry animation to User Menu**
Update the `AnimatePresence` or inline CSS animations for the dropdown menu to include a `rotateX` or `scale` transition.

- [ ] **Step 2: Final visual check against AC-002, AC-003, AC-009, AC-010**
Verify transparency at top, glass transition, link functionality, and menu animation.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/Navbar.jsx
git commit -m "feat(navbar): add 3D animation to user menu and final polish"
```
