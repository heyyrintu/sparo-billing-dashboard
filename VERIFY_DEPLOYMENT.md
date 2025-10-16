# 🚀 Deployment Verification Checklist

## ✅ Your app is LIVE on DigitalOcean!

### Step 1: Test Health Endpoint

Open your browser or use curl:
```bash
curl https://your-app-name.ondigitalocean.app/api/healthz
```

**Expected Response:**
```json
{"status":"ok"}
```

### Step 2: Access the Application

Visit: `https://your-app-name.ondigitalocean.app`

You should see the **Drona Logitech Dashboard** sign-in page.

### Step 3: Login with Production Credentials

**Email**: `admin@dronalogitech.cloud`  
**Password**: `drona@12345`

### Step 4: Test Core Functionality

1. **Dashboard Loads**: ✓ Main dashboard displays
2. **KPI Cards**: ✓ Shows revenue metrics
3. **Upload Inbound**: 
   - Click "Upload Inbound"
   - Select `sample-data/inbound-sample.xlsx`
   - Verify upload succeeds
4. **Upload Outbound**:
   - Click "Upload Outbound"
   - Select `sample-data/outbound-sample.xlsx`
   - Verify upload succeeds
5. **Data Display**: ✓ Dashboard updates with uploaded data
6. **Charts**: ✓ Daily revenue chart displays
7. **Admin Panel**: Visit `/admin` to see upload history

### Step 5: Database Verification

Check that the database was seeded:
- Admin user exists: `admin@dronalogitech.cloud`
- Can login successfully
- Database tables created

---

## 🎯 Performance Checks

### Load Time
- Initial page load: < 3 seconds ✓
- API responses: < 1 second ✓

### Database
- Connection: Stable ✓
- Migrations: Applied ✓
- Seeding: Complete ✓

### Docker Container
- Status: Running ✓
- Health checks: Passing ✓
- Memory usage: < 512MB ✓

---

## 🔧 Troubleshooting (If Needed)

### App Not Loading?

1. **Check DigitalOcean Dashboard**:
   - Go to Apps → spario-billing-dashboard
   - Check "Runtime Logs" tab
   - Look for startup messages

2. **Check Container Status**:
   - Should show "Running"
   - Health checks should be green

3. **Check Database Connection**:
   - Verify `DATABASE_URL` is set
   - Check PostgreSQL database is running

### Login Not Working?

1. **Check Environment Variables**:
   ```
   ADMIN_EMAIL=admin@dronalogitech.cloud
   ADMIN_PASSWORD=drona@12345
   NEXTAUTH_SECRET=<set-in-do-dashboard>
   ```

2. **Check Seed Logs**:
   - Look for "Admin user created" in logs
   - If missing, database seeding may have failed

3. **Manual Database Check** (if needed):
   - Connect to PostgreSQL
   - Run: `SELECT * FROM "User" WHERE email = 'admin@dronalogitech.cloud';`

### File Upload Failing?

1. **Check Permissions**:
   - `/data/uploads` directory should exist
   - Owned by `nextjs:nodejs` user

2. **Check File Size**:
   - Default max: 10MB
   - Increase via `MAX_FILE_SIZE` env var if needed

3. **Check Logs**:
   - Look for upload errors in Runtime Logs
   - Verify Prisma can write to database

---

## 📊 Monitoring

### DigitalOcean Metrics

Watch these in your DO dashboard:

1. **CPU Usage**: Should be < 50% normally
2. **Memory Usage**: Should be < 400MB
3. **Response Time**: < 500ms average
4. **Error Rate**: Should be 0%

### Database Metrics

1. **Connections**: Active connections < 10
2. **Storage**: Used < 500MB (1GB total)
3. **Query Performance**: < 100ms average

---

## 🎉 Success Indicators

✅ Health endpoint returns `{"status":"ok"}`  
✅ Login page loads without errors  
✅ Can authenticate with admin credentials  
✅ Dashboard displays after login  
✅ File uploads work correctly  
✅ Data persists across sessions  
✅ Charts and visualizations render  
✅ Admin panel shows upload history  

---

## 🔐 Security Reminder

### After First Login:

1. **Change Admin Password**:
   - Implement password change feature
   - Or manually update in database

2. **Rotate NEXTAUTH_SECRET**:
   - Generate new secret: `openssl rand -base64 32`
   - Update in DigitalOcean environment variables

3. **Review Logs**:
   - Check for unauthorized access attempts
   - Monitor error patterns

4. **Enable Monitoring**:
   - Set up alerts for errors
   - Monitor resource usage

---

## 📱 Custom Domain (spario.dronalogitech.cloud)

### Google Safe Browsing Warning

If you see the "Dangerous site" warning:

1. **Submit for Review**: https://safebrowsing.google.com/safebrowsing/report_error/?hl=en
   - Enter: `spario.dronalogitech.cloud`
   - Request review

2. **Wait 24-48 hours** for Google to clear the false positive

3. **Use Default Domain** in the meantime:
   - `https://your-app-name.ondigitalocean.app`
   - No warnings on DO domain

### DNS Configuration

If custom domain isn't working:

1. **Check DNS Records**:
   - Type: `CNAME` or `A`
   - Points to DigitalOcean app
   - TTL: 3600 (1 hour)

2. **Wait for Propagation**:
   - Can take up to 48 hours
   - Check with: `dig spario.dronalogitech.cloud`

3. **Update in DigitalOcean**:
   - Apps → Settings → Domains
   - Add custom domain
   - Follow SSL certificate setup

---

## 🎊 You're Live!

Your Drona Logitech Billing Dashboard is now:

- ✅ **Running** on DigitalOcean App Platform
- ✅ **Secure** with HTTPS and authentication
- ✅ **Scalable** with managed PostgreSQL
- ✅ **Production-ready** with health checks
- ✅ **Auto-deploying** on git push

**Cost**: ~$12/month (Basic app + Dev database)

---

## 📞 Need Help?

- **Logs**: DigitalOcean Dashboard → Apps → Runtime Logs
- **Database**: DigitalOcean Dashboard → Databases → Console
- **Docs**: `/DIGITALOCEAN_DEPLOYMENT.md`
- **Repository**: https://github.com/heyyrintu/sparo-billing-dashboard

---

**Congratulations on your successful deployment! 🚀**
