/**
 * TailorFlow Instagram Graph API Client
 * Uses permanent Meta System User Token for @flower.thief
 */

const GRAPH_API_BASE = 'https://graph.facebook.com/v26.0';

export interface InstagramProfile {
  id: string;
  username: string;
  name: string;
  biography?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
  website?: string;
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  children?: {
    data: Array<{
      id: string;
      media_type: string;
      media_url: string;
    }>;
  };
}

function getConfig() {
  const token = process.env.META_SYSTEM_USER_TOKEN;
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!token || !igId) {
    throw new Error('Missing META_SYSTEM_USER_TOKEN or INSTAGRAM_BUSINESS_ACCOUNT_ID in environment.');
  }
  return { token, igId };
}

/**
 * Fetch live Instagram profile metrics for @flower.thief
 */
export async function getInstagramProfile(): Promise<InstagramProfile> {
  const { token, igId } = getConfig();
  const fields = 'id,username,name,biography,profile_picture_url,followers_count,media_count,website';
  const res = await fetch(`${GRAPH_API_BASE}/${igId}?fields=${fields}&access_token=${token}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Instagram Graph API error: ${JSON.stringify(errorData)}`);
  }

  return res.json();
}

/**
 * Fetch recent published grid media from @flower.thief
 */
export async function getRecentMedia(limit = 12): Promise<InstagramMediaItem[]> {
  const { token, igId } = getConfig();
  const fields = 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,children{id,media_type,media_url}';
  const res = await fetch(`${GRAPH_API_BASE}/${igId}/media?fields=${fields}&limit=${limit}&access_token=${token}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Failed to fetch Instagram media: ${JSON.stringify(errorData)}`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Step 1: Create an IG Media container for a single photo
 */
async function createPhotoContainer(imageUrl: string, caption?: string, isCarouselItem = false): Promise<string> {
  const { token, igId } = getConfig();
  const params = new URLSearchParams({
    image_url: imageUrl,
    access_token: token,
  });

  if (isCarouselItem) {
    params.append('is_carousel_item', 'true');
  } else if (caption) {
    params.append('caption', caption);
  }

  const res = await fetch(`${GRAPH_API_BASE}/${igId}/media`, {
    method: 'POST',
    body: params,
  });

  const json = await res.json();
  if (!res.ok || !json.id) {
    throw new Error(`Failed to create photo container: ${JSON.stringify(json)}`);
  }

  return json.id;
}

/**
 * Step 2: Publish a created media container to the live feed
 */
async function publishContainer(creationId: string): Promise<string> {
  const { token, igId } = getConfig();
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: token,
  });

  const res = await fetch(`${GRAPH_API_BASE}/${igId}/media_publish`, {
    method: 'POST',
    body: params,
  });

  const json = await res.json();
  if (!res.ok || !json.id) {
    throw new Error(`Failed to publish container ${creationId}: ${JSON.stringify(json)}`);
  }

  return json.id; // Returns published IG Media ID
}

/**
 * Publish a single photo post directly to @flower.thief
 */
export async function publishSinglePhoto(imageUrl: string, caption: string): Promise<string> {
  const creationId = await createPhotoContainer(imageUrl, caption);
  return publishContainer(creationId);
}

/**
 * Publish a carousel (up to 10 photos) to @flower.thief
 */
export async function publishCarousel(imageUrls: string[], caption: string): Promise<string> {
  const { token, igId } = getConfig();
  if (imageUrls.length < 2) {
    throw new Error('A carousel requires at least 2 images.');
  }

  // 1. Create item containers
  const childContainerIds: string[] = [];
  for (const url of imageUrls) {
    const childId = await createPhotoContainer(url, undefined, true);
    childContainerIds.push(childId);
  }

  // 2. Create parent carousel container
  const carouselParams = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childContainerIds.join(','),
    caption: caption,
    access_token: token,
  });

  const carouselRes = await fetch(`${GRAPH_API_BASE}/${igId}/media`, {
    method: 'POST',
    body: carouselParams,
  });

  const carouselJson = await carouselRes.json();
  if (!carouselRes.ok || !carouselJson.id) {
    throw new Error(`Failed to create carousel container: ${JSON.stringify(carouselJson)}`);
  }

  // 3. Publish carousel
  return publishContainer(carouselJson.id);
}
