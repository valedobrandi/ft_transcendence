#!/bin/sh
set -e

# Fix perms for mounted volume
echo "Fixing permissions for /app/data"
mkdir -p /app/data
chown -R nodeuser:nodeuser /app/data

# Ensure database file exists
if [ ! -f "$DATABASE_PATH" ]; then
  echo "Creating SQLite database at $DATABASE_PATH"
  touch "$DATABASE_PATH"
  chown nodeuser:nodeuser "$DATABASE_PATH"
fi

echo "Running database initialization..."
node /app/dist/database/init.js  # or npx tsx if you still use tsx

exec "$@"
