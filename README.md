# TailorFlow (Madison Portfolio & Social Media Automation)

Automated portfolio & social media workflow system built for Hollywood seamstress & tailor Madison ([@flower.thief](https://instagram.com/flower.thief)) to clear a backlog of **86+ celebrity client looks** (Bright Eyes, Charli XCX, Sheryl Lee Ralph, Victoria Monét, Barbie Ferreira, Demi Lovato, Music of Luna, and more).

---

## 🚀 Key Features

1. **Direct Meta Graph API Integration (`@flower.thief`)**:
   - Authenticated with a permanent Meta System User token.
   - Connected to Instagram Business Account ID `17841401551184173` and Facebook Page `Flower Thief` (`785808854815996`).
   - Supports publishing single photos, carousels (up to 10 images), and standalone Reels directly to the live feed.
   - Live endpoints for account metrics (`/api/instagram/profile`), recent published posts (`/api/instagram/feed`), and container publishing (`/api/publish`).

2. **One-Click Voice Dictation & AI Intake**:
   - Tap the microphone in the dashboard to speak directly about fits, hems, and styling, or paste a raw list of past jobs.
   - Built-in Gemini AI parser identifies client names, look types, stylists, assistants, and photo credits.
   - Automatically isolates videos/BTS clips as standalone **Reels** and groups stills into **Carousels**.
   - Tags `@flower.thief` collaborator handle and auto-formats clean, line-separated captions.

3. **Paste-a-Link Ingestion & Downloader**:
   - Quick input modal to paste any Instagram post or Reel link.
   - Leverages `yt-dlp` and Meta Graph API to preview media, extract captions, and stage new posts with one click.
   - Includes quick-draft fallback with direct image linking.

4. **Chrome Extension (Manifest V3)**:
   - Scrapes high-resolution media directly from Instagram web and Getty Images while logged into your browser.
   - In-page tagging for full-body outfit indicator and standalone Reels.
   - One-click direct sync to the Review Dashboard.

5. **Pre-Loaded 86-Look Backlog (`IG.md`)**:
   - 86 verified looks from Madison's client archive pre-populated with styling handles and $20 rate billing ($1,720 total backlog).
   - Filter by status (`Draft`, `Pending Review`, `Scheduled`, `Published`).
   - Real-time **Quality Control audit**: flags posts missing full-body outfit photos showing hems and break.

---

## 🛠️ Tech Stack

- **Dashboard**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide icons.
- **Browser Extension**: Chrome Manifest V3 (Content Script, Popup, Service Worker).
- **Backend / Database**: Next.js dynamic API routes + Firebase Firestore with fallback local store.
- **Publishing & Metrics**: Meta Graph API v26.0 (`/media` -> `/media_publish`).
- **AI Engine**: Google Gemini API for intelligent entity & credit extraction.

---

## 📦 Getting Started

### 1. Run the Review Dashboard Locally
```bash
cd dashboard
npm install
npm run dev -- -p 3001
```
Open **[http://localhost:3001](http://localhost:3001)**.

### 2. Install the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the [`extension/`](./extension) directory.
4. Navigate to any Instagram post and click the TailorFlow scissors icon in the toolbar!

---

## 💰 Invoicing & Billing
- **Rate**: $20 flat fee billed per completed/processed post.
- **Current Backlog Count**: 86 posts ($1,720).
- **Accounting**: Formatted for QuickBooks Net-30 invoice reconciliation.
