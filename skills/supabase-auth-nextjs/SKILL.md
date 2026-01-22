---
name: Supabase Auth Next.js
description: Best practices for implementing Authentication with Supabase in Next.js 14/15 App Router.
---

# Supabase Auth with Next.js App Router

## 1. Architecture
- Use **SSR** (Server Side Rendering) for protecting routes.
- Use **Client Component** for Login/Signup forms.
- Use `createServerComponentClient` (from `@supabase/auth-helpers-nextjs` or `@supabase/ssr`) for server-side data fetching.

## 2. Middleware Protection
Create `middleware.ts` in root to protect routes.

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}
```

## 3. Auth Context (Client Side)
Ensure `SupabaseProvider` wraps the app layout to provide session state to all client components.

## 4. Login Page Pattern (Glassmorphism)
- Split "Sign In" and "Sign Up" into Tabs.
- Fields: Email, Password.
- Handle Errors: Show valid feedback.

## 5. Route Handling
- `/login`: Public.
- `/upload`: Protected (Redirect to /login if no session).
- `/pk`: Public.
