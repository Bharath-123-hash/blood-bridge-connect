# Rakta-Seva Connect

A blood donor and emergency request app that connects donors with people in need. Built with TanStack Start, React, Tailwind CSS, shadcn/ui, and Lovable Cloud (Supabase) for auth, database, and storage. Ships as both a web app and a native Android app via Capacitor.

## Features

- 🔐 Email/password authentication with show/hide password toggles
- 🩸 Browse donors with filters (blood group, location) and sort options
- 🚨 Post emergency blood requests with quick-pick hospital fields
- 👤 User profile with location, age, gender, and notification preferences
- 📱 Bottom navigation, mobile-first design, installable as an Android app

## Tech Stack

- **Framework:** TanStack Start (React 19 + Vite 7)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — auth, Postgres, RLS, storage
- **Mobile:** Capacitor (Android)
- **Language:** TypeScript

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node.js 20+)

### Install & run

```bash
bun install
bun run dev
```

Open the printed local URL in your browser.

### Build for production

```bash
bun run build
bun run preview
```

## Project Structure

```
src/
├── routes/              # File-based routes (TanStack Router)
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Home
│   ├── auth.tsx         # Sign in / sign up
│   ├── donors.tsx       # Donor list with filters
│   ├── request.tsx      # Create emergency request
│   ├── profile.tsx      # User profile
│   └── alert.$id.tsx    # Emergency alert detail
├── components/          # Shared UI + shadcn/ui primitives
├── lib/                 # Auth context, helpers
├── integrations/
│   └── supabase/        # Auto-generated client & types
└── styles.css           # Design tokens (Tailwind v4)
supabase/migrations/     # Database schema migrations
```

## Backend (Lovable Cloud)

The app uses Lovable Cloud for the database and authentication. Schema lives in `supabase/migrations/`. Row Level Security is enabled on all user-facing tables. The Supabase client is auto-generated at `src/integrations/supabase/client.ts` — do not edit it manually.

## Android (Capacitor)

This project is preconfigured to ship as a native Android app. See [`ANDROID.md`](./ANDROID.md) for the full step-by-step guide.

Quick version:

```bash
bunx cap add android         # first time only
bun run build && bunx cap sync android
bunx cap open android        # then hit Run ▶ in Android Studio
```

## Editing the Project

You can edit this project in two ways:

1. **Lovable** — open the project in [Lovable](https://lovable.dev) and chat to make changes. Edits are committed automatically.
2. **Your own IDE** — clone the repo, edit locally, and push. Changes sync back to Lovable.

## Deployment

Open the project in Lovable and click **Publish** to deploy. Custom domains can be configured under **Project → Settings → Domains**.

## License

Private project — all rights reserved.
