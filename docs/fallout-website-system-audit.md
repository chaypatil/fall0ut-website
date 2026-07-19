# Fallout Website System Audit

Audit date: 2026-07-18
Scope: current local `fall0ut.in` website project and its documented operating process
Method: targeted static inspection only; no web browsing, media inspection, package installation, website-code edits, or deployment

Finding labels used throughout:

- **VERIFIED**: directly confirmed in code, configuration, documentation, filenames, or Git metadata.
- **INFERRED**: strongly suggested by the inspected evidence but not explicitly confirmed.
- **UNKNOWN**: requires Chay's answer or later runtime inspection.

## 1. Executive summary

The current website is a polished but manually operated static site. Its strongest assets are a compact deployment model, an established visual language, responsive media, accessible carousel controls, and basic Vercel Analytics instrumentation. Its main weakness is not the absence of a backend; it is that changing one event requires synchronizing several copies of the same information inside `index.html`.

Five highest-impact findings:

1. **VERIFIED: Event information is duplicated across featured cards, calendar entries, announcements, stats, countdown attributes, and ticket routes.** This is the root cause of repeated edits and drift.
2. **VERIFIED: Event lifecycle is manual and currently stale.** On the audit date, IMHAPPY (17 July 2026) remains marked and displayed as upcoming. JavaScript updates countdown copy but cannot move or archive an event.
3. **VERIFIED: Project instructions are stale.** `AGENTS.md` still describes `fall0ut.xyz`, pending GitHub auto-deploy, and a Vercel CLI deployment workflow, while Git metadata shows the GitHub repository on `main`; no inspected instruction documents the current `fall0ut.in` setup.
4. **VERIFIED: Deterministic safeguards are absent.** There is no event schema, validator, link checker, asset checker, automated visual check, or deployment checklist in the repository.
5. **VERIFIED: The correct immediate architecture is still no-backend.** One structured event source plus a small renderer and validation scripts would eliminate most recurring work while preserving a clean migration path to a CMS and, much later, direct ticketing.

The recommended sequence is: establish a structured event source, derive every event surface from it, add deterministic validation, replace stale always-loaded context, and only then create a small set of task-specific Codex skills. A CMS, WhatsApp bot, payment system, and ticketing backend should wait for stable operations and business readiness.

## 2. Files inspected

Nine project files were inspected. Recent Git commit titles and Git remote/branch metadata were also inspected, without patches or full history.

| File | Purpose | Why inspected |
|---|---|---|
| `website/index.html` | Main page, event content, routes, and all main-page JavaScript | Live-page architecture, behavior, data, links |
| `website/moments.html` | F0 Moments archive page | Gallery behavior and media organization |
| `website/styles.css` | Shared styling and responsive rules | Actual design system and breakpoints |
| `website/vercel.json` | Vercel rewrites | Routes and hosting behavior |
| `website/AGENTS.md` | Repo-level operating instructions | Deployment and always-on context audit |
| `current-context.md` | Wider Fallout context | Facts, history, strategy, and stale-context audit |
| `website/.vercelignore` | Deployment exclusions | Asset and preview deployment behavior |
| `website/.gitignore` | Git exclusions | Local metadata and preview handling |
| `website/.vercel/project.json` | Vercel project linkage | Project identity only; no secrets inspected |

Not inspected:

- `.env.local`: **VERIFIED** present and ignored; deliberately not opened because no inspected code references environment variables and it may contain secrets.
- Media contents: **VERIFIED** only names, paths, counts, byte sizes, HTML dimensions, and code references were recorded.
- `node_modules`, build output, caches, previews, Git patches, and unrelated folders: not inspected.

Recent commit titles confirm repeated manual work around carousel behavior, ticket CTA wording, ticket messages, campaign highlighting, posters, moments media, contact typography, and footer links.

## 3. Verified current architecture

### Architecture map

```text
GitHub: chaypatil/fall0ut-website (main)
                  |
                  v
            Vercel project
          fall0ut-website
                  |
       static HTML + CSS + assets
                  |
      +-----------+------------+
      |                        |
  index.html               moments.html
      |                        |
 inline JS + events        static galleries
      |
 WhatsApp / Instagram / Vercel Analytics
```

