
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeStr = searchParams.get('exclude');
  const category = searchParams.get('category') || null;
  const excludeIds = excludeStr ? excludeStr.split(',') : [];

  // Use RPC for fair matchmaking - Try v7 first (category support)
  let { data: selected, error } = await supabase.rpc('get_fair_match_v7', {
    exclude_ids: excludeIds,
    p_category: category === 'All' ? null : category
  });

  // Fallback to old version if v7 isn't deployed yet
  if (error && error.message.includes('does not exist')) {
    console.log('Falling back to get_fair_match (v6)');
    ({ data: selected, error } = await supabase.rpc('get_fair_match', {
      exclude_ids: excludeIds
    }));
  }

  if (error) {
    console.error('Matchmaking RPC Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!selected || selected.length < 2) {
    return NextResponse.json({ error: 'Not enough photos to match (Minimum 2 required)' }, { status: 404 });
  }

  // Generate a random match ID
  const match_id = crypto.randomUUID();

  return NextResponse.json({
    match_id,
    photos: selected
  });
}
