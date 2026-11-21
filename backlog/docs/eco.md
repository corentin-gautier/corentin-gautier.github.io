---
id: doc-3
title: "Eco-design"
type: specification
---

The site is its own showcase: it must stay as light as it claims.

## Rules

- Native first: HTML and CSS before JavaScript, browser features before a library.
- Load only what is needed: images lazy-loaded near the viewport.
- Media in the right format: AVIF at display size, system fonts (no downloaded font).
- No tracker, no cookie, no third-party script.
- Claims on the page: under 300 kB, under 20 requests, no JavaScript framework.

## Page-weight meter

- Header badge and the eco section show the bytes this page actually downloaded.
- Sum of `encodedBodySize` over the navigation and resource entries, updated by a `PerformanceObserver`: it rises while scrolling as images load.
- After load, a rise flashes a "+N ko à l'instant" tooltip for 3.5 s.
- A square compares this page with the median web page (2.5 MB, HTTP Archive): its side follows the square root of the weight, so areas stay proportional.

## Lightbox

- Work images open large, reusing the image already loaded: nothing more is downloaded.
