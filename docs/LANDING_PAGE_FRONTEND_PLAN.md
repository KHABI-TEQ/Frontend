# Landing page: audience messaging & frontend implementation plan

This document **does not implement** the landing page. It:

1. **Maps** the provided backend-derived copy to **what already exists** in this Next.js client.
2. **Expands** the copy with **real frontend capabilities** (AI flows, voice, DealSite, routes).
3. Proposes **how** to build a polished UI on **`/`** (currently `src/app/new-homepage/page.tsx` → `NewHomepage`).

**Current home entry:** `src/app/page.tsx` renders `NewHomepage` from `src/app/new-homepage/page.tsx` (hero, key features, value proposition, featured properties, social proof, for-agents, security, final CTA, footer patterns).

---

## Part A — How the client already supports the narrative

| Theme (your copy) | Where it lives in the frontend | Notes |
|-------------------|----------------------------------|--------|
| **AI listing assist** (landlord / agent / developer) | `PropertyAiConversationFlow` + `suggestProperty` (`POST /account/ai/suggest-property`, auth) | Used when posting a property with **AI mode**; interactive missing-field prompts via `getPropertyFieldPrompt` in `aiInteractivePrompts.ts`. |
| **AI preference assist** (buyers / tenants / JV seekers) | `PreferenceAiConversationFlow` + `suggestPreference` (`POST /ai/suggest-preference`, public) | `/preference` with **Use AI**; steps: conversation → contact confirm (name/email) → summary → submit `buildPreferencePayload` → `POST …/preferences/submit`. |
| **Voice + keyboard** | `AiFillBlock` — Web Speech API (`en-NG`), optional **amount entry mode** (comma display, digits-only send) for budget steps; silence grace **5s** before session end; end beep | Shared by preference AI and property listing AI. |
| **TTS for AI replies** | `useSpeechSynthesis` (`en-NG`); toggle “Play AI replies aloud”; per-message speaker control | Preference & property AI chat UIs. |
| **DealSite** (branded public URL) | `DealSiteProvider` / `useDealSite` (`deal-site-context.tsx`); setup under `public-access-page/*` | Slug, theme, hero, featured listings, inspection defaults, subscribe, contact visibility, pause/resume/delete. |
| **Agent marketplace & match** | `agent-marketplace/[id]/page.tsx` — “Match preference” flow | Pairs agent listings with buyer preferences where product allows. |
| **LASRERA / request-to-market** | `lasrera-marketplace/page.tsx`; `my-request-to-market/page.tsx`; `requestToMarketService` | Agents request to market publisher inventory; publishers respond. |
| **Inspections & bookings** | `my-inspection-requests`, `continue-inspection`, `check-booking-details`, `field-agent-inspection*`, secure buyer/seller response routes | In-app inspection workflows (role-specific). |
| **Subscriptions / upgrades** | `agent-subscriptions`, dashboard agent/landlord/developer cards | Plan upgrades tied to listing volume / product rules. |
| **KYC** | `agent-kyc` | Agent onboarding. |
| **Post by preference** | `post-property-by-preference/page.tsx` | Connects listing creation to buyer preference context. |
| **Matched properties** | `matched-properties/...`, `preference/matches/...` | Surfaces matches when backend finds fit. |
| **Manual vs AI** | `PreferenceModeSelector`; `postingMode` in post-property context | User explicitly chooses AI or manual form. |

Use this table when writing marketing copy so **every claim links to a real route or feature flag**, or qualify as “where enabled / per backend rules.”

---

## Part B — Expanded copy (backend + frontend truth)

Use as source for final microcopy; shorten per section layout.

### Hero (one line, optional)

**Suggested line (aligned with product + FE):**  
**Khabi-Teq — List smarter. Search smarter. Close faster.** AI-assisted listing and preference flows, voice or type, structured for Nigeria’s property market — from first pitch to published fields.

### 1. Landlords

**Headline (keep):** Turn your asset into demand — without drowning in paperwork.

