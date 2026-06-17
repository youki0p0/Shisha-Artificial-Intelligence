# Shisha Flavor OS

A public, multi-user **shisha / hookah flavor inventory and recipe generation**
web service. It is **OCR-first and database-first**, not an AI chatbot.

Normal recipe generation works **without any external LLM**. The product feels
intelligent because the database, parser, scoring engine, and recipe engine are
well-designed — AI is an *optional fallback*, never the core.

> LISSO is treated as an initial **curator / preset provider / flavor
> philosophy source**, not as the only user. The system is built for public,
> multi-user use.

---

## Core philosophy

The correct pipeline is always:

```
user input / photo / OCR
  ↓ local parsing
  ↓ database matching
  ↓ confidence scoring
  ↓ manual review
  ↓ confirmed user inventory or recipe
```

Hard rules enforced by the architecture:

- AI must **not** invent flavor data.
- AI must **not** decide the final recipe.
- AI must **not** auto-register master flavor records.
- OCR / AI / web-search results must **not** auto-become confirmed inventory.
- ~80% of intent understood locally ⇒ **do not call AI**.
- Unknown *mood* words ⇒ ignore / weak-tag rather than calling AI.

---

## Tech stack

- **Next.js 16 (App Router)** + **TypeScript** (strict)
- **Tailwind CSS** + minimal **shadcn/ui**-style primitives
- **Zod** validation, **React Hook Form** (ready for richer forms)
- **Repository pattern** over an MVP **JSON-file** store
- Pure, testable engines: parser / scoring / recipe / layering / heat / matcher
- **Vitest** tests
- Vercel deployment target

UI is **Japanese-first**; all code, comments, and docs are in **English**.

---

## Quick start

```bash
npm install
npm run seed     # writes .data/db.json from src/data/seed (optional; auto-seeds on first run)
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm test           # run the vitest suite
```

The MVP uses a **mock current user** (`user_demo`). To view the curator/admin
screen, set the cookie `sfos_uid=user_lisso` (or `user_admin`) in your browser.

---

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/` | Dashboard | inventory summary, recent recipes, photo sessions, low-stock |
| `/inventory` | My Inventory | manual add, status edit/remove, custom items, master submission |
| `/photo-import` | Photo Import | upload (mock) → OCR → detected candidates |
| `/photo-import/[id]` | Photo Review | raw OCR text, candidates, edit/approve/ignore |
| `/flavors` | Flavor Master Search | brand/flavor/tag search, taste profile, add to inventory |
| `/recipes/new` | Recipe Generator | parse intent locally, 4 modes, full recipe output |
| `/r/[shareId]` | Shared Recipe | owned/missing comparison + local substitutes |
| `/admin` | Admin / Curator | master data lists + submission review (curator/admin only) |

---

## Architecture

```
src/
  domain/         types.ts (all models) · schemas.ts (Zod) · taste.ts (vector math)
  data/seed/      curated Brand/FlavorMaster/TasteWord/Synergy/Heat/Troubleshooting + demo user
  repositories/   types.ts (interfaces) · jsonStore.ts (JSON DB) · index.ts (impls)
  engines/        parser · scoring · recipe · layering · heat · matcher  (pure functions)
  adapters/       ocr (mock) · webSearch (mock) · ai (disabled)
  services/       recipeService (wires repos + engines)
  lib/            auth (mock user) · ids · utils
  components/     ui primitives · TasteBars · RecipeView
  app/            App Router pages, server actions, API routes
```

### Data separation (multi-tenant)

- **Global master** (`Brand`, `FlavorMaster`, `TasteWord`, `SynergyRule`,
  `HeatTemplate`, `TroubleshootingRule`) — shared, read-only for normal users,
  editable only by curator/admin.
- **User private** (`UserInventoryItem`, `UserRecipe`, `PhotoImportSession`,
  `PhotoDetectedItem`, `MasterSubmission`, …) — separated by `userId`; one user
  can never read another's private inventory.

### Engines (all pure / unit-tested)

- **`parser.ts`** — `LocalIntentParser`: matches `TasteWord` keywords/aliases,
  degree words, negation; extracts unknown terms; computes confidence and the
  AI-fallback decision. No AI.
- **`scoring.ts`** — taste-vector match, role/tag match, inventory & synergy
  bonuses, layer affinity, beginner bonus, concept fit, minus avoid/constraint/
  overpower/cooling-overload/excess-sweetness/heaviness penalties.
- **`recipe.ts`** — selects a diverse flavor set, allocates grams, builds
  layers/heat/timeline/troubleshooting, score breakdown, missing-flavor
  alternatives.
- **`layering.ts`** — top/middle/bottom assignment (aroma & citrus up, heavy
  cream/base down, delicate tea protected).
- **`heat.ts`** — picks the best `HeatTemplate` for the mix.
- **`matcher.ts`** — maps raw OCR / search text → brand/flavor/size candidates
  with a confidence score.

### AI fallback decision (in the parser)

| Condition | Action |
|---|---|
| confidence ≥ 0.8 | never call AI |
| confidence ≥ 0.5 **and** main taste detected | do not call AI |
| only unknown mood words | weak-tag, do not call AI |
| confidence < 0.5 | best-effort local result + *flag* possible AI fallback |
| unknown product/drink/food names | flag possible AI fallback |

Even when flagged, AI is only invoked if `AI_FALLBACK_ENABLED=true` **and**
`AI_API_KEY` is set (off by default), and it may only *refine the intent* — it
never builds the recipe or master data.

---

## How OCR currently works

`src/adapters/ocr.ts` ships `MockOcrAdapter`, which returns a fixed, plausible
Japanese/English shelf listing for any image so the full pipeline
(session → OCR → match → review → approve) is exercisable end-to-end. Detected
items are stored as `pending` and only become inventory on explicit approval.

See **`docs/future-ocr.md`** to connect a real engine (Google Vision / AWS
Textract / Tesseract.js).

## Future notes

- **Real OCR adapter** → `docs/future-ocr.md`
- **AI fallback** → `docs/future-ai.md`
- **Web Search API** (Brave / Google CSE / SerpAPI) → `docs/future-websearch.md`
- **DB migration** to Supabase / Postgres / Neon / Vercel Postgres →
  `docs/future-db-migration.md`

---

## Known limitations (MVP)

- JSON-file store (`.data/db.json`); single-process only. Not for concurrent
  production load — migrate to Postgres for that (docs provided).
- Auth is a **mock current user** (cookie-switchable). Real auth plugs into
  `src/lib/auth.ts`.
- OCR and web search are **mock** adapters.
- The Japanese parser uses substring + alias matching (no morphological
  analyzer); conjugations are handled via curated stem aliases. A future step
  can add kuromoji for richer tokenisation.
- Shared-recipe "save adjusted recipe" is modelled and the comparison UI works,
  but full adjusted-save is a future step.
- Master-data CRUD editors in `/admin` are read-only lists + a working
  submission review queue (skeleton, by design).

---

## Safety

The app shows age/legal notices (20+ only), treats OCR/AI/web results as
uncertain until reviewed, keeps private inventory private, and never makes
health-benefit claims or suggests unsafe/illegal substances.
