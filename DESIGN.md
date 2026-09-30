# FallØut India: DESIGN.md

How the FallØut website should look and feel. `AGENTS.md` says how the site behaves (ticket catalog, WhatsApp messages, calendar rules); this file says how it looks. The live implementation is the token block at the top of `styles.css`. If this file and the stylesheet ever disagree, fix one of them on purpose rather than drifting.

Format follows the nine-section `DESIGN.md` convention, so it can also be uploaded to Claude Design to scaffold a design system and UI kit.

---

## 1. Visual theme & atmosphere

FallØut is India's underground hard techno, schranz and rave platform: current events, direct ticket access over WhatsApp, a city Rave Calendar and the FØ Glimpses photo archive.

The mark is a gothic wordmark in liquid chrome on black, with spiked terminals and a slashed Ø. The website is built from the same materials as that mark:

- **Carbon**: a near-black base, never pure black.
- **Steel**: one cool grey family for text, lines and surfaces.
- **Chrome**: polished metal, used sparingly and only where a buyer acts.

The mood is a warehouse at 3am: cold light on metal, flyer typography, nothing soft or friendly. It stays restrained. No neon, no glow, no gradients for decoration. **Event posters are the only colour on the page**; the interface stays monochrome so the artwork carries the energy.

Priorities, in order: get people to the right event, let them pick tickets fast, then show the culture (Glimpses, community).

## 2. Color palette & roles

| Token | Value | Role |
|---|---|---|
| `--bg` | `#09090b` | Page background (carbon) |
| `--bg-raised` | `#111114` | Raised surfaces |
| `--ink` | `#ececf0` | Body text |
| `--ink-strong` | `#f7f7f9` | Headlines, names, prices |
| `--muted` | `#a0a0a9` | Secondary text, venue lines, captions |
| `--dim` | `#6c6c75` | Tertiary labels (e.g. `Date`, `Venue`) |
| `--steel` | `#c9cbd2` | Status text such as `Last few left` |
| `--accent` | `#d6d8de` | Focus rings, back links, link underlines |
| `--line` | `rgba(232, 232, 238, 0.12)` | Hairlines |
| `--line-strong` | `rgba(232, 232, 238, 0.26)` | Ghost button borders, input borders |
| `--chrome` | vertical gradient `#fdfdfe 0%`, `#dcdee3 20%`, `#a3a6af 47%`, `#eef0f3 60%`, `#babdc5 82%`, `#e6e7eb 100%` | Primary actions, discount tag, `FØ exclusive` chip |
| `--chrome-soft` | `#d9dbe1 0%`, `#8f929b 55%`, `#c4c7ce 100%` | Flat-offer discount tag |
| `--on-chrome` | `#0b0b0d` | Text and icons on chrome |
| `--action-gradient` | `var(--chrome)` | Required for every conversion CTA (see `AGENTS.md`) |

Rules:

- **One grey family.** Every neutral sits on hue 240 with low saturation (about 6%, 10% for the darkest values). Do not mix warm and cool greys.
- **No hue accents.** Blue, periwinkle, purple, mint and teal are retired. Colour comes from posters and photography only.
- **No pure black or pure white** in UI. Use `--bg` and `--ink-strong`.
- **Chrome means "act here".** Use it for conversion actions and offer markers, never for selected states, decoration or headings.
- Dark overlays use carbon: `rgba(10, 10, 12, 0.5–0.72)`.

Texture:

- A fixed film grain over the page background (SVG fractal noise, 180px tile, 5.5% opacity) on a `pointer-events: none` pseudo-element. Never on scrolling elements.
- A faint cold light at the top (`radial-gradient` at 6%) and bottom edge (5%) of the viewport, like the reflection along the base of the wordmark.
- No grid lines, no crosshairs, no blobs.

## 3. Typography rules

**Families:** Archivo (variable: width 62–125%, weight 400–900) and Geist Mono (400, 500), from Google Fonts:

```
https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Geist+Mono:wght@400;500&display=swap
```

Both fonts contain `Ø` (U+00D8) and `₹` (U+20B9). This is a hard requirement: brand names use Ø and every price uses ₹. Check glyph coverage before swapping either font (Martian Mono and JetBrains Mono, for example, have no ₹).

Four roles, one metal:

| Role | Spec | Used for |
|---|---|---|
| **Display** | Archivo, `font-stretch: 68%`, weight 500 (`--display-weight`), uppercase, tracking 0 to 0.02em, line-height 0.88–0.9, `text-wrap: balance`. Small UI names and prices use weight 600 (`--display-weight-ui`) so they stay crisp | Page and section headings, event names, month names, ticket category names, prices |
| **Label** | Archivo, `font-stretch: 115%`, weight 600 (700 on chrome), uppercase, tracking 0.1em | Navigation, buttons, eyebrows, footer, quickbar. The `INDIA` under the wordmark uses 0.6em tracking |
| **Data** | Geist Mono, weight 500, uppercase, tracking 0.06em, `tabular-nums` | Dates, venue lines, countdowns, pricing phases, quantities, discount amounts, ticket counts |
| **Body** | Archivo, normal width, weight 400, tracking 0, line-height 1.5–1.7, max ~70ch | Descriptions and paragraphs |

