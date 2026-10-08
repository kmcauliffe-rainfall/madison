import { Post } from '@/types/post';

export const SEED_POSTS: Post[] = [
  {
    post_id: 'post_bright_eyes_hollywood_bowl',
    client_name: 'Bright Eyes',
    event_or_project: 'Hollywood Bowl Headline Show',
    look_type: 'Conor Oberst Stage Suit Tailoring & Alterations',
    status: 'pending_review',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/brighteyesofficial',
        quality_rating: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: false,
        source_url: 'https://instagram.com/brighteyesofficial',
        quality_rating: 'high'
      },
      {
        url: 'https://assets.mixkit.co/videos/preview/mixkit-concert-crowd-applauding-a-band-on-stage-42407-large.mp4',
        type: 'video',
        is_full_body: true,
        source_url: 'https://instagram.com/brighteyesofficial',
        quality_rating: 'high'
      }
    ],
    is_standalone_reel: true,
    caption: `Bright Eyes • Hollywood Bowl Stage Fit\n\nTailoring: @flowerthief\nStyling: @chrishoran20\nAssistants: @alex_styling, @taylor.assist\nPhoto: @charlyhphotos`,
    collaborator_account: '@flowerthief',
    additional_collaborators: ['@brighteyesofficial'],
    location: 'Hollywood Bowl, Los Angeles',
    scheduled_time: null,
    credits: {
      tailoring: '@flowerthief',
      stylist: '@chrishoran20',
      assistants: ['@alex_styling', '@taylor.assist'],
      hair: '@lucas_hair',
      makeup: '',
      nails: '',
      photographer: '@charlyhphotos'
    },
    notes: 'Conor requested double-stitch tapered trousers and reinforced shoulder seams for stage mobility. BTS clip to be published as standalone Reel.',
    rate_billed: 20,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    post_id: 'post_charli_xcx_chrome_hearts',
    client_name: 'Charli XCX',
    event_or_project: 'VMAs / Afterparty',
    look_type: 'Chrome Hearts Custom Leather Pant Hems & Archival Fit',
    status: 'draft',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/charli_xcx',
        quality_rating: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/chrishoran20',
        quality_rating: 'high'
      }
    ],
    is_standalone_reel: false,
    caption: `Charli XCX • VMAs Afterparty\n\nTailoring: @flowerthief\nStyling: @chrishoran20\nAssistants: @samuel_asst\nHair: @sams_hair_la\nMakeup: @glam_by_d\nPhoto: @cobrasnake`,
    collaborator_account: '@flowerthief',
    additional_collaborators: ['@chrishoran20'],
    location: 'New York City / VMAs',
    scheduled_time: null,
    credits: {
      tailoring: '@flowerthief',
      stylist: '@chrishoran20',
      assistants: ['@samuel_asst'],
      hair: '@sams_hair_la',
      makeup: '@glam_by_d',
      nails: '@nails_by_mei',
      photographer: '@cobrasnake'
    },
    notes: 'Prioritize full-body shot displaying raw Chrome Hearts leather pant hems. Madison flat day-rate client.',
    rate_billed: 20,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    post_id: 'post_music_of_luna_fairy',
    client_name: 'Music of Luna',
    event_or_project: 'Single Release / Editorial',
    look_type: 'Custom Fairy Corsetry & Delicate Wire Structural Work',
    status: 'draft',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/musicofluna',
        quality_rating: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: false,
        source_url: 'https://instagram.com/musicofluna',
        quality_rating: 'high'
      }
    ],
    is_standalone_reel: false,
    caption: `Music of Luna • "Fairy Tale" Editorial\n\nTailoring: @flowerthief\nStyling: @gabby_style\nAssistants: @jordan_tailor_assist\nHair: @hairbymel\nMakeup: @celestialmua\nPhoto: @wmag_archive`,
    collaborator_account: '@flowerthief',
    additional_collaborators: ['@musicofluna', '@gabby_style'],
    location: 'Los Angeles, CA',
    scheduled_time: null,
    credits: {
      tailoring: '@flowerthief',
      stylist: '@gabby_style',
      assistants: ['@jordan_tailor_assist'],
      hair: '@hairbymel',
      makeup: '@celestialmua',
      nails: '@clawz_la',
      photographer: '@wmag_archive'
    },
    notes: 'Collaborated with Gabby. Ensure high-res images from W Mag or photographer directly without watermark.',
    rate_billed: 20,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    post_id: 'post_demi_lovato_chris_horan',
    client_name: 'Demi Lovato',
    event_or_project: 'Press Tour / Red Carpet',
    look_type: 'Tailored Blazer Silhouette & Precision Trouser Break',
    status: 'scheduled',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/chrishoran20',
        quality_rating: 'high'
      }
    ],
    is_standalone_reel: false,
    caption: `Demi Lovato • Press Tour\n\nTailoring: @flowerthief\nStyling: @chrishoran20\nAssistants: @styleasst_la\nHair: @hairbycesar\nMakeup: @jillmua\nPhoto: @editorial_snaps`,
    collaborator_account: '@flowerthief',
    additional_collaborators: ['@chrishoran20'],
    location: 'Beverly Hills, CA',
    scheduled_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    credits: {
      tailoring: '@flowerthief',
      stylist: '@chrishoran20',
      assistants: ['@styleasst_la'],
      hair: '@hairbycesar',
      makeup: '@jillmua',
      nails: '@nails_by_demi',
      photographer: '@editorial_snaps'
    },
    notes: 'Scheduled for optimal Tuesday morning peak engagement window.',
    rate_billed: 20,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    post_id: 'post_pandora_knox_mv',
    client_name: 'Pandora Knox',
    event_or_project: 'Music Video Release',
    look_type: 'Custom Structured Leather Bustier & Draped Skirt',
    status: 'draft',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/pandoraknox',
        quality_rating: 'high'
      }
    ],
    is_standalone_reel: false,
    caption: `Pandora Knox • Official Music Video Look\n\nTailoring: @flowerthief\nStyling: @gabby_style\nAssistants: @maddie_assist\nHair: @hair_guru_la\nMakeup: @vamp_makeup\nPhoto: @mv_director_stills`,
    collaborator_account: '@flowerthief',
    additional_collaborators: ['@pandoraknox', '@gabby_style'],
    location: 'Los Angeles Soundstage',
    scheduled_time: null,
    credits: {
      tailoring: '@flowerthief',
      stylist: '@gabby_style',
      assistants: ['@maddie_assist'],
      hair: '@hair_guru_la',
      makeup: '@vamp_makeup',
      nails: '@stiletto_nails',
      photographer: '@mv_director_stills'
    },
    notes: 'IMPORTANT (Per meeting): Hold until official music video drops. Do not post teasers prematurely!',
    rate_billed: 20,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    post_id: 'post_replicant_labs_3d',
    client_name: 'Replicant Labs',
    event_or_project: 'Hybrid 3D Printing x Haute Couture',
    look_type: 'Custom Prop Integration & Architectural Bodice Tailoring',
    status: 'published',
    media: [
      {
        url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop',
        type: 'image',
        is_full_body: true,
        source_url: 'https://instagram.com/flowerthief',
        quality_rating: 'high'
      }
    ],
    is_standalone_reel: false,
    caption: `Replicant Labs • Architectural Structural Wear\n\nTailoring: @flowerthief\nStyling: @flowerthief\nAssistants: @maker_assist\nPhoto: @futurefashion_archive`,
    collaborator_account: '@flowerthief',
    additional_collaborators: ['@replicantlabs'],
    location: 'Replicant Labs Studio, LA',
    scheduled_time: null,
    published_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    instagram_post_id: 'ig_1798234871923',
    credits: {
      tailoring: '@flowerthief',
      stylist: '@flowerthief',
      assistants: ['@maker_assist'],
      hair: '',
      makeup: '',
      nails: '',
      photographer: '@futurefashion_archive'
    },
    notes: 'First 3D printed prop fitted directly to tailored corsetry.',
    rate_billed: 20,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString()
  }
];