**Sub (expanded):** Publish **sale, rent, shortlet, or JV** from the same posting experience. Choose **AI listing** and speak or type a short brief — the app suggests structured fields (location, pricing, land size, documents, features) via `suggest-property`; you refine, add images, set **commission / inspection fees** where the form exposes them, then publish. Prefer full control? Switch to **manual** anytime.

**What you gain (FE-aware):**

- Structured listings that match the **multi-step post-property** flows (category → details → images → summary).
- **Dashboard** (`dashboard` landlord view) paths to **inspections**, **requests to market**, and listing management.
- **Request to market:** agents can request to promote your inventory (`my-request-to-market` as publisher); you accept or reject.
- DealSite / LASRERA exposure: where your deployment enables **public** and **LASRERA marketplace** listings, copy should say “when you list on those channels” — frontend has dedicated **LASRERA** and **public DealSite** surfaces.

**CTAs (deep links):**  
`List a property` → `/post-property` (or landlord-specific entry if product uses `/landlord` / sell flow).  
`Book a demo` → `/contact-us` or sales URL (confirm with product).

---

### 2. Developers

**Headline (keep):** Showcase projects. Capture partners. Scale pipeline.

**Sub (expanded):** **Joint-venture** and other listing types use the same posting machinery as residential stock — `joint-venture` post flow under `post-property/joint-venture`, with **AI conversation** optional (`PropertyAiConversationFlow`). **DealSite** branding and public pages are available where the account is agent/developer-eligible (`isAgentOrDeveloperEffective`). Buyer **preferences** include **JV** mode in `PreferenceAiConversationFlow` / `getMissingFieldsFromPreferenceData`.

**What you gain:**

- One system for **development types**, land requirements, JV terms, and title steps (mirrored in AI missing-field order for JV preferences).
- **Subscriptions** (`agent-subscriptions`) when scaling volume.
- Leads from **preference submit** + **match** surfaces where backend scores fit.

**CTAs:** `Start a JV listing` → `/post-property/joint-venture`. `Talk to sales` → contact.

---

### 3. Agents

**Headline (keep):** Your brand. Your listings. Your leads — on one platform.

**Sub (expanded):** Complete **KYC** (`/agent-kyc`), manage **subscriptions**, and run a **DealSite** — branded slug, hero, featured stock, subscribe settings, inspection defaults (`deal-site-context`, `public-access-page/*`). **AI listing assist** on post-property matches landlord/developer behaviour. **Agent marketplace** (`/agent-marketplace`) includes **Match preference** on detail pages. **Request to market** on **LASRERA marketplace** (`/lasrera-marketplace`) with fee/commission visibility where implemented.

**What you gain:**

- **DealSite** preview URL from context (`previewUrl`), theme colours (`#09391C` / `#8DDB90` defaults in settings).
- **Broadcast** (`/agent-broadcast`) where product enables email subscribers.
- **Inspections** queue (`/my-inspection-requests`, related flows).
- **Dashboard** quick links to request-to-market and listings.

**CTAs:** `Activate your DealSite` → `/public-access-page/setup` (or onboarding path you standardize). `Upgrade plan` → `/agent-subscriptions`.

---

### 4. Clients / Buyers

**Headline (keep):** Say what you want. We structure the search.

**Sub (expanded):** Open **`/preference`**, pick **Use AI**, and walk through a **guided conversation** — one question at a time, aligned with the real form (state → LGA → area → type-specific fields). **Voice or type**; budget steps use **comma-formatted Naira** in the input and **digits-only** to the API. **TTS** can read assistant lines aloud. Finish with **name/email confirm**, **summary**, then **submit**. Alternatively use **manual** form or continue from AI into the wizard with data merged.

**What you gain:**

- Structured **buy / rent / shortlet / JV** preferences and payload shape from `buildPreferencePayload`.
- **Matches** via `matched-properties`, `preference/matches`, and marketplace flows when logged in as agent.
- **Inspections / bookings** from shortlists and property detail flows.

**CTAs:** `Tell us what you’re looking for` → `/preference`. `Browse listings` → `/market-place` or `buy_page` / `rent_page` as product prefers.

---

### AI / voice strip (single band)

