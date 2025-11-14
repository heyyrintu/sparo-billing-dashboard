# PostgreSQL Setup Guide

## Prerequisites

1. Install PostgreSQL locally on Windows:
   - Download from: https://www.postgresql.org/download/windows/
   - Or use PostgreSQL installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Default port: 5432

## Database Setup

1. Open PostgreSQL command line (psql) or pgAdmin

2. Create a database:
   ```sql
   CREATE DATABASE spario_dashboard;
   ```

3. (Optional) Create a dedicated user:
   ```sql
   CREATE USER spario_user WITH PASSWORD 'your_password_here';
   GRANT ALL PRIVILEGES ON DATABASE spario_dashboard TO spario_user;
   ```

## Environment Configuration

Create a `.env` file in the project root with the following:

```env
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database_name?schema=public
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/spario_dashboard?schema=public"
```

### Connection String Examples

**Using default postgres user:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/spario_dashboard?schema=public"
```

**Using custom user:**
```
DATABASE_URL="postgresql://spario_user:your_password@localhost:5432/spario_dashboard?schema=public"
```

**With different port:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5433/spario_dashboard?schema=public"
```

## Running Migrations

After setting up the database and `.env` file:

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

2. Run migrations:
   ```bash
   npx prisma migrate dev --name init_postgresql
   ```

3. (Optional) Seed initial admin user:
   ```bash
   npm run db:seed
   ```

## Verification

Test the connection:
```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and manage your database.

## Troubleshooting

### Connection refused
- Ensure PostgreSQL service is running
- Check if port 5432 is correct
- Verify firewall settings

### Authentication failed
- Verify username and password in DATABASE_URL
- Check pg_hba.conf file for authentication settings

### Database does not exist
- Create the database using the SQL commands above
- Verify database name matches in DATABASE_URL

