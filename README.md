# Doubtly — Every doubt, solved.

> A production-ready, open education Q&A and learning archive built with Next.js 14 App Router, PostgreSQL, Prisma ORM, and high-density trigram & full-text blended search.

Students can search questions, read step-by-step solutions, download PDF revision notes, and watch embedded YouTube study lessons with **zero student login required**. A single administrator manages all editorial content via a secure, rate-limited, httpOnly JWT-protected dashboard at `/admin`.

---

## Features

- **Blended Ranking Full-Text Search**:
  - PostgreSQL `pg_trgm` trigram similarity + weighted `tsvector` (`ts_rank_cd`) + logarithmic view boost (`LN(1 + views)`).
  - Query normalization: accent stripping, punctuation handling, synonym dictionary expansion (e.g., `derivative` → `differentiation`, `algo` → `algorithm`), length capping at 200 chars.
  - Typo tolerance with trigram fallback operator (`%`).
  - Matched terms highlighted using safe `<mark>` snippets.
- **Instant Autocomplete (`<SearchBox />`)**:
  - 180ms debounce, keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`/`Escape`).
  - Request cancellation with `AbortController`.
  - Accessible ARIA combobox and listbox attributes.
  - Mixed auto-suggestions: question titles, topic tags, subjects, and recent searches.
- **Zero Student Auth**:
  - Frictionless access for curious learners worldwide.
  - Anonymous "Was this helpful" feedback with cryptographic IP hashing (`HMAC-SHA256`) and rate limiting.
- **Secure Admin Panel (`/admin`)**:
  - Single administrator login via username & bcrypt hash (cost factor &ge; 12).
  - `jose` HS256 JWT tokens stored in `httpOnly`, `SameSite=Strict`, `Secure` cookies (`doubtly_admin`, 8-hour expiry).
  - Rate-limited to 5 login attempts per 15 minutes per IP with artificial 300ms delay on failure.
  - CSRF protection via same-origin verification on all mutation requests.
  - Rich text sanitized via DOMPurify on both write and read paths.
  - Instant cache invalidation via `revalidatePath()`.
- **Fast Content Delivery**:
  - Inline PDF preview and direct download for study notes.
  - YouTube click-to-load thumbnail facade (zero external requests until clicked).
  - Incremental Static Regeneration (`export const revalidate = 3600`) on all public pages.
- **Enterprise SEO & Structured Data**:
  - Schema.org `QAPage` JSON-LD on question pages.
  - Schema.org `Article` JSON-LD on study note pages.
  - Dynamic OpenGraph 1200×630 social card (`app/opengraph-image.tsx`).
  - Dynamic brand favicon (`app/icon.tsx`).
  - Dynamic XML Sitemap (`app/sitemap.ts`) & Robots configuration (`app/robots.ts`).

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components, Server Actions) |
| **Styling** | Tailwind CSS + Radix UI Primitives (`@radix-ui/*`) |
| **Database** | PostgreSQL + Prisma ORM |
| **Search Engine** | PostgreSQL Native `tsvector` (GIN) + `pg_trgm` (Trigram) |
| **Auth** | `jose` (JWT) + `bcryptjs` (Password hashing) + `httpOnly` cookies |
| **Validation** | `zod` |
| **Storage** | Cloudinary v2 SDK (PDF & Image uploads) |
| **Sanitization** | DOMPurify + JSDOM |
| **Icons** | Lucide React |

---

## Brand Guide

- **Primary Color**: `#4F46E5` (Indigo)
- **Secondary Color**: `#0891B2` (Cyan)
- **Spark Accent**: `#FBBF24` (Amber)
- **Ink**: `#111827`
- **Muted**: `#6B7280`
- **Dark Surface**: `#0B1120`
- **Card Dark Surface**: `#131D31`
- **Fonts**: Plus Jakarta Sans (headings, 700), Inter (body), JetBrains Mono (code/math)
- **Logo**: Speech bubble with an amber-dotted question mark
- **Wordmark**: "Doubt" in slate + "ly" in indigo

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Required | Description | Default / Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/doubtly?schema=public` |
| `JWT_SECRET` | Yes | Secret key for signing admin JWT (min 32 chars) | `super-secret-jwt-key-doubtly-at-least-32-chars-long` |
| `ADMIN_USERNAME` | Yes | Default admin username for seeding | `admin` |
| `ADMIN_PASSWORD_HASH` | No | Pre-computed bcrypt hash (or generated on seed) | Seed script sets `AdminPassword123!` |
| `CLOUDINARY_URL` | Yes | Cloudinary credentials for uploads | `cloudinary://<api_key>:<api_secret>@<cloud_name>` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public canonical URL of deployment | `http://localhost:3000` |

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database & Extensions

Ensure PostgreSQL is running. Then apply the Prisma schema and the raw SQL migration for the full-text search extensions:

```bash
# Push schema structure to database
npx prisma db push

# Apply Postgres search extensions & tsvector generated columns
# Run the SQL migration located in prisma/migrations/20240101000000_init_search_and_extensions/migration.sql
# In psql or your database client:
# \i prisma/migrations/20240101000000_init_search_and_extensions/migration.sql
```

Alternatively, run the Prisma migration command:
```bash
npx prisma migrate dev
```

### 3. Seed Sample Data & Admin Account

```bash
npm run seed
```

This seeds:
- Admin user: **Username:** `admin` | **Password:** `AdminPassword123!`
- 5 core subjects: Mathematics, Physics, Chemistry, Biology, Computer Science
- Sample step-by-step calculus questions and physics doubts
- Sample PDF note summary
- Sample video lecture embed
- Popular search log queries

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- Student Experience: [http://localhost:3000](http://localhost:3000)
- Search: [http://localhost:3000/search?q=calculus](http://localhost:3000/search?q=calculus)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Deployment (Vercel + Neon / Supabase)

### 1. Database Provisioning (Neon / Supabase)
1. Create a PostgreSQL project on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the Connection Pooling URL for `DATABASE_URL` (and Direct URL if applicable).
3. In your SQL editor on Neon or Supabase, execute:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE EXTENSION IF NOT EXISTS unaccent;
   ```
4. Run `npx prisma db push` against your cloud connection string.
5. Execute the contents of `prisma/migrations/20240101000000_init_search_and_extensions/migration.sql` in the SQL console.

### 2. Vercel Deployment
1. Import your repository into [Vercel](https://vercel.com).
2. Add the environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET` (generate a strong 64-char string)
   - `CLOUDINARY_URL`
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
3. Set Build Command to: `prisma generate && next build`
4. Deploy!

---

## License

MIT © Doubtly Editorial Platform

