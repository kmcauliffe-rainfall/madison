# TailorFlow (Madison Portfolio & Social Media Automation)

Automated portfolio & social media workflow system built for Hollywood seamstress & tailor Madison ([@flowerthief](https://instagram.com/flowerthief)) to clear a backlog of **86+ celebrity client looks** (Bright Eyes, Charli XCX, Sheryl Lee Ralph, Victoria Monét, Barbie Ferreira, Demi Lovato, Music of Luna, and more).

---

## 🚀 Key Features

1. **One-Click Voice Dictation & AI Intake**:
   - Tap the microphone in the dashboard to speak directly about fits, hems, and styling, or paste a raw list of past jobs.
   - Built-in AI parser identifies client names, look types, stylists, assistants, and photo credits.
   - Automatically isolates videos/BTS clips as standalone **Reels** and groups stills into **Carousels**.
   - Tags `@flowerthief` collaborator handle and auto-formats clean, line-separated captions.

2. **Pre-Loaded 86-Look Backlog (`IG.md`)**:
   - 86 verified looks from Madison's client archive pre-populated with styling handles and $20 rate billing ($1,720 total backlog).
   - Filter by status (`Draft`, `Pending Review`, `Scheduled`, `Published`).
   - Real-time **Quality Control audit**: flags posts missing full-body outfit photos showing hems and break.

3. **Chrome Extension (Manifest V3)**:
   - Scrapes high-resolution media directly from Instagram web and Getty Images.
   - In-page tagging for full-body outfit indicator and standalone Reels.
   - One-click direct sync to the Review Dashboard.

4. **Meta Graph API Publishing Engine**:
   - Multi-stage container publishing pipeline for single images, multi-image carousels, and standalone Reels.
   - Safe **Simulation Mode** runs out-of-the-box with real-time progress logs.
   - Automatic live publishing once Meta credentials are provided.

---

## 🛠️ Tech Stack

- **Dashboard**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide icons.
- **Browser Extension**: Chrome Manifest V3 (Content Script, Popup, Service Worker).
- **Backend / Database**: Next.js dynamic API routes + Firebase Firestore with fallback local store.
- **Publishing**: Meta Graph API v20.0 (`/media` -> `/media_publish`).

---

## 📦 Getting Started

### 1. Run the Review Dashboard Locally
```bash
cd dashboard
npm install
npm run dev
```
Open **[http://localhost:3001](http://localhost:3001)** (or 3000).

### 2. Install the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the [`extension/`](./extension) directory.
4. Navigate to any Instagram post (e.g. [@charli_xcx](https://instagram.com/charli_xcx)) and open the TailorFlow popup!

### 3. Deploying to Firebase
```bash
firebase login
firebase deploy
```

---

## 💰 Invoicing & Billing
- **Rate**: $20 flat fee billed per completed/processed post.
- **Current Backlog Count**: 86 posts ($1,720).
- **Accounting**: Formatted for QuickBooks Net-30 invoice reconciliation.
