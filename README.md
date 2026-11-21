# gta6-cover-art-maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/RanggaMurphy/gta6-cover-art-maker/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/RanggaMurphy/gta6-cover-art-maker/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Neon Bay Cover Studio** — an offline web app that turns your photos and a caption into GTA 6-style cover art: a multi-panel poster look, bold chrome lettering, and a Vice City sunset or neon grade, exported as a PNG to share. Built by RanggaMurphy for the make.fun competition "Make GTA 6 Cover Art" (gta6-cover-art-01).

## What it does

- **Multi-panel posters** — five layouts (Hero Split, Triptych, Four Corners, Full Bleed, Sunset Strip) where every panel holds its own photo (a portrait, a car, a beach, a neon street), each panel cropped and positioned on its own (drag, scroll to zoom, or the sliders). Splitting one photo across the panels is only an optional extra, not the default.
- **Vice City grades** — six grades (Sunset, Neon Nights, Golden Hour, Teal Noir, Candy Pop, Vice Dusk) applied per panel and across the whole cover, with film grain and vignette.
- **Bold original lettering** — editable title, subtitle, and small line in three styles (chrome, solid, outline), set in Anton and Bebas Neue, both shipped under the SIL Open Font License. No Rockstar Games logo, artwork, or font anywhere.
- **Three post sizes** — export PNG at 1080×1080, 1080×1350, and 1920×1080, all client-side and instant.
- **Offline** — static files only, no network request, your photos never leave your machine. Demo photos ship with the app so it is alive the moment it opens.

## What's new in v2

- **Poster finish** — a palm and city skyline silhouette along the top edge, a subtle halftone print texture, and a soft neon rim light (pink to cyan) inside the frame, all drawn in code over your panels. Toggle it with the new Skyline checkbox.
- **Chrome glow title** — the chrome lettering now sits on a warm orange glow, with a thin chrome underline bar (white to pink to purple) under the subtitle.
- **Sixth grade: Vice Dusk** — a deep purple-to-orange sunset treatment, joining the five original grades, whose washes are now punchier across the board.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

## Enter it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.

Entered on make.fun.
