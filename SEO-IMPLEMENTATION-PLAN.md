# Gaelworx — SEO / AEO / GEO Implementation Plan

**For the implementing agent.** Execute in order. Phase 0 is the blocker — nothing else
matters until the site stops declaring itself as `gwhoundsweb.vercel.app`. Each task lists
the files, the change, and an acceptance check. Repo is a dependency‑free static site
(16 HTML pages + `robots.txt`, `sitemap.xml`, `llms.txt`, `vercel.json`, `demo.js`, etc.).

**Canonical host decision (applies everywhere):** use the **apex** `https://gaelworx.com`
(no `www`). All code references, canonicals, OG, schema, sitemap, robots, and llms.txt use
`https://gaelworx.com`. `www.gaelworx.com` will 301 → apex (handled by Vercel).

---

## PHASE 0 — Domain migration (CRITICAL — do first)

### Why the site still serves vercel.app
Switching the domain in the Vercel dashboard only makes `gaelworx.com` *resolve*. Two things
still point everything back to the old host:
1. The old `gwhoundsweb.vercel.app` deployment URL stays live and is **not redirected** by
   default, so both URLs serve identical content (duplicate content).
2. **The code hardcodes `gwhoundsweb.vercel.app` 91 times** — including every
   `<link rel="canonical">`, which literally tells Google/Bing/AI crawlers the "true" URL is
   the vercel.app one. Fixing the DNS without fixing these leaves conflicting signals.

Do all four tasks below.

### 0.1 — Set the primary domain (Vercel dashboard)
- Vercel → Project → **Settings → Domains**.
- Set **`gaelworx.com` as Primary Domain**. Add `www.gaelworx.com` and let Vercel redirect it
  to the apex.
- **Acceptance:** visiting `https://www.gaelworx.com` 308‑redirects to `https://gaelworx.com`.

### 0.2 — Redirect the old vercel.app URL (code)
Replace `vercel.json` with the version below. This adds a **host‑scoped 308 redirect** from the
production alias to the apex (per‑deployment preview URLs keep working because they have
different hostnames), and adds the **HSTS** header. CSP is unchanged in this phase (still allows
Google Fonts until Phase 2.5 self‑hosts them).

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "gwhoundsweb.vercel.app" }],
      "destination": "https://gaelworx.com/:path*",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
      ]
    },
    {
      "source": "/(assets|projects)/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=2592000, stale-while-revalidate=86400" }
      ]
    }
  ]
}
```
- **Acceptance:** `curl -sI https://gwhoundsweb.vercel.app/voice.html` returns `308` with
  `location: https://gaelworx.com/voice.html`.

### 0.3 — Rewrite all 91 hardcoded references (code)
Global find‑replace across the **site/runtime files** (explicitly excluding this plan document,
which quotes the old host as explanatory text): replace the exact string
`gwhoundsweb.vercel.app` → `gaelworx.com`.

This safely rewrites `https://gwhoundsweb.vercel.app/...` → `https://gaelworx.com/...` in every
canonical, `og:url`, `og:image`, JSON‑LD (`@id`/`url`/`logo`/`image`), plus `sitemap.xml` (14
URLs), the `robots.txt` `Sitemap:` line, and `llms.txt` (12 URLs). It does **not** touch the
email `hello@gaelworx.com` (already correct) or any other domain.

Files that contain it: `index.html about.html accessibility.html automations.html contact.html
faq.html install.html pricing.html privacy.html software.html terms.html thanks.html voice.html
web.html work.html 404.html robots.txt sitemap.xml llms.txt`. Do **not** include
`SEO-IMPLEMENTATION-PLAN.md` itself in the sweep.

- **Acceptance:** a repo‑wide search for `gwhoundsweb.vercel.app` returns **0 results**;
  `index.html` canonical reads `<link rel="canonical" href="https://gaelworx.com/">`.

### 0.4 — Reconcile with search engines (post‑deploy)
- Add **`https://gaelworx.com`** as a property in **Google Search Console** and **Bing Webmaster
  Tools**; submit `https://gaelworx.com/sitemap.xml` in both.
