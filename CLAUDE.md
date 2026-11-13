# Ain Platform (منصة عين) — Project Guide for Agents

Ain is an Arabic, RTL admin console for **فريق العيون التطوعي** (Al-Oyoun Volunteer Team), run under **جمعية العيون التطوعية** (Al-Oyoun Volunteer Association). It tracks volunteers, programs (events/initiatives), sponsors, volunteer participation hours, and sponsor donations.

This file replaces the original Arabic `SPEC.md` (the design-prototype spec). It records every decision made so far, describes the system as it is built today, and explains how to deploy it on Cloudflare (current target) or move it to another vendor (e.g. Vercel + Supabase).

**Read this whole file before changing code.** When this file and the code disagree, the code is the source of truth. Fix this file in the same change.

---

## 1. Repository layout

```
CLAUDE.md                     this file
README.md                     short human quick-start
app/
  client/                     the application (React SPA + Cloudflare Pages Functions API)
    index.html
    vite.config.js            React + Tailwind v4 plugins
    wrangler.jsonc            Cloudflare Pages config: D1, R2, service binding, Browser Rendering
    package.json              scripts for dev, build, deploy, DB migrations
    migrations/               SQL files, applied in numeric order (see §5)
    functions/api/            backend: one file per route (Pages Functions file-based routing)
    server/                   backend-only helpers (validation glue, avatar storage)
    shared/                   pure JS used by BOTH the UI and the API (validation, role rules)
    src/                      React UI
      pages/                  one component per route
      components/             shared UI pieces (modals, form fields, list rows, sidebar...)
      api.js                  fetch wrapper for every API endpoint
      theme.jsx               light/dark theme, accent colors
      programState.js         program date logic (state, day count, summary)
      search.js               Arabic-aware fuzzy search (Fuse.js)
      format.js               date/number formatting
      imageResize.js          client-side photo crop/resize before upload
      volunteerPdf.js         downloads the server-rendered volunteer PDF
    public/                   favicon, logo PNGs
  image-resizer/              separate Cloudflare Worker that resizes avatars (Images binding)
brand/                        official Ain logos (SVG/PNG) and the team logo
assets/                       Saudi Riyal symbol SVG (official shape)
screens/                      ORIGINAL design prototypes (.jsx, mock data). Reference only, not built.
presentation/                 intro deck (.pptx/.pdf) about the platform. Not part of the app.
```

`screens/` and `presentation/` are historical. Do not import from them. The live UI is `app/client/src`.

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| UI | React 19, React Router 7, Vite 8 | Plain JavaScript (`.jsx`), no TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + theme values in JS | See §7 for why some colors are injected as CSS classes |
| Icons | `lucide-react` | Gender icons are custom SVG (`GenderIcon.jsx`) |
| Search | `fuse.js` with Arabic normalization | `src/search.js` |
| API | Cloudflare Pages Functions (`functions/`) | `onRequestGet/Post/Put/Delete({ env, params, request })` |
| Database | Cloudflare D1 (SQLite) | binding `DB`, database name `ain-db` |
| File storage | Cloudflare R2 | binding `AVATARS`, bucket `ain-avatars` |
| Image resize | Cloudflare Images via a separate Worker | `app/image-resizer`, reached through service binding `IMAGE_RESIZER` |
| PDF | Cloudflare Browser Rendering (`@cloudflare/puppeteer`) | binding `BROWSER`; needs `nodejs_compat` |
| Lint | `oxlint` | `npm run lint` |

There are no tests yet. Verify changes by running the app (§9) and checking the affected pages in both themes and at phone width.

---

## 3. Product scope (v1)

Two public screens and four admin sections:

| Route | Page | Purpose |
|---|---|---|
| `/` | `Splash.jsx` | Logo mark, tagline, "انطلق" (Go) button to the dashboard |
| `/about` | `About.jsx` | About the team, the association, the platform, plus the contact footer |
| `/dashboard` | `Dashboard.jsx` | Greeting, 4 stat cards, 3 "ماذا تريد أن تدير؟" (What do you want to manage?) cards |
| `/volunteers` | `Volunteers.jsx` | List, gender tabs, search, add volunteer |
| `/volunteers/:id` | `VolunteerProfile.jsx` | Details, photo, stats, program history, PDF download |
| `/volunteers/:id/profile` | `VolunteerReport.jsx` | A4 printable profile; rendered to PDF by the server (§6.6) |
| `/programs` | `Programs.jsx` | List, year + category filters, add program |
| `/programs/:id` | `ProgramProfile.jsx` | Details, volunteers, budget, notes |
| `/sponsors` | `Sponsors.jsx` | List, search, add sponsor |
| `/sponsors/:id` | `SponsorProfile.jsx` | Contact info, stats, donation log |

