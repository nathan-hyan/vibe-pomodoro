#!/bin/sh
set -e

# Initialize database if it doesn't exist
if [ ! -f "${DB_PATH}" ]; then
  echo "Initializing database at ${DB_PATH}..."
  cp /data/db.json.template "${DB_PATH}"
  echo "Database initialized successfully!"
else
  echo "Using existing database at ${DB_PATH}"
fi

# Execute the main command
exec "$@"
