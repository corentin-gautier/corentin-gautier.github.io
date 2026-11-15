#!/bin/zsh
# Installs (or, with --remove, removes) the launchd agent that runs now-playing.sh every 5 seconds.

label=local.stream.now-playing
plist=~/Library/LaunchAgents/$label.plist
script=${0:A:h}/now-playing.sh

launchctl bootout gui/$UID/$label 2>/dev/null
if [[ $1 == --remove ]]; then
	rm -f -- $plist
	print "Removed $label"
	exit 0
fi

chmod +x -- $script
cat > $plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key><string>$label</string>
	<key>ProgramArguments</key><array><string>$script</string></array>
	<key>StartInterval</key><integer>5</integer>
	<key>RunAtLoad</key><true/>
</dict>
</plist>
EOF
launchctl bootstrap gui/$UID $plist && print "Installed $label: $script every 5 s"