| Area | Finding |
|---|---|
| Project type | **VERIFIED:** static web app; no framework, package manifest, bundler, or component system found. |
| Entry points | **VERIFIED:** `index.html` for the main experience and `moments.html` for the gallery. |
| Live controls | **VERIFIED:** `index.html`, `moments.html`, `styles.css`, `vercel.json`, and referenced files under `assets/`. |
| Hosting | **VERIFIED:** linked to Vercel project `fall0ut-website`; `vercel.json` supplies rewrites. |
| Source control | **VERIFIED:** GitHub remote `chaypatil/fall0ut-website`, branch `main`, synchronized with `origin/main` at inspection time. |
| Domain configuration | **VERIFIED:** no DNS records or `fall0ut.in` domain settings are stored in code. `AGENTS.md` contains obsolete `fall0ut.xyz` notes. **UNKNOWN:** current registrar and Vercel domain state are external. |
| JavaScript | **VERIFIED:** one large inline script in `index.html`; a small touch-state script in `moments.html`. |
| CSS | **VERIFIED:** one global stylesheet with tokens, component selectors, and five media-query groups. |
| Data | **VERIFIED:** event, announcement, stat, redirect, contact, and gallery data are hardcoded in HTML/JavaScript. No structured data files exist. |
| Backend/database | **VERIFIED:** absent. |
| Forms/APIs | **VERIFIED:** no forms or application API. External navigation goes to WhatsApp and Instagram. |
| Analytics | **VERIFIED:** Vercel Web Analytics script plus custom `window.va("event", ...)` calls for sections, links, carousel use, event views, and ticket clicks. |
| External URLs | **VERIFIED:** stored directly in HTML and inline JavaScript. Google Fonts, Instagram, WhatsApp community, and WhatsApp DM are used. |
| Main assets | **VERIFIED:** 59 files under `assets/`, about 31.87 MiB total. Hero media is about 16.6 MiB; moments and poster assets make up the rest. |
| Moment storage | **VERIFIED:** six homepage highlights in `assets/moments/`; archive images grouped under `assets/moments/events/{event}/`. |
| Backgrounds | **VERIFIED:** separate desktop/mobile MP4 and poster JPG files in `assets/hero/`. CSS also creates ambient gradients and grid texture. |
| Design documentation | **VERIFIED:** primarily implicit in `styles.css`; no current design specification exists. |

The HTML references checked during the audit all resolve to existing local assets. Thirteen assets are currently unreferenced, including old Continuum, Aiden, and Riana posters, three rejected highlights, legacy logo PNGs, and `fallout-stage-bg.jpeg`.

## 4. Current website behavior inventory

Runtime status below is based on direct implementation inspection, not a live browser run, because the audit explicitly prohibited web browsing.

| Section or interaction | Status | Implementation | Data dependency | Current manual work | Regression risk |
|---|---|---|---|---|---|
| Morphing hero and sticky wordmark | Working | `index.html` `updateScrollState`; CSS custom properties | Scroll position, wordmark asset | Preserve JS/CSS coupling | High |
| Fixed header with Events/Contact | Working | Header HTML; fixed/blurred CSS | Route map | Keep labels/routes synchronized | Medium |
| Header opacity and short gradient divider | Working | Scroll-derived CSS variables; `.site-header::after` | Scroll position | Visual checking | Medium |
| Desktop/mobile hero backgrounds | Working | Two video elements and media-query display | Four hero assets | Prepare two crops/posters | Medium |
| Hot Right Now campaign | Working | Hardcoded Steelworks article | Poster, copy, date, venue, route | Edit several literals | High |
| Featured events carousel | Working | Inline JS translate carousel | Four duplicated event cards | Add/remove/order cards manually | High |
| Automatic rotation | Working | 3-second timer, 5 seconds after manual use | Slide count | None unless behavior changes | Medium |
| Manual carousel controls | Working | Buttons, swipe/drag, trackpad, keyboard | Slide DOM | Visual/device QA | High |
| Pause and reduced-motion handling | Working | Pause button, media query, JS listener | Browser preference | Accessibility QA | Medium |
| Event image grayscale/color reveal | Working | Hover/focus/touch classes | Poster asset | Check mobile interaction | Medium |
| Countdown labels | Partial | Recomputed every 30 seconds | Duplicated ISO timestamps | Add timestamp in every surface | High |
| Event expiry/lifecycle | Broken | Countdown only changes label; classes remain hardcoded | Manual classes and placement | Manually remove/move/archive | Critical |
| Ticket backlinks | Working | `/go/:slug` rewrite, JS map, WhatsApp redirect | Slug, message, offer, phone | Update route map and all links | High |
| Ticket click attribution | Partial | Vercel custom event before 280 ms redirect; placement query | Analytics availability | Interpret Vercel reports | Medium |
| Rave Calendar | Working but stale-prone | Hardcoded month/event markup | Repeated event facts | Sort, classify, count manually | Critical |
| Current-month initial alignment | Partial | Hardcoded `data-current-month` and scroll positioning | Correct month marker | Move marker monthly | High |
| Stats strip | Partial | Four hardcoded numbers | Manual counts | Recount and edit | High |
| Announcements | Working | Four hardcoded cards | Repeated event copy | Rewrite and reorder | Medium |
| F0 Moments homepage preview | Working | Open accordion and six cards | Six fixed image paths | Replace files/markup manually | Medium |
| More Moments route | Working | `/f0moments` rewrite to `moments.html` | Vercel rewrite | Maintain route and page | Low |
| Moments archive | Working | Three static event sections, 28 images | Folder naming and markup | Add every figure manually | High |
| Join F0 Mob | Working | WhatsApp community link | One repeated URL | Update in multiple locations | Medium |
| Community popup | Working | Opens after 8 seconds; session dismissal; Escape/X | Repeated community URL/copy | Keep copy/link aligned | Medium |
| Contact actions | Working | WhatsApp DM, Instagram, community links | Repeated external URLs | Update literals | Medium |
| Smooth internal paths | Working | Vercel rewrites, History API, `scrollIntoView` | `sectionRoutes` and section IDs | Maintain two route lists | Medium |
| Image fallbacks | Absent | No `onerror`, fallback source, or generated placeholder | Assets | Prevent missing files before deploy | High |
| Reduced motion | Working | Disables video and near-eliminates transitions | OS/browser preference | Regression QA | Low |
| Footer | Working | Static brand-only footer | None | Minimal | Low |

