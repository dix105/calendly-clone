# Calendly Clone SaaS - Deployment Guide

## Project Status

✅ **Completed:**
- All TypeScript errors fixed (migrated from @supabase/auth-helpers-nextjs to @supabase/ssr)
- Project builds successfully
- Code pushed to GitHub: https://github.com/dix105/calendly-clone

⏳ **Remaining Steps:**

### 1. Run Database Schema in Supabase

Go to: https://supabase.com/dashboard/project/yugdnukwvctbyccznjof/sql/new

Copy and paste the contents of `supabase/schema.sql` and run it.

### 2. Deploy to Vercel

**Option A: Deploy via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/new
2. Import Git Repository: `dix105/calendly-clone`
3. Configure environment variables (see below)
4. Deploy

**Option B: Deploy via Vercel CLI**
```bash
vercel login
vercel --prod
```

### 3. Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://yugdnukwvctbyccznjof.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(get from .env.local or Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=(get from Supabase dashboard > Project Settings > API)

GOOGLE_CLIENT_ID=(get from Google Cloud Console)
GOOGLE_CLIENT_SECRET=(get from Google Cloud Console)

NEXT_PUBLIC_APP_URL=(your Vercel deployment URL)
```

### 4. Configure Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit the OAuth 2.0 Client ID
3. Add your Vercel deployment URL to "Authorized JavaScript origins"
4. Add `https://your-deployment-url.vercel.app/api/auth/callback` to "Authorized redirect URIs"

### 5. Update Supabase Auth Callback URL

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Set Site URL to your Vercel deployment URL
3. Add your Vercel deployment URL to Redirect URLs

## Testing Checklist

After deployment, test these flows:

- [ ] Login with Google
- [ ] Create event type
- [ ] View public booking page at `/book/{username}`
- [ ] Make a booking
- [ ] Check booking appears in dashboard

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth routes (login)
│   ├── (dashboard)/      # Dashboard routes
│   ├── api/auth/         # Auth API routes
│   ├── book/[username]/  # Public booking pages
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/        # shadcn/ui components
├── lib/
│   ├── supabase-server.ts
│   └── utils.ts
├── middleware.ts         # Auth middleware
└── types/
    └── supabase.ts

supabase/
└── schema.sql            # Database schema
```

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth + Database)
- @supabase/ssr for server-side auth

## Features

- Google OAuth authentication
- Event type management
- Public booking pages
- Calendar integration (prepared for Google Calendar API)
- Booking management
- Responsive design
