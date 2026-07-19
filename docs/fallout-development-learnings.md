# FallØut Website Development Learnings

Last updated: 2026-07-20

This file records durable product and implementation rules discovered while changing the live site. Read it before design, SEO, event-page or release work. Update it only when a lesson will prevent repeated mistakes or reduce future work.

## Homepage restraint

- The homepage is an event and culture surface, not a search landing page.
- On mobile, the landing hero must extend slightly beyond the dynamic viewport so the next event artwork never peeks out beneath the fixed quickbar on first load.
- Do not add visible keyword lists, genre chips, city lists, SEO explanations or an About block to the homepage.
- Do not repeat the brand-positioning sentence in the hero, footer and multiple sections. Keep the homepage visual and concise.
- Announcements do not have a distinct job and should not appear as a section or route. Current information belongs in Hot Right Now, Featured Events or the Rave Calendar.
- The footer is minimal: one linked `FALL0UT India` label. Do not add a slogan or navigation row.

## Search without visible clutter

- Never hide keyword text from people while exposing it to crawlers. Hidden keyword stuffing is deceptive and can weaken search trust.
- Put search intent on dedicated, genuinely useful pages with unique titles, descriptions, headings and visible editorial copy.
- Use structured data, canonical URLs, descriptive image text, internal links and the sitemap for machine-readable context.
- The preferred brand sentence may appear once on the About page. Machine metadata can describe the same entity where technically required, but visible repetition is not a design strategy.
- Part 2 guide content lives in `data/search-guides.json`. Run `node scripts/generate-search-guides.mjs` after editing it. Do not hand-edit generated guide HTML.

## FØ Moments rules

- On the homepage, the `FØ Moments` heading itself links to `/f0moments`.
- Keep the homepage gallery frame close to the viewport edges, especially on mobile.
- Align the title, image grid and description to the same internal gutter.
- Do not add a redundant button row below the gallery when the heading and final tile already open the archive.
- On an event page, render FØ Moments only when that event has an uploaded image folder in `eventMomentFolders`.
- If an event has no uploaded images, render no FØ Moments section, fallback message, archive button or FØ Moments continuation link. This applies to upcoming and past events.
- A maximum of six selected images appears on an event page. The full event folder stays on `/f0moments`.

## Multi-city feature rules

- A tour-level homepage feature should show the complete date range and every included city rather than presenting only its first stop.
- Set the feature archive timestamp to the final tour date so automatic delisting does not remove it after the opening city.

## Visual QA rules

- Inspect the affected surface at 1280×720 and 390×844 before release.
- Check horizontal overflow numerically, not only by eye.
- For FØ Moments, capture the whole section on desktop and mobile to verify outer gutter, caption alignment and link hierarchy.
- Check one event with images and one event without images after any event-page change.
- Browser QA can create `debug.log`; remove it before staging.

## Release discipline

- A website change is incomplete until the production deployment is Ready and the affected `fall0ut.in` routes are verified.
- Stage only intentional files. Generated search-guide HTML, its source JSON and generator script belong in the same commit.
- Validate JSON, XML, inline JavaScript, local assets and `git diff --check` before committing.
- After pushing `main`, verify desktop/mobile behavior, canonical metadata, sitemap presence and any redirect changed by the task.
