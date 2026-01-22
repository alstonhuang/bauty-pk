# Task 6: Premium UX/UI Polish & Re-design (Revised)

## Context
The user is unsatisfied with the current "cluttered" and "oversized" interface.
**Goal**: Create a clean, distraction-free, "Split-Screen" PK experience that fits perfectly on one screen.

## Design Direction: "The Arena"
- **Less is More**: Remove header/footer distractions on the PK page. Focus purely on the two competitors.
- **Split Layout**: The screen should be perfectly divided into Left and Right.
- **Dark & Sleek**: Deep dark background, neon accents only on interaction.

## Requirements

### 1. PK Page Overhaul (`app/pk/page.tsx`)
**Structure:**
- **Container**: `h-[calc(100vh-80px)]` (Full viewport height minus header).
- **Layout**: `grid grid-cols-1 md:grid-cols-2 gap-4 p-4`.
- **VS Badge**: A floating absolute centered element (`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10`).
- **Image Card**:
    - Must use `.glass-panel` style.
    - **Image Sizing**: `relative w-full h-[60vh]`.
    - **Object Fit**: `object-contain` (Show full image) or `object-cover` (Fill space) depending on aesthetic, but ensure it doesn't overflow. **Strongly suggest `object-contain` with a blurred background of the same image behind it.**
- **Interaction**:
    - **Hover**: When hovering Left, Right dims slightly (and vice versa).
    - **Vote Button**: A large, clear "Vote" button BELOW each image.

### 2. Global Visuals (`app/globals.css`)
- **Background**: Ensure the background is dark enough (`#050505`) so images pop.
- **Typography**: Make sure the "VS" text is energetic (Italic, bold, neon glow).

### 3. Animations
- **Initial Load**: The two cards should slide in from left and right.
- **After Vote**: The loser fades out/grayscale, the winner scales up + glows. Then both slide out for the next pair.

## Implementation Plan
1.  Rewrite `app/pk/page.tsx` completely.
2.  Update `app/globals.css` if necessary for the VS badge animation.
3.  Ensure Mobile responsiveness (stack vertically on mobile, but keep images visible).

## Reference Code (Tailwind)
```tsx
<div className="flex flex-col h-full bg-black/40 rounded-2xl overflow-hidden border border-white/10 relative group cursor-pointer transition-all hover:border-pink-500/50">
  {/* Image Container */}
  <div className="relative w-full h-[60vh] bg-black/60">
      <Image src={url} fill className="object-contain" />
  </div>
  {/* Action Area */}
  <div className="p-6 flex flex-col items-center justify-center bg-white/5 border-t border-white/5">
     <button className="btn-primary w-full max-w-[200px]">VOTE</button>
  </div>
</div>
```
