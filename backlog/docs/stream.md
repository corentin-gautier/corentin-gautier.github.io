---
id: doc-5
title: "Stream overlay"
type: guide
---

OBS overlays for Twitch streams, in the portfolio's style (dark paper, lime marker). In `stream/`, not published with the site. Full parameter list: the comment at the top of `overlay.html`.

## Files

| File | Role |
| --- | --- |
| `overlay.html` | The overlay, one OBS Browser source per scene |
| `dock.html` | Controls as an OBS Custom Browser Dock; settings kept in OBS and sent live |
| `studio.html` | Every scene side by side with its settings |
| `serve.mjs` | `npm run stream`: serves the studio at `http://localhost:4174`, reloads on save, refreshes OBS's overlays (`--no-obs` leaves OBS alone) |
| `now-playing.sh` | Writes what Spotify plays to `now-playing.js` (gitignored) |
| `install-now-playing.sh` | Installs the launchd agent running it every 5 s (`--remove` removes it) |

## Scenes (`scene=`)

| Scene | Shows |
| --- | --- |
| `game` (default) | 16:10 hole for the screen capture, right column with webcam, chat and clock, strip with topic and rotating infos |
| `chat` | Same frame with a big 16:9 webcam hole |
| `start` | "Starts soon", countdown with `in` (minutes) or `at` (time) |
| `pause` | "Be right back" |
| `end` | "That's it for today" |
| `full` | Game full screen: a corner badge (name, live, uptime, topic), webcam crop marks, alerts |

## Main settings

- `channel`: Twitch chat and alerts (subs, gifts, raids, bits), read anonymously; follows are not read.
- `topic`, `next`, `title`, `info`, `links`, `goal`: texts shown.
- `cam`, `ratio`, `chat`, `music`, `corner`, `theme` (dark or light), `lang` (fr or en): layout switches.
- `ws`: OBS WebSocket password; the overlay then follows the dock's settings live (they win over the URL's) and takes the stream's own uptime.
- `demo=1` fakes messages and alerts; `preview=1` draws a fake capture in the holes.

## How the parts talk

- The overlay is a `file://` page: it cannot ask Spotify, so it reloads `now-playing.js` every few seconds. The script runs only while OBS is open, and writes through a temp file so the overlay never reads half a file.
- `serve.mjs` reaches OBS through its WebSocket server, with the password from OBS's own settings file.
