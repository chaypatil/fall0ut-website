# FALL0UT analytics playbook

## Dashboard

Open the Vercel Web Analytics dashboard for `fall0ut-website` and filter the hostname to `fall0ut.in`.

The site uses normal internal paths for the key conversion steps, so they remain visible in the standard Pages panel even when custom-event reporting is unavailable.

| Dashboard path | Meaning |
| --- | --- |
| `/campaign/:event/:channel` | Visits from a specific campaign link |
| `/event/:slug` | Event detail opened |
| `/go/:slug` | Ticket intent; the visitor continued to the prefilled WhatsApp message |
| `/out/community/:placement` | Community WhatsApp exit |
| `/out/contact/:placement` | WhatsApp DM exit |
| `/out/instagram/:placement` | Instagram profile exit |
| `/calendar` | Rave Calendar opened through navigation |
| `/f0moments` | FØ Moments archive opened |

Custom events also capture campaign attribution, featured-board views and manual movement, section views, scroll depth, 15-second engaged visits, event opens, and outbound destinations. Vercel does not count custom events when calculating bounce rate.

## Steelworks campaign links

Use a different link for each Instagram placement:

- Bio: `https://www.fall0ut.in/campaign/steelworks/instagram-bio`
- Story: `https://www.fall0ut.in/campaign/steelworks/instagram-story`
- Reel: `https://www.fall0ut.in/campaign/steelworks/instagram-reel`
- Post: `https://www.fall0ut.in/campaign/steelworks/instagram-post`
- Partner: `https://www.fall0ut.in/campaign/steelworks/instagram-partner`

Each route opens the Steelworks event page, retains campaign attribution through the ticket journey, and appears separately in the Vercel Pages panel.

## Weekly review

Review a seven-day window and record:

1. Campaign visits by channel.
2. Event-detail visitors.
3. `/go/:slug` ticket-intent visitors.
4. Calendar and FØ Moments visitors.
5. Community and contact exits.
6. Mobile and Instagram in-app browser share.

Treat ticket-intent visitors and qualified WhatsApp conversations as the primary outcome. Bounce rate is contextual because a visitor can scroll, watch media, or leave through an external destination without producing another page view.
