# Fallout Website

## Event Listing UX Protocol

- Ticket prices must come from the event's catalog. Never hard-code one event's price into shared UI.
- For multi-city events, the sticky mobile price follows the currently selected city's lowest available category.
- On an event page, the mobile quickbar becomes an event-specific price and `Book tickets` bar while ticket categories are outside the central 80% of the viewport.
- When every ticket category is clearly visible within that central 80%, restore the standard mobile quickbar so it never covers the choices.
- `Book tickets` scrolls smoothly to the category list. Selecting a category opens WhatsApp immediately with the event, city, category, phase, and price.
- Ticket selection is the primary conversion path. Event descriptions belong below the selector, and community prompts must not obstruct event pages.
- Shared conversion actions use `--action-gradient`; new ticket CTAs must follow this visual language.
- Keep event-page spacing compact on mobile. Do not add explanatory labels, duplicate buttons, platform notes, or other copy unless the user explicitly requests it.

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
