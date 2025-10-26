# Deployment Guide for Render

This guide will help you deploy the LIANA CRM application to Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Quick Deploy

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/liana-crm.git
   git push -u origin main
   \`\`\`

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and configure everything

3. **Set Environment Variables**
   - After deployment, go to your service settings
   - Update `FRONTEND_URL` to your Render URL (e.g., `https://liana-crm.onrender.com`)
   - Render will auto-generate secure values for `AUTH_SECRET`, `JWT_SECRET`, and `PASSWORD_SALT`

### Option 2: Manual Setup

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name**: liana-crm
     - **Environment**: Node
     - **Region**: Choose closest to you
     - **Branch**: main
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

2. **Add Persistent Disk**
   - In service settings, go to "Disks"
   - Click "Add Disk"
   - **Name**: liana-data
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB (free tier)

3. **Set Environment Variables**
   Generate secure secrets:
   \`\`\`bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   \`\`\`

   Add these environment variables in Render:
   \`\`\`
   NODE_ENV=production
   PORT=3000
   DATABASE_PATH=/var/data/database.sqlite
   FRONTEND_URL=https://your-app.onrender.com
   AUTH_SECRET=<generated-secret-1>
   JWT_SECRET=<generated-secret-2>
   PASSWORD_SALT=<generated-secret-3>
   \`\`\`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)

## Post-Deployment

### Access Your Application

Your app will be available at: `https://your-service-name.onrender.com`

### Default Login Credentials

- **Username**: Elena | **Password**: 12345
- **Username**: Anna | **Password**: 09876

**⚠️ IMPORTANT**: Change these passwords immediately after first login!

### Update Frontend URL

After deployment, update the `FRONTEND_URL` environment variable to match your actual Render URL.

## Local Network Access

To access your app from other devices on your local network:

1. **Find your local IP address**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr` (look for inet)

2. **Set environment variables**:
   \`\`\`bash
   FRONTEND_URL=http://192.168.1.100:3000
   \`\`\`

3. **Start the server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access from other devices**:
   - Open browser on another device
   - Navigate to `http://192.168.1.100:3000`

## Troubleshooting

### Database Issues

If you see "NOT NULL constraint failed" errors:
- Check that `DATABASE_PATH` points to `/var/data/database.sqlite`
- Ensure the persistent disk is properly mounted

### CORS Errors

If you see CORS errors in the browser console:
- Verify `FRONTEND_URL` matches your actual Render URL
- Check that cookies are enabled in your browser

### Build Failures

If the build fails with SQLite errors:
- Render will automatically rebuild `better-sqlite3` for the correct platform
- Check build logs for specific errors

### Connection Issues

If the app doesn't load:
- Check that both Next.js (port 3000) and Express server (port 8000) are running
- Verify the `start` script in `package.json` uses `concurrently`

## Security Checklist

- ✅ Change default admin passwords
- ✅ Use strong, randomly generated secrets
- ✅ Enable HTTPS (automatic on Render)
- ✅ Set `NODE_ENV=production`
- ✅ Never commit `.env` files to Git
- ✅ Regularly backup your database

## Monitoring

- **Logs**: View real-time logs in Render Dashboard
- **Metrics**: Monitor CPU, memory, and bandwidth usage
- **Alerts**: Set up email notifications for downtime

## Scaling

Free tier limitations:
- Sleeps after 15 minutes of inactivity
- 750 hours/month of runtime
- 100 GB bandwidth

To upgrade:
- Go to service settings
- Choose a paid plan for 24/7 uptime
- Increase disk size if needed

## Support

For issues:
1. Check Render logs for errors
2. Review this deployment guide
3. Contact Render support: https://render.com/docs

---

**Deployed successfully?** Don't forget to update `FRONTEND_URL` and change default passwords!
