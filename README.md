# Our Hearth

**Cornell Tech · Startup Studio 2026**

A guided conversation app that helps adult children have important talks with their parents about legacy, healthcare, and finances.

---

## Tech Stack

- **Next.js 16** (Turbopack) · React 19 · TypeScript
- **Tailwind CSS v4** · Framer Motion
- **Supabase** (auth + database)

---

## Getting Started

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd care-bears
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Open `.env.local` and fill in the two Supabase values. Get them from the [Supabase dashboard](https://supabase.com/dashboard) → select the **care-bears** project → **Project Settings** → **API**:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **Publishable (anon) key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Two Entry Points

### Entry Point 1: Adult Child Flow → `/`

The main app for the person initiating conversations.

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/` | Landing page — email magic-link sign-up |
| 2 | `/auth/verify` + `/auth/callback` | OTP authentication flow |
| 3 | `/onboarding` | Add first parent / relationship |
| 4 | `/library` | Browse conversation topic cards, send one to a parent |
| 5 | `/conversations` | Track sent conversations, view completed responses |
| 6 | `/relationships` | Manage parent relationships |

### Entry Point 2: Parent Flow → `/parent`

No login required. The parent uses a 6-character access code their child shares with them.

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/parent` | Enter access code → welcome screen |
| 2 | `/parent/[conversationId]` | Answer questions (animated, mad-lib style) |
| 3 | `/parent/[conversationId]/complete` | Thank you screen |

---

## Project Structure

```
app/                        # Next.js routes
  (app)/                    # Authenticated adult child app (sidebar layout)
    library/                # Topic grid + topic detail
    conversations/          # Conversation history
    relationships/          # Manage relationships
  parent/                   # Unauthenticated parent flow
  onboarding/               # First-run setup
src/
  components/               # UI components (Sidebar, TopicCard, etc.)
  data/topics.json          # Conversation topics + questions
  lib/                      # Supabase clients, TypeScript types
```