The brief mentioned a Continuum event listing as an example to verify. **VERIFIED:** Continuum is present only as a past calendar item and as unused poster assets; it is not a current featured event.

## 5. Established design system

### Intentional established rules

| Token/rule | Current implementation |
|---|---|
| Base palette | `#01040a` background, `#030812` raised background, `#f4f8f6` ink, `#9aa5b4` muted, `#65728a` dim. |
| Accent | Variable named `--teal` but valued `#6f8dff`, a blue/periwinkle accent. This confirms the move away from literal teal. |
| Typography | DM Sans 400/500/700 for body; Barlow Condensed 500/600/700 for headings, navigation, labels, dates, and CTAs. |
| Letter spacing | Body `0`; compact uppercase utility text generally `0.18em` to `0.28em`; major headings `0.02em` to `0.16em`. |
| Width | Shared sections and header content cap at `1480px`; calendar intentionally breaks to full width. |
| Section spacing | `clamp(34px, 5vw, 74px)` vertically and `clamp(18px, 4.2vw, 80px)` horizontally. |
| Corners | Restrained `5px` to `6px` radii on framed surfaces; most sections/cards are square and borderless. |
| Borders | Mostly removed. Buttons and small controls retain subtle borders; header divide is a 3px short gradient. |
| Background | Near-black with restrained dark-blue gradients, faint grid texture, translucent raised panels, and occasional blur. |
| Header | Fixed, blurred, 58px minimum desktop height; 56px mobile; hero wordmark morphs into header brand. |
| Hero | Full-bleed video, responsive source, dark scrim, subtle blue bloom, centered wordmark. |
| Priority event | Two-column desktop, poster-first mobile, asymmetric low-opacity blue/purple shadow, discount bookmark. |
| Featured card | One full-width slide; poster/content split desktop; stacked on widths below 920px; 9:13 art on mobile. |
| Poster treatment | Featured posters grayscale by default and color on hover/focus/touch; focus poster remains color. |
| Moments preview | Desktop horizontal portrait rail with 4:5 cards; mobile two-column six-image grid plus wide CTA. |
| Moments gallery | 12-column desktop mosaic, 4:5 and 16:10 cards; two equal columns of 4:5 cards on mobile; full color. |
| Calendar | Horizontal month rail, snap scrolling, 300px/25vw cards desktop and up to 82vw at tablet widths. |
| Breakpoints | 1120px, 920px, and 760px layout breakpoints; hover-none and reduced-motion behavior queries. |
| Motion | Carousel 560ms easing; short 160-260ms interactions; reduced motion disables video and transitions. |

### Temporary, inconsistent, obsolete, or undocumented rules

- **VERIFIED temporary:** Steelworks is a single hardcoded focus campaign. The visual pattern may be reusable, but its data and status are not modeled.
- **VERIFIED inconsistent:** `--teal` is blue, so the token name no longer expresses its meaning. Rename later to `--accent`, not during routine content work.
- **VERIFIED inconsistent:** event order is IMHAPPY, Eczodia, Morfame, SHDW even though Morfame occurs before Eczodia.
- **VERIFIED inconsistent:** the stats strip says 28 past events while the calendar contains 26 `.is-past` entries.
- **VERIFIED obsolete:** CSS for `.is-tba` and `.calendar-status` exists but no current matching markup was found.
- **VERIFIED obsolete assets:** 13 local assets are unreferenced. They are harmless but increase archive ambiguity.
- **VERIFIED undocumented:** nearly all design decisions exist only in CSS and past commit titles, making Codex rediscover them on each design task.
- **UNKNOWN:** whether the hardcoded copy claim "India's hardest underground rave community" and "up to 20% off" should remain permanent public claims.

## 6. Context and documentation audit

### `current-context.md`

| Category | Content | Recommended home |
|---|---|---|
| Current facts | Positioning, active cities, current team, current community, current media performance | Short strategy/current-state document, manually dated |
| Permanent design rules | None beyond naming/identity language | Future design-system skill/reference |
| Repeatable workflows | Local archive path rule | Tiny project instruction file |
| Historical decisions | Origin story, old statistics, old collaborators, old team size | `docs/archive/brand-history.md` |
| Deprecated decisions | Clothing/drop strategy | Archive only |
| Future ideas | Culture platform positioning and strategic goals | Product strategy document |
| Open questions | No explicit decision log or owner/date fields | Future-platform planning document |
| Stale risk | Last updated 2026-06-24; performance/community figures decay quickly | Date and review cadence required |

**VERIFIED:** `current-context.md` is doing too many jobs. It combines live facts, positioning, historical memory, deprecated ideas, operating paths, and strategy. It should not be loaded for a poster swap or event-date correction.

### `AGENTS.md`

**VERIFIED current value:** identifies the project as a static Vercel app and records a health-check concept.