Admin pages share `Layout` + `Sidebar` (fixed right sidebar on desktop, drawer below `md`).

### Not in v1 (planned later)
- **Login and roles** (admin / president / accountant / volunteer). There is **no authentication** today. See §10.
- Internal team departments (development, media, PR...). v1 only filters by gender.
- Yearly aggregated reports page.
- Automatic enhancement of sponsor/program logos.

---

## 4. Identity and naming decisions

- **Platform name: عين ("Ain", meaning "eye").** Taken from the last three letters of "المتطوعين" (the volunteers) and "الراعين" (the sponsors). It symbolizes watching over every detail of the volunteer work.
- **Tagline:** "عين .. لخدمة المتطوعين" with the subline "وحدة التحكم بفريق العيون التطوعي".
- **Splash button text is "انطلق"**, not "ابدأ". This was a deliberate choice.
- **Logo:** a rounded diamond (squircle rotated 45°) with a white "ع" inside.
  - In the UI it is the vector component `src/components/AinMark.jsx`. The diamond takes the current accent color (teal in light mode, gold in dark mode). The `color` prop overrides it; the PDF always uses teal.
  - The name "عين" is always real text next to the mark, never part of an image.
  - Earlier PNG attempts with a transparent cut-out letter disappeared on some backgrounds. That is why the mark is SVG with a solid fill and an internal mask.
  - Source files: `brand/logo/` (teal, gold, black/white; SVG + PNG). The favicon (`public/favicon.svg`) is recolored at runtime to match the in-app theme.
- **Team logo** (`brand/team-logo.png`, `public/logo/team-logo.png`): a chain of colorful people with near-black text. Used only on the About page and **always on a fixed white background**, in both themes, or the text disappears.
- **Terminology:** the funder is called **"الراعي" (sponsor)**, never "الداعم" (supporter). This is intentional.
- **Demo signed-in user** shown in the sidebar: **عبدالله فالح — مدير النظام** (system admin). Hard-coded in `Sidebar.jsx` until auth exists.
- **Contact footer** (About page only; not shown on admin pages):
  - Address: FODB 6682
  - Social handle on X, Snapchat, YouTube, TikTok: `aloyunv`
  - Phone / WhatsApp: 0541822889 / +966541822889
  - Email: aluyonv@gmail.com
  - Copyright line

---

## 5. Database

D1 is SQLite. The schema lives in `app/client/migrations/`:

| File | What it does |
|---|---|
| `0001_schema.sql` | All tables and base indexes |
| `0002_seed.sql` | **Demo data** (6 volunteers, 5 sponsors, 5 programs, participations, donations). Not needed in production |
| `0003_volunteer_national_id.sql` | Unique index on `volunteers.national_id` |
| `0004_participation_roles.sql` | Renames old roles, syncs supervisor/deputy flags, unique (volunteer, program) |

All files use `IF NOT EXISTS` or idempotent `UPDATE`s **except `0002_seed.sql`**: running it twice duplicates the demo rows.

### 5.1 Conventions
- **Dates are `TEXT` in ISO `YYYY-MM-DD`**, always Gregorian. The UI never uses the native date picker because iOS can show a Hijri calendar. `GregorianDateInput.jsx` uses three selects instead.
- **Booleans are `INTEGER` 0/1** (`is_supervisor`, `is_deputy`).
- **Enums use short English codes with `CHECK` constraints.** Arabic labels are only in the UI.
- **IDs are `INTEGER PRIMARY KEY AUTOINCREMENT`.** New IDs are read from `info.meta.last_row_id`.
- **Foreign keys declare `ON DELETE CASCADE`/`SET NULL`, but the API also deletes children explicitly** in a `DB.batch` (D1 does not enforce FKs unless enabled). Keep doing both.
- Image columns store a **public path**, e.g. `/api/images/avatars/12-<uuid>.webp`, not a full URL.

### 5.2 Tables

**`volunteers`**
| Column | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT NOT NULL | required |
| gender | TEXT NOT NULL | `'m'` / `'f'`; drives avatar icon and the gender tabs |
| national_id | TEXT | required by the API, exactly 10 digits, **unique**. Arabic-Indic digits are normalized to ASCII |
| birth_date | TEXT | required by the API, valid date, not in the future |
| phone, email, qualification, job | TEXT | optional |
| join_date | TEXT | optional, valid date |
| photo | TEXT | R2 path; changed only through `PUT/DELETE /api/volunteers/:id/photo` |
| status | TEXT NOT NULL | `'active'` / `'inactive'`, default `active` |

