# Task 3: Core PK System (Voting) Agent

## Context
You are working on the "Beauty PK System". The foundation is ready.
Your role = implement the **Random Matching** and **Voting Logic** with ELO rating updates.

## Existing Resources
- **Supabase Client**: `lib/supabaseClient.ts`.
- **Global Styles**: `app/globals.css`.
- **Schema**: See below.

## Database Schema
### photos
- `id`, `url`, `score` (Integer), `wins`, `losses`, `matches`.
### votes
- `id`, `winner_photo_id`, `loser_photo_id`, `voter_id`, `created_at`.
### transactions
- `id`, `photo_id`, `vote_id`, `delta`, `previous_score`, `new_score`, `reason`.

## Core Algorithm (ELO Rating)
Implement this logic in your API or Server Action:
- K-Factor = 32.
- Expected Score = 1 / (1 + 10 ^ ((OpponentScore - MyScore) / 400)).
- Delta = Round(32 * (1 - Expected)).
- Winner Score += Delta.
- Loser Score -= Delta.

## Requirements
1.  **API Route (`/api/match/random`)**:
    - Returns 2 random photos from DB.
    - JSON: `{ match_id: "...", photos: [ {id, url, score}, {id, url, score} ] }`
2.  **API Route (`/api/match/vote`)**:
    - Accepts: `{ match_id, winner_id, loser_id }`.
    - Updates: `photos` (score, wins/losses).
    - Inserts: `votes`, `transactions` (x2 for winner and loser).
3.  **PK Interface (`/pk` or home `/`)**:
    - Show 2 photos side-by-side.
    - Click to vote.
    - **Crucial**: Animation! When a photo is clicked, show a "Victory" effect, and slide in the next pair immediately.
    - Display the "Points Gained (+xx)" after voting.

## Deliverables
- Functional Voting Loop.
- Accurate ELO calculation updates in DB.