**VERIFIED stale/conflicting content:** it names `fall0ut.xyz`, says DNS is not configured, says GitHub auto-deploy is pending, and prescribes Vercel CLI production deployment. These details should not remain always-on because domain and deployment state change independently of most code tasks.

### Recommended documentation split

- Tiny always-on `AGENTS.md`: repository purpose, source-of-truth file routing, no unapproved production deploy, preserve established design tokens, and required validation command.
- `data/events.json`: all changing event facts.
- `data/site.json`: community URL, Instagram URL, WhatsApp contact, stats only if not derived.
- Design skill/reference: visual tokens, card proportions, breakpoints, interaction rules.
- Event operations skill: intake, lifecycle, poster integration, and approval points.
- Release-check skill: deterministic validation, local QA, deploy approval, post-deploy checks.
- `docs/product/future-platform.md`: WhatsApp bot, CMS, direct ticketing, payments, compliance, and admin ideas.
- `docs/archive/`: obsolete domains, historical stats, old campaigns, and deprecated plans.

## 7. Manual operations and leakage map

| Activity | Trigger and current steps | Files/data | Frequency/effort | Risk and human reason | Recommendation |
|---|---|---|---|---|---|
| Add event | Receive event facts; add featured card, calendar row, route, countdown, announcement, poster, and stats | `index.html`, `assets/` | Per event; 20-45 min | High; facts/copy/offer need approval | Eliminate repeated markup through one event record; retain approval |
| Update event | Find every duplicated literal and align it | `index.html` | Frequent; 10-25 min | High drift risk | One structured record |
| Expire/archive event | Remove from carousel, change calendar class, update stats/announcements | `index.html` | After every event; 10-20 min | Currently forgotten | Runtime/build classification from date |
| Update ticket offer/link | Change `/go` message, badges, note, and potentially copy | `index.html` | Ticket-phase dependent; 10-20 min | Money/public offer needs approval | Structured offer fields plus validator |
| Replace poster | Copy optimized file; update path/dimensions/alt; verify crops | HTML and `assets/` | Per asset; 10-30 min | Visual selection remains human | Asset workflow plus dimension checks |
| Add moments | Copy/optimize files; create every figure; choose wide cards | `moments.html`, `assets/moments/` | Per event; 20-60 min | Curation is cultural judgment | Manifest-driven gallery; retain curation |
| Adjust mobile layout | Modify shared media queries; inspect both pages | `styles.css`, HTML | Irregular; 20-90 min | High shared blast radius | Visual regression screenshots |
| Correct design drift | Rediscover CSS and old prompts/commits | `styles.css`, context | Frequent; high token use | Taste requires Chay | Design skill plus screenshots |
| Check expired info | Manually compare dates/copy/routes | `index.html` | Ideally daily; 5-15 min | Deterministic | Scheduled report and runtime lifecycle |
| Check broken links/assets | Click or inspect manually | HTML/JS/assets | Before deploy; 10-20 min | Deterministic | Validator/link checker |
| Update community/contact links | Change repeated URL literals | `index.html`, `moments.html` | Rare; 5-15 min | Simple approval | `site.json` |
| Deploy | Push `main` or use stale CLI instructions; wait and inspect | Git/Vercel | Per release; 10-20 min | Production action requires approval | One documented workflow |
| Check live site | Manually visit desktop/mobile and click flows | Production | Per release; 10-30 min | Some visual judgment | Automated smoke plus human visual sign-off |
| Repeat instructions to Codex | Restate typography, spacing, routes, and CTA rules | Conversation | Nearly every change | Context leakage | Skills and small source map |
| Rediscover files | Search the same three live files and large assets | Repo | Every task; token-heavy | Avoidable | Tiny architecture map and task file limits |

## 8. Event data and lifecycle audit

### Current representation

**VERIFIED:** there is no event entity. An event is an informal set of matching strings distributed across HTML and JavaScript.

| Field | Current support | Evidence/problem |
|---|---|---|
| ID/slug | Partial | Slugs exist only for five `/go` routes; past events lack IDs. |
| Event name | Yes | Repeated in cards, calendar, announcements, messages. |
| Organizer | No structured support | Sometimes embedded in names/copy. |
| City | Partial | Plain display string. |
| Venue | Partial | Plain display string; TBA is copy, not state. |
| Start date | Partial | Calendar `datetime`, display copy, and some countdown timestamps. |
| Start time | Partial | Only four featured/current events have timestamp data; Steelworks lacks time. |
| End date/time | Mostly absent | Protocol has a displayed date range but only one `datetime`; no end model. |
| Timezone | Implicit | Four timestamps use `+05:30`; no global timezone declaration. |
| Poster/mobile poster | Partial | One poster path per featured event; responsive layout crops same file. |
| Ticket URL | Partial | Internal route is repeated; final WhatsApp target is in JS. |
| Ticket phase | Absent | Offer labels exist but no sale phase/state. |
| Status | Partial/manual | CSS classes `is-past` and `is-upcoming`; not date-derived. |
| Featured status/order | Partial/manual | Presence and order in featured markup. |
| Lineup | Absent | Poster-only or event name/copy. |
| Description | Partial | Focus and announcements only. |
| Collaboration type | Absent | Not modeled. |
| Announcement state | Partial/manual | Presence in announcement section. |
| Sold out | Absent | No state or CTA behavior. |
| Cancelled/postponed | Absent | No state or display rule. |
| Archive visibility | Partial/manual | Past calendar and moments pages are separate hardcoded surfaces. |

