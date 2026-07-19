# Fallout Website Operating Handoff

Last updated: 2026-07-19

## Read This First

You are now responsible for ongoing edits and sensible workflow automation for the live Fallout website.

This is an execution role. When Chay requests a website edit, do not stop after modifying local files.

Unless Chay explicitly says **preview**, **local only**, **do not publish**, or **hold deployment**, completion means:

1. Inspect the relevant existing code and preserve established behavior.
2. Make the requested edit in the active repository.
3. Run appropriate local checks and inspect desktop/mobile behavior when relevant.
4. Commit the intentional files to Git.
5. Push the commit to `origin/main`.
6. Allow the connected Vercel project to deploy.
7. Verify the production result on `fall0ut.in` and important affected links.
8. Tell Chay what changed, what was verified, the commit, and whether production is live.

A local-only edit is **not finished** unless Chay explicitly requested a preview or local draft. If pushing or deployment fails, report the exact blocker instead of presenting the local change as complete.

Do not create a preview by default. Chay will ask for one when he wants one.

## Active Project

- Canonical repository: `C:\Users\chait\OneDrive\Documents\Fall0ut\website`
- GitHub remote: `https://github.com/chaypatil/fall0ut-website.git`
- Production branch: `main`
- Hosting: Vercel project `fall0ut-website`
- Primary domain: `https://fall0ut.in`
- Main source files:
  - `index.html`: main page, event markup, routes, and main JavaScript
  - `moments.html`: F0 Moments archive page
  - `styles.css`: shared visual system and responsive behavior
  - `vercel.json`: clean routes and rewrites
  - `assets/`: brand, event, hero, and moments media
- Systems audit: `docs/fallout-website-system-audit.md`

This canonical folder was intentionally created on 2026-07-18 by copying the complete Fallout project from `Claude\Projects\Fallout` into `Documents\Fall0ut` and byte-verifying the contents, including Git history. It is now the single active location for Codex and Claude Code.

The older copy at `C:\Users\chait\OneDrive\Documents\Claude\Projects\Fallout\website` is a frozen archive, not a second active workspace. Never edit, test, commit, or deploy from it. Its parent folder contains `ARCHIVED-READ-ME-FIRST.md` confirming the move. If a task starts in the archived folder, stop and direct it to `C:\Users\chait\OneDrive\Documents\Fall0ut`.

At handoff time, the canonical repository is on `main`, synchronized with `origin/main`, but has uncommitted local changes in `index.html`, `moments.html`, `styles.css`, and `vercel.json`, plus an untracked `docs/` directory. These changes came from the attempted IMHAPPY removal/event-archive task described below. Do not delete, overwrite, or blindly commit them. Review and test them first. Check Git status again before every task because another chat may have made newer changes.

## Current Recovery Incident

Chay asked the previous chat to remove IMHAPPY, restore automatic carousel movement, automatically remove ended events from promotion, and preserve them on permanent event pages accessible through the Rave Calendar.

What actually happened:

- The previous chat correctly edited the canonical new project folder, but stopped at local files.
- It confirmed a `file://` preview, not the production website.
- It claimed IMHAPPY was removed without committing, pushing, waiting for Vercel, or checking `fall0ut.in`.
- The live website therefore continued showing the previous deployed build.
- The chat then speculated that `fall0ut.in` might use another Vercel project. That claim was not established and was partly caused by the stale domain notes in `AGENTS.md`.

What the current local diff contains:

- IMHAPPY references are removed from current website code. Historical mentions remain only in the systems audit.
- Featured Events now contains Eczodia, Morfame, and SHDW.
- Carousel constants still specify 3-second automatic rotation and 5 seconds after manual interaction.
- New client-side lifecycle logic classifies calendar entries by date and removes expired featured slides.
- New `/event/:slug` routing and permanent event-page rendering were added.
- New event-detail/gallery CSS and a Vercel rewrite were added.
- The implementation is uncommitted, undeployed, and not yet accepted as production-ready.

The next responsible chat must begin by reviewing this diff in the canonical repository. It should verify carousel auto-rotation, manual controls, date classification, event-page routes, browser history, direct page loads, mobile behavior, and all ticket links. If the implementation is sound, finish it through commit, push, Vercel deployment, and production verification. If it is flawed, fix it in place without reverting unrelated user work.

Never use a local preview as proof of a live change. Production confirmation requires the deployed commit and a successful check of the affected `fall0ut.in` route.

## Product Context

Fallout / fall0ut / F0 / FØ is an Indian underground hard-techno and rave-culture platform. The website currently serves as:

- an events landing page
- a ticket enquiry destination
- a rave calendar and past-event record
- an FØ Moments culture/archive surface
- a WhatsApp community entry point
- a brand and cultural identity surface

The current website is intentionally a static v1. Do not introduce a backend, CMS, payment system, database, or large framework unless Chay asks and the operating need justifies it.

## Current Architecture and Known Weakness

The site is static HTML/CSS/JavaScript deployed on Vercel. There is no backend or database.

Event data is currently duplicated inside `index.html` across:

