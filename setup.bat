@echo off
echo 🚀 Setting up Spario Billing Dashboard...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL is not installed. Please install PostgreSQL first.
    echo    You can skip this if you're using a remote database.
)

REM Create environment file if it doesn't exist
if not exist .env.local (
    echo 📝 Creating environment file...
    copy env.example .env.local
    echo ✅ Environment file created. Please update .env.local with your database settings.
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create necessary directories
echo 📁 Creating directories...
if not exist data\uploads mkdir data\uploads
if not exist sample-data mkdir sample-data

REM Generate sample data
echo 📊 Generating sample Excel files...
call npm run generate:sample

REM Run database migrations
echo 🗄️ Running database migrations...
call npx prisma migrate dev

REM Seed the database
echo 🌱 Seeding database...
call npm run db:seed

echo ✅ Setup complete!
echo.
echo 🚀 Start the development server:
echo    npm run dev
echo.
echo 🌐 Application will be available at: http://localhost:4000
echo 👤 Default credentials:
echo    Email: admin@dronalogitech.cloud
echo    Password: drona@12345
echo.
echo 📊 Sample Excel files are available in the sample-data/ directory
echo 📋 Admin panel: http://localhost:4000/admin
