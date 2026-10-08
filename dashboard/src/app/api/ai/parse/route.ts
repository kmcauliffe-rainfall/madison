import { NextRequest, NextResponse } from 'next/server';
import { Post } from '@/types/post';
import { savePost } from '@/lib/postStore';

interface ParsedLook {
  client_name: string;
  event_or_project: string;
  look_type: string;
  is_standalone_reel: boolean;
  stylist?: string;
  assistants?: string[];
  hair?: string;
  makeup?: string;
  nails?: string;
  photographer?: string;
  notes?: string;
  media_url?: string;
}

function parseVoiceOrTextToList(text: string): ParsedLook[] {
  // Split into chunks if bulleted or numbered or paragraphs
  const chunks = text
    .split(/(?:\n\s*[-*•\d+.]\s*|\n\n+)/)
    .map(c => c.trim())
    .filter(c => c.length > 5);

  const rawBlocks = chunks.length > 0 ? chunks : [text.trim()];
  const parsedLooks: ParsedLook[] = [];

  for (const block of rawBlocks) {
    const look: ParsedLook = {
      client_name: 'Madison Client',
      event_or_project: 'Styling & Alteration',
      look_type: 'Custom Fit & Tailoring',
      is_standalone_reel: false,
      stylist: '',
      assistants: [],
      hair: '',
      makeup: '',
      nails: '',
      photographer: '',
      notes: block
    };

    // Detect Client Name
    if (/bright\s*eyes|conor\s*oberst/i.test(block)) {
      look.client_name = 'Bright Eyes';
      look.event_or_project = 'Hollywood Bowl Show';
    } else if (/charli\s*xcx/i.test(block)) {
      look.client_name = 'Charli XCX';
      look.event_or_project = 'VMAs / Afterparty';
    } else if (/music\s*of\s*luna|luna/i.test(block)) {
      look.client_name = 'Music of Luna';
      look.event_or_project = 'Single Release / Editorial';
    } else if (/demi\s*lovato/i.test(block)) {
      look.client_name = 'Demi Lovato';
      look.event_or_project = 'Press Tour / Red Carpet';
    } else if (/pandora\s*knox/i.test(block)) {
      look.client_name = 'Pandora Knox';
      look.event_or_project = 'Music Video Shoot';
    } else if (/replicant/i.test(block)) {
      look.client_name = 'Replicant Labs';
      look.event_or_project = '3D Structural Fashion';
    } else {
      // Extract from first words or "for [Name]"
      const forMatch = block.match(/(?:for|with|client|artist)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (forMatch) {
        look.client_name = forMatch[1];
      } else {
        const firstWords = block.split(/[:\-,]/)[0].trim();
        if (firstWords.length < 30) look.client_name = firstWords;
      }
    }

    // Detect Look / Alteration
    if (/hem|pant[s]?\s*hem|shortened/i.test(block)) {
      look.look_type = 'Custom Pant Hem & Taper';
    } else if (/suit|blazer|tuxedo/i.test(block)) {
      look.look_type = 'Stage Suit Tailoring';
    } else if (/corset|bustier|wire/i.test(block)) {
      look.look_type = 'Structural Corsetry & Alteration';
    } else if (/leather/i.test(block)) {
      look.look_type = 'Leather Garment Alterations';
    }

    // Detect Video / BTS / Reel
    if (/reel|video|clip|bts|movement|rehearsal/i.test(block)) {
      look.is_standalone_reel = true;
    }

    // Detect Stylist
    const stylistMatch = block.match(/(?:styled\s*by|styling|stylist)\s*[:\-–]?\s*([@\w\.\-]+(?:\s+[A-Z][a-z]+)*)/i);
    if (stylistMatch) {
      look.stylist = stylistMatch[1].trim();
    } else if (/chris\s*h[ao]ran/i.test(block)) {
      look.stylist = '@chrishoran20';
    } else if (/gabby/i.test(block)) {
      look.stylist = '@gabby_style';
    }

    // Detect Assistants
    const asstMatch = block.match(/(?:asst[s]?|assistant[s]?|assisted\s*by)\s*[:\-–]?\s*([@\w\.\-]+(?:\s*,\s*[@\w\.\-]+)*)/i);
    if (asstMatch) {
      look.assistants = asstMatch[1].split(/[,&]/).map(s => s.trim()).filter(Boolean);
    }

    // Detect Hair
    const hairMatch = block.match(/(?:hair|hair\s*by)\s*[:\-–]?\s*([@\w\.\-]+(?:\s+[A-Z][a-z]+)*)/i);
    if (hairMatch) look.hair = hairMatch[1].trim();

    // Detect Makeup
    const muaMatch = block.match(/(?:makeup|mua|glam)\s*[:\-–]?\s*([@\w\.\-]+(?:\s+[A-Z][a-z]+)*)/i);
    if (muaMatch) look.makeup = muaMatch[1].trim();

    // Detect Photo
    const photoMatch = block.match(/(?:photo|shot\s*by|photographer)\s*[:\-–]?\s*([@\w\.\-]+(?:\s+[A-Z][a-z]+)*)/i);
    if (photoMatch) look.photographer = photoMatch[1].trim();

    // Extract any URLs in the text
    const urlMatch = block.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      look.media_url = urlMatch[0];
    }

    parsedLooks.push(look);
  }

  return parsedLooks;
}

export async function POST(req: NextRequest) {
  try {
    const { input_text } = await req.json();

    if (!input_text || typeof input_text !== 'string' || !input_text.trim()) {
      return NextResponse.json({ success: false, error: 'input_text is required' }, { status: 400 });
    }

    const parsedItems = parseVoiceOrTextToList(input_text);
    const createdPosts: Post[] = [];

    for (const item of parsedItems) {
      const header = `${item.client_name} • ${item.look_type}`;
      const lines = [header, '', 'Tailoring: @flowerthief'];
      if (item.stylist) lines.push(`Styling: ${item.stylist}`);
      if (item.assistants && item.assistants.length > 0) lines.push(`Assistants: ${item.assistants.join(', ')}`);
      if (item.hair) lines.push(`Hair: ${item.hair}`);
      if (item.makeup) lines.push(`Makeup: ${item.makeup}`);
      if (item.nails) lines.push(`Nails: ${item.nails}`);
      if (item.photographer) lines.push(`Photo: ${item.photographer}`);

      const fallbackImages = [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
      ];
      const randomImg = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

      const post: Post = {
        post_id: `post_ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        client_name: item.client_name,
        event_or_project: item.event_or_project,
        look_type: item.look_type,
        status: 'pending_review', // Ready for immediate review
        media: [
          {
            url: item.media_url || randomImg,
            type: item.is_standalone_reel ? 'video' : 'image',
            is_full_body: true,
            quality_rating: 'high'
          }
        ],
        is_standalone_reel: item.is_standalone_reel,
        caption: lines.join('\n'),
        collaborator_account: '@flowerthief',
        credits: {
          tailoring: '@flowerthief',
          stylist: item.stylist || '',
          assistants: item.assistants || [],
          hair: item.hair || '',
          makeup: item.makeup || '',
          nails: item.nails || '',
          photographer: item.photographer || ''
        },
        notes: item.notes,
        rate_billed: 20,
        created_at: new Date().toISOString()
      };

      const saved = await savePost(post);
      createdPosts.push(saved);
    }

    return NextResponse.json({
      success: true,
      count: createdPosts.length,
      posts: createdPosts
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error parsing text';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
