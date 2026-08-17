# Fallout Website

## Event Listing UX Protocol

- Ticket prices must come from the event's catalog. Never hard-code one event's price into shared UI.
- For multi-city events, the sticky mobile price follows the currently selected city's lowest available category.
- On an event page, the mobile quickbar becomes an event-specific price and `Book tickets` bar while ticket categories are outside the central 80% of the viewport.
- When every ticket category is clearly visible within that central 80%, restore the standard mobile quickbar so it never covers the choices.
- `Book tickets` scrolls smoothly to the category list.
- Every available category carries its own quantity stepper, starting at 0, placed ahead of the category name. Buyers can mix categories in one order (for example 2 GA plus 2 Backstage).
- The `Book on WhatsApp` bar below the list stays disabled until at least one category has a quantity above 0, and shows the running ticket count and order total.
- Changing city re-renders the categories and resets every quantity to 0, so a stale quantity can never carry across cities.
- `ticketCatalog` is the single source of truth for category pricing, phase, and discounts. Never repeat those values in `goRoutes`, buttons, or hand-written WhatsApp URLs.
- Multi-city archive slugs must resolve through `ticketContexts` to one canonical catalog and the correct default city.
- WhatsApp ticket messages must be generated from what the buyer actually selected and include event, city when applicable, and for every chosen category its label, quantity, phase, line total, and discount when one exists. When more than one category is chosen the message ends with an order total.
- Every pricing update must be checked across all cities and categories, including the rendered selector, sticky `onwards` price, analytics payload, and encoded WhatsApp message.
- Time-based ticket phases belong in the catalog as `pricingSwitchAt` plus `categoriesAfterSwitch`; the page must switch automatically at the specified India-time timestamp and generate WhatsApp copy from the active phase.
- Ticket availability belongs in the catalog. `sold-out` categories display `Sold out`, render no quantity stepper, and can never enter an order; `last-few` categories show a compact scarcity badge without changing their price or message.
- Past calendar entries show `View event` only when their slug exists in `eventMomentFolders`. Past entries without FØ Glimpses remain visible as history but are not actionable.
- Never show `Tickets closed` in the Rave Calendar.
- Ticket selection is the primary conversion path. Event descriptions belong below the selector, and community prompts must not obstruct event pages.
- Shared conversion actions use `--action-gradient`; new ticket CTAs must follow this visual language.
- Keep event-page spacing compact on mobile. Do not add explanatory labels, duplicate buttons, platform notes, or other copy unless the user explicitly requests it.
- Flipping posters start their timer when the poster scrolls into view, never on page load: first flip 3 seconds after it enters view, then every 5 seconds, alternating. Respect `prefers-reduced-motion` by not flipping at all.

## Deploy Configuration (configured by /setup-deploy)
- Platform: Vercel
- Production URL: https://fall0ut-website.vercel.app
- Deploy workflow: CLI deploy from local repo; GitHub auto-deploy pending Vercel GitHub app access to `chaypatil/fall0ut-website`
- Deploy status command: HTTP health check
- Merge method: direct push to `main`
- Project type: static web app
- Post-deploy health check: https://fall0ut-website.vercel.app

### Custom deploy hooks
- Pre-merge: none
- Deploy trigger: `npx.cmd --yes vercel --prod --yes`
- Deploy status: poll production URL
- Health check: https://fall0ut-website.vercel.app

### Custom domains
- `fall0ut.xyz` is attached to the Vercel project but DNS is not configured yet.
- `www.fall0ut.xyz` is attached to the Vercel project but DNS is not configured yet.
- Current nameservers: `parking1.gen.xyz`, `parking2.gen.xyz`
- Preferred handoff: domain owner changes nameservers to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`.
- Alternate DNS records from Vercel verification:
  - `A @ 216.198.79.1`
  - `A @ 64.29.17.1`
  - `CNAME www 6b61fc7ec40db849.vercel-dns-017.com.`
- Re-check after DNS changes: `npx.cmd --yes vercel domains verify fall0ut.xyz` and `npx.cmd --yes vercel domains verify www.fall0ut.xyz`.
