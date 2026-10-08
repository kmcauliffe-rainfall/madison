export type PostStatus = 'draft' | 'pending_review' | 'scheduled' | 'published';

export interface MediaAsset {
  url: string;
  thumbnail_url?: string;
  type: 'image' | 'video';
  is_full_body: boolean;
  source_url?: string;
  quality_rating?: 'high' | 'medium' | 'screenshot_flagged';
}

export interface Credits {
  tailoring: string;
  stylist: string;
  assistants: string[];
  hair: string;
  makeup: string;
  nails: string;
  photographer: string;
  custom_credits?: { role: string; handle: string }[];
}

export interface Post {
  post_id: string;
  client_name: string;
  event_or_project: string;
  look_type: string;
  status: PostStatus;
  media: MediaAsset[];
  is_standalone_reel: boolean;
  caption: string;
  collaborator_account: string;
  additional_collaborators?: string[];
  location?: string;
  scheduled_time?: string | null;
  published_at?: string | null;
  instagram_post_id?: string | null;
  credits: Credits;
  notes?: string;
  rate_billed: number;
  created_at: string;
  updated_at?: string;
}