- Keep the 0.2 redirects in place so Google consolidates the old URLs into the new ones. (Google
  swaps the indexed URL over days–weeks; the 301/308 + corrected canonicals are what drive it.)
- **Acceptance:** GSC shows the sitemap accepted and pages being indexed under gaelworx.com.

---

## PHASE 1 — Do‑now quick fixes (Low effort / High‑to‑Med impact)

### 1.1 — Fix the fake phone number
Area code **`369` is not a valid US area code** and reads as fake to people and machines. Get the
real number and replace it **everywhere**: page footers, `contact.html`, all JSON‑LD `telephone`,
and `llms.txt` (`+1 (369) 212-1203`). Do not ship until verified.
- **Acceptance:** no `369` phone string remains anywhere; the number dials correctly.

### 1.2 — Trim over‑length meta descriptions to ≤155 characters
These pages exceed the SERP truncation limit (current char counts in parens). Rewrite each to
**≤155 chars**, unique, benefit‑led:
`install.html` (286 — nearly double), `pricing.html` (218), `work.html` (217),
`accessibility.html` (205), `voice.html` (202), `web.html` (200), `contact.html` (198),
`software.html` (181), `about.html` (175), `faq.html` (166).
(`index`, `privacy`, `terms`, `thanks`, `404` are already fine — leave them.)
- **Acceptance:** every meta description ≤155 characters.

### 1.3 — Collapse the homepage to a single `<h1>`
`index.html` has **two `<h1>`** elements (the "back" and "front" animation layers of
"FORGED ONCE. SHARPENED FOREVER."). Keep **one** as the `<h1>`; convert the other to a
`<div>`/`<span>` with `aria-hidden="true"`, preserving its existing inline styles so the visual is
identical.
- **Acceptance:** `index.html` contains exactly one `<h1>`; the hero looks unchanged.

