# JRStrauss Personal Development App - Supabase Cloud Version

This version adds:
- Email/password login
- Supabase cloud sync
- Per-user privacy using Row Level Security
- Local fallback when not signed in

## 1. Create Supabase project
Go to Supabase and create a new project.

## 2. Create database table
Open Supabase Dashboard > SQL Editor > New Query.
Paste the SQL from:

supabase/schema.sql

Run it.

## 3. Add API keys
In Supabase Dashboard:
Project Settings > API

Copy:
- Project URL
- anon public key

Create a file called `.env.local` using `.env.example`:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key

## 4. Run locally or in StackBlitz
npm install
npm run dev

## 5. Deploy to Netlify
Build command:
npm run build

Publish directory:
dist

Add the same environment variables in Netlify:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## 6. Install on phone
Open the deployed Netlify URL on your phone and choose:
Add to Home Screen / Install App.
