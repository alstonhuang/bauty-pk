# Task 2: Photo Upload & Gallery Agent

> **SYSTEM INSTRUCTION:**
> Before starting, you **MUST** set your working directory to: `c:/Users/alston.huang/.gemini/antigravity/playground/synthetic-kilonova`
> Do not create a new project. Work in the existing one.

# Task 5: Robust Authentication System

> **SYSTEM INSTRUCTION:**
> Before starting, you **MUST** set your working directory to: `c:/Users/alston.huang/.gemini/antigravity/playground/synthetic-kilonova`
> Do not create a new project. Work in the existing one.

## Context
Currently, the app uses a "Developer Bypass" or relies on anonymous actions. We need a proper, secure User Authentication flow using Supabase Auth.
The goal is to allow users to Sign Up and Log In so they can securely manage their own photos and have a persistent identity.

## Existing Resources
- **Supabase Client**: `lib/supabaseClient.ts`
- **Current Mock Implementation**: See `app/upload/page.tsx` (needs to be cleaned up).

## Requirements

### 1. Build Authentication Pages
Create a dedicated route `/login` (or a modal) that handles:
- **Tabs**: Toggle between "Sign In" and "Sign Up".
- **Fields**: Email and Password.
- **Validation**: Ensure email format and password length.
- **Feedback**: Show clear success/error messages (e.g., "Wrong password", "Check email for confirmation").
- **Design**: Use the **Glassmorphism** style (`.glass-panel`). It should look premium.

### 2. Clean Up & Integration
- **Refactor Upload Page**: Remove the "Developer Bypass" button. If the user is not logged in, show a "Please Login to Upload" state that redirects to `/login`.
- **Navbar/Header**: Update `app/layout.tsx` or create a `components/Navbar.tsx` that:
    - Shows "Login" button when guest.
    - Shows "Avatar / Logout" dropdown when logged in.

### 3. State Management
- Ensure the user session state is correctly propagated (standard Supabase `onAuthStateChange` listener).

## Deliverables
- A beautiful `/login` page.
- A functional Navbar with Auth state.
- Cleaned up Upload page enforcing real auth.
