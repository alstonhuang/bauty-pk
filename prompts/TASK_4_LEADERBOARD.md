# Task 4: Leaderboard & Visual Polish Agent

## Context
You are working on the "Beauty PK System".
Your role is to build the **Leaderboard** and apply **Final Visual Polish**.

## Existing Resources
- **Supabase Client**: `lib/supabaseClient.ts`.
- **Global Styles**: `app/globals.css`.

## Requirements
1.  **Leaderboard Page (`/leaderboard`)**:
    - Query `photos` table: Order by `score` DESC, Limit 20 (or 50).
    - Display columns: Rank, Photo (Avatar/Thumbnail), Score, Win Rate (Wins/Matches).
2.  **Visuals**:
    - Use the `.glass-panel` class for the list container.
    - Highlight the Top 3 with special styling (Gold/Silver/Bronze effects).
    - Add skeleton loading states while fetching data.
3.  **Responsive**:
    - Ensure the table/list looks good on Mobile.
4.  **Navigation**:
    - Add a sleek Navigation Bar (Header) linking to: PK (Home), Leaderboard, Upload.

## Deliverables
- High-performance, SEO-friendly Leaderboard page.
- Navigation Component (Header) used in `layout.tsx`.
