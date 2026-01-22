# Task 2: Photo Upload & Gallery Agent

## Context
You are working on the "Beauty PK System". The foundation (Next.js + Supabase Client + Global CSS) is already set up.
Your role is to implement the **Photo Upload** and **User Gallery** features.

## Existing Resources
- **Supabase Client**: `lib/supabaseClient.ts` (Use this for all DB interactions).
- **Styles**: `app/globals.css` contains the design system. Use utility classes:
    - `.glass-panel` (Container style)
    - `.btn-primary` (Button style)
    - `.container` (Layout)
- **Schema**: See below.

## Database Schema (Supabase)
### photos
- `id` (UUID, PK)
- `user_id` (UUID, FK -> users.id)
- `url` (String) - The public URL of the uploaded image.
- `score` (Integer) - Default: 1000.
- `created_at` (Timestamp)

(Note: You also need to handle Supabase Storage for the actual file upload, bucket name: 'photos')

## Requirements
1.  **Upload Page (`/upload`)**:
    - Create a form to select an image.
    - Upload image to Supabase Storage.
    - Insert a record into `photos` table with default score 1000.
    - Show success message/animation.
2.  **Gallery Page (`/gallery`)** (or integrated into separate route):
    - Display photos uploaded by the current user.
    - Use a masonry or grid layout.
    - Use `.glass-panel` for image cards.

## Implementation Steps
1.  Create `app/upload/page.tsx`.
2.  Implement the upload logic using `supabase.storage`.
3.  Implement the DB insert logic.
4.  Ensure the UI matches the "Premium Glassmorphism" aesthetic defined in `globals.css`.

## Deliverables
- A working Upload Page.
- A Gallery Component showing user photos.
