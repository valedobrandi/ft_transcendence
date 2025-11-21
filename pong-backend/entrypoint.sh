#!/bin/sh
set -e

# Ensure database file exists
if [ ! -f "$DATABASE_PATH" ]; then
  echo "Creating SQLite database at $DATABASE_PATH"
  touch "$DATABASE_PATH"
fi

# Run migrations or schema setup if you have them
# e.g. node dist/src/migrate.js

echo "Running database initialization..."
npx tsx /app/database/init.ts

# Finally start the app
exec "$@"
