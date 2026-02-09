import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=no_code`)
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${request.nextUrl.origin}/api/auth/line/callback`,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '',
        client_secret: process.env.LINE_CHANNEL_SECRET || '',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'Token exchange failed')

    // 2. Get user profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profileData = await profileResponse.json()
    if (!profileResponse.ok) throw new Error('Failed to get LINE profile')

    // User data from LINE
    const lineUserId = profileData.userId
    const displayName = profileData.displayName
    const avatarUrl = profileData.pictureUrl

    // We use a pseudo-email for LINE users since email is optional and harder to get
    const pseudoEmail = `${lineUserId}@line.user`

    // 3. Find or create user in Supabase
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: pseudoEmail,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: avatarUrl,
        line_id: lineUserId,
        provider: 'line'
      }
    })

    if (createError && !createError.message.includes('already exists')) {
      throw createError
    }

    // 4. Generate a login link (Magic Link) to sign the user in
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: pseudoEmail,
      options: {
        redirectTo: `${request.nextUrl.origin}/`
      }
    })

    if (linkError) throw linkError

    // 5. Redirect the user to the login link
    return NextResponse.redirect(linkData.properties.action_link)

  } catch (err: any) {
    console.error('LINE Login Error:', err)
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=${encodeURIComponent(err.message)}`)
  }
}
