# kpsglobal.id

Public website of **KPS Global Solutions** (PT KPS Global Solutions): independent advisory
on commodity deal structuring and Fractional COO leadership. Live at <https://kpsglobal.id>.

The site is built with Vite, React, TypeScript, Tailwind and shadcn/ui, and
prerendered with [vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg):
every page is a ready HTML file with its own text and meta tags, so search engines
and link previews (LinkedIn and others) see the content without running JavaScript.

## Pages, languages and addresses

English lives at the root, Russian under `/ru/`, Chinese under `/zh/`, e.g.
`/services/deal-structuring/`, `/ru/services/deal-structuring/`, `/zh/services/deal-structuring/`.

| Page | Path |
|------|------|
| Home | `/` |
| Services overview and the two lines | `/services/`, `/services/deal-structuring/`, `/services/fractional-coo/`, `/services/compliance-kyc/` |
| About (founder, history, governance, company details) | `/about/` |
| Contact form | `/contact/` (accepts `?topic=…` and `?docs=<slug>,<slug>`) |
| Privacy policy | `/privacy/` |
| Commodities (list and one page per commodity) | `/commodities/`, `/commodities/<aluminium\|lng\|sulphur\|copper\|diesel>/` |
| Insights, news and procedures (lists, one page per item) | `/insights/`, `/news/`, `/procedures/` and `/<section>/<slug>/` |
| RSS (insights and news per language) | `/feed.xml`, `/ru/feed.xml`, `/zh/feed.xml` |
| Mandates (list and one page per mandate) | `/mandates/`, `/mandates/<id>/` |
| Documents (library by group, one page per document) | `/documents/` (accepts `?group=…`), `/documents/<slug>/` |

The page list is `PAGE_PATHS` / `COLLECTION_PATHS` in `src/i18n/locales.ts`; the matching
components are in `src/App.tsx`. The language comes from the address only.

## Facts and texts

- Every figure, contact, address and legal detail comes from `src/data/canon.ts`.
  Texts use `{placeholders}` instead of repeating values.
  A canon field set to `null` hides the block that needs it.
- Interface strings live in `src/i18n/strings/{en,ru,zh}.ts`; every key exists in all three
  (checked by `src/test/content.test.ts`).

## Publishing an article or a news item

Add a folder with up to three files and push:

```
content/insights/<slug>/en.md   required: every field
content/insights/<slug>/ru.md   optional: title, description, draft
content/insights/<slug>/zh.md   optional: title, description, draft, reviewed
content/news/<slug>/…           same, with the news fields
content/procedures/<slug>/…     same, with the procedure fields; translations repeat the steps
```

`en.md` frontmatter — insight: `title`, `description` (≤ 160 chars), `date` ("YYYY-MM-DD"),
`line` (deals | operations), `commodity` (aluminium, lng, sulphur, copper, diesel),
`linkedinUrl?`, `cover?` (a PNG/JPG in `public/`), `draft`, `reviewed`.
News: `title`, `description`, `date`, `kind` (mandate | service | document | event),
`related?` (["insights/<slug>"]), `cover?`, `draft`, `reviewed`.
Procedure: `title`, `description`, `audience` (buyer | seller | investor, or a list), `commodity` (empty: every commodity),
`supplier?` (a code such as `S-01`), `basis?` (an Incoterms 2020 rule), `version` ("1.0"), `updated`,
`steps` (each: `title`, `actor`, `document`, `receives`), `draft`, `reviewed`;
ru.md / zh.md carry translated `steps`, the same number as en.md. Schemas: `src/content/schema.ts`.

```sh
npm run procedure:new -- --commodity sulphur --supplier S-01 --basis FOB   # draft skeleton in content/procedures/sulphur-s-01/
npm run procedure:update -- sulphur-s-01   # copies the current files to content/procedures/_archive/sulphur-s-01/<date>/, raises the version
```

Folders starting with `_` are not published. Each procedure page has a "Request procedure form" button
that opens the contact form with the procedure as the topic.

Commodity pages live in `content/commodities/<id>/{en,ru,zh}.md` — all five commodities in all three
languages are required. Full format: `title`, `description`, `summary`, `checks`, `structure`
(`basis`, `payment`, `inspection`), `route` (steps with `title`, `detail`), `stalls`; the Markdown body
describes the deal from the buyer's side. Short format (`format: short`): `title`, `description`,
`summary` and a two-paragraph body; the origin and screening line is added by the site.
Related insights, procedures and open mandates are linked by `commodity`.

### Mandates

`content/mandates/<id>/en.md` (folder: the id in lowercase, e.g. `kps-m-2026-001`) with exactly these
fields: `id` (KPS-M-2026-001), `side` (supply | demand), `commodity`, `volume`, `basis` (an Incoterms 2020
rule), `originRegion` (Gulf | Central Asia | Southeast Asia | Other), `instrument` (DLC | SBLC | DLC or SBLC),
`status` (open | in-work | closed), `published`, `validUntil`, `draft`, `description` (≤ 200 chars).
`ru.md` / `zh.md` carry only `description` and `draft`. No text outside the frontmatter.