Expired events require manual removal because CSS classes, carousel membership, announcements, stats, and calendar placement are authored as fixed markup. The countdown function only replaces text after start time; it does not mutate lifecycle, move markup, or recalculate counts.

### Minimum sensible lifecycle

Use `Asia/Kolkata` as the default timezone, with explicit override only when needed.

| State | Meaning | Automatic or approved transition |
|---|---|---|
| Draft | Incomplete/private record | Human creates and edits |
| Announced | Publicly approved but sales/details may be incomplete | Human approval required |
| Upcoming | Announced and start is in the future | Automatic from date |
| Live | Start passed and end/grace window has not passed | Automatic |
| Ended | End/grace window passed | Automatic |
| Archived | Ended and preserved in archive surfaces | Automatic visibility; human can override |
| Postponed | Date invalidated pending replacement | Human approval |
| Cancelled | Event will not occur | Human approval |
| Sold out | Inventory unavailable while event remains active | Human or future ticketing system |

For events without an exact end time, define `endsAt` when known; otherwise derive an operational end as the next local day at a fixed hour, clearly documented and overridable. Do not treat an unknown end as immediate expiry at start time.

### Architecture comparison

| Stage | Smallest sensible implementation | Benefits | Trade-off |
|---|---|---|---|
| No backend now | `data/events.json` plus a small browser renderer or static generation script; derive carousel, calendar, announcements, counts, routes, and archive | One source, automatic sorting/expiry, low cost, reversible | Requires a one-time refactor and schema validation |
| Lightweight CMS later | Headless CMS with validated event schema and role-limited editor; static build/webhook deployment | Non-code editing, drafts, media metadata | Vendor/admin complexity and content migration |
| Direct ticketing future | Backend database with immutable event IDs, inventory, orders, payments, tickets, settlements, audit log, and role-based admin | Transactional integrity and operations | High security, legal, compliance, and support burden |

The current JSON schema should use durable IDs and separate content from sales fields so records can migrate later without changing public slugs.

## 9. Automation opportunity table

| Automation | Problem/trigger | Implementation/home | Approval | Savings | Difficulty | Priority |
|---|---|---|---|---|---|---|
| Event sorting/classification | Build/load or current time | Date logic in renderer | No | High time/token | Low | Now |
| Expired event archiving | End/grace time passes | Runtime/build code | No, unless override | High | Low | Now |
| Event schema validation | Event data changes | Local/CI script | Blocks release | High | Low | Now |
| Missing asset check | Event/gallery data changes | Local/CI script | Blocks release | Medium | Low | Now |
| Duplicate event detection | Event data changes | Validator by ID/slug/date/name | Blocks release | Medium | Low | Now |
| Derived stats | Event data changes/time passes | Renderer | No | Medium | Low | Now |
| Card generation | Event record added | Renderer/templates | Human approves content | High | Medium | Now |
| Broken ticket-link check | Before deploy/daily | Script; treat WhatsApp URLs carefully | Report before deploy | Medium | Medium | Next |
| Image aspect/dimension validation | Asset added | Metadata script | Warning/block by rule | Medium | Low | Next |
| Mobile/desktop visual checks | Pull request/predeploy | Browser screenshots at fixed viewports | Human visual approval | High | Medium | Next |
| Deployment checklist | Release requested | Release-check skill plus script | Production approval | Medium | Low | Next |
| Expired copy detection | Daily/predeploy | Search rendered output for ended IDs/dates | Review report | Medium | Medium | Next |
| Community-link validation | Weekly/predeploy | HTTP health check | Review failures | Low | Low | Next |
| Placeholder generation | Missing poster approved | Deterministic image template | Human approves public use | Low | Medium | Later |
| Archive page generation | Event becomes archived | Renderer from event data | No unless hidden | High | Medium | Next |
| Live-site health check | After deploy and scheduled | HTTP/routes/assets smoke test | Alert only | Medium | Low | Next |
| WhatsApp workflow | Qualified inbound message | WhatsApp Business provider/backend | Human owns copy/escalation | Potentially high | High | Later |
| Direct-ticket workflow | Order/payment lifecycle | Secure backend and provider webhooks | Business/legal readiness | High eventually | High | Later |

## 10. Instruction classification

Each recurring rule has one primary home.

