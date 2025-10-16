#!/bin/sh
set -e

echo "Initializing database schema..."
node node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate || echo "Schema push failed, trying migrate deploy..."
node node_modules/prisma/build/index.js migrate deploy || echo "Migration failed, continuing..."

echo "Seeding database..."
node node_modules/prisma/build/index.js db seed || echo "Seed already run or failed, continuing..."

echo "Starting application..."
exec node server.js