**Suggested FE-accurate copy:**  
**One platform. Two AI shortcuts.**  
**Sellers:** describe the listing — AI suggests fields for **sale, rent, shortlet, or JV** (authenticated `suggest-property`).  
**Buyers:** describe what you want — AI suggests a **preference** before submit (public `suggest-preference`).  
**Input:** microphone **or** keyboard — same outcome; optional **read-aloud** for assistant messages; **5-second** pause window before voice session ends.

---

### Footer trust line

**Suggested:** Built for Nigeria — structured listings and preferences, inspections, marketplace, and workflows that connect people, properties, and compliance in one place.

---

## Part C — Implementation plan (UI / UX, no code yet)

### C.1 Placement on the existing homepage

`NewHomepage` already stacks: Hero → Key features → Value proposition → Featured → Social proof → For agents → Security → Final CTA.

**Recommended approach:**

1. **Hero (`NewHeroSection`)** — Optional one-line tagline + primary/secondary CTAs (Browse / List / Submit preference). Align colours with brand tokens already used: `#09391C`, `#8DDB90`, background `#FFFEFB`.
2. **New section: “Who it’s for”** — Insert **after** key features or value proposition: a **4-column grid** (desktop) / **accordion or tabs** (mobile) for Landlords | Developers | Agents | Buyers. Each column: headline, 2–3 sentence sub, 3 bullet “gains”, 2 buttons. Use **cards** with subtle border `border-[#8DDB90]/40` and soft green tint `bg-[#f0fdf4]/60` (consistent with `PreferenceAiConversationFlow` / `AiFillBlock`).
3. **Narrow “AI + voice” strip** — Full-width band between sections (dark green `#09391C` or deep teal `#0B423D` like hero fallback) with white text + two icons (mic + keyboard). Single short paragraph + optional link “See how it works” → anchor to section or `/preference?` with query.
4. **Footer** — Append trust line above existing `NewFooter` links; ensure **Explore** links in footer point to real routes (today some are `#` in `new-footer.tsx` — plan to replace with `/market-place`, `/preference`, `/post-property`, etc.).

### C.2 Design principles

- **Typography:** Keep existing homepage scale (e.g. `text-2xl sm:text-4xl` for hero); section titles `text-3xl font-bold text-[#09391C]`.
- **Motion:** Reuse `framer-motion` patterns from `new-homepage` (fade-in, stagger children) for the new audience section — avoid heavy animation on first paint.
- **Accessibility:** CTAs with visible focus rings; contrast on green buttons (`bg-[#8DDB90] text-[#09391C]`).
- **Imagery:** Optional illustrations per persona (landlord building, crane for developer, agent badge, family home for buyer) — place in `/public` or use lightweight SVG; lazy-load below fold.

### C.3 Engineering tasks (when you implement)

| Task | Detail |
|------|--------|
| New component | e.g. `AudienceSegmentsSection.tsx` under `components/new-homepage/` |
| Content source | Start static in component; optional CMS later (`useHomePageSettings` if extended) |
| Links | Replace `#` placeholders in footer `exploreLinks` / `servicesLinks` with real paths from Part A |
| Analytics | Add click events on segment CTAs (if GTM/analytics exists) |
| SEO | Update `<title>` / meta description in `layout.tsx` or page metadata for homepage |
| i18n | Not required now; strings in English |

### C.4 Out of scope for this doc

- Backend copy approval or legal review.
- Actual React/Tailwind implementation (explicitly deferred).

---

## Part D — Quick reference: routes for CTAs

| Intent | Path |
|--------|------|
| Submit preference | `/preference` |
| Post property (hub) | `/post-property` |
| JV listing | `/post-property/joint-venture` |
| Agent marketplace | `/agent-marketplace` |
| LASRERA marketplace | `/lasrera-marketplace` |
| DealSite setup | `/public-access-page/setup` |
| Subscriptions | `/agent-subscriptions` |
| Request to market (user) | `/my-request-to-market` |
| Contact | `/contact-us` |
| Market listings browse | `/market-place` |

Adjust for marketing campaigns (e.g. `?type=rent` on preference — see `preference/page.tsx` URL param).

---

*This plan aligns marketing language with the current codebase. Update Part A/B when features or routes change.*
