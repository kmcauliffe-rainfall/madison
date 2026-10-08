// TailorFlow Content Script for Instagram & Editorial Platforms

function parseCreditsFromText(text) {
  if (!text) return {};
  
  const credits = {
    tailoring: "@flowerthief",
    stylist: "",
    assistants: [],
    hair: "",
    makeup: "",
    nails: "",
    photographer: ""
  };

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const patterns = {
    stylist: /(?:styled\s*by|styling|stylist)\s*[:\-–]?\s*([@\w\.\-]+(?:\s*,\s*[@\w\.\-]+)*)/i,
    assistants: /(?:assistant[s]?|styling\s*asst[s]?|tailoring\s*asst[s]?)\s*[:\-–]?\s*([@\w\.\-]+(?:\s*,\s*[@\w\.\-]+)*)/i,
    hair: /(?:hair|hair\s*by|hair\s*stylist)\s*[:\-–]?\s*([@\w\.\-]+)/i,
    makeup: /(?:makeup|mua|makeup\s*by)\s*[:\-–]?\s*([@\w\.\-]+)/i,
    nails: /(?:nails|nail\s*artist|manicure)\s*[:\-–]?\s*([@\w\.\-]+)/i,
    photographer: /(?:photo|photographer|shot\s*by|photography)\s*[:\-–]?\s*([@\w\.\-]+)/i,
    tailoring: /(?:tailor|tailoring|custom\s*by|alterations)\s*[:\-–]?\s*([@\w\.\-]+)/i
  };

  for (const line of lines) {
    for (const [key, regex] of Object.entries(patterns)) {
      const match = line.match(regex);
      if (match && match[1]) {
        if (key === 'assistants') {
          const raw = match[1].split(/[,&/]/).map(s => s.trim()).filter(Boolean);
          credits.assistants = [...new Set([...credits.assistants, ...raw])];
        } else if (!credits[key] || credits[key] === '@flowerthief') {
          credits[key] = match[1].trim();
        }
      }
    }
  }

  return credits;
}

function extractInstagramMedia() {
  const mediaList = [];
  
  // Try to find active modal or main article
  const root = document.querySelector('article') || document.querySelector('div[role="dialog"]') || document;

  // Extract videos
  const videos = root.querySelectorAll('video');
  videos.forEach(v => {
    if (v.src && !v.src.startsWith('blob:')) {
      mediaList.push({
        url: v.src,
        type: 'video',
        is_full_body: false,
        source_url: window.location.href,
        quality_rating: 'high'
      });
    }
  });

  // Extract images
  const images = root.querySelectorAll('img');
  images.forEach(img => {
    // Avoid avatar icons and small UI images (< 150px)
    if (img.naturalWidth > 200 || img.width > 200) {
      let highResUrl = img.src;
      if (img.srcset) {
        const parts = img.srcset.split(',').map(s => s.trim().split(' '));
        // Take highest width srcset entry
        if (parts.length > 0) {
          const sorted = parts.sort((a, b) => {
            const wA = parseInt(a[1]) || 0;
            const wB = parseInt(b[1]) || 0;
            return wB - wA;
          });
          if (sorted[0] && sorted[0][0]) {
            highResUrl = sorted[0][0];
          }
        }
      }

      // Check if duplicate
      if (highResUrl && !mediaList.some(m => m.url === highResUrl)) {
        mediaList.push({
          url: highResUrl,
          type: 'image',
          is_full_body: false,
          source_url: window.location.href,
          quality_rating: 'high'
        });
      }
    }
  });

  // Extract caption & comments
  let captionText = '';
  const captionEl = root.querySelector('h1') || root.querySelector('span[dir="auto"]');
  if (captionEl) {
    captionText = captionEl.innerText || '';
  }

  // Fallback to searching meta description
  if (!captionText) {
    const metaDesc = document.querySelector('meta[property="og:description"]');
    if (metaDesc) {
      captionText = metaDesc.content || '';
    }
  }

  return {
    source_url: window.location.href,
    title: document.title,
    caption: captionText,
    media: mediaList,
    parsed_credits: parseCreditsFromText(captionText)
  };
}

function extractGettyMedia() {
  const mediaList = [];
  const mainImage = document.querySelector('picture img') || document.querySelector('img[class*="AssetCard"]');
  if (mainImage) {
    mediaList.push({
      url: mainImage.src,
      type: 'image',
      is_full_body: false,
      source_url: window.location.href,
      quality_rating: 'high'
    });
  }

  const titleEl = document.querySelector('h1') || document.querySelector('figcaption');
  const captionText = titleEl ? titleEl.innerText : '';

  return {
    source_url: window.location.href,
    title: document.title,
    caption: captionText,
    media: mediaList,
    parsed_credits: parseCreditsFromText(captionText)
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_PAGE_DATA') {
    let data;
    if (window.location.hostname.includes('gettyimages')) {
      data = extractGettyMedia();
    } else {
      data = extractInstagramMedia();
    }
    sendResponse({ success: true, data });
  }
  return true;
});
