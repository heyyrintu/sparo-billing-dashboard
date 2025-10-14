@echo off
echo 🚀 Setting up Spario Billing Dashboard...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo 📝 Creating environment file...
    copy env.example .env.local
    echo ✅ Environment file created. Please update .env.local with your settings.
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist data\uploads mkdir data\uploads
if not exist sample-data mkdir sample-data

REM Generate sample data
echo 📊 Generating sample Excel files...
npm run generate:sample

REM Build and start services
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose exec app npx prisma migrate deploy

REM Seed the database
echo 🌱 Seeding database...
docker-compose exec app npm run db:seed

echo ✅ Setup complete!
echo.
echo 🌐 Application is running at: http://localhost:3000
echo 👤 Default credentials:
echo    Email: admin@spario.com
echo    Password: admin123
echo.
echo 📊 Sample Excel files are available in the sample-data/ directory
echo 📋 Admin panel: http://localhost:3000/admin
echo.
echo To stop the application: docker-compose down
echo To view logs: docker-compose logs -f
