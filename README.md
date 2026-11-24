# Daylight Planner

A personal planner and music teaching studio built with Next.js, React, and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
app/                         Next.js routes, layout, and global styles
src/
  components/
    layout/                   App navigation and header
    ui/                       Shared interface primitives
  data/                       Empty first-run data defaults
  features/
    app/                      App shell, state, and shared dialogs
    finances/                 Income, expense, and savings views
    goals/                    Goal tracking views
    insights/                 Studio summary views
    overview/                 Dashboard widgets
    planner/                  Weekly and monthly calendar views
    students/                 Student roster views
  hooks/                      Reusable React hooks
  types/                      Shared domain types
```

## Where to add features

- Put cross-feature data types in `src/types`.
- Put reusable stateful behavior in `src/hooks` or the relevant feature folder.
- Keep feature-specific screens and components inside `src/features/<feature>`.
- Keep shared controls and layout components inside `src/components`.
- Keep `app/page.tsx` as the route entry point; compose the experience in `src/features/app/app-shell.tsx`.

## Supabase cloud setup

The app now requires a Supabase sign-in before rendering the studio or loading studio data. To enable authentication and cloud sync:

1. Create a free Supabase project and keep its project URL and publishable key handy.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). Row-level security restricts each account to its own app data.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Project Settings → API Keys.
4. In Supabase Authentication settings, turn off **Confirm Email** under **Sign In / Providers → Email**. The app then creates the account without sending an email and takes you to `/login`; sign in with the same email and password. Supabase Auth hashes passwords with bcrypt and stores only the hash. Set the minimum password length to 8 to match the signup form. After creating your account, disable **Allow new users to sign up** for a private, single-owner studio. Existing browser data is copied to the account the first time it syncs.
5. The app starts with empty goals, students, transactions, planner events, and sleep data. On first sign-in, any existing browser cache for this app is uploaded if no cloud record exists yet.
6. Connect the GitHub repository to Cloudflare Pages. Use build command `npm run build` and output directory `out`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as Pages build environment variables, then add the deployed URL to Supabase Authentication → URL Configuration.

Disabling email confirmation means Supabase will accept an email address without verifying ownership. Use this flow only for your own account, then disable public sign-ups. Row-level security still isolates each user's records.

Use one account for this private studio app. The client uses only the publishable key; never put a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable. Review the [current Supabase pricing and limits](https://supabase.com/pricing) before relying on a free tier for day-to-day business records.

## Login and sign-up pages

- Login: `/login` (local development: `http://localhost:3000/login`)
- Sign-up: `/signup` (local development: `http://localhost:3000/signup`)

The home page, `/login`, and `/signup` all show an authentication gate when signed out. If Supabase environment variables are missing, the gate explains that setup is required and disables sign-in; the studio does not fall back to local-only access. After sign-out, the browser's local app-data cache is cleared.

## API calls

The app uses Supabase's hosted APIs directly through `@supabase/supabase-js`; it does not define custom Next.js API endpoints.
After sign-in, the SDK attaches the user's JWT to database requests, and the `auth.uid()` row-level policies in `supabase/schema.sql` restrict reads and writes to that user's rows.

| API / operation | What the app uses it for | Called from |
| --- | --- | --- |
| `supabase.auth.getSession()` | Restore the saved login; refreshes its token through Supabase Auth if needed | `src/features/auth/auth-provider.tsx` |
| `supabase.auth.onAuthStateChange()` | Client-side listener that keeps the UI in sync; it is not an HTTP endpoint | `src/features/auth/auth-provider.tsx` |
| `supabase.auth.signInWithPassword()` → `POST /auth/v1/token?grant_type=password` | Sign in with email and password | `src/features/auth/auth-provider.tsx` |
| `supabase.auth.signUp()` → `POST /auth/v1/signup` | Create an account | `src/features/auth/auth-provider.tsx` |
| `supabase.auth.signOut()` → `POST /auth/v1/logout` | End the current session | `src/features/auth/auth-provider.tsx` |
| `user_app_data` `SELECT` → `GET /rest/v1/user_app_data` | Load a user's saved app data by `state_key` | `src/hooks/use-persistent-state.ts` |
| `user_app_data` `UPSERT` → `POST /rest/v1/user_app_data?on_conflict=user_id,state_key` | Migrate local data on first sign-in and save changes to cloud | `src/hooks/use-persistent-state.ts` |

`onAuthStateChange()` is a client-side session listener; it is not a separate custom HTTP endpoint. There are no custom `/api/*` routes and no health API. The app is a static export, so a health endpoint would neither keep the static site awake nor guarantee that Supabase avoids its inactivity pause.

