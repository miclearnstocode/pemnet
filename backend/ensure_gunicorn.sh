#!/bin/bash
LOG_FILE="$HOME/logs/gunicorn-watchdog.log"
PID_FILE="$HOME/gunicorn.pid"
BACKEND_DIR="$HOME/pemnet-webApp/backend"

mkdir -p "$HOME/logs"

# --- Health check: does the app respond? ---
HTTP_CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:5000/api/health 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    exit 0
fi

echo "[$(date)] Gunicorn unhealthy (HTTP $HTTP_CODE) — restarting" >> "$LOG_FILE"

# --- Kill any existing gunicorn processes ---
pkill -f "gunicorn app:app" 2>/dev/null
sleep 2
pkill -9 -f "gunicorn app:app" 2>/dev/null
sleep 1

# Clean up stale pid file
rm -f "$PID_FILE"

# --- Rotate access log if over 200 MB ---
if [ -f "$HOME/logs/gunicorn-access.log" ]; then
    SIZE=$(stat -c%s "$HOME/logs/gunicorn-access.log" 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 209715200 ]; then
        mv "$HOME/logs/gunicorn-access.log" "$HOME/logs/gunicorn-access.log.old.$(date +%s)"
        echo "[$(date)] Rotated access log ($SIZE bytes)" >> "$LOG_FILE"
    fi
fi

# --- Start Gunicorn ---
cd "$BACKEND_DIR" || exit 1
source venv/bin/activate

gunicorn app:app \
  --bind 127.0.0.1:5000 \
  --workers 1 \
  --worker-class sync \
  --timeout 300 \
  --graceful-timeout 30 \
  --max-requests 500 \
  --max-requests-jitter 50 \
  --pid "$PID_FILE" \
  --access-logfile "$HOME/logs/gunicorn-access.log" \
  --error-logfile "$HOME/logs/gunicorn-error.log" \
  --chdir "$BACKEND_DIR" \
  --daemon

# --- Wait for it to come up ---
for i in 1 2 3 4 5 6; do
    sleep 2
    HTTP_CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:5000/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "[$(date)] Restart SUCCESS (pid $(cat "$PID_FILE" 2>/dev/null))" >> "$LOG_FILE"
        exit 0
    fi
done

echo "[$(date)] Restart FAILED — health check never returned 200" >> "$LOG_FILE"
exit 1
