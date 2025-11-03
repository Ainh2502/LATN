#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z db 5432; do
  sleep 1
done

echo "✅ Database is ready!"
exec "$@"
