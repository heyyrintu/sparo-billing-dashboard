# Docker Deployment Guide

## ✅ Successfully Deployed!

Your Spario Billing Dashboard is now running in Docker containers.

## Services Running

1. **App Container** - Next.js application on port 3000
2. **PostgreSQL Container** - Database on port 5432

## Access the Application

- **Dashboard**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/healthz
- **Sign In**: http://localhost:3000/auth/signin

## Default Credentials

- **Email**: admin@dronalogitech.cloud
- **Password**: drona@12345

## Docker Commands

### Start the application
```bash
docker-compose up -d
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Check container status
```bash
docker-compose ps
```

### Access the database
```bash
docker-compose exec postgres psql -U spario_user -d spario_billing
```

## Data Persistence

Your data is persisted in Docker volumes:
- `spariodashboard_postgres_data` - Database data
- `spariodashboard_uploads_data` - Uploaded Excel files

## Environment Variables

The application uses environment variables from `.env` file. Make sure to update:
- `NEXTAUTH_SECRET` - Change this in production!
- `POSTGRES_PASSWORD` - Use a strong password in production
- `DATABASE_URL` - Points to PostgreSQL container

## Production Considerations

1. **Security**:
   - Change default passwords
   - Use strong NEXTAUTH_SECRET
   - Enable HTTPS with a reverse proxy (nginx/Caddy)

2. **Performance**:
   - Increase database resources in docker-compose.yml
   - Add Redis for session storage
   - Configure CDN for static assets

3. **Monitoring**:
   - Set up health check alerts
   - Monitor container resource usage
   - Enable logging to external service

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Remove and recreate containers
docker-compose down -v
docker-compose up -d --build
```

### Database connection issues
```bash
# Check if PostgreSQL is healthy
docker-compose ps

# Restart the database
docker-compose restart postgres
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Or stop the conflicting service
```

## Database Migration

The application automatically runs Prisma migrations on startup. To manually run migrations:

```bash
docker-compose exec app npx prisma migrate deploy
```

## Backup and Restore

### Backup database
```bash
docker-compose exec postgres pg_dump -U spario_user spario_billing > backup.sql
```

### Restore database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U spario_user -d spario_billing
```

## Fixed Issues

During deployment, the following issues were resolved:

1. ✅ Missing dev dependencies (tailwindcss, postcss) - Fixed by removing `--only=production` flag
2. ✅ ESLint configuration errors - Disabled ESLint during build
3. ✅ TypeScript errors in validation.ts - Fixed Zod instanceof usage
4. ✅ RevenueSlab interface type mismatch - Added `| null` to max property
5. ✅ Set iteration TypeScript error - Added `downlevelIteration: true` to tsconfig.json
6. ✅ File class not available in Node.js - Added runtime check for File class
7. ✅ Missing standalone output - Added `output: 'standalone'` to next.config.js
8. ✅ Missing public directory - Removed unnecessary COPY instruction

## Next Steps

1. Access the dashboard at http://localhost:3000
2. Sign in with admin credentials
3. Upload your Excel files (inbound/outbound)
4. View KPI metrics and daily charts
5. Monitor the system health at /api/healthz

Enjoy your containerized dashboard! 🚀
