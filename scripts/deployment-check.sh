#!/bin/bash
# Quick deployment checklist script

echo "🚀 Spario Dashboard - Pre-Deployment Checklist"
echo "=============================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file missing - create from env.example"
    exit 1
fi

# Check for required environment variables
echo ""
echo "Checking environment variables..."

if grep -q "NEXTAUTH_SECRET=spario-dashboard-secret-key-change-in-production" .env; then
    echo "⚠️  WARNING: NEXTAUTH_SECRET is still default - CHANGE IT!"
else
    echo "✅ NEXTAUTH_SECRET has been customized"
fi

if grep -q "ADMIN_PASSWORD=admin123" .env; then
    echo "⚠️  WARNING: ADMIN_PASSWORD is still default - CHANGE IT!"
else
    echo "✅ ADMIN_PASSWORD has been customized"
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL" .env; then
    echo "✅ DATABASE_URL is configured"
else
    echo "❌ DATABASE_URL is missing"
    exit 1
fi

echo ""
echo "Checking Node modules..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "⚠️  node_modules missing - run: npm install"
fi

echo ""
echo "Checking Prisma setup..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma client generated"
else
    echo "⚠️  Prisma client not generated - run: npx prisma generate"
fi

echo ""
echo "=============================================="
echo "📋 Manual Checks Required:"
echo ""
echo "1. Update NEXTAUTH_SECRET with: openssl rand -base64 32"
echo "2. Change ADMIN_PASSWORD to a strong password"
echo "3. Set correct NEXTAUTH_URL for your domain"
echo "4. Ensure PostgreSQL is running and accessible"
echo "5. Test database connection"
echo "6. Run migrations: npx prisma migrate deploy"
echo "7. Seed database: npx prisma db seed"
echo ""
echo "=============================================="
echo ""

# Generate a sample NEXTAUTH_SECRET
echo "💡 Sample NEXTAUTH_SECRET (use this or generate your own):"
openssl rand -base64 32 2>/dev/null || echo "Install openssl to generate secrets"
echo ""
