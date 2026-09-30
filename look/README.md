# Design preview (fall0ut.xyz only)

This folder lets the team try the direction-board options on the real site before
anything changes on fall0ut.in.

- `look.js` is included on every page but only switches on for preview hosts
  (fall0ut.xyz, www.fall0ut.xyz, `fall0ut-website-git-*.vercel.app` branch previews
  and local servers). On fall0ut.in, www.fall0ut.in and fall0ut-website.vercel.app it
  returns immediately: no styles, no panel, no changes.
- On a preview host it reads `?look=` (seven letters, one per row of the direction
  board: background, headings, hero, event posters, buttons, texture, system labels),
  for example `?look=aaaaacb`. `?look=off` shows the site without preview changes.
  A "Design" button opens a panel to switch options live.
- `look.css` is generated. Edit `options.css` or `styles.css`, then run
  `python3 look/build-look.py`. It remaps every colour rule in `styles.css` for the
  light and night backgrounds, then appends `options.css`.
- `art/` holds the preview artwork (soft sigil, light streaks, power lines, fractal
  wisps).
- `vercel.json` sends `X-Robots-Tag: noindex` for fall0ut.xyz so the preview is never
  indexed.

Once a direction is chosen, bake it into `styles.css` properly and delete this folder
and the `look.js` script tags before merging to `main`.
