#!/bin/sh
set -e

DB_FILE="/app/database/pong.db"

# If DB file doesn't exist, initialize it
if [ ! -f "$DB_FILE" ]; then
  echo "Database not found, initializing..."
  npm run database
fi

# Start backend
exec "$@"

