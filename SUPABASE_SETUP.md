# Supabase Integration & Multi-User Setup Guide

## Overview
This guide explains how to set up and deploy SimpleGymTracker with Supabase for multi-user support, user isolation, and secure authentication.

## Architecture Changes

### Database Migration: SQLite → PostgreSQL
- **Old**: SQLite database (single-user, local only)
- **New**: PostgreSQL via Supabase (multi-user, cloud-based)

### Data Isolation
- All tables now include `user_id` field
- Row Level Security (RLS) policies ensure users only see their own data
- Each user's workouts, exercises, and templates are isolated at the database level

## Setup Instructions

### Phase 1: Local Development Setup

#### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up (free tier available)
2. Create a new project:
   - Organization: Create new or use existing
   - Name: `SimpleGymTracker`
   - Password: Generate strong password
   - Region: Choose closest to you
   - Click "Create new project"

3. Wait for project to be provisioned (~2-3 minutes)

#### Step 2: Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` (NEXT_PUBLIC_SUPABASE_ANON_KEY)

#### Step 3: Set Environment Variables

1. In the project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

#### Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `SUPABASE_SCHEMA.sql` from the root of this project
4. Paste it into the SQL editor
5. Click **Run**
6. Wait for all tables and policies to be created (~10 seconds)

**Tables Created:**
- `user_profiles` - User account info
- `workout_sessions` - Workouts (user-isolated)
- `exercises` - Exercise records (user-isolated)
- `templates` - Workout templates (user-isolated)
- `template_exercises` - Template exercise details (user-isolated)
- `common_exercises` - Shared exercise list (100+ exercises)

**Security:**
- All user-specific tables have Row Level Security (RLS) enabled
- RLS policies automatically filter data by `auth.uid()`
- This means users can ONLY see/edit their own data at the database level

#### Step 5: Test Locally

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000
   - Should redirect to `/auth/login`
   - Click "Sign up" to create an account
   - Sign in with test email and password

3. Create a test workout:
   - Add exercise "Bench Press"
   - Select a date
   - Click "+Add"
   - Should see workout in calendar

4. Test Data Isolation:
   - Create another account in incognito window
   - Sign in with different email
   - Should see NO workouts from first account
   - This proves RLS is working!

### Phase 2: Deploy to Railway

#### Prerequisites
- Railway account (https://railway.app)
- GitHub repo with latest code pushed

#### Step 1: Deploy to Railway

1. Go to https://railway.app/dashboard
2. Click **New Project** → **Deploy from GitHub repo**
3. Connect your SimpleGymTracker repo
4. Railway auto-detects Next.js - click **Deploy**

#### Step 2: Add Environment Variables to Railway

1. In Railway, go to your project settings
2. Click **Variables**
3. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Click **Restart Services**

#### Step 3: Test on Production

1. Go to your Railway domain (something like `simple-gym-tracker-production.up.railway.app`)
2. Test login/signup
3. Create a workout - should work exactly like local

### Phase 3: Mobile App Setup (Future)

When you build React Native/Flutter apps, they will use the SAME Supabase backend:

```typescript
// React Native example
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Same auth and data access - users' data automatically syncs across apps
```

## Key Features Implemented

### Authentication
- ✅ Email/password signup
- ✅ Email verification (enable in Supabase Auth settings)
- ✅ Session management (secure JWT in httpOnly cookies)
- ⏳ 2FA support (infrastructure ready, UI needed)

### Data Isolation
- ✅ Row Level Security policies
- ✅ `user_id` on all user-specific tables
- ✅ Automatic filtering by `auth.uid()`
- ✅ Users can only access their own data

### Database
- ✅ PostgreSQL (vs local SQLite)
- ✅ 100+ common exercises
- ✅ Indexed for performance
- ✅ Automatic backups (Supabase handles this)

## API Route Changes

All API routes have been preserved and will work with Supabase:

```typescript
// Before: Uses SQLite directly
// After: Uses Supabase client (PostgreSQL)

// Example: /api/workouts
// - Automatically filters by current user_id (RLS)
// - User can only see/modify their own workouts
// - Other users' workouts are invisible
```

## Scaling Path

**Current State (All Users Share 1 DB):**
- ✅ Works for teams/gyms sharing the same workspace
- ✅ One account = one separate database
- ✅ Supabase free tier: up to 500MB storage

**Future: Multi-Tenant (Multiple Organizations)**
- Add `organization_id` to tables
- Create org invite system
- Users can belong to multiple orgs
- Each org has isolated access

## Troubleshooting

### "Auth context not available"
- Make sure `<AuthProvider>` wraps your app in `layout.tsx`
- Check that `AuthProvider` is in root layout, not sub-layout

### "User data not visible"
- Check that Supabase credentials are correct in `.env.local`
- Verify RLS policies exist in Supabase SQL Editor
- Try incognito window (cached auth might be issue)

### "Supabase connection error"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and key are correct
- Check that Supabase project is not in suspended state
- Try creating new API key in Supabase dashboard

### "Can't sign up"
- Check email format (valid email required)
- Password must be 6+ characters
- Check browser console for detailed error

## Security Notes

1. **Row Level Security (RLS)** - Database enforces access control
   - Even if someone hacks the API, RLS prevents cross-user access
   - Users get `401 Unauthorized` if they try to access other users' data

2. **Credentials in Code** - `NEXT_PUBLIC_*` are safe to expose
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is meant to be public
   - It only allows what RLS policies permit
   - Sensitive operations use `SUPABASE_SERVICE_ROLE_KEY` (server-only)

3. **Passwords** - Supabase handles encryption
   - Never stored as plaintext
   - Uses bcrypt hashing
   - Accessible only by Supabase auth system

## Next Steps

1. **Enable Email Confirmation** (optional)
   - Supabase Settings → Auth → Email Templates
   - Protects against fake signups

2. **Add 2FA** (when ready)
   - UI already designed for future
   - Just need to add form handling in login page

3. **Build Mobile Apps**
   - Use same `SUPABASE_URL` and `ANON_KEY`
   - All data syncs automatically
   - No additional backend needed

4. **Custom Domains** (when deploying)
   - Railway: Add custom domain in settings
   - Supabase: Already has domain

## Questions?

- Supabase Docs: https://supabase.com/docs
- Railway Docs: https://docs.railway.app
- Next.js Docs: https://nextjs.org/docs
