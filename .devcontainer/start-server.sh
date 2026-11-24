
#!/usr/bin/env bash

set -e

cd /workspaces/"$(basename "$PWD")"

# Don't start another server if one is already running
if curl -fsS http://127.0.0.1:8080/ >/dev/null 2>&1; then
    echo "Website server is already running."
    exit 0
fi

# Start the website server in the background
nohup python3 -m http.server 8080 --bind 0.0.0.0 \
    >/tmp/website-server.log 2>&1 </dev/null &

# Wait for the server to become available
for i in {1..10}; do
    if curl -fsS http://127.0.0.1:8080/ >/dev/null 2>&1; then
        echo "Website server started on port 8080."
        exit 0
    fi
    sleep 1
done

echo "Failed to start website server:"
cat /tmp/website-server.log
exit 1