### 1.4 — Add `lastmod` to the sitemap
`sitemap.xml` has no dates. Add a `<lastmod>YYYY-MM-DD</lastmod>` to every `<url>` (use the real
last‑edit date per page; today's date is fine for this pass). Keep them accurate on future edits —
do **not** fake or bulk‑bump them (Google distrusts inaccurate lastmod).
```xml
<url><loc>https://gaelworx.com/voice.html</loc><lastmod>2026-07-07</lastmod></url>
```
- **Acceptance:** all 14 `<url>` entries have a valid `<lastmod>`.

### 1.5 — Wire IndexNow (Bing = ChatGPT's index gate)
- Generate an IndexNow key (a random 32‑char hex string). Host it at
  `https://gaelworx.com/<key>.txt` (file contents = the key).
- On each production deploy, POST changed URLs to
  `https://api.indexnow.org/indexnow` with the key (a small deploy hook / GitHub Action).
- **Acceptance:** the key file resolves 200; a test submission returns 200/202.

---

## PHASE 2 — Structured data + performance (Med effort / High‑Med impact)

### 2.1 — Ship one corrected JSON‑LD `@graph` on every page
**Defects to fix (from audit):** (a) `#org` is typed BOTH `ProfessionalService` and
`Organization` on the same `@id`; (b) `provider`/`publisher` reference `#org` on 8 pages where
`#org` is never defined (dangling `@id`); (c) FAQPage markup is inconsistent (some pages emit a
bare second `FAQPage` script); (d) no `LocalBusiness`/NAP, no `sameAs`, no `Person`, no
`BreadcrumbList`.

**Rule:** put ONE `@graph` per page. The **shared org block below is byte‑for‑byte identical on
every page**; each page then appends its own `WebPage` + `BreadcrumbList` (+ `Service`/`FAQPage`
where relevant) into the same graph. Delete all the old/duplicate/bare JSON‑LD scripts.

**Shared block (every page):**
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://gaelworx.com/#org",
      "name": "Gaelworx",
      "alternateName": "GAELWORX",
      "url": "https://gaelworx.com/",
      "logo": { "@id": "https://gaelworx.com/#logo" },
      "image": { "@id": "https://gaelworx.com/#logo" },
      "description": "AI automation agency for trades and small businesses in the continental US — managed AI voice agents, workflow automation, custom software owned outright by the client, and high-craft web.",
      "slogan": "Non sine periculo — not without danger.",
      "telephone": "+1-XXX-XXX-XXXX",
      "email": "hello@gaelworx.com",
      "priceRange": "$899–$50,000",
      "areaServed": { "@type": "Country", "name": "United States" },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US",
        "addressRegion": "XX"
      },
      "knowsAbout": [
        "AI voice agents", "Workflow automation", "Custom business software",
        "AI installation", "Web design", "CrewAI", "LangChain", "n8n", "Local AI models"
      ],
      "sameAs": [
        "https://www.linkedin.com/company/gaelworx",
        "https://www.youtube.com/@gaelworx"
      ]
    },
    {
      "@type": "ImageObject",
      "@id": "https://gaelworx.com/#logo",
      "url": "https://gaelworx.com/assets/knot-etch.png",
      "contentUrl": "https://gaelworx.com/assets/knot-etch.png",
      "caption": "Gaelworx"
    },
    {
      "@type": "WebSite",
      "@id": "https://gaelworx.com/#website",
      "url": "https://gaelworx.com/",
      "name": "Gaelworx",
      "publisher": { "@id": "https://gaelworx.com/#org" }
    }
  ]
}
```

**Per‑page additions** (append to that page's `@graph`). Example for `voice.html`:
```json
{
  "@type": "WebPage",
  "@id": "https://gaelworx.com/voice.html#webpage",
  "url": "https://gaelworx.com/voice.html",
  "name": "Voice Agents — Gaelworx",
  "isPartOf": { "@id": "https://gaelworx.com/#website" },
  "about": { "@id": "https://gaelworx.com/#org" }
},
{
  "@type": "BreadcrumbList",
  "@id": "https://gaelworx.com/voice.html#breadcrumb",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gaelworx.com/" },
    { "@type": "ListItem", "position": 2, "name": "Voice Agents", "item": "https://gaelworx.com/voice.html" }
  ]
},
{
  "@type": "Service",
  "@id": "https://gaelworx.com/voice.html#service",
  "serviceType": "Managed AI voice agents",
  "provider": { "@id": "https://gaelworx.com/#org" },
  "areaServed": { "@type": "Country", "name": "United States" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "899",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "899", "priceCurrency": "USD",
      "unitText": "per month", "billingIncrement": "1"
    }
  }
}
```

**Service → offer mapping** (build the `Service` node per page from this):
| Page | serviceType | Offer |
|---|---|---|
| `voice.html` | Managed AI voice agents | `Offer` 899/mo (UnitPriceSpecification) |
| `automations.html` | Workflow automation engines | `Offer` price `2500` (from) |
| `software.html` | Custom business software | `Offer` price `15000` (from) |
| `install.html` | AI installation | `Offer` price `2500` (from) |
| `web.html` | Web design | `AggregateOffer` lowPrice `1499` highPrice `9999` |
| `pricing.html` | (keep the `OfferCatalog` listing all five) | — |

**FAQPage** (only on pages with visible `<details>` Q&A — faq, pricing, software, install,
automations, voice, web). One consistent node per page, inside the same graph. Continuing the
`voice.html` example above (note the `@id`/`isPartOf` point at `voice.html`, matching the
`WebPage` node it belongs to — not `faq.html`):
```json
{
  "@type": "FAQPage",
  "@id": "https://gaelworx.com/voice.html#faq",
  "isPartOf": { "@id": "https://gaelworx.com/voice.html#webpage" },
  "publisher": { "@id": "https://gaelworx.com/#org" },
  "mainEntity": [
    { "@type": "Question", "name": "…", "acceptedAnswer": { "@type": "Answer", "text": "…" } }
  ]
}
```

**Intentionally NOT included (do not add):**
- **No `SearchAction`/sitelinks searchbox** — Google deprecated it (Nov 2024) and there's no real
  site search endpoint. Adding it earns nothing.
- **No self‑authored `aggregateRating`/`review` on `#org`** — self‑serving star ratings are
  ineligible and can be flagged. Add `Review`/`AggregateRating` ONLY later, sourced from real
  third‑party reviews (see 3.2).