- Hot Right Now
- Featured Events
- Rave Calendar
- Announcements
- countdown timestamps
- event statistics
- `/go/:slug` ticket routes
- WhatsApp messages and discount metadata

This duplication is the main source of stale events, ordering mistakes, repeated edits, and excessive Codex work.

Known concrete problems from the audit:

- IMHAPPY remained marked as upcoming after its event date passed.
- The public past-events statistic says 28 while the calendar contains 26 past entries.
- Featured event order is not strictly chronological.
- The current calendar month is manually marked.
- `AGENTS.md` contains stale `fall0ut.xyz` and deployment notes.
- There is no deterministic validation for dates, links, duplicates, missing posters, or event lifecycle.

Fix these through structured data and deterministic behavior when doing so is the smallest sensible next step. Do not repeatedly patch the same fact in several HTML blocks forever.

## Established Website Rules

Treat these as locked defaults unless Chay explicitly changes them.

### Brand and visual language

- Near-black base with a restrained dark ambient blue/periwinkle tint.
- Avoid beige, flashy gradients, decorative blobs, excessive shine, and generic AI-looking styling.
- DM Sans is the body font.
- Barlow Condensed is used for uppercase headings, navigation, dates, labels, and compact CTAs.
- Text spacing must remain readable; body letter spacing is zero.
- Sections should not be divided by visible border lines.
- The header-to-body division uses only a very short gradient transition.
- Corners remain restrained, generally 5-6px when framing is needed.
- Do not add nested cards or marketing-style explanatory copy.
- Maintain a professional, restrained, club/editorial feel inspired by BCCO and Feral without copying them directly.

### Header and hero

- Keep the Fallout hero wordmark and its scroll morph into the fixed header.
- Keep Events and Contact in the top navigation; mobile navigation must stay uncluttered.
- Keep separate desktop and mobile hero video assets and poster fallbacks.
- Preserve reduced-motion behavior that disables hero video and near-eliminates transitions.
- The hero should remain full-bleed and dark enough for the wordmark to read clearly.

### Hot Right Now

- This is the one priority campaign slot for the event Fallout most needs to market.
- Heading is `Hot Right Now🔥` unless Chay changes it.
- Do not add mechanical subtitles such as “priority drop” or “in focus.”
- Keep the subtle uneven purple-blue shadow behind the feature.
- The current priority campaign is Steelworks Festival until Chay replaces it.

### Featured Events

- Keep the section name `Featured events`.
- One event occupies the carousel viewport at a time.
- Automatic rotation starts at 3 seconds.
- Manual swipe, drag, trackpad, keyboard, previous/next, and pause controls remain available.
- After manual interaction, automatic rotation uses 5 seconds.
- Preserve reduced-motion pause behavior and accessibility labels.
- Do not remove manual navigation when maintaining auto-rotation.
- Standard CTA text is exactly `Get tickets` unless Chay explicitly supplies different wording.
- Event display location follows `venue / city`.
- Event posters are grayscale by default and reveal color on hover, focus, or touch.
- Touch behavior must work on mobile without forcing navigation merely to reveal color.
- Discount badges and copy must match Chay's approved offer exactly. Do not invent ticket claims.

### Current ticket routing

- Event ticket interest currently goes through internal `/go/:slug` routes and then to WhatsApp with event-specific prefilled messages.
- The currently established offers are:
  - Morfame: flat Rs 300 off
  - Eczodia: up to Rs 150 off
  - SHDW: up to Rs 150 off
  - Steelworks: up to Rs. 700 off
- Do not change discounts, phone numbers, wording, or destinations without Chay's approval.
- Continue using Vercel Analytics events and route attribution for non-personal click/funnel measurement.
- The linked Vercel account currently exposes page-view metrics but not the custom-event metric. Route totals such as `/campaign/:event/:channel`, `/event/:slug`, `/calendar`, `/f0moments`, `/go/:slug`, and `/out/:target/:placement` remain visible on the current plan; the custom Events panel requires Pro or Enterprise.
- Campaign attribution is retained through the same browser session and added to ticket/outbound routes and custom events.
- Use `docs/fallout-analytics-playbook.md` for the dashboard path map, Steelworks Instagram links, and weekly review workflow.
- Do not build personal tracking or a leads database without a clear purpose, consent model, and a separate approved task.

### Calendar and announcements

- Public name is `Rave Calendar` inside the page, but the top navigation stays `Events`.
- Event presentation uses venue/city consistently.
- Do not display meaningless TBA placeholders. When Chay explicitly supplies `TBA` as the venue, display exactly `TBA / city` and never spell out the abbreviation.
- Announcements contain audience-facing event copy, not developer notes, platform names, or implementation labels.
- Past events should be preserved rather than deleted once lifecycle automation exists.

### FØ Moments

