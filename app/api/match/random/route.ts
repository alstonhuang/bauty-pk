
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Use the singleton instance


  // Fetch a batch of active photos
  // Since we can't do random() easily in simple query, we'll fetch up to 50 active photos
  // and pick 2 randomly from them.
  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, url, score')
    .eq('is_active', true)
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!photos || photos.length < 2) {
    return NextResponse.json({ error: 'Not enough photos to match' }, { status: 404 });
  }

  // Shuffle array
  const shuffled = photos.sort(() => 0.5 - Math.random());

  // Pick first 2
  const selected = shuffled.slice(0, 2);

  // Generate a random match ID (client doesn't necessarily need to persist this strictly unless we want to track match generation, 
  // but requirements say JSON: { match_id: "...", photos: ... })
  const match_id = crypto.randomUUID();

  return NextResponse.json({
    match_id,
    photos: selected
  });
}