- **No `Person` (founder) node with a placeholder** — add it in 3.1 once you have a real name;
  a placeholder like `{{FOUNDER_NAME}}` will fail validation. When ready, add the `Person` node
  and a `"founder": { "@id": ".../#founder" }` ref on `#org`.

**Before shipping:** substitute the real `telephone` and `addressRegion`, confirm the JSON is
valid/closed, and paste each page through Google's **Rich Results Test** and the **Schema Markup
Validator** (`validator.schema.org`).
- **Acceptance:** every page validates with 0 errors; no dangling `@id`; one `@graph` per page;
  no bare/duplicate FAQPage scripts remain.

### 2.2 — Per‑page Open Graph / Twitter
- Give each page its **own** `og:image` (not the single shared `og-card.png`) where practical, and
  add `og:image:width`, `og:image:height`, `og:image:alt`, `og:locale` = `en_US`.
- Add full Twitter fields: `twitter:title`, `twitter:description`, `twitter:image`.
- **Acceptance:** OG/Twitter tags present and page‑specific.

### 2.3 — Reveal‑on‑scroll fallback
113 elements start at `opacity:0` and are revealed by JS. Ensure content **defaults to visible if
JS doesn't run** (e.g., a `.no-js` rule or set the reveal only after a `js` class is added to
`<html>`). Content is already in the HTML source (good for crawlers) — this is a resilience/UX fix.
- **Acceptance:** with JS disabled, all page content is visible.

### 2.4 — LCP / preload
- Add `fetchpriority="high"` + a `<link rel="preload">` for the hero LCP image; never
  `loading="lazy"` the LCP image.
- **Acceptance:** PageSpeed Insights field data shows LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

### 2.5 — Self‑host fonts (removes render‑blocking Google Fonts)
- Download the woff2 for **Grenze Gotisch (700–900), Space Grotesk (400/500/700), Space Mono
  (400/700)**, place in `/assets/fonts/`, add `@font-face` rules with `font-display: swap`.
- Remove the Google Fonts `<link>` and the two `preconnect`s.
- **Then update the CSP** in `vercel.json`: drop `https://fonts.googleapis.com` from `style-src`
  and change `font-src https://fonts.gstatic.com` → `font-src 'self'`.
- **Acceptance:** no external font requests; text renders in the brand faces; CSP has no Google
  Fonts hosts.

---

## PHASE 3 — Entity, trust & content (the visibility engine)

> This is the part that gets you named by AI. The site is technically clean but currently a ghost:
> 0 mentions across tested buyer prompts. These build the missing brand/entity signals.

### 3.1 — Put a real face on the business (E‑E‑A‑T)
- Add a founder/team section to `about.html`: **real name, photo, short bio, credentials, LinkedIn.**
- Create the company **LinkedIn** and **YouTube** profiles; confirm the URLs, then add them to the
  `#org` `sameAs` array (2.1) and add the `Person` (`#founder`) node with `worksFor` → `#org`.
- **Acceptance:** a named human is on the site and wired into schema; `sameAs` URLs resolve.

### 3.2 — Reviews flywheel (never gated)
- Collect **3–5 genuine reviews/month** on **Google Business Profile, Clutch, G2, Trustpilot** —
  ask every client, gate/incentivize **no one** (gating is now bannable).
- Have the AI voice‑agent product fire a **compliant post‑job review request**.
- Once real reviews exist, add `AggregateRating`/`Review` sourced from those platforms.
- **Acceptance:** review count climbing at a steady cadence; ratings visible on third‑party sites.

