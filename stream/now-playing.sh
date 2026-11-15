#!/bin/zsh
# Writes what Spotify plays to now-playing.js, next to this script, for overlay.html to show. A page opened from
# file:// cannot ask Spotify itself, but it can load a script file: the overlay reloads this one every few seconds.
# Run every 5 s by launchd (see install-now-playing.sh), only while OBS is open.

dir=${0:A:h}
pgrep -xq OBS || exit 0

json=$(osascript -l JavaScript -e '
const spotify = Application("Spotify");
let out = { state: "off" };
if (spotify.running()) {
	const track = spotify.currentTrack;
	out = { state: spotify.playerState(), title: track.name(), artist: track.artist(), album: track.album(), art: track.artworkUrl() };
}
out.updated = Date.now();
JSON.stringify(out);
' 2>/dev/null) || exit 0

# Written aside then moved, so the overlay never reads half a file
print -r -- "window.nowPlaying = $json;" > "$dir/now-playing.js.tmp" && mv "$dir/now-playing.js.tmp" "$dir/now-playing.js"