Computed, not stored: total hours, number of programs (from `participations`).
Removed on purpose: volunteer code (VOL-xxxx), city, per-year tabs.

**`programs`**
| Column | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| description | TEXT | shown under the name, above the stats |
| category | TEXT NOT NULL | `'internal'` (داخلي) / `'external'` (خارجي) |
| executor_name | TEXT | **Forced to "جمعية العيون التطوعية" by the API when `internal`.** Free text when `external` |
| executor_logo | TEXT | optional |
| location | TEXT | replaces the old "city" field |
| supervisor_name | TEXT | free-text name |
| beneficiaries | INTEGER | shown in the stats only, not repeated in the details table |
| date_mode | TEXT NOT NULL | `'single'` / `'range'` / `'multiple'` |
| dates | TEXT NOT NULL | **JSON array string** of ISO dates. single → `[d]`, range → `[start, end]`, multiple → `[d1, d2, ...]`. The API parses it to an array |
| logo | TEXT | optional |
| notes | TEXT | free text for lessons learned and suggestions |
| status | TEXT | **Legacy, not maintained.** Program state is derived from dates (§6.3) |

Removed on purpose: program code (PRG-xxxx), separate "program type" (replaced by category), city.

**`program_partners`** — partner organizations (الجهات المشاركة) of a program: `id`, `program_id` → programs, `name`. Replaced as a whole list on program update.

**`program_sponsors`** — **legacy, unused by the UI.** A program's sponsors are derived from `donations` linked to it. The API still deletes rows from it on cascade. Do not build on it; drop it in a future migration.

**`sponsors`**
| Column | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| logo | TEXT | optional |
| category | TEXT NOT NULL | `'person'` (شخص) / `'company'` (شركة). **Only these two** |
| since | TEXT | start of the relationship |
| phone, email | TEXT | the only contact fields. A separate "contact person" field was removed on purpose |

**`participations`** — a volunteer in a program.
| Column | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| volunteer_id | INTEGER NOT NULL → volunteers | |
| program_id | INTEGER NOT NULL → programs | |
| role | TEXT NOT NULL | `متطوع` (volunteer), `مشرف` (supervisor), `مساعد مشرف` (assistant supervisor), or any custom text ≤ 50 chars ("أخرى") |
| hours | REAL NOT NULL | 0 – 10000 |
| is_supervisor, is_deputy | INTEGER | **Always derived from `role`** by `roleFlags()` in `shared/participation.js`. Never set them directly |
| date | TEXT | defaults to the program's first date when added from the program page |

Unique index on `(volunteer_id, program_id)`: **a volunteer appears in a program once**. Hours and role are edited on that single row.

**`donations`**
| Column | Type | Rules |
|---|---|---|
| id | INTEGER PK | |
| sponsor_id | INTEGER NOT NULL → sponsors | |
| program_id | INTEGER → programs, nullable | `NULL` = **general fund support** (دعم الصندوق). Otherwise must be an existing program, chosen from a list, never free text |
| support_type | TEXT NOT NULL | `'cash'` (مالي) / `'inkind'` (عيني) |
| amount | REAL NOT NULL | ≥ 0. **In-kind support must have an estimated amount** so it counts in totals; the UI tags it "تقديري" (estimated) |
| inkind_item | TEXT | required when `inkind`: what was given |
| date | TEXT NOT NULL | |

Deleting a program sets its donations' `program_id` to `NULL` (they become fund support). Deleting a sponsor deletes its donations.

### 5.3 Relationships

```
volunteers 1──* participations *──1 programs 1──* program_partners
sponsors   1──* donations      *──0..1 programs     (NULL program = general fund)
```

### 5.4 Adding a schema change
1. Add `migrations/000N_description.sql`. Make it idempotent (`IF NOT EXISTS`, safe `UPDATE`s).
2. Append it to both `db:update:local` and `db:update:remote` in `package.json`.
3. Update §5 of this file.
4. Run it locally, then remotely (`npm run db:update:remote`). Remote changes are not automatic on deploy.

---

## 6. Backend (API)

Every route is a file under `app/client/functions/api/`. Pages Functions maps file paths to URLs (`[id]` = one segment, `[[path]]` = catch-all). All responses are JSON. Errors are `{ error: "<Arabic message>", errors?: { field: message } }` with a 4xx status. The UI shows `error` and maps `errors` to form fields.