- Homepage shows six selected, full-color highlight images.
- The first highlights should maintain inclusive representation when suitable approved images exist.
- The CTA leads to a separate internal moments page, not an endlessly expanded homepage section.
- The gallery is grouped by event and remains full color.
- Homepage moments use a compact mobile two-column layout with a wide final CTA.
- Gallery images must be intentionally selected and optimized. Never dump an entire drive or raw multi-gigabyte archive into the repository.
- The Instagram CTA uses `@fall0utindia` and links to the actual profile.

### Community, contact, and footer

- Contact styling remains minimal, uppercase, and compact.
- Contact actions are WhatsApp DM, `@fall0utindia`, and Community.
- The footer stays minimal with `FALL0UT India` only unless Chay asks for more.
- Community currently points to the approved WhatsApp group link.
- Do not add duplicate WhatsApp rows or invent labels.

## Default Execution Protocol

For every requested website edit:

1. Read Git status first and preserve changes made by Chay or another chat.
2. Locate the smallest affected code/data surface.
3. Confirm dates, links, public claims, discounts, and supplied media paths from Chay's request.
4. Implement the complete behavior, including mobile and accessibility states where relevant.
5. Check for broken local asset references and console/runtime errors.
6. Test affected routes and interactions at desktop and mobile sizes.
7. Review the diff for accidental copy, layout, or metadata changes.
8. Commit only intentional files with a clear message.
9. Push `main` unless Chay explicitly requested a preview/hold.
10. Verify Vercel deployment and the affected production experience.

Do not say “live” merely because files were edited. Do not tell Chay to perform Git operations that the chat can perform itself. Ask only when credentials, an external account action, or a meaningful product decision blocks execution.

## Automation Roadmap

Automation should be introduced when it removes repeated work without prematurely rebuilding the platform.

### Automate now

1. **One structured event source**
   - Add each event once with slug, name, city, venue, dates, timezone, poster, status, featured order, announcement copy, ticket message, and offer.
   - Generate Featured Events, Rave Calendar, Announcements, countdowns, statistics, and `/go` routing from that source.

2. **Automatic event lifecycle**
   - Sort by date.
   - Stop showing ended events as upcoming.
   - Remove ended events from the featured carousel automatically.
   - Preserve them in the past-events archive.
   - Support announced, upcoming, live, ended, archived, postponed, cancelled, and sold-out states.
   - Use `Asia/Kolkata` by default.

3. **Automatic statistics**
   - Derive past events, upcoming events, cities, and related counts from the same event source.

4. **Event validation before deployment**
   - Detect missing required fields, invalid dates, duplicate slugs, missing posters, broken internal routes, missing WhatsApp messages, expired events still marked upcoming, and inconsistent offers.

5. **Central site configuration**
   - Store the Instagram profile, WhatsApp contact, WhatsApp community, and other repeated site links once.

### Automate next

6. **Moments manifest and gallery generation**
   - Define selected images and layout metadata once per event and generate gallery markup.

7. **Asset checks**
   - Validate image size, format, dimensions, aspect ratio, and naming before deployment.

8. **Desktop/mobile visual checks**
   - Capture fixed viewport screenshots and check for overflow, blank images, overlapping text, and broken interactions.

9. **One release workflow**
   - Validation, preview when requested, explicit change review, commit, push, Vercel status, live smoke test, and concise release report.

10. **Scheduled health checks**
   - Report broken routes, missing assets, stale upcoming events, and unavailable community/ticket destinations.

### Automate later, only when justified

- lightweight event admin/CMS
- WhatsApp Business bot and lead workflow
- private sales dashboard
- organizer event submissions
- direct payments and ticketing
- inventory, ticket issuance, QR check-in, attendee records, refunds, and settlements

These later systems require product discovery, operating ownership, security/privacy work, and where relevant business/legal/tax verification. Do not build them merely because they are possible.

## Human Approval Boundaries

Always require Chay's decision for:

- which event is Hot Right Now
- event facts that are missing or contradictory
- public announcement copy and cultural positioning
- discounts, prices, ticket categories, and customer promises
- changing WhatsApp numbers, social handles, or community destinations
- collecting personal customer data
- payment, refund, settlement, tax, or compliance behavior
- removing archive material permanently
- redesigning established visual rules

When Chay directly requests a normal website edit, that request includes permission to implement and publish it unless he says preview/hold/local-only. Do not ask for redundant deployment confirmation after completing the requested change.

## Immediate Recommended Next Engineering Work

The next structural improvement should be the event-data refactor, not another framework rewrite:

1. Define a small event schema and confirm the unresolved lifecycle rules with Chay.
2. Move current events into one structured source.
3. Render featured cards, calendar entries, announcements, counts, countdowns, and ticket routing from that source.
4. Add deterministic validation.
5. Verify visual parity before publishing.
6. Then create sharp project skills for event operations, asset integration, design-system maintenance, and release checking.

Read `docs/fallout-website-system-audit.md` for the full evidence, open questions, proposed folder structure, and detailed automation map.

## Required Completion Report

For each completed task, report:

- what changed
- what was tested
- commit hash
- push/deployment status
- live URL or affected route
- any remaining blocker or decision

Keep this concise. Never call local-only work complete when Chay asked for a live website edit.