Rule of thumb: if it reads like a set time or a number, it is Data. If it is a name, it is Display. If you press it or navigate with it, it is Label.

Key sizes:

| Element | Size |
|---|---|
| Event page title | `clamp(3.5rem, 9vw, 8.5rem)` |
| Hot Right Now title | `clamp(3.2rem, 6.4vw, 6.8rem)` |
| Featured card title | `clamp(2.7rem, 4.6vw, 4.9rem)` |
| Section heading (h2) | `clamp(2rem, 3.6vw, 4rem)` |
| Month name | `clamp(2.25rem, 3vw, 3.35rem)` |
| Ticket selector heading | `clamp(1.35rem, 3vw, 2.1rem)` |
| Calendar event name | `clamp(1.12rem, 1.45vw, 1.5rem)` |
| Labels and buttons | 0.7–0.86rem |
| Data | 0.66–0.9rem |

Brand spelling: write the brand with `Ø` (FallØut, FALLØUT, FØ Glimpses, FØ Mob). The Instagram handle `@fall0utindia` and existing `FALL0UT` copy use a zero and stay as written.

## 4. Component stylings

**Primary button** (`.primary-button`): chrome fill (`--action-gradient`), 1px `rgba(255,255,255,0.55)` border, inset top highlight and dark bottom edge, `--on-chrome` label at weight 700, min-height 44px. On hover a band of light sweeps across it (pseudo-element, `translateX`, 520ms, `cubic-bezier(0.16, 1, 0.3, 1)`). On press it moves down 1px. Disabled: flat `rgba(255,255,255,0.05)` fill, half-strength ink, no sweep. Keep labels short: `Get tickets`, `Buy now`, `Book tickets`, `Join WhatsApp`.

**Secondary action** (`.section-action`): transparent, 1px `--line-strong` border, ink label. Hover lifts the border to 86% and adds an 8% fill.

**Discount tag** (`.discount-bookmark`): chrome, dark label, bookmark notch via `clip-path`, pinned to the top right of the poster. Flat-rate offers use `--chrome-soft`.

**Posters**: in the featured carousel, posters sit in grayscale (`grayscale(1) contrast(1.08) brightness(0.82)`) and reveal colour with a slight zoom on hover, focus or touch. The Hot Right Now poster is always in colour. Flipping posters follow the timing in `AGENTS.md`.

**Ticket selector**, the primary conversion surface:

| State | Treatment |
|---|---|
| Default row | 1px steel border at 22%, carbon fill |
| Hover | Border to 50% |
| Featured | Border 40%, faint steel gradient, top highlight, larger name and price. Emphasis without a badge |
| Selected | Bright `#e6e7eb` border, 16% steel wash and a 3px chrome edge on the left. Stays dark: selection is a state, not an action |
| Last few | Row carries a small `Last few left` label in `--steel` Data type |
| FØ exclusive | Small chrome chip with dark Data text |
| Sold out | Dimmed text and border, no stepper, `Sold out` in place of a price |

- Quantity stepper: square (2px), 25px buttons with invisible enlarged hit areas, Data digits, placed before the category name, starting at 0.
- Booking bar: Data count (`No tickets selected`, `3 tickets selected`), Display total, chrome `Buy now` that stays disabled until a quantity is above 0.
- Cover note callout: 3px bright left border, faint steel wash, a small rotated chrome square as the marker, Label type.

**Rave Calendar**: one column per month. In the current month, past events drop to 45% opacity and upcoming ones get an 8% steel wash with a 3px chrome edge. Notice cards (`More dates dropping soon`) use a faint diagonal steel gradient. Countdowns sit in a 1px steel-bordered chip in Data type.

**Header**: floating fixed bar with 18px backdrop blur. The hero wordmark morphs into the header on scroll. Nav links use Label type.

**Mobile quickbar**: fixed to the bottom, up to three equal cells, the first one chrome (`Tickets`). On event pages it becomes the event price plus a chrome `Book tickets` button, following the visibility rules in `AGENTS.md`.

**FØ Glimpses**: full-colour photos at 4:5, 2px corners, 10–12px gaps.

**Focus**: a 1px `--accent` outline with 2px offset; inside clipped containers (carousel, calendar, quickbar, contact rows) the ring sits 2px inside instead.

## 5. Layout principles

