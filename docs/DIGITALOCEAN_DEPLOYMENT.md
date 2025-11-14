# DigitalOcean App Platform Deployment Guide

## 🌊 Deploy to DigitalOcean App Platform

### Why DigitalOcean App Platform?
- ✅ **$5/month free credit** for starter apps
- ✅ **Node.js support** (native Next.js deployment)
- ✅ **Managed PostgreSQL** included
- ✅ **Auto-deploy** from GitHub
- ✅ **Free SSL** certificate
- ✅ **Easy scaling** when you grow

---

## 📋 Prerequisites

1. DigitalOcean account (sign up at https://digitalocean.com)
2. GitHub repository with your code (already done ✅)
3. A secure password for admin access

---

## 🚀 Deployment Steps

### Method 1: Using App Spec File (Recommended)

1. **Log in to DigitalOcean**
   - Go to: https://cloud.digitalocean.com/apps

2. **Create New App**
   - Click "Create App"
   - Select "GitHub" as source
   - Authorize DigitalOcean to access your GitHub

3. **Select Repository**
   - Choose: `heyyrintu/sparo-billing-dashboard`
   - Branch: `main`
   - ✅ Check "Autodeploy" (deploys automatically on push)

4. **Import App Spec**
   - Click "Edit App Spec"
   - Copy the contents from `.do/app.yaml` in your repo
   - Paste and click "Save"

5. **Configure Secrets**
   Click on your app → Settings → Environment Variables:
   
   **Generate NEXTAUTH_SECRET**:
   ```powershell
   # Run in PowerShell:
   $bytes = New-Object byte[] 32
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```
   
   **Set these variables**:
   ```
   NEXTAUTH_SECRET=<paste-generated-secret>
   ADMIN_PASSWORD=<your-secure-password>
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait 5-10 minutes for build and deployment
   - Your app will be live at: `https://your-app-name.ondigitalocean.app`

---

### Method 2: Manual Configuration (Step-by-Step)

1. **Log in to DigitalOcean**
   - https://cloud.digitalocean.com/apps

2. **Create App**
   - Click "Create App"
   - Select "GitHub"
   - Choose repository: `heyyrintu/sparo-billing-dashboard`

3. **Configure Build**
   - Source: Root directory
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - HTTP Port: `3000`

4. **Add PostgreSQL Database**
   - Click "Add Resource"
   - Select "Database"
   - Choose "PostgreSQL 15"
   - Name: `spario-db`
   - Plan: Dev Database ($7/month) or Basic ($15/month)

5. **Set Environment Variables**
   Go to Settings → Environment Variables:
   
   ```
   DATABASE_URL=${spario-db.DATABASE_URL}
   NEXTAUTH_SECRET=<generate with command above>
   NEXTAUTH_URL=${APP_URL}
   ADMIN_EMAIL=admin@dronalogitech.cloud
   ADMIN_PASSWORD=drona@12345
   NODE_ENV=production
   PORT=3000
   ```

6. **Configure Health Check**
   - Path: `/api/healthz`
   - Initial Delay: 60 seconds
   - Period: 10 seconds
   - Timeout: 5 seconds

7. **Choose Plan**
   - **Basic (Recommended)**: $5/month
     - 512 MB RAM
     - Good for starter apps
   
   - **Professional**: $12/month
     - 1 GB RAM
     - For production apps

8. **Review & Launch**
   - Review all settings
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)

---

## 🔐 Post-Deployment Setup

### 1. Run Database Migrations

**Option A: Using Console**
   - Go to your app → Console tab
   - Click "Launch Console"
   - Run:
     ```bash
     npx prisma migrate deploy
     npx prisma db seed
     ```

**Option B: SSH Access**
   ```bash
   doctl apps create-deployment <app-id> --exec "npx prisma migrate deploy && npx prisma db seed"
   ```

### 2. Verify Deployment
   - Visit: `https://your-app-name.ondigitalocean.app`
   - Try: `https://your-app-name.ondigitalocean.app/api/healthz`
   - Should return: `{"status":"ok"}`

### 3. Test Login
   - Go to: `https://your-app-name.ondigitalocean.app/auth/signin`
   - Login with:
     - Email: `admin@dronalogitech.cloud`
     - Password: `drona@12345`

---

## 💰 Pricing Breakdown

### Starter Setup (Recommended)
- **App**: $5/month (Basic - 512MB RAM)
- **Database**: $7/month (Dev Database - 1GB storage)
- **Total**: **$12/month**

### Production Setup
- **App**: $12/month (Professional - 1GB RAM)
- **Database**: $15/month (Basic - 10GB storage)
- **Total**: **$27/month**

