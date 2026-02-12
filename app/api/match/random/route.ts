
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeStr = searchParams.get('exclude');
  const tagsStr = searchParams.get('tags');
  const category = searchParams.get('category');
  const excludeIds = excludeStr ? excludeStr.split(',') : [];

  // 優先處理多重標籤，若無則回退至單一類別
  const targetTags = tagsStr ? tagsStr.split(',') : (category && category !== 'All' ? [category] : null);

  // 嘗試使用 v8 (支援多重標籤陣列)
  let { data: selected, error } = await supabase.rpc('get_fair_match_v8', {
    exclude_ids: excludeIds,
    p_tags: targetTags
  });

  // 如果 v8 不存在，則回退至 v7 (舊有的 category 模式)
  if (error && (error.message.includes('does not exist') || error.code === 'PGRST202' || error.message.includes('Could not find'))) {
    console.log('v8 function not found, falling back to v7...');
    const p_cat = category && category !== 'All' ? category : (targetTags ? targetTags[0] : null);
    ({ data: selected, error } = await supabase.rpc('get_fair_match_v7', {
      exclude_ids: excludeIds,
      p_category: p_cat
    }));
  }

  // 如果 v7 也不存在，則回退至 v6 (無類別模式)
  if (error && (error.message.includes('does not exist') || error.code === 'PGRST202' || error.message.includes('Could not find'))) {
    console.log('v7 function not found, falling back to get_fair_match (v6)');
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
