# gta6-cover-art-maker

[![Make GTA 6 Cover Art](https://img.shields.io/badge/make.fun-gta6--cover--art--01-ff5e8a)](https://make.fun/c/gta6-cover-art-01)
[![Rank: awaiting judging](https://img.shields.io/badge/rank-awaiting%20judging-lightgrey)](https://make.fun/c/gta6-cover-art-01)
[![Prize pool $250](https://img.shields.io/badge/prize-%24250-ff9a3d)](https://make.fun/c/gta6-cover-art-01)

**Neon Bay Cover Studio** — an offline web app that turns your photos and a caption into GTA 6-style cover art: a multi-panel poster look, bold chrome lettering, and a Vice City sunset or neon grade, exported as a PNG to share. Built by RanggaMurphy for the make.fun competition "Make GTA 6 Cover Art" (gta6-cover-art-01).

## What it does

- **Multi-panel posters** — five layouts (Hero Split, Triptych, Four Corners, Full Bleed, Sunset Strip) with one photo split across panels or several photos on one cover, each panel cropped and positioned on its own (drag, scroll to zoom, or the sliders).
- **Vice City grades** — five grades (Sunset, Neon Nights, Golden Hour, Teal Noir, Candy Pop) applied per panel and across the whole cover, with film grain and vignette.
- **Bold original lettering** — editable title, subtitle, and small line in three styles (chrome, solid, outline), set in Anton and Bebas Neue, both shipped under the SIL Open Font License. No Rockstar Games logo, artwork, or font anywhere.
- **Three post sizes** — export PNG at 1080×1080, 1080×1350, and 1920×1080, all client-side and instant.
- **Offline** — static files only, no network request, your photos never leave your machine. Demo photos ship with the app so it is alive the moment it opens.

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
