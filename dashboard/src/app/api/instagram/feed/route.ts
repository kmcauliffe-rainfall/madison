import { NextRequest, NextResponse } from 'next/server';
import { getRecentMedia } from '@/lib/instagram';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const media = await getRecentMedia(limit);
    return NextResponse.json({ success: true, count: media.length, media });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Instagram feed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
