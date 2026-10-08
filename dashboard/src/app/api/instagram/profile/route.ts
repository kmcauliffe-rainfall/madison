import { NextResponse } from 'next/server';
import { getInstagramProfile } from '@/lib/instagram';

export async function GET() {
  try {
    const profile = await getInstagramProfile();
    return NextResponse.json({ success: true, profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Instagram profile';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
