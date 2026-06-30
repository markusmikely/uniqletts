# Uniqletts — Frontend + Sanity CMS

React 18 + TypeScript + Vite. Sanity CMS backend with embedded admin at `/admin`, Vercel serverless API for writes, and Resend email notifications.

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in VITE_SANITY_PROJECT_ID (create at sanity.io/manage)
npm run dev
```

Open http://localhost:5173 — Admin panel at http://localhost:5173/admin

For API routes locally (forms, view tracking):

```bash
npm run dev:api   # requires Vercel CLI: npm i -g vercel
```

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SANITY_PROJECT_ID` | Frontend | Sanity read client |
| `VITE_SANITY_DATASET` | Frontend | Dataset name (default: `production`) |
| `VITE_GTM_ID` | Frontend | Google Tag Manager / GA4 |
| `VITE_CLARITY_ID` | Frontend | Microsoft Clarity |
| `SANITY_API_WRITE_TOKEN` | Vercel only | Server-side writes |
| `RESEND_API_KEY` | Vercel only | Email notifications |
| `ENQUIRY_NOTIFY_EMAIL` | Vercel only | Staff inbox for enquiries |

## Sanity setup

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage)
2. Add your project ID to `.env.local`
3. Invite team members in Sanity project settings (they log in at `/admin`)
4. Create singleton documents with these IDs:
   - `siteSettings` (Site Settings)
   - `homepageSettings` (Homepage Settings)
5. Add legal pages with slugs: `privacy`, `terms`, `cookies`

## Project structure

```
api/                    # Vercel serverless functions (writes + email)
sanity.config.ts        # Embedded Studio config (basePath: /admin)
src/
├── studio/
│   ├── schemas/        # Property, review, enquiry, settings
│   ├── structure.ts    # Custom admin desk layout
│   └── tools/          # Analytics dashboard
├── lib/
│   ├── sanity.ts       # Read client + GROQ queries
│   └── api.ts          # Form submission helpers
├── pages/AdminPage.tsx # Embedded Sanity Studio
└── ...
```

## Admin features

- **Dashboard** — enquiry counts, property view stats, pending reviews, GA4 link
- **Properties** — CRUD with image gallery, floor plan, video, featured flag
- **Enquiries** — filtered by type (valuation/viewing/contact/maintenance), forward to email
- **Reviews** — moderation (pending/approved), show/hide on site
- **Site settings** — contact info, social links, market snapshot stats

## API endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/enquiry` | POST | All form submissions |
| `/api/review` | POST | Public review submission |
| `/api/track-view` | POST | Increment property view count |
| `/api/forward-enquiry` | POST | Re-forward enquiry from admin |

All public forms include a honeypot field (`website`) for spam protection.

## Build & deploy

```bash
npm run build
npm run preview
```

Deploy to Vercel — set server env vars in the Vercel dashboard. The `vercel.json` routes `/api/*` to serverless functions and everything else to the SPA.

## Phase roadmap

- [x] Phase 1: Homepage + all public pages (static data)
- [x] Phase 2: Sanity CMS integration (property & review data)
- [x] Phase 3: Admin dashboard + enquiry management
- [x] Phase 4: Analytics (GA4 via GTM + Clarity + custom Sanity stats)
- [ ] Phase 5: Live Google/Trustpilot review sync
- [ ] Phase 6: SMS notifications (Twilio)
