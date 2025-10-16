# Deployment Guide - Spario Billing Dashboard

## 🚀 Hosting Options

### Option 1: Vercel + Neon PostgreSQL (Recommended - FREE)

**Pros**: 
- Free tier available
- Automatic deployments from GitHub
- Built for Next.js
- Easy setup

**Steps**:

1. **Create Neon Database** (Free PostgreSQL)
   - Go to https://neon.tech
   - Sign up and create a new project
   - Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository: `heyyrintu/sparo-billing-dashboard`
   - Configure Environment Variables:
     ```
     DATABASE_URL=postgresql://your-neon-connection-string
     NEXTAUTH_SECRET=generate-a-random-32-character-string
     NEXTAUTH_URL=https://your-app-name.vercel.app
     ADMIN_EMAIL=admin@dronalogitech.cloud
     ADMIN_PASSWORD=drona@12345
     ```
   - Click "Deploy"

3. **Run Database Migrations**
   - After deployment, go to Vercel dashboard
   - Project Settings → Storage → Connect Neon database
   - In terminal, run:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```

**Cost**: FREE (Neon: 500MB, Vercel: 100GB bandwidth)

---

### Option 2: Railway (Easiest - All-in-One)

**Pros**:
- Includes PostgreSQL database
- One-click deployment
- Free $5 credit monthly

**Steps**:

1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select `heyyrintu/sparo-billing-dashboard`
5. Railway will auto-detect and create PostgreSQL
6. Add Environment Variables:
   ```
   NEXTAUTH_SECRET=generate-a-random-32-character-string
   ADMIN_EMAIL=drona_admin@spario.com
   ADMIN_PASSWORD=admin123
   ```
7. Click "Deploy"

**Cost**: FREE $5/month credit (usually enough for small apps)

---

### Option 3: Docker VPS (DigitalOcean/AWS/Azure)

**Pros**:
- Full control
- Your existing Docker setup works
- Can handle larger scale

**Steps**:

1. **Create a VPS** (Choose one):
   - DigitalOcean: $6/month droplet
   - AWS EC2: t2.micro (free tier)
   - Azure: B1s (free tier available)

2. **SSH into your server**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Docker & Docker Compose**:
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   apt install docker-compose -y
   ```

4. **Clone your repository**:
   ```bash
   git clone https://github.com/heyyrintu/sparo-billing-dashboard.git
   cd sparo-billing-dashboard
   ```

5. **Create production environment file**:
   ```bash
   nano .env.production
   ```
   Add:
   ```
   DATABASE_URL=postgresql://spario:CHANGE_THIS_PASSWORD@postgres:5432/spario_dashboard
   NEXTAUTH_SECRET=GENERATE_A_STRONG_SECRET_HERE
   NEXTAUTH_URL=http://your-server-ip:3000
   ADMIN_EMAIL=admin@dronalogitech.cloud
   ADMIN_PASSWORD=drona@12345
   ```

6. **Update docker-compose.yml for production**:
   ```bash
   nano docker-compose.yml
   ```
   Update environment variables to use stronger passwords

7. **Start the application**:
   ```bash
   docker-compose up -d
   ```

8. **Set up domain (optional)**:
   - Point your domain to server IP
   - Install Nginx as reverse proxy
   - Install SSL certificate with Let's Encrypt

**Cost**: $5-6/month (DigitalOcean/Vultr)

---

### Option 4: Render (Docker Support)

**Pros**:
- Native Docker support
- Free PostgreSQL database
- Auto-deploy from GitHub

**Steps**:

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub and select your repository
4. Choose "Docker" as environment
5. Add PostgreSQL database (free tier)
6. Set Environment Variables:
   ```
   DATABASE_URL=internal-postgres-connection-string
   NEXTAUTH_SECRET=generate-random-string
   NEXTAUTH_URL=https://your-app.onrender.com
   ADMIN_EMAIL=admin@dronalogitech.cloud
   ADMIN_PASSWORD=drona@12345
   ```
7. Deploy

**Cost**: FREE tier available (with limitations)

---

## 🔐 Security Checklist Before Going Live

- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Generate a strong `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Update `NEXTAUTH_URL` to your actual domain
- [ ] Change PostgreSQL password in production
- [ ] Enable HTTPS/SSL
- [ ] Set up backup strategy for database
- [ ] Configure CORS if needed
- [ ] Review and limit file upload sizes
- [ ] Set up monitoring/logging

---

## 🎯 Recommended Quick Start

**For Beginners**: Railway (easiest, all-in-one)
**For Best Performance**: Vercel + Neon (optimized for Next.js)
**For Full Control**: VPS with Docker (most flexible)

---

## 📋 Environment Variables Reference

### Required Variables:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NEXTAUTH_SECRET=your-secret-min-32-chars
NEXTAUTH_URL=https://your-domain.com
```

### Optional Variables:
```bash
ADMIN_EMAIL=admin@dronalogitech.cloud
ADMIN_PASSWORD=drona@12345
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/data/uploads
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=3600000
```

---

## 🔄 Post-Deployment Steps

1. **Test the deployment**:
   - Visit your URL
   - Try logging in with admin credentials
   - Upload sample Excel files
   - Verify KPI cards display data

2. **Set up backups**:
   - Configure automated database backups
   - Test restore procedure

3. **Monitor application**:
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure error tracking (Sentry)
   - Enable application logs

4. **Update DNS** (if using custom domain):
   - Point A record to server IP
   - Add CNAME for www subdomain
   - Wait for DNS propagation (5-60 minutes)

---

## 🆘 Troubleshooting

### Database Connection Issues:
```bash
# Test database connection
docker-compose exec app npx prisma db pull

# Check database logs
docker-compose logs postgres
```

### Application Not Starting:
```bash
# Check application logs
docker-compose logs app

# Restart containers
docker-compose restart
```

### Migration Errors:
```bash
# Reset and re-run migrations
docker-compose exec app npx prisma migrate reset
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

---

## 📞 Need Help?

- Check application logs: `docker-compose logs app`
- Check database status: `docker-compose ps`
- Health check: `curl http://your-domain/api/healthz`

---

## 🎉 You're Ready to Deploy!

Choose your hosting option above and follow the steps. Your dashboard will be live in minutes!
