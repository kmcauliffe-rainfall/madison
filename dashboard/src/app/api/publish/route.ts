import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePostPartial } from '@/lib/postStore';

interface PublishStepLog {
  step: string;
  status: 'pending' | 'success' | 'failed' | 'simulated';
  detail: string;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post_id, simulate = false } = body;

    if (!post_id) {
      return NextResponse.json({ success: false, error: 'post_id is required' }, { status: 400 });
    }

    const post = await getPostById(post_id);
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.META_USER_ACCESS_TOKEN;

    const isLiveConfigured = Boolean(
      businessAccountId &&
      businessAccountId !== 'your_ig_business_id' &&
      accessToken &&
      accessToken !== 'your_long_lived_token'
    );

    const logs: PublishStepLog[] = [];
    const addLog = (step: string, status: 'pending' | 'success' | 'failed' | 'simulated', detail: string) => {
      logs.push({ step, status, detail, timestamp: new Date().toISOString() });
    };

    // Quality check validation before publish
    const fullBodyAsset = post.media.find(m => m.is_full_body);
    if (!fullBodyAsset) {
      addLog('Quality Control Alert', 'simulated', 'Notice: No full-body outfit image flagged. Client standard recommends at least one full-length shot.');
    }

    // Determine publish strategy
    const isReel = post.is_standalone_reel && post.media.some(m => m.type === 'video');
    const isCarousel = !isReel && post.media.length > 1;

    let instagramPostId = '';

    if (!isLiveConfigured || simulate) {
      // Simulation mode
      addLog('Mode Detection', 'simulated', 'Meta Graph API live credentials not detected or simulation requested. Running end-to-end publishing pipeline simulation.');

      if (isReel) {
        addLog('Step 1: Create Reel Container', 'simulated', `POST /v20.0/{business_account_id}/media (media_type=REELS, video_url=${post.media[0].url})`);
        addLog('Step 2: Reel Processing Check', 'simulated', 'Container status: FINISHED. Video encoding validated.');
        instagramPostId = `ig_reel_${Date.now()}`;
        addLog('Step 3: Publish Media', 'simulated', `POST /v20.0/{business_account_id}/media_publish -> Published IG Reel ID: ${instagramPostId}`);
      } else if (isCarousel) {
        addLog('Step 1: Create Carousel Children', 'simulated', `Creating ${post.media.length} child containers (is_carousel_item=true)`);
        const childIds = post.media.map((_, i) => `item_container_${Date.now()}_${i + 1}`);
        addLog('Step 2: Assemble Parent Carousel', 'simulated', `Parent container created with children: ${childIds.join(', ')}`);
        instagramPostId = `ig_carousel_${Date.now()}`;
        addLog('Step 3: Publish Carousel', 'simulated', `Published carousel container ID: ${instagramPostId}`);
      } else {
        const singleUrl = post.media[0]?.url || 'https://images.unsplash.com/photo-1509631179647-0177331693ae';
        addLog('Step 1: Create Single Media Container', 'simulated', `POST /v20.0/{business_account_id}/media (image_url=${singleUrl})`);
        instagramPostId = `ig_post_${Date.now()}`;
        addLog('Step 2: Publish Single Media', 'simulated', `Published post ID: ${instagramPostId}`);
      }

      // Update post state
      const updated = await updatePostPartial(post_id, {
        status: 'published',
        published_at: new Date().toISOString(),
        instagram_post_id: instagramPostId
      });

      return NextResponse.json({
        success: true,
        simulated: true,
        instagram_post_id: instagramPostId,
        logs,
        post: updated
      });
    }

    // LIVE META GRAPH API EXECUTION
    const GRAPH_URL = 'https://graph.facebook.com/v20.0';

    if (isReel) {
      const videoAsset = post.media.find(m => m.type === 'video') || post.media[0];
      addLog('Step 1: Create Reel Container', 'pending', `Calling Meta Graph API for video ${videoAsset.url}`);

      const createRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: videoAsset.url,
          caption: post.caption,
          share_to_feed: true,
          access_token: accessToken
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok || !createData.id) {
        throw new Error(createData.error?.message || 'Failed to create Reels container');
      }
      const containerId = createData.id;
      addLog('Step 1: Create Reel Container', 'success', `Container ID: ${containerId}`);

      // Publish container
      const pubRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok || !pubData.id) {
        throw new Error(pubData.error?.message || 'Failed to publish Reel');
      }
      instagramPostId = pubData.id;
      addLog('Step 2: Publish Media', 'success', `Published IG ID: ${instagramPostId}`);

    } else if (isCarousel) {
      addLog('Step 1: Create Child Items', 'pending', `Creating ${post.media.length} items`);
      const childIds: string[] = [];

      for (const item of post.media) {
        const isVideo = item.type === 'video';
        const payload: Record<string, unknown> = {
          is_carousel_item: true,
          access_token: accessToken
        };
        if (isVideo) {
          payload.media_type = 'VIDEO';
          payload.video_url = item.url;
        } else {
          payload.image_url = item.url;
        }

        const childRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const childData = await childRes.json();
        if (!childRes.ok || !childData.id) {
          throw new Error(childData.error?.message || 'Failed to create carousel item');
        }
        childIds.push(childData.id);
      }
      addLog('Step 1: Create Child Items', 'success', `Created: ${childIds.join(', ')}`);

      // Create parent carousel container
      const parentRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'CAROUSEL',
          children: childIds.join(','),
          caption: post.caption,
          access_token: accessToken
        })
      });
      const parentData = await parentRes.json();
      if (!parentRes.ok || !parentData.id) {
        throw new Error(parentData.error?.message || 'Failed to create carousel parent');
      }
      const parentContainerId = parentData.id;
      addLog('Step 2: Parent Carousel', 'success', `Parent Container ID: ${parentContainerId}`);

      // Publish parent container
      const pubRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: parentContainerId,
          access_token: accessToken
        })
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok || !pubData.id) {
        throw new Error(pubData.error?.message || 'Failed to publish carousel');
      }
      instagramPostId = pubData.id;
      addLog('Step 3: Publish Carousel', 'success', `Published IG ID: ${instagramPostId}`);

    } else {
      // Single image
      const singleRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: post.media[0]?.url,
          caption: post.caption,
          access_token: accessToken
        })
      });
      const singleData = await singleRes.json();
      if (!singleRes.ok || !singleData.id) {
        throw new Error(singleData.error?.message || 'Failed to create media container');
      }
      const containerId = singleData.id;

      const pubRes = await fetch(`${GRAPH_URL}/${businessAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      });
      const pubData = await pubRes.json();
      if (!pubRes.ok || !pubData.id) {
        throw new Error(pubData.error?.message || 'Failed to publish image');
      }
      instagramPostId = pubData.id;
      addLog('Published', 'success', `Published IG ID: ${instagramPostId}`);
    }

    const updated = await updatePostPartial(post_id, {
      status: 'published',
      published_at: new Date().toISOString(),
      instagram_post_id: instagramPostId
    });

    return NextResponse.json({
      success: true,
      simulated: false,
      instagram_post_id: instagramPostId,
      logs,
      post: updated
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown publishing error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
