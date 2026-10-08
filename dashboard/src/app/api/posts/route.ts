import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, savePost } from '@/lib/postStore';
import { Post } from '@/types/post';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const client = searchParams.get('client');

    let posts = await getAllPosts();

    if (status && status !== 'all') {
      posts = posts.filter(p => p.status === status);
    }

    if (client) {
      posts = posts.filter(p => p.client_name.toLowerCase().includes(client.toLowerCase()));
    }

    return NextResponse.json({ success: true, posts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.client_name) {
      return NextResponse.json({ success: false, error: 'client_name is required' }, { status: 400 });
    }

    const post: Post = {
      post_id: body.post_id || `post_${Date.now()}`,
      client_name: body.client_name,
      event_or_project: body.event_or_project || 'General Project',
      look_type: body.look_type || '',
      status: body.status || 'draft',
      media: body.media || [],
      is_standalone_reel: Boolean(body.is_standalone_reel),
      caption: body.caption || '',
      collaborator_account: body.collaborator_account || '@flowerthief',
      additional_collaborators: body.additional_collaborators || [],
      location: body.location || '',
      scheduled_time: body.scheduled_time || null,
      credits: body.credits || {
        tailoring: '@flowerthief',
        stylist: '',
        assistants: [],
        hair: '',
        makeup: '',
        nails: '',
        photographer: ''
      },
      notes: body.notes || '',
      rate_billed: body.rate_billed || 20,
      created_at: body.created_at || new Date().toISOString()
    };

    const saved = await savePost(post);
    return NextResponse.json({ success: true, post: saved }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
