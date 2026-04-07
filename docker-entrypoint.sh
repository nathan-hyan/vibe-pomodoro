#!/bin/sh
set -e

DB_DIR=$(dirname "${DB_PATH}")

# Ensure the data directory is writable (needed for JSON Server's atomic writes
# which create a temporary .db.json.tmp file in the same directory)
if [ -d "${DB_DIR}" ]; then
  chmod 777 "${DB_DIR}" 2>/dev/null || echo "Warning: Could not set permissions on ${DB_DIR}"
fi

# Initialize database if it doesn't exist
if [ ! -f "${DB_PATH}" ]; then
  echo "Initializing database at ${DB_PATH}..."
  cp /app/db.json.template "${DB_PATH}"
  echo "Database initialized successfully!"
else
  echo "Using existing database at ${DB_PATH}"
fi

# Ensure the database file is writable
chmod 666 "${DB_PATH}" 2>/dev/null || echo "Warning: Could not set permissions on ${DB_PATH}"

# Execute the main command
exec "$@"
