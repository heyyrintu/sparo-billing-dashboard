#!/bin/bash

echo "🚀 Setting up Spario Billing Dashboard..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp env.example .env.local
    echo "✅ Environment file created. Please update .env.local with your settings."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data/uploads
mkdir -p sample-data

# Generate sample data
echo "📊 Generating sample Excel files..."
npm run generate:sample

# Build and start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec app npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
docker-compose exec app npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "🌐 Application is running at: http://localhost:3000"
echo "👤 Default credentials:"
echo "   Email: admin@spario.com"
echo "   Password: admin123"
echo ""
echo "📊 Sample Excel files are available in the sample-data/ directory"
echo "📋 Admin panel: http://localhost:3000/admin"
echo ""
echo "To stop the application: docker-compose down"
echo "To view logs: docker-compose logs -f"