| Method & path | File | Notes |
|---|---|---|
| GET `/api/dashboard` | `dashboard.js` | counts: volunteers, programs, hours, beneficiaries |
| GET/POST `/api/volunteers` | `volunteers/index.js` | list includes `total_hours`, `total_programs`; sorted by hours desc, then programs desc |
| GET/PUT/DELETE `/api/volunteers/:id` | `volunteers/[id].js` | GET adds `programs[]`, `totalHours`, `totalPrograms`. PUT is partial but validates the merged record. 409 on duplicate national ID |
| PUT/DELETE `/api/volunteers/:id/photo` | `volunteers/[id]/photo.js` | raw image body; see §6.5 |
| GET `/api/volunteers/:id/pdf` | `volunteers/[id]/pdf.js` | A4 PDF download; see §6.6 |
| GET `/api/images/*` | `images/[[path]].js` | serves R2 objects under `avatars/` with immutable caching and ETag/304 |
| GET/POST `/api/programs` | `programs/index.js` | list includes `total_hours`, `volunteer_count`; POST accepts `partners[]` |
| GET/PUT/DELETE `/api/programs/:id` | `programs/[id].js` | GET adds `volunteers[]`, `sponsors[]` (from donations), `partners[]`, `funding[]`, `totalHours`, `totalVolunteers` |
| POST `/api/programs/:id/volunteers` | `programs/[id]/volunteers.js` | bulk add `{ members: [{ volunteer_id, role, hours }] }`, max 200; skips existing members and unknown IDs; returns `{ added, skipped }` |
| GET/POST `/api/sponsors` | `sponsors/index.js` | list includes `donation_count`, `total_amount`, `program_count` |
| GET/PUT/DELETE `/api/sponsors/:id` | `sponsors/[id].js` | GET adds `donations[]` (with `program_name`), `donationCount`, `totalAmount` |
| POST `/api/donations`, PUT/DELETE `/api/donations/:id` | `donations/` | `normalize()` validates type/amount/in-kind item/date |
| POST `/api/participations`, PUT/DELETE `/api/participations/:id` | `participations/` | role flags recomputed from role; 409 on duplicate |

### 6.1 Shared validation
`shared/volunteer.js` and `shared/participation.js` run in both the browser and the API, so a form and the server always agree. **Any new validation rule goes there, not in a page or a route.** Error messages are Arabic.
- `toAsciiDigits()` converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits, so input typed on an Arabic keyboard works.
- `INCOMPLETE_DATE` (`'incomplete'`) is what the date picker emits when only some of day/month/year are chosen.

### 6.2 Roles
`ROLE_OPTIONS` = متطوع / مشرف / مساعد مشرف / أخرى (custom text). Migration 0004 renamed the old roles `مشرف عام` → `مشرف` and `نائب المشرف` → `مساعد مشرف`.

### 6.3 Program dates and state (`src/programState.js`)
- State is computed from dates against the user's local "today": `ongoing` (جارية الآن), `upcoming` (قادمة), `finished` (منتهية), `undated` (بدون تاريخ).
- Day count: single = 1, range = inclusive days between start and end, multiple = number of dates.
- The program header shows only the **first date**. The details table shows the full dates in one cell (`dateSummary`).
- The program form currently creates and edits **single-date** programs only. Range/multiple programs keep their dates unchanged when edited. Adding range/multiple editing to the form is open work.

### 6.4 Executor rule
`category = 'internal'` → `executor_name` is forced to "جمعية العيون التطوعية" on create and update, and the field is read-only in the form. `external` → free text plus an optional logo.

### 6.5 Avatar upload pipeline
1. Browser: `imageResize.js` center-crops to a square, max 512 px, and encodes JPEG (Safari canvas cannot encode WebP).
2. `PUT /api/volunteers/:id/photo` with the raw bytes. The server checks the size (≤ 10 MB raw) and detects the format from magic bytes (JPEG/PNG/WebP only; `Content-Type` is ignored).
3. The server calls the `ain-image-resizer` Worker through the `IMAGE_RESIZER` service binding (512×512, `fit: cover`, `gravity: auto`, WebP q80).
4. If the resizer is unavailable (e.g. local dev), the original is accepted only if it is already ≤ 300 KB.
5. Stored in R2 as `avatars/<volunteerId>-<uuid>.<ext>`. Keys are never reused, so responses are cached forever. The previous photo is deleted.
6. `volunteers.photo` = `/api/images/avatars/...`. Deleting a volunteer deletes the photo.