### 3.3 — Claim the local trinity
- Create/verify **Google Business Profile** (narrowest accurate primary category; service‑area
  business with hidden address; 10+ photos), import to **Bing Places**, claim **Apple Business
  Connect**. Identical NAP everywhere.
- **Acceptance:** all three live with matching name/phone/URL.

### 3.4 — Get listed where AI cites (off‑site)
Priority: **Clutch → The Manifest → DesignRush → GoodFirms → G2 → Capterra → Trustpilot**, plus
AI‑tool directories (There's An AI For That, Futurepedia, Toolify, AI Agents Directory). Pitch to
earn placement in third‑party listicles (getvoip, CloudTalk, trade press). **Never self‑publish a
"best AI receptionist" list** — self‑serving "best X" pages get penalized.
- **Acceptance:** live listings on the top B2B directories.

### 3.5 — Build the winnable content (answer‑first, table‑rich, with original stats)
Create these pages/clusters (low‑competition, high‑intent). Lead each H2/H3 with a self‑contained
**40–80 word answer**, add comparison/price‑tier **tables**, and publish **original stats** (your
missed‑call math: SMBs miss ~6 of 10 calls; answering within 5 min ≈ 9× conversions).
- **Per‑trade voice‑agent pages** `/ai-voice-agent/[trade]` — start with **landscaping/lawn care**
  (quick win), then HVAC, plumbing, electrical, roofing. Each: emergency‑triage lead, missed‑call
  ROI calculator, call demo, "managed vs cheap DIY bot" table, FSM integrations, FAQ.
- **Cost guide** `/how-much-does-an-ai-receptionist-cost` — price‑tier table (DIY $25–199 vs
  managed $899+). (Cost queries fire AI answers most.)
- **Comparison pages** `/ai-receptionist-vs-answering-service` + factual `"[rival] alternative for
  trades"` (Smith.ai, Ruby, Dialzara, Rosie).
- **"You own the code, no monthly fees"** custom‑software page (your sharpest differentiator).
- **One YouTube demo** (missed‑call catch + booking); embed with `VideoObject`.
- **Acceptance:** pages live, answer‑first, in the sitemap, validating schema.

---

## Don't (traps to avoid)
- **Don't rebuild off static HTML into a JS/SPA framework "for SEO."** AI crawlers don't run JS —
  your static HTML is an A‑grade advantage. Protect it.
- **Don't treat `llms.txt` as a growth lever** (97% of sites get zero AI traffic from it). Keep the
  existing one as a hedge; never bill it as an AI‑ranking service.
- **Don't gate/incentivize reviews.** Ask everyone; steady velocity beats a burst.
- **Don't block AI crawlers** — your `robots.txt` correctly welcomes them; keep it.
- **Don't add schema expecting it to be a ranking/citation lever** — it's for correct entity
  understanding and rich‑result eligibility, not a hack.
- **Don't fake `lastmod` or chase #1 as if it still equals traffic** (~68% of searches are
  zero‑click; GEO is a high‑intent conversion play).

---

## Final acceptance checklist
- [ ] `https://gwhoundsweb.vercel.app/*` 308‑redirects to `https://gaelworx.com/*`
- [ ] Repo search for `gwhoundsweb.vercel.app` → 0 results
- [ ] `www` → apex redirect works; HSTS header present
- [ ] No `369` phone string anywhere; real number verified
- [ ] All meta descriptions ≤155 chars; one `<h1>` on the homepage
- [ ] `sitemap.xml` has `lastmod`; submitted in GSC + Bing; IndexNow live
- [ ] One valid `@graph` per page (0 errors in Rich Results Test); no dangling `@id`; no self‑serving ratings; no `SearchAction`
- [ ] Fonts self‑hosted; CSP updated; CWV all‑green
- [ ] Named founder + `sameAs` live; reviews flywheel started; GBP/Bing/Apple claimed
- [ ] First winnable pages shipped (landscaping page, cost guide) answer‑first with tables