**Free Credits**:
- New users get $200 credit for 60 days
- Promo codes available (check DigitalOcean website)

---

## 🔧 Configuration Options

### Custom Domain
1. Go to Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `dashboard.yourdomain.com`)
4. Update DNS:
   ```
   Type: CNAME
   Host: dashboard
   Value: your-app-name.ondigitalocean.app
   ```
5. SSL certificate auto-generated (free)

### Scaling
- Settings → Resources → Edit Component
- Increase instance size or count
- Changes apply on next deployment

### Auto-Deploy
- Already enabled if you selected "Autodeploy"
- Every `git push` triggers deployment
- View logs in App Platform dashboard

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs in DigitalOcean dashboard
# Common issues:
# 1. Missing environment variables
# 2. Build configuration errors
# 3. Build timeout (increase in settings)
```

### Database Connection Issues
```bash
# Verify DATABASE_URL
# Format: postgresql://user:pass@host:25060/dbname?sslmode=require

# Test connection in console:
npx prisma db pull
```

### Migration Errors
```bash
# Reset migrations (CAUTION: destroys data)
npx prisma migrate reset

# Or force deploy:
npx prisma migrate deploy --skip-generate
```

### App Won't Start
```bash
# Check application logs
# Verify health check endpoint works
# Ensure PORT environment variable is set to 3000
# Check build and start commands are correct
```

---

## 📊 Monitoring

### Built-in Monitoring
- Go to your app → Insights
- View:
  - CPU usage
  - Memory usage
  - Request rates
  - Response times
  - Error rates

### Alerts
- Settings → Alerts
- Configure notifications for:
  - Deployment failures
  - High resource usage
  - Domain issues
  - Health check failures

### Logs
- Go to Runtime Logs
- Filter by:
  - Build logs
  - Deploy logs
  - App logs
- Real-time streaming available

---

## 🔄 Updating Your App

### Automatic Updates
- `git push origin main` → Auto-deploys ✨

### Manual Deployment
- Go to your app dashboard
- Click "Deploy" dropdown
- Select "Force Rebuild and Deploy"

### Rollback
- Go to Activity tab
- Find previous deployment
- Click "Rollback to this deployment"

---

## 🎯 Quick Commands Reference

### Deploy from CLI
```bash
# Install doctl (DigitalOcean CLI)
# Windows (PowerShell as Admin):
choco install doctl

# Or download from: https://github.com/digitalocean/doctl/releases

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml

# List apps
doctl apps list

# Get app ID
doctl apps list --format ID,Spec.Name

# View logs
doctl apps logs <app-id> --type RUN

# Run command in app
doctl apps create-deployment <app-id> --exec "npm run migrate"
```

---

## ✅ Pre-Deployment Checklist

Before deploying, make sure:

- [ ] `.do/app.yaml` is configured
- [ ] `NEXTAUTH_SECRET` is generated (32+ characters)
- [ ] `ADMIN_PASSWORD` is changed from default
- [ ] `DATABASE_URL` will be auto-populated by DO
- [ ] Health check endpoint `/api/healthz` works locally
- [ ] Application builds successfully (`npm run build`)
- [ ] All code is pushed to GitHub
- [ ] Repository is accessible to DigitalOcean

---

## 🎉 You're Ready!

Your app will be live at:
```
https://your-app-name.ondigitalocean.app
```

Sign in at:
```
https://your-app-name.ondigitalocean.app/auth/signin
```

With:
- Email: `admin@dronalogitech.cloud`
- Password: `drona@12345`

---

## 📞 Need Help?

- DigitalOcean Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community
- Support: https://cloud.digitalocean.com/support

---

## 💡 Pro Tips

1. **Use Dev Database** for testing ($7/month)
2. **Enable auto-deploy** for convenience
3. **Set up alerts** for deployment failures
4. **Monitor logs** regularly
5. **Use custom domain** for professional look
6. **Enable backups** for production
7. **Review monthly costs** in Billing section

---

## 🚀 Next Steps After Deployment

1. **Test thoroughly**:
   - Upload Excel files
   - Verify KPI calculations
   - Test all features

2. **Set up monitoring**:
   - Enable DO monitoring
   - Configure Sentry for errors
   - Set up uptime monitoring

3. **Backup strategy**:
   - Enable automated database backups
   - Export data regularly

4. **Security**:
   - Review environment variables
   - Enable 2FA on DO account
   - Rotate secrets periodically

5. **Documentation**:
   - Document your deployment
   - Note any custom configurations
   - Keep credentials secure

---

**Your dashboard is production-ready! 🎊**
