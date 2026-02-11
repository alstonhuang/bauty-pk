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
    // Determine the base origin - force https for production/tunnels
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('x-forwarded-host') || request.nextUrl.host
    const origin = `${protocol}://${host}`
    const redirectUri = `${origin}/api/auth/line/callback`

    console.log('LINE Callback Start:', { origin, redirectUri })

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '',
        client_secret: process.env.LINE_CHANNEL_SECRET || '',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('LINE Token Exchange Error:', tokenData)
      throw new Error(tokenData.error_description || 'Token exchange failed')
    }

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

    // 3. Find or create user in Supabase
    const pseudoEmail = `${lineUserId}@line.user`

    console.log('Preparing Supabase Admin creation for:', pseudoEmail)

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

    if (createError &&
      !createError.message.toLowerCase().includes('already') &&
      !createError.message.toLowerCase().includes('exists')) {
      console.error('Supabase Admin Create User Error:', createError)
      throw createError
    }

    // 4. Generate a login link
    // Ensure redirectTo also uses the correct origin
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: pseudoEmail,
      options: {
        redirectTo: `${origin}/`
      }
    })

    if (linkError) {
      console.error('Supabase Generate Link Error:', linkError)
      throw linkError
    }

    console.log('LINE Login Success, Redirecting to action_link')
    // 5. Redirect the user to the login link
    return NextResponse.redirect(linkData.properties.action_link)

  } catch (err: any) {
    console.error('LINE Login Error Details:', err)
    // Force redirect back to login with specific error
    return NextResponse.redirect(`${request.nextUrl.origin}/login?error=${encodeURIComponent(err.message)}`)
  }
}
