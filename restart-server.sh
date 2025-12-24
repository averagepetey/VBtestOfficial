#!/bin/bash
# Kill processes on port 3006 and start fresh server

echo "🛑 Stopping existing server on port 3006..."
lsof -ti:3006 | xargs kill -9 2>/dev/null
sleep 2

echo "✅ Port 3006 is now free"
echo ""
echo "🚀 Starting fresh server..."
echo "   (You'll see the logs in this terminal)"
echo ""

npm run dev