| Recurring instruction/rule | Best home | Reason |
|---|---|---|
| Active project path and source map | A. Always-on project rule | Needed in almost every task; keep under 15 lines |
| Never deploy without explicit approval | A. Always-on project rule | Applies to nearly every production task |
| Events use venue/city display format | D. Structured data/configuration | Values change; rendering rule stays stable |
| Event dates, status, order, featured state | D. Structured data/configuration | Content, not layout code |
| Ticket destination/message/offer | D. Structured data/configuration | Per-event changing information; money copy still approved |
| Automatically expire/archive/sort | C. Website code | Runtime/build behavior should be automatic |
| Derive stats and calendar groups | C. Website code | Same source should produce all surfaces |
| Visual tokens, proportions, interaction rules | B. Codex skill | Needed specifically for design implementation/review |
| Steps for adding/updating an event | B. Codex skill | Repeatable task workflow |
| Asset intake, optimization, crop, and naming | B. Codex skill | Repeatable media workflow |
| Release and post-deploy checks | B. Codex skill | Task-specific orchestration |
| Required fields, duplicate IDs, missing files | E. Validation script | Deterministic and cheaper than model reasoning |
| Screenshot sizes and layout assertions | E. Validation script | Deterministic browser checks |
| Daily expiry/link/health report | F. Scheduled automation | Time-triggered, report-first |
| Event selection, public claims, copy tone | G. Human approval | Cultural/public judgment |
| Discounts, pricing, WhatsApp messages | G. Human approval | Money and customer expectations |
| Production deployment | G. Human approval | Public and potentially irreversible |
| Payment, tax, privacy, refund policy | G. Human approval | Requires professional/business verification |

## 11. Proposed Codex skill map

Create no skills until structured data and validation exist; otherwise skills will encode the current duplication.

| Skill | Purpose and trigger | Inputs/output | Read boundary | Scripts/references | Timing/savings |
|---|---|---|---|---|---|
| `fallout-event-operations` | Add/update/postpone/cancel/archive an event | Intake facts -> validated event record and summary | Max 6: event schema, event data, site config, event template/renderer, validator, relevant instruction | `validate-events`; lifecycle reference | Now after data refactor; very high savings |
| `fallout-design-system` | Any visual/layout/component change | Request + screenshots -> scoped CSS/HTML change preserving rules | Max 5: design reference, CSS, affected template/page, optional screenshot manifest | Fixed viewport visual checks | Next; high savings |
| `fallout-asset-integration` | Poster, hero, or moments media added/replaced | Source paths -> optimized named assets and manifest update | Max 5 plus explicitly supplied media metadata; never scan whole archive | Dimension/size/aspect validator | Next; medium-high savings |
| `fallout-release-check` | User asks to preview, ship, or push live | Diff + validation -> release report; deploy only after approval | Max 8: changed files, config, validation output | Asset/link/schema checks, screenshot smoke, health check | Next; high safety/savings |
| `fallout-live-site-maintenance` | Broken route, stale event, or health alert | Alert -> diagnosis and narrowly scoped fix | Max 6 initially; expand only with reason | Health/link checker | Later when scheduled checks exist; medium savings |

Do not create separate skills for future-platform planning yet. Keep one product document until actual discovery work becomes frequent. Do not put campaign copy, live event records, domain state, or secrets inside skills.

## 12. Token-efficiency operating protocol

| Task | Default protocol | Maximum initial reads |
|---|---|---|
| Add event | Read schema, event data, site config, event-operations skill; validate; show changed record | 4 files plus supplied poster metadata |
| Change event info | Locate slug in event data; edit one record; validate affected output | 3 files |
| Change design | Read design reference, CSS, and affected template/component only | 3-5 files |
| Add moments | Read moments manifest, gallery template, asset rules; inspect only supplied assets | 3 files plus named assets |
| Check site | Run deterministic validation first; inspect files only for failures | 2 files before failures |
| Deploy | Read release skill, Git status/diff summary, config; run checks; request approval | 4 files |
| Plan future feature | Read future-platform document and only relevant schema/architecture file | 3 files |

Additional protocol:

1. Search filenames and identifiers before opening files.
2. Never load media directories or historical context for a routine event edit.
3. Prefer validator output over asking Codex to reason about missing fields or paths.
4. Keep routine completion summaries to changed records, checks, deployment state, and open approvals.
5. Expand beyond the stated file boundary only after explaining which unanswered question requires it.
6. Do not mix strategic history, current metrics, deployment instructions, and design rules in one always-loaded document.

## 13. Future-platform open loops

| Capability | Current classification | Prepare now | Do not build yet / dependencies |
|---|---|---|---|
| WhatsApp bot | Idea requiring product discovery | Durable event IDs, approved message fields | Provider setup, consent/privacy, escalation workflow |
| Community automation | Discovery required | Central community URL and campaign tags | Avoid unsolicited messaging; define operations first |
| Direct ticketing | Long-term product | Stable event schema and IDs | Explicitly wait for demand, operations, security, and business readiness |
| Payment gateway | Business/legal readiness | Keep ticket CTA abstraction independent of provider | Provider onboarding, professional tax/GST verification |
| GST dependency | Professional verification | Record as decision gate only | No legal/tax conclusion in code or this audit |
| Organizer onboarding | Product discovery | Model organizer and collaboration fields optionally | Identity, contracts, permissions, support process |
| Event submission | Product discovery | Draft state and validation schema | Moderation, spam, ownership, approval workflow |
| Inventory/capacity | Direct-ticket dependency | Reserve future field names only if documented | Transactional backend and concurrency controls |
| Ticket issuance | Direct-ticket dependency | Durable event/order IDs later | Secure backend, delivery, reissue, fraud handling |
| QR/check-in | Direct-ticket dependency | None now | Signed tokens, scanner operations, offline/retry behavior |
| Attendee data | Privacy/security readiness | Avoid collecting now | Consent, retention, access, breach response, professional review |
| Refunds | Business/legal readiness | None now | Policy, payment reconciliation, customer support |
| Settlements | Business/legal readiness | None now | Organizer agreements, accounting, audit trail |
| Analytics | Partially present | Event naming dictionary and non-personal funnel metrics | Do not build a personal tracking database without purpose/consent |
| Admin access | CMS/backend dependency | Draft roles in product doc | Authentication, authorization, audit logs |
| Security | Required before backend | Keep static attack surface small; never commit secrets | Threat model and security review before transactional work |
| Privacy/legal | Future gate | Minimize data collection | Professional verification before attendee/payment systems |
| Data storage | Backend decision | Use portable IDs/schema now | Database choice remains reversible until real requirements exist |