The resizer Worker has `workers_dev: false` and `preview_urls: false`: it is never public, only reachable through the binding.

### 6.6 Volunteer PDF
- `GET /api/volunteers/:id/pdf` launches headless Chromium (Browser Rendering), opens **`/volunteers/:id/profile?render=pdf` on the same public origin**, waits for `[data-report-ready]` (set once data, photo and web font are loaded), and prints an A4 PDF with CSS page size and page numbers.
- This keeps Arabic text selectable and correctly shaped, and lets the program list flow onto extra pages.
- Browser sessions are reused (`keep_alive` 20 s) because the free plan allows only a few new browsers per minute. If launching fails, it returns 503 with "خدمة إنشاء الملف مشغولة حالياً، حاول بعد لحظات" (the service is busy, try again shortly).
- The report page is always light (teal accent) regardless of the app theme.
- `/volunteers/:id/profile` without `?render=pdf` shows the same page with a toolbar (back, download).

---

## 7. Frontend and design system

### 7.1 Layout rules
- **Fully RTL.** Arabic UI text everywhere. Code, identifiers and comments are English.
- Fixed sidebar on the right with: الرئيسية (Home), المتطوعون (Volunteers), البرامج (Programs), الرعاة (Sponsors); the Ain mark on top; the demo user at the bottom. Below `md` it becomes a drawer, and header action buttons collapse to icon-only (`.ain-header-actions`, `.ain-btn-label` in `index.css`).
- Every detail page starts with a back link to its list (`PageHeader backTo`).
- **Every entity name is a link** to its profile, in both directions (volunteer ↔ program ↔ sponsor).
- **Stat card labels are short**, without "عدد" (count) or "إجمالي" (total), e.g. "الساعات" not "إجمالي الساعات". Small icon + `truncate` so text never overflows on phones.
- **List rows:** the name is flexible (`flex-1 truncate`); secondary data (role, hours, arrow) is fixed-width (`shrink-0`) so it does not shift with name length. Hours show as a number + clock icon, without the word "ساعات".
- **Year filters** are pill buttons: "الكل" (All) + every year present in the data. Related stats follow the selected year.
- Modals (`Modal.jsx`): Esc closes only the top-most modal; backdrop click closes only if the press started on the backdrop; while a request is in flight (`busy`) the modal cannot be closed and leaving the page asks for confirmation.
- Photos are picked and previewed locally and uploaded only when the form is saved.

### 7.2 Colors (`src/theme.jsx`, `src/index.css`)
| Token | Light | Dark |
|---|---|---|
| Accent (from the association logo) | teal `#1D95A6` | gold `#D6A429` |
| Text on accent | `#FFFFFF` | `#1A1305` |
| Page background | `#ECEEF1` | `#0F1115` |
| Sidebar | `#FFFFFF` | `#14161C` |
| Card | `#F3F4F6`, border `gray-300` (deliberately visible) | `#171A21`, border `gray-800` |
| Fund support / external category | violet (`violet-500`, `--fund: #7C3AED`) | same |

- The accent is used for the logo, icons, the main entity name on each page, active tabs, hover borders and primary buttons.
- **Violet marks "not the default":** general-fund donations (vs. program-linked donations in accent) and the "خارجي" (external) badge (vs. "داخلي" in accent).
- The original spec used a beige light background (`#F7F2E7`). The code later moved to neutral gray `#ECEEF1`. **Code wins.**
- Theme toggle: "الوضع الليلي" / "الوضع النهاري" (dark/light mode), saved in `localStorage` key `ain-dark`.
- Accent-dependent styles are injected as classes (`.ain-accent-solid`, `.ain-accent-text`, `.ain-accent-bg-soft`, `.ain-accent-hover`, `.ain-pill-active`, `.ain-accent-border`) by `ThemeProvider`, not Tailwind arbitrary values. Arbitrary values with runtime colors caused problems earlier. Reuse these classes.

### 7.3 Typography, icons, currency
- Font: **Tajawal** (Google Fonts import in `index.css`), fallback Segoe UI.
- Icons: lucide-react.
- **Avatars never use name initials.** Male volunteer → man icon, female → woman icon, company sponsor → building icon, person sponsor → man icon (sponsors have no gender field). A volunteer photo replaces the icon when present.
- In a program's volunteer list: **supervisor** = crown icon, solid accent background, bold, always first; **assistant supervisor** = crown with a small line under it. The rest are sorted by hours desc.
- **Saudi Riyal:** `RiyalSymbol.jsx` draws the official SAMA symbol as SVG (`assets/Saudi_Riyal_Symbol.svg`). Do not use the Unicode code point U+20C1; font support is unreliable.

