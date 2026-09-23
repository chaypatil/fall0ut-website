# FallØut ticketing portal

Replaces the offline buyer spreadsheet and gets our buyers through the door
without queueing behind Skillbox and walk-up traffic.

Five pages, all plain HTML on the existing site. No server, no app to install.

| Page | Who uses it | What it does |
|---|---|---|
| `/portal/events.html` | FallØut staff | Add an event, grab its organiser link |
| `/portal/issue.html` | FallØut staff | Record a buyer, mint a QR, send it on WhatsApp |
| `/portal/scan.html` | Whoever is on the gate | Scan QRs, works with no signal |
| `/portal/tickets.html` | FallØut staff | Every sale, totals, CSV export, organiser link |
| `/portal/organiser.html` | The organiser | Read-only live numbers, no buyer details |

## Setting it up, once

1. Create a free project at supabase.com.
2. SQL Editor → New query → paste all of `portal/schema.sql` → Run.
3. Settings → API Keys → copy the **publishable** key, and Settings → Data API →
   copy the **Project URL**, into `portal/config.js`. Both are meant to be public.
   Never paste a secret or `service_role` key anywhere in this folder.
4. Authentication → Users → Add user, one per person who issues or scans.
   There is no public sign-up, so only people you add can get in.

## Before each event

1. Add the event on the Events page. The share token generates itself.
2. Sell as usual, recording each buyer on the issue page.
3. Copy the organiser link from the Sold page and send it to the promoter. It
   updates on its own, which is what replaces the spreadsheet.

## On the day

Open the scanner **before you lose signal** and press *Load tickets for offline
use*. From then on it holds the list on the phone, so scanning keeps working in
a basement. It syncs back whenever signal returns.

Print the CSV as a paper backup the first time. Trust it after one clean event,
not before.

## Things worth knowing

- **The QR holds a random code and nothing else.** No name, no category, no
  price, so photographing one teaches a forger nothing.
- **Two scanners can both accept the same QR while offline.** One scanner per
  lane and this never comes up. Once online, the database refuses the second
  redemption.
- **A ticket is spent once.** Rescanning shows who it was and when they went in.
- **The organiser link exposes counts and money only.** Forwarding it leaks no
  buyer details, and you can rotate the token in Supabase to kill a link.

## Not built yet, on purpose

Payment proof uploads, organiser logins, refunds and per-phase caps. Run one
event clean first, then add what actually hurt.
