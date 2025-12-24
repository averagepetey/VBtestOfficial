#!/bin/bash
# Find and show the Next.js server process

echo "🔍 Finding processes on port 3006..."
echo ""

PIDS=$(lsof -ti:3006 2>/dev/null)

if [ -z "$PIDS" ]; then
  echo "❌ No process found on port 3006"
  echo "You can start the server with: npm run dev"
else
  echo "✅ Found process(es) on port 3006:"
  for PID in $PIDS; do
    echo ""
    echo "Process ID: $PID"
    ps -p $PID -o pid,command,etime 2>/dev/null || echo "  (Process details unavailable)"
  done
  echo ""
  echo "To kill these processes and start fresh:"
  echo "  lsof -ti:3006 | xargs kill -9"
  echo "  npm run dev"
fi