- Content max width 1480px, centred. The Rave Calendar breaks out to full width.
- Section padding: `clamp(34px, 5vw, 74px)` vertical and `clamp(18px, 4.2vw, 80px)` horizontal; 18px sides on mobile.
- Gaps of 8–12px between tiles and rows.
- No visible borders between sections. The header-to-body transition is a 3px short gradient.
- **Corners are hard**: `--radius: 2px` everywhere, including steppers, tags and the mobile ticket bar. No pills, no circles.
- Hero: full-bleed video with separate desktop and mobile files, carbon scrim and a faint cold bloom rising from the bottom. On mobile it extends just past the viewport so the next section never peeks under the quickbar.
- Event page: poster (220–390px) beside the details on desktop, stacked on mobile. The ticket selector (max 760px) comes before the description.
- Keep mobile compact. Do not add explanatory labels, duplicate buttons or platform notes.

## 6. Depth & elevation

- Mostly flat. Hierarchy comes from surface lightness and type, not shadow.
- Shadows are black and soft (`rgba(0, 0, 0, 0.4–0.55)`), never coloured.
- The Hot Right Now feature carries an uneven cold light, as if one edge of a steel plate catches it: `inset 0 1px 0 rgba(255,255,255,0.06)`, `24px -10px 78px rgba(214,218,228,0.07)`, `-18px -16px 52px rgba(214,218,228,0.03)`, `16px 28px 92px rgba(0,0,0,0.55)`.
- Chrome surfaces get an inset top highlight (`rgba(255,255,255,0.9)`) and a dark bottom edge (`rgba(0,0,0,0.28)`), so they read as a plate rather than a flat grey.
- Layers: header 30, mobile quickbar 40, community popup 80.

## 7. Do's and don'ts

**Do**

- Let posters and photos be the only colour.
- Use `--action-gradient` for every ticket or join action, with `--on-chrome` text.
- Use Data type (Geist Mono) for anything that reads like a set time, a price detail or a count.
- Spell the brand with Ø and check that any new font renders Ø and ₹.
- Keep ticket selection first on event pages and the description below it.
- Show venues as `venue / city`.
- Honour `prefers-reduced-motion`: no hero video, no bloom pulse, no light sweep, no poster flips.
- Check 1280×800 and 390×844, with no horizontal scroll.

**Don't**

- Reintroduce blue, purple, mint or teal accents, neon glows, or the purple-to-blue "AI gradient".
- Use beige or cream anywhere.
- Round corners beyond 2px or use pill shapes.
- Use chrome for selected states, headings or decoration.
- Put grain or noise on anything that scrolls.
- Add section-number eyebrows, explanatory labels, duplicate buttons or platform notes.
- Show `Tickets closed` in the Rave Calendar.
- Hard-code prices in shared UI; they come from `ticketCatalog`.
- Use pure `#000` or `#fff`.

## 8. Responsive behavior

| Breakpoint | What changes |
|---|---|
| ≤1120px | Featured cards rebalance columns; gallery tiles go half width |
| ≤920px | Featured cards stack; Hot Right Now narrows its poster column; event detail becomes one column; calendar columns become 82vw swipe cards |
| ≤760px | Mobile layout: bottom quickbar, 18px gutters, full-width buttons, two-column Glimpses, Hot Right Now stacks poster-first, event title on one line sized by viewport width |
| ≤520px | Tighter ticket cover note |

- On touch devices (`hover: none`), tapping reveals poster colour without forcing navigation.
- Tap targets are at least 44px; stepper buttons get enlarged invisible hit areas.
- `touch-action: manipulation` on links and buttons; the quickbar respects `env(safe-area-inset-bottom)`.

## 9. Agent prompt guide

Reusable prompts for building on this system:

- **New page or section**: "Build [section] for FallØut India using DESIGN.md. Carbon background, steel greys only, chrome only on the primary action. Names in Archivo condensed 500 uppercase, labels in Archivo expanded 600 uppercase, dates, venues and prices in Geist Mono. 2px corners. Posters and photos are the only colour."
- **New event card**: "Add an event card: grayscale poster that turns colour on hover, Data date line `DD MMM YYYY / City`, Display event name, Data venue line `Venue / City`, and a `Get tickets` action. Discount tag in chrome, top right of the poster."
- **Ticket UI**: "Follow the Ticket selector states in DESIGN.md exactly. Selected rows stay dark with a chrome left edge; only `Buy now` is chrome."
- **Social or print adaptation** (1080×1350): "Carbon background with grain, chrome wordmark centred high, event name in Archivo condensed 500 uppercase, date and venue in Geist Mono, poster art as the only colour. No gradients or glows."

Before shipping any change, check:

1. No new hue accents; every grey is on the steel family.
2. Chrome appears only on actions and offer markers.
3. Ø and ₹ render in every new string.
4. Corners are 2px.
5. Mobile at 390px has no horizontal scroll and nothing covers the ticket choices.
6. Reduced motion turns off every new animation.
