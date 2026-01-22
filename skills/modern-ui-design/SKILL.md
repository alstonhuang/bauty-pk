---
name: Modern UI Design (Glassmorphism)
description: Guidelines for creating premium, high-end interfaces using Tailwind/CSS Modules and Framer Motion.
---

# Modern UI & Animation Guide

## 1. The "Premium" Aesthetic
- **Backgrounds**: Never plain black. Use deeply saturated dark colors (`#0F0F1A`) with ambient radial gradients.
- **Glassmorphism**: 
  - `backdrop-filter: blur(16px)`
  - `background: rgba(255, 255, 255, 0.05)`
  - Border: 1px solid `rgba(255, 255, 255, 0.1)`

## 2. Animation (Framer Motion)
Install: `npm install framer-motion`

### Key Patterns
- **Page Transition**:
  ```tsx
  <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} transition={{duration: 0.5}}>
  ```
- **List Stagger**:
  ```tsx
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
  ```
- **Button Hover**:
  ```tsx
  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  ```

## 3. Typography
- Use `Inter` or `Outfit` fonts.
- **Headings**: `font-extrabold`, `tracking-tight`, `text-transparent bg-clip-text bg-gradient-to-r`.
- **Labels**: `uppercase`, `tracking-widest`, `text-xs`, `opacity-60`.

## 4. Components
- **Cards**: Use the `.glass-panel` utility.
- **Inputs**: Transparent background, bottom border only or full glass background.
