#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
RETRIES=12 # ~60s total
until [ $RETRIES -le 0 ]
do
    if node -e "(async()=>{try{const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();await p.$queryRaw`SELECT 1`;await p.$disconnect();process.exit(0)}catch(e){process.exit(1)}})()"; then
        echo "✅ Database is reachable"
        break
    else
        echo "⏳ Database not ready yet, retrying... ($RETRIES left)"
        RETRIES=$((RETRIES-1))
        sleep 5
    fi
done

echo "📋 Running database migrations..."
if node node_modules/prisma/build/index.js migrate deploy; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations failed or already applied, continuing..."
fi

echo "🌱 Seeding database with admin user..."
SEED_RETRIES=3
until [ $SEED_RETRIES -le 0 ]
do
    if node prisma/seed.js; then
        echo "✅ Database seeded successfully"
        break
    else
        echo "⚠️  Seeding attempt failed, retrying... ($SEED_RETRIES left)"
        SEED_RETRIES=$((SEED_RETRIES-1))
        sleep 3
    fi
done

echo "🚀 Starting application..."
exec node server.js