### 7.4 Search (`src/search.js`)
- Fuzzy (Fuse, threshold 0.35) over normalized Arabic: removes diacritics and tatweel, and folds أ/إ/آ/ٱ → ا, ة → ه, ى → ي, ؤ → و, ئ → ي. So "احمد" finds "أحمد".
- An all-digit query (phone, national ID) uses exact substring match instead of fuzzy match.

### 7.5 Per-page behavior
- **Dashboard:** 4 stats (volunteers, programs, hours, beneficiaries) and 3 manage cards (volunteers, programs, sponsors).
- **Volunteers list:** tabs الكل / المتطوعون / المتطوعات (all / male / female). **Stats follow the tab, not the search text.** Sorted by hours, then programs count.
- **Volunteer profile:** details, photo, stats, one program history list (newest first) with a year filter that also updates the stats. "Join program" dialog: pick a program (grouped by state, searchable), then role + hours. PDF download button.
- **Programs list:** year filter + category filter (الكل/داخلي/خارجي) working together; stats (programs, beneficiaries) follow both; sorted by first date, newest first; category badge on each row.
- **Program profile, top to bottom:** optional logo, name, description, first date, stats, details table (category, executor, dates, day count, location, supervisor), sponsors and partners (optional), volunteers (with "add volunteers" bulk dialog: multi-select with search + gender filter, then role + hours per volunteer), **budget** (total always visible; click to expand each contribution: sponsor, cash/in-kind, amount, in-kind description), **notes last** (collapsed by default).
- **Sponsors list:** stats (sponsors, supported programs), search, sorted by number of donations desc.
- **Sponsor profile:** phone + email only, stats (donation count, total amount; no "programs supported" card), year filter, donation log colored by target (program = accent, fund = violet). Donation form: target "برنامج" (program) or "للصندوق" (to the fund).

---

## 8. Configuration and bindings

`app/client/wrangler.jsonc` (Pages project `ain-platform`):

| Binding | Type | Resource | Used by |
|---|---|---|---|
| `DB` | D1 | `ain-db` (`database_id` is account-specific) | all API routes |
| `AVATARS` | R2 | bucket `ain-avatars` | photo upload, image serving |
| `ain_avatars` | R2 | same bucket | **unused duplicate** created by the dashboard; safe to remove |
| `IMAGE_RESIZER` | Service | Worker `ain-image-resizer` | photo upload (optional at runtime) |
| `BROWSER` | Browser Rendering | — | PDF route |

`compatibility_flags: ["nodejs_compat"]` is required by `@cloudflare/puppeteer`.

`app/image-resizer/wrangler.jsonc` (Worker `ain-image-resizer`): binding `IMAGES` (Cloudflare Images).

There are **no secrets or environment variables** today. If you add any, use `wrangler secret put` / the dashboard, never commit them.

---

## 9. Local development

Requirements: Node 20+, npm. All commands run from `app/client`.

```bash
npm install
npm run db:migrate:local      # schema + demo seed + updates into the local D1 (.wrangler/state)
npm run dev:cf                # build, then wrangler pages dev on http://localhost:8788 (UI + API + D1 + R2)
npm run dev:resizer           # optional, second terminal: image resizer Worker
npm run lint
```

- `npm run dev` (plain Vite, port 5173) serves the UI only. `/api` will not work there.
- `dev:cf` serves the built `dist/`, so rebuild after UI changes.
- Without the resizer running, photo upload accepts only images already ≤ 300 KB.
- The PDF route needs Browser Rendering, which may not work in local dev. Test it on a deployment.
- Local data lives in `app/client/.wrangler/` (gitignored). Delete that folder to reset.

---

## 10. Deploying to Cloudflare (current target)

Free plan works; a custom domain is not needed. The app is served at `https://<project-name>.pages.dev`.

### 10.1 One-time setup (new Cloudflare account)
From `app/client`:

```bash
npx wrangler login
npx wrangler d1 create ain-db               # copy the printed database_id
npx wrangler r2 bucket create ain-avatars
```

