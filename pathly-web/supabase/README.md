# Supabase database setup

Run `migrations/001_initial_schema.sql` once in the Supabase SQL Editor.

The migration creates:

- `profiles`
- `career_journeys`
- `assessments`
- `career_readiness`
- `roadmaps`
- `roadmap_tasks`

Row Level Security is enabled on every table. Authenticated users can only
read and modify rows that belong to their own Supabase user ID.

## Authentication redirect URLs

In **Authentication → URL Configuration**, allow the local development URL
shown by Vite, including:

- `http://localhost:5173/onboarding.html`
- `http://localhost:5173/confirm-email.html`
- `http://localhost:5173/reset-password.html`

Before publishing, set **Site URL** to the final deployed domain and add one of
the following redirect configurations:

- `https://your-domain.vercel.app/confirm-email.html`
- `https://your-domain.vercel.app/reset-password.html`
- `https://your-domain.vercel.app/**` to allow every Pathly authentication page

Without these redirects, email verification or password reset links can fall
back to the home page instead of opening their intended status/form page.
