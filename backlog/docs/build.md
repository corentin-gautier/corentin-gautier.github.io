---
id: doc-4
title: "Build and deploy"
type: guide
---

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Serves the sources at `http://localhost:4173` (`PORT` overrides), gzip like GitHub Pages, live reload |
| `npm run build` | Writes `dist/` |
| `npm run preview` | Serves `dist/`, rebuilt on each change |
| `npm run stream` | Stream studio, see [Stream overlay](/documentation/5/stream-overlay) |

## Build (`tools/build.mjs`)

- Copies `assets/`, `favicon.svg`, `robots.txt`, the sitemaps, `.nojekyll`.
- Minifies the listed pages (`index.html`, `404.html`, `mentions-legales.html`) with html-minifier-terser, JSON-LD included; CSS with esbuild.
- A new page or root file must be added to its list there. `stream/` is never copied.
- Writes the redirect pages (below).

## Deploy

- GitHub Actions (`.github/workflows/deploy.yml`): on push to `main`, `npm ci`, `npm run build`, publish `dist/` to GitHub Pages.
- Domain: corentingautier.dev.

## Redirects (`tools/redirects.mjs`)

- GitHub Pages cannot send a 301: each old address gets a page with a canonical link and an instant meta refresh.
- Cassonade's old pages under `/mc-vanilla-sugar/` (English and French features) point to the same paths on cassonademod.com.

## Sitemaps

- `sitemap.xml` is an index: `sitemap-main.xml` (this site) plus the sitemaps of the project sites served under the same domain (`/snap-carousel/`, `/core-blocks-enhancer/`, `/no-thanks/`, `/restyle-for-twitch/`, `/macos-start-menu/`), which live in their own repositories.