## 14. NOW / NEXT / LATER roadmap

### NOW

| Recommendation | Impact | Effort | Dependencies | Reversible | Manual/Codex reduction | Long-term support |
|---|---|---|---|---|---|---|
| Define `events.json` schema and migrate all event facts | Very high | Medium | Chay confirms fields/status rules | Yes | Very high | Foundation |
| Render featured, calendar, announcements, stats, countdowns, and routes from event data | Very high | Medium | Event schema | Yes | Very high | Strong |
| Implement automatic sort and lifecycle classification | Very high | Low-medium | End/grace rule | Yes | High | Strong |
| Add event/asset/duplicate validator | High | Low | Schema and paths | Yes | High | Strong |
| Replace `AGENTS.md` with a tiny current source map and approval rules | High | Low | Confirm deployment workflow/domain | Yes | High token savings | Neutral |
| Split historical/current/future context documents | Medium-high | Low | None | Yes | High token savings | Strong |

### NEXT

| Recommendation | Impact | Effort | Dependencies | Reversible | Manual/Codex reduction | Long-term support |
|---|---|---|---|---|---|---|
| Add moments manifest and generated gallery | High | Medium | Asset naming rules | Yes | High | Strong |
| Add link and image-metadata checks | Medium | Low-medium | Structured config | Yes | Medium | Strong |
| Add fixed desktop/mobile screenshot checks | High | Medium | Stable rendered pages | Yes | High | Strong |
| Create the five proposed skills, starting with event operations and release check | High | Medium | Data/scripts stabilized | Yes | Very high | Strong |
| Establish one Git/Vercel release workflow and post-deploy health check | High | Low-medium | Confirm auto-deploy behavior | Yes | Medium | Strong |
| Schedule report-only live health and stale-event checks | Medium | Medium | Validator/health script | Yes | Medium | Strong |
| Evaluate a lightweight CMS only if non-code event updates become frequent | Medium | Medium | Stable schema, editor requirements | Yes | Medium | Strong |

### LATER

| Recommendation | Impact | Effort | Dependencies | Reversible | Manual/Codex reduction | Long-term support |
|---|---|---|---|---|---|---|
| WhatsApp Business workflow | Potentially high | High | Funnel design, provider, privacy, staffing | Partly | High | Medium |
| Organizer submission/onboarding | High if demand exists | High | Moderation, roles, agreements | Partly | High | Strong |
| Direct ticketing discovery and architecture | Potentially transformative | High | Demand and operations evidence | Keep decisions reversible | Unknown | Core future goal |
| Payments, inventory, ticket issuance, QR check-in, refunds, settlements | Very high | Very high | Business/legal readiness, secure backend, support | Low once live | High | Core, but premature now |

## 15. Conflicts, risks, and technical debt

1. **Critical, VERIFIED:** expired IMHAPPY remains in upcoming surfaces on 18 July 2026.
2. **High, VERIFIED:** the past-event stat is 28 while only 26 past calendar entries exist.
3. **High, VERIFIED:** event facts and ticket behavior are duplicated across multiple blocks.
4. **High, VERIFIED:** event order is not chronological in the featured carousel.
5. **High, VERIFIED:** the current month is a hardcoded marker, so calendar landing will become stale monthly.
6. **High, VERIFIED:** unknown event end times have no defined expiry rule.
7. **High, VERIFIED:** no fallback exists for a missing poster; one missing file can create a blank/broken card.
8. **Medium, VERIFIED:** `AGENTS.md` deployment/domain instructions are obsolete and can cause incorrect production actions.
9. **Medium, VERIFIED:** `/go/:slug` is a client-side redirect through `index.html`; attribution depends on JavaScript and a short delay before leaving for WhatsApp.
10. **Medium, INFERRED:** analytics events may not always transmit before the 280 ms redirect; this requires runtime/network verification.
11. **Medium, VERIFIED:** community and contact URLs are repeated instead of centralized.
12. **Medium, VERIFIED:** 13 unused assets blur the distinction between archive and live assets.
13. **Medium, VERIFIED:** hero media accounts for over half the deployed local asset bytes; performance budgets are not enforced.
14. **Low, VERIFIED:** the accent token name `--teal` contradicts its blue value and current design language.

## 16. Questions requiring Chay's answer