Any other field stops the build, as do currency signs and the words price, discount, below, LME,
цена, скидка, 价格 next to a number (reported as `file:line`). Counterparty names listed in a local
`_internal/blocked-names.json` (not in the repository) are rejected too; without that file the check
is skipped. A mandate past `validUntil` is shown as closed. Each open mandate gets a news item
(`/news/mandate-<id>/`) and an RSS entry generated from its data. `/mandates/` stays `noindex` and
out of the sitemap until a mandate is published.

Rules: `draft: true` in en.md keeps the item off the site; a Russian file is published unless
it is a draft; a Chinese file only with `reviewed: true`. Without its own text a language shows
the English one under its interface, with canonical pointing at the English page and no hreflang
for that language. Markdown is rendered without raw HTML; the body starts at `##`; images must be
files in `public/`.

`npm run content:check` validates all content without building (file › field: reason).
The build fails on the same problems. A list page (`/insights/`, `/news/`) stays `noindex` and out
of the sitemap until its first item is published. Internal links in Markdown (`/…`) open through
the site's navigation; external links open in a new tab. Link previews: `cover`, else an image generated at
build time (`dist/og/<slug>-<lang>.png`). Every other indexed page gets its own preview drawn from its
title after prerendering (`dist/og/page-<path>-<lang>.png`); pages that are not indexed use `og-image.png`.

Fonts are self-hosted (`src/styles/fonts.css`, Noto Sans SC under `/fonts/noto-sans-sc/` on
`/zh/` pages only); pages make no requests to third-party servers.

## Documents

The site describes documents; it never serves them. `content/documents/<slug>/{en,ru,zh}.md`:
`title`, `group` (counterparty-pack | standard-forms | engagement | services | checklists),
`issuer` (kps | counterparty | supplier), `dealStep`, `summary` (≤ 220 chars), `contents` (list),
`version`, `date`, `access` (on-request | preview), `previewPages?`, `draft`, `reviewed`; ru.md / zh.md
carry `title`, `dealStep`, `summary`, `contents`, `draft`, `reviewed`. The body says what the document is.
A published card may not contain "TODO". "Request" opens `/contact/?docs=<slug>` with the document ticked.

Source files are kept outside the repository, in `_internal/documents/<slug>/<slug>.pdf`.

```sh
npm run docs:preview -- before-payment
#   → public/docs-preview/before-payment/page-N.webp: 1200 px images with a diagonal
#     "kpsglobal.id · PREVIEW · NOT FOR USE" watermark and a footer line, no text layer.
#     Only for documents with access: preview.

npm run docs:issue -- --doc mutual-nda --to "Acme Trading Ltd" --person "J. Doe"
#   → _internal/issued/KPS-YYYYMMDD-NNN_mutual-nda_acme-trading-ltd.pdf: recipient, date and
#     number on every page; editing and copying are forbidden with an owner password;
#     a row in _internal/issued/register.csv (number, date, document, version, recipient).
```

`docs:issue` needs [qpdf](https://qpdf.readthedocs.io) (`brew install qpdf`) and `KPS_PDF_OWNER_PASSWORD`
in `.env.local`; without either it stops and writes nothing.

`npm run docs:audit` lists published cards (`draft: false`) that have no source (PDF or DOCX) in
`_internal/documents/<slug>/` and exits with code 1 if there are any. Without the `_internal` folder
(e.g. in CI) it is skipped with a warning. It is not part of the build.

Checks on every build and `content:check`: no `.pdf`, `.doc`, `.docx` or `.xlsx` in `public/` or `dist/`;
no `file`, `origin` or `producer` field anywhere in `content/`; texts in `content/` are checked against a
local `_internal/blocked-names.json` when it exists.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
cp .env.example .env.local   # then set VITE_FORMSPREE_ENDPOINT
npm run dev                  # http://localhost:8080
```

`npm run dev` renders in the browser. To see the prerendered result, build and preview.

## Build

```sh
npm run lint
npm run test
npm run build     # static site in dist/ (first checks for "name 2.ts"-style copies: npm run check:dupes)
npm run test:e2e  # browser checks on the built site, uses the local Google Chrome
npm run preview   # serves dist/ the way GitHub Pages does, incl. 404
```

`npm run build` writes one folder per page (`dist/ru/privacy/index.html`),
`dist/404.html`, and generates `dist/sitemap.xml` and `dist/robots.txt`
from the page list.

## Contact form

The form posts to [Formspree](https://formspree.io). The endpoint is read from
`VITE_FORMSPREE_ENDPOINT` at build time: `.env.local` locally, the repository
variable `VITE_FORMSPREE_ENDPOINT` (Settings → Secrets and variables → Actions →
Variables) in CI. Without it the form shows the email address instead of the submit button.

Fields: name, company, country, email, role (buyer, seller, investor, intermediary, other), commodity,
documents (several), topic, message, consent.

## Publishing

A push to `main` runs `.github/workflows/deploy.yml`: `npm ci`, `npm run build`,
then the `dist/` folder is deployed to GitHub Pages under the domain in `CNAME`.
Work happens in feature branches; merging into `main` publishes the site.
