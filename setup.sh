#!/bin/bash

echo "🚀 Setting up Spario Billing Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   You can skip this if you're using a remote database."
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp env.example .env.local
    echo "✅ Environment file created. Please update .env.local with your database settings."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data/uploads
mkdir -p sample-data

# Generate sample data
echo "📊 Generating sample Excel files..."
npm run generate:sample

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev

# Seed the database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "🚀 Start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Application will be available at: http://localhost:4000"
echo "👤 Default credentials:"
echo "   Email: admin@dronalogitech.cloud"
echo "   Password: drona@12345"
echo ""
echo "📊 Sample Excel files are available in the sample-data/ directory"
echo "📋 Admin panel: http://localhost:4000/admin"
