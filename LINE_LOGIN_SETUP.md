# LINE Login Setup Guide

## 📋 Overview
This project uses a **custom LINE login implementation** (Option B) because Supabase doesn't natively support LINE as an OAuth provider. The implementation uses LINE's OAuth 2.0 API with a custom callback handler.

## 🔧 Environment Variables Setup

### Step 1: Create `.env.local` file
In the project root directory (`/home/ubuntu/agentmanager/workspace/Beauty-PK/`), create a file named `.env.local`:

```bash
cd /home/ubuntu/agentmanager/workspace/Beauty-PK
touch .env.local
```

### Step 2: Add Required Variables
Open `.env.local` and add the following:

```env
# LINE OAuth Configuration
NEXT_PUBLIC_LINE_CHANNEL_ID=your_line_channel_id_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# Supabase Admin Key (for user management)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Existing Supabase variables (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Get Your Keys

#### A. LINE Channel ID & Secret
1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new **LINE Login** channel (or use existing)
3. Navigate to **Basic settings** tab
4. Copy:
   - **Channel ID** → `NEXT_PUBLIC_LINE_CHANNEL_ID`
   - **Channel secret** → `LINE_CHANNEL_SECRET`

#### B. Supabase Service Role Key
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. Under **Project API keys**, find `service_role` (secret)
5. Copy the key → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Security Warning**: The `service_role` key has admin privileges. Never expose it in client-side code or commit it to Git.

## 🌐 LINE Developers Console Configuration

### Set Callback URL
In your LINE Login channel settings:

1. Go to **LINE Login** tab
2. Find **Callback URL** section
3. Add the following URLs:

**For Local Development:**
```
http://localhost:3000/api/auth/line/callback
```

**For Production (Vercel):**
```
https://your-domain.vercel.app/api/auth/line/callback
```

Replace `your-domain` with your actual Vercel deployment URL.

## 🔄 How It Works

### Authentication Flow
1. User clicks "Sign in with LINE" button
2. Frontend redirects to LINE's authorization page
3. User approves the login on LINE
4. LINE redirects back to `/api/auth/line/callback` with authorization code
5. Backend exchanges code for access token
6. Backend fetches user profile from LINE API
7. Backend creates/finds user in Supabase using Admin API
8. Backend generates a magic link to log user into Supabase
9. User is automatically signed in and redirected to homepage

### User Data Handling
- LINE users are assigned a pseudo-email: `{lineUserId}@line.user`
- User metadata includes:
  - `full_name`: Display name from LINE
  - `avatar_url`: Profile picture from LINE
  - `line_id`: LINE user ID for future lookups
  - `provider`: Set to `'line'`

## 🧪 Testing

### Local Testing
```bash
npm run dev
```
Then visit `http://localhost:3000/login` and click the LINE login button.

### Production Testing
After deploying to Vercel:
1. Update the callback URL in LINE Console
2. Set environment variables in Vercel Dashboard
3. Redeploy and test

## 🐛 Troubleshooting

### Error: "LINE Client ID is not configured"
- Make sure `NEXT_PUBLIC_LINE_CHANNEL_ID` is set in `.env.local`
- Restart the dev server after adding environment variables

### Error: "Token exchange failed"
- Verify `LINE_CHANNEL_SECRET` is correct
- Check that the callback URL in LINE Console matches exactly

### Error: "Failed to create user"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase logs for detailed error messages

### User not appearing in Supabase
- Check that the `handle_new_user` trigger is installed (from `user_profile_setup.sql`)
- Verify RLS policies allow user creation

## 📝 Files Modified

- `app/login/page.tsx` - Added LINE login button and redirect logic
- `app/api/auth/line/callback/route.ts` - LINE OAuth callback handler
- `lib/supabaseAdmin.ts` - Supabase Admin client for user management

## 🔗 References

- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)
- [Supabase Admin API](https://supabase.com/docs/reference/javascript/admin-api)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
