#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
sleep 5

echo "📋 Running database migrations..."
if node node_modules/prisma/build/index.js migrate deploy; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations failed or already applied, continuing..."
fi

echo "🌱 Seeding database with admin user..."
if node prisma/seed.js; then
    echo "✅ Database seeded successfully"
else
    echo "⚠️  Seeding failed or admin user already exists"
fi

echo "🚀 Starting application..."
exec node server.js