1. What exact rule marks an event ended when no end time is supplied: a fixed number of hours after start, or a fixed next-day time?
2. Should ended events automatically remain visible in the calendar archive, and should all of them receive a dedicated archive/detail page?
3. Is "announced" distinct from "upcoming" in public UI, or only an internal workflow state?
4. Which events count toward the public "Past events" statistic, given the current 28-versus-26 mismatch?
5. Should `Hot Right Now` always contain exactly one event, and can that event also appear in the featured carousel?
6. Are discount amount, wording, expiry, and ticket category required fields for every promoted ticket offer?
7. Is WhatsApp number `+91 95168 94286` the permanent shared business destination, or a temporary personal number?
8. Are the community claims "India's hardest" and "up to 20% off" approved permanent copy or campaign copy requiring periodic review?
9. Is GitHub-to-Vercel auto-deploy now the only production path, or is CLI deployment still intentionally supported?
10. Should `fall0ut.xyz` redirect to `fall0ut.in`, remain independently active, or be retired?
11. Who besides Chay may approve public event facts, discounts, copy, and production deployment?
12. For F0 Moments, what determines which images are homepage highlights and which archive cards are wide?

Unanswered questions count: **12**.

## 17. Proposed future folder structure

```text
website/
  AGENTS.md                         # tiny source map + approval rules only
  index.html
  moments.html
  styles.css
  vercel.json
  data/
    events.json                     # single event source of truth
    site.json                       # social/contact/community configuration
    moments.json                    # curated gallery manifest
    schemas/
      event.schema.json
      moments.schema.json
  js/
    app.js                          # routing, lifecycle, analytics, interactions
    events.js                       # rendering and derived views
    moments.js                      # gallery rendering
  assets/
    brand/
    hero/
    events/
      {event-slug}/
        poster.webp
        poster-mobile.webp          # optional
    moments/
      {event-slug}/
  scripts/
    validate-events.mjs
    validate-assets.mjs
    check-links.mjs
    smoke-site.mjs
  docs/
    fallout-website-system-audit.md
    design-system.md
    operations/
      release.md
    product/
      future-platform.md
    archive/
      brand-history.md
      deployment-history.md
  .agents/
    skills/                          # create only after data/scripts stabilize
```

This structure is a target, not a recommendation to move every file immediately. Start with `data/events.json`, its schema, and validation; move other concerns only when they are actively changed.

## 18. Appendix: exact repeated instructions and where they currently live

| Established instruction | Current location/evidence | Future single home |
|---|---|---|
| Use Events and Contact in the top navigation | `index.html` header | Website template/code |
| Keep the hero wordmark morphing into the sticky header | `updateScrollState` plus header/hero CSS | Website code; documented in design skill |
| Keep separate mobile and desktop hero media | Hero markup, `assets/hero/`, 760px CSS query | Website code/data; asset skill |
| Use near-black with dark ambient blue | CSS root/body/hero/focus backgrounds | Design reference/skill |
| Use DM Sans body and Barlow Condensed uppercase display text | Google Fonts links and CSS | Design reference/skill |
| Avoid visible section border lines | Borderless panels; short header gradient only | Design reference/skill |
| Featured events rotate automatically and remain manually controllable | Carousel HTML/JS/CSS; recent commits | Website code |
| Use 3 seconds initially and 5 seconds after manual interaction | Carousel constants | Website code |
| Use `Get tickets` as the standard event CTA | Focus and featured markup; recent commits | Website renderer |
| Route ticket interest through per-event WhatsApp messages | `goRoutes` map | Event structured data plus route code |
| Show per-event discount bookmarks and explanatory note | Event/focus markup and CSS | Event structured data plus renderer |
| Format event location as venue/city | Featured and calendar strings | Structured event fields plus renderer |
| Posters are grayscale until interaction; gallery images stay full color | Event/gallery CSS | Design skill/code |
| Homepage F0 Moments contains six highlights then More Moments | `index.html` moments preview and mobile CSS | `moments.json` plus renderer |
| More Moments opens a separate internal page | `vercel.json`, homepage CTA, `moments.html` | Website routing |
| Community uses WhatsApp and contact uses WhatsApp/Instagram | Repeated main-page links | `site.json` |
| Preserve accessible controls and reduced-motion behavior | ARIA labels, keyboard events, reduced-motion rules | Website code plus release validation |
| Deploy on Vercel from the GitHub repository | Git remote, Vercel metadata; stale `AGENTS.md` conflict | Tiny current release document after confirmation |

### Confidence summary

- **Verified findings:** high confidence for local architecture, code behavior, data duplication, assets, design tokens, Git remote/branch, and documentation conflicts.
- **Inferences:** the site is likely deployed by GitHub-to-Vercel auto-deploy and analytics delivery may race the WhatsApp redirect; both require external verification.
- **Unknowns:** the 12 decisions in Section 16, current DNS/domain state, actual Vercel production settings, analytics plan/retention, and live runtime behavior.
- **Files that may need inspection later:** current Vercel project/domain settings, GitHub/Vercel integration settings, any external analytics dashboard, and `.env.local` only if a future task proves it is relevant. No additional website source file is required for this audit.
