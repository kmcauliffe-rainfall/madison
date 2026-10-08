import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { getRecentMedia } from '@/lib/instagram';

const execAsync = promisify(exec);
const YT_DLP_PATH = '/opt/homebrew/bin/yt-dlp';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'A valid Instagram URL is required' }, { status: 400 });
    }

    // Extract shortcode if possible (e.g. /p/CODE/ or /reel/CODE/)
    const shortcodeMatch = url.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;

    // 1. First, check if this matches any recent post from Madison's live Instagram account via Graph API
    try {
      const recentMedia = await getRecentMedia(50);
      const match = recentMedia.find(m => shortcode && m.permalink.includes(shortcode));
      if (match) {
        return NextResponse.json({
          success: true,
          source: 'graph_api',
          media_type: match.media_type,
          url: match.media_url,
          caption: match.caption,
          timestamp: match.timestamp,
          permalink: match.permalink,
          like_count: match.like_count,
          comments_count: match.comments_count,
          children: match.children?.data || []
        });
      }
    } catch (e) {
      console.warn('Graph API lookup skipped/failed:', e);
    }

    // 2. Run yt-dlp to extract metadata or download video/reel
    const outputDir = path.join(process.cwd(), 'public', 'downloads');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Run yt-dlp to inspect or fetch
    try {
      const infoCmd = `${YT_DLP_PATH} --dump-json --no-warnings --no-call-home "${url}"`;
      const { stdout } = await execAsync(infoCmd, { timeout: 15000 });
      const info = JSON.parse(stdout);

      const filename = `${info.id || Date.now()}.${info.ext || 'mp4'}`;
      const outputPath = path.join(outputDir, filename);

      // Download file if not exists
      if (!fs.existsSync(outputPath)) {
        const downloadCmd = `${YT_DLP_PATH} -f "best" -o "${outputPath}" --no-warnings "${url}"`;
        await execAsync(downloadCmd, { timeout: 30000 });
      }

      return NextResponse.json({
        success: true,
        source: 'yt_dlp',
        id: info.id,
        title: info.title || info.description,
        caption: info.description || info.title,
        media_type: info.ext === 'mp4' ? 'VIDEO' : 'IMAGE',
        local_url: `/downloads/${filename}`,
        thumbnail: info.thumbnail,
        duration: info.duration,
        uploader: info.uploader || 'Instagram User'
      });
    } catch (dlpError: unknown) {
      console.warn('yt-dlp error:', dlpError);

      // Fallback: If yt-dlp hit rate-limiting, return helpful details
      return NextResponse.json({
        success: false,
        error: 'Could not directly extract video stream. Instagram requires active authentication or this is a photo carousel. Try creating a post draft manually or import from connected @flower.thief feed.',
        shortcode
      }, { status: 422 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error processing URL';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