1. Put the new `database_id` in `app/client/wrangler.jsonc`. Commit it (it is not a secret).
2. If you renamed the project, database or bucket, update the names in `wrangler.jsonc` and in the `db:*` scripts.
3. Create the schema in the remote database. Pick one:
   - with demo data: `npm run db:migrate:remote`
   - empty (production): run `0001`, `0003`, `0004` only:
     ```bash
     for f in 0001_schema 0003_volunteer_national_id 0004_participation_roles; do
       npx wrangler d1 execute ain-db --remote --file=migrations/$f.sql
     done
     ```
4. Deploy the resizer Worker **before** the Pages project (the service binding must point to an existing Worker): `npm run deploy:resizer`. This requires Cloudflare Images to be enabled on the account.
5. Deploy the app: `npm run deploy` (or connect Git, below).

### 10.2 Automatic deploys from GitHub
**Pages project (the app):** Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → select this repo.
| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None (or Vite) |
| Root directory | `app/client` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `20` (or newer) |

Pages reads the bindings from `wrangler.jsonc`, because it has `pages_build_output_dir`. Every push to `main` deploys production; other branches get preview URLs. If bindings do not show up, add them under the project's Settings → Bindings with the same names.

**Resizer Worker (optional auto-deploy):** Workers & Pages → `ain-image-resizer` → Settings → Builds → connect the same repo, root directory `app/image-resizer`, deploy command `npx wrangler deploy`. It changes rarely, so a manual `npm run deploy:resizer` is fine.

**Database migrations are never run by a deploy.** Run them by hand (§5.4) before pushing code that needs them.

### 10.3 Security: no authentication yet
Every API route is open. Anyone with the URL can read personal data (national IDs, phone numbers) and change or delete records. Before sharing the URL beyond a trusted group:
- **Fastest option:** Cloudflare Zero Trust → Access → protect `<project>.pages.dev` (free for up to 50 users; email one-time PIN login).
  - Caveat: the PDF route opens `/volunteers/:id/profile` through headless Chromium on the public URL, so Access would block it. Add an Access bypass for that path plus `/api/volunteers/*` and `/assets/*`, or render the report without a browser round-trip.
- **Real fix (planned):** app-level login and roles (§3).

---

## 11. Moving to another vendor (vendor-agnostic notes)

The UI (`src/`) and `shared/` are plain React/JS and run anywhere that serves a static SPA with an `/api` backend. Only `functions/`, `server/avatars.js` and `app/image-resizer` depend on Cloudflare. Mapping for **Vercel + Supabase**:

| Cloudflare piece | Replacement | What to change |
|---|---|---|
| Pages static hosting | Vercel (Vite preset, root `app/client`, output `dist`) | Add an SPA rewrite: all non-`/api` paths → `/index.html` (Pages does this automatically) |
| Pages Functions `functions/api/**` | Vercel Functions in `app/client/api/**`, same paths | Change `onRequestGet({ env, params, request })` to `export async function GET(request)`; read params from the URL. Keep returning `Response.json(...)` |
| D1 (`env.DB`) | Supabase Postgres | See §11.1 |
| R2 (`env.AVATARS`) | Supabase Storage bucket `avatars` | Replace `put/get/delete`. You can serve public URLs from Storage directly and drop `images/[[path]].js`, but then store full URLs in `photo` and update `avatarKeyFromPhoto()` |
| Images resizer Worker | `sharp` inside the photo function, or Supabase image transformations | The photo route already falls back if there is no resizer, but then only accepts images ≤ 300 KB, so you need some resizer |
| Browser Rendering | `puppeteer-core` + `@sparticuz/chromium` on Vercel, or any HTML-to-PDF service | Keep the `[data-report-ready]` wait and A4 print options |

### 11.1 D1 → Postgres
Query changes:
- Placeholders `?` → `$1, $2, ...`.
- `db.prepare(sql).bind(...).all()` → `{ rows }`; `.first()` → `rows[0]`; `.first('c')` → `rows[0].c`. Postgres `COUNT`/`SUM` return strings via `pg`: cast with `::int` / `::float` in SQL.
- `info.meta.last_row_id` → `INSERT ... RETURNING id`.
- `res.meta.changes` → `rowCount`.
- `DB.batch([...])` → one transaction (`BEGIN ... COMMIT`).
- Duplicate-key detection: `err.message.includes('UNIQUE constraint failed: volunteers.national_id')` → `err.code === '23505'` and `err.constraint === 'idx_volunteers_national_id'` (in `server/volunteers.js` and `participations/index.js`).
- `dates` can stay a JSON string in `text`, or become `jsonb` (then drop the `JSON.parse`/`JSON.stringify` calls).

Equivalent schema (keeps dates as ISO text so the app code is unchanged):

