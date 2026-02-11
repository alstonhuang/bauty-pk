
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Use RPC for fair matchmaking (includes Self-PK fix and Match-count fairness)
  const { data: selected, error } = await supabase.rpc('get_fair_match');

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