```sql
CREATE TABLE volunteers (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('m','f')),
  national_id text,
  birth_date text, phone text, email text, qualification text, job text, join_date text, photo text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);
CREATE UNIQUE INDEX idx_volunteers_national_id ON volunteers(national_id);

CREATE TABLE sponsors (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  logo text,
  category text NOT NULL CHECK (category IN ('person','company')),
  since text, phone text, email text
);

CREATE TABLE programs (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('internal','external')),
  executor_name text, executor_logo text, location text, supervisor_name text,
  beneficiaries integer DEFAULT 0,
  date_mode text NOT NULL CHECK (date_mode IN ('single','range','multiple')),
  dates text NOT NULL DEFAULT '[]',
  logo text, notes text,
  status text DEFAULT 'مكتمل'
);

CREATE TABLE program_partners (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  program_id bigint NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name text NOT NULL
);

CREATE TABLE participations (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  volunteer_id bigint NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  program_id bigint NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  role text NOT NULL,
  hours double precision NOT NULL DEFAULT 0,
  is_supervisor integer NOT NULL DEFAULT 0,
  is_deputy integer NOT NULL DEFAULT 0,
  date text
);
CREATE UNIQUE INDEX idx_participations_volunteer_program ON participations(volunteer_id, program_id);
CREATE INDEX idx_participations_program ON participations(program_id);

CREATE TABLE donations (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  sponsor_id bigint NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  program_id bigint REFERENCES programs(id) ON DELETE SET NULL,
  support_type text NOT NULL CHECK (support_type IN ('cash','inkind')),
  amount double precision NOT NULL DEFAULT 0,
  inkind_item text,
  date text NOT NULL
);
CREATE INDEX idx_donations_sponsor ON donations(sponsor_id);
CREATE INDEX idx_donations_program ON donations(program_id);
```

`program_sponsors` is left out on purpose (unused). The seed in `0002_seed.sql` is plain `INSERT`s and runs on Postgres as-is.

If you use Supabase, keep the database behind the API functions (service-role key in a server-side env var). Do not expose tables to the browser through the Supabase client unless you also add Row Level Security and auth.

### 11.2 Exporting existing data from D1
```bash
npx wrangler d1 export ain-db --remote --output=ain-db.sql --no-schema
```
This produces SQLite `INSERT` statements. Load them into the target database after creating the schema; reset identity sequences afterwards (`SELECT setval(pg_get_serial_sequence('volunteers','id'), max(id)) FROM volunteers;` per table). Copy R2 objects to the new storage and keep the same keys, or rewrite `volunteers.photo`.

---

## 12. Rules for agents working here

- **UI text is Arabic; code, identifiers, comments and commit messages are English.** New user-facing errors (including API `error` strings) are Arabic.
- Keep validation in `shared/`, so the UI and the API stay identical.
- Reuse existing components (`Modal`, `Field`, `ListRow`, `PillTabs`, `SegmentedControl`, `StatCard`, `Avatar`, `GregorianDateInput`, `TagInput`, `ConfirmDialog`, `EditDeleteActions`) and the `ain-*` accent classes before creating new ones.
- Never use a native date input. Use `GregorianDateInput`.
- Never set `is_supervisor`/`is_deputy` by hand. They come from `role`.
- Every schema change is a new idempotent migration file plus the `package.json` script plus §5 of this file.
- Check every UI change in light and dark mode and at phone width (~390 px). Long Arabic names must truncate, not wrap the row.
- Do not put secrets in `wrangler.jsonc` or the repo.
- Do not commit `node_modules/`, `dist/`, `.wrangler/` or `.claude/settings.local.json`.
- Keep this file up to date when you change behavior, schema, bindings or deployment.

### Known gaps and open work
- No authentication or authorization (§10.3). Highest priority before real use.
- Program form edits single-date programs only (§6.3).
- Program/sponsor/executor logos exist in the schema, but there is no upload flow yet (only volunteer photos have one).
- `programs.status` and `program_sponsors` are legacy. Remove them in a migration.
- Duplicate R2 binding `ain_avatars` in `wrangler.jsonc`.
- Migrations are applied with `wrangler d1 execute` scripts, with no applied-migrations tracking. Consider moving to `wrangler d1 migrations apply`. The folder name and file naming already match its convention, but it would also run the seed file, so move `0002_seed.sql` out first.
- `index.html` has `lang="en"` and title "client". Should be `lang="ar" dir="rtl"` and an Arabic title.
- The Tajawal font loads from Google Fonts. Self-host it if offline use or privacy matters.
- No automated tests.
