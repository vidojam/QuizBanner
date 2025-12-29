# QuizBanner Deployment & Configuration Checklist

## 🔍 Quick Diagnostics

Run these test scripts to verify your configuration:

```bash
# Test email configuration
node test-email.cjs

# Check deployment configuration
node check-deployment.cjs

# Check premium user status
node check-premium-user.cjs

# Test database connection
node test-connection.js
```

---

## 📋 Render Deployment Configuration Issues

### ⚠️ CRITICAL ISSUES TO FIX:

1. **APP_URL in Render**
   - Current `.env`: `http://192.168.1.191:5000` (local network)
   - Render config: `https://quizbanner.onrender.com` ✅
   - **Issue**: Local `.env` has wrong URL for production
   - **Fix**: Set `APP_URL=https://quizbanner.onrender.com` in Render dashboard

2. **STRIPE_WEBHOOK_SECRET**
   - Missing in both `.env` and `render.yaml`
   - **Required for**: Premium subscription webhooks
   - **Fix**: Get from Stripe Dashboard → Webhooks → Add endpoint
     - Webhook URL: `https://quizbanner.onrender.com/api/webhooks/stripe`
     - Add to Render environment variables

3. **Database Configuration**
   - `render.yaml` has database section commented out
   - Current `.env` has empty `DATABASE_URL`
   - **Issue**: Using SQLite (not recommended for Render)
   - **Fix**: Uncomment database section in `render.yaml` OR use Neon/Supabase

---

## 🔧 Environment Variable Configuration

### For Local Development (.env)
```env
APP_URL=http://localhost:5000
# Or for network access:
APP_URL=http://192.168.1.191:5000
```

### For Render Deployment (Environment Variables)
Must set these in Render Dashboard → Settings → Environment Variables:

```
✅ Already Set:
- NODE_ENV=production
- EMAIL_HOST=smtp.gmail.com
- EMAIL_PORT=587
- EMAIL_FROM=QuizBanner <noreply@quizbanner.com>
- APP_URL=https://quizbanner.onrender.com

❌ Must Add Manually:
- STRIPE_SECRET_KEY=sk_live_... (from Stripe)
- STRIPE_PUBLISHABLE_KEY=pk_live_... (from Stripe)
- STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe webhooks)
- EMAIL_USER=vidojam@gmail.com
- EMAIL_PASSWORD=rpqq... (Gmail App Password)

🔄 Auto-Generated (already done):
- SESSION_SECRET (Render auto-generates)
- JWT_SECRET (Render auto-generates)
- DATABASE_URL (from database if connected)
```

---

## 🚀 Stripe Webhook Setup for Render

### Step 1: Create Webhook Endpoint in Stripe
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://quizbanner.onrender.com/api/webhooks/stripe`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_...`)

### Step 2: Add to Render
1. Go to Render Dashboard → Your Service
2. Environment tab
3. Add new variable:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (from Step 1)
4. Save changes

---

## 🗄️ Database Options for Render

### Option 1: PostgreSQL on Render (Free Tier)
**⚠️ Free tier expires after 90 days**

Uncomment in `render.yaml`:
```yaml
databases:
  - name: quizbanner-db
    databaseName: quizbanner
    plan: free
```

### Option 2: Neon PostgreSQL (Recommended - Free Forever)
1. Sign up: https://neon.tech
2. Create database
3. Copy connection string
4. Add to Render: `DATABASE_URL=postgresql://...`

### Option 3: Supabase PostgreSQL
1. Sign up: https://supabase.com
2. Create project
3. Get connection string from Settings → Database
4. Add to Render: `DATABASE_URL=postgresql://...`

---

## 📧 Contact Form Testing

### Test locally:
```bash
# Run email test
node test-email.cjs
```

### Test on Render:
1. Go to: `https://quizbanner.onrender.com/contact`
2. Fill out form
3. Submit
4. Check logs in Render Dashboard → Logs tab

### Common Issues:
- **"Failed to send email"**: Check Gmail App Password
- **"Contact form not found"**: Check route is registered
- **500 error**: Check server logs for details

---

## 💎 Premium User Testing

### Test Guest Premium (No Auth):
```bash
GET https://quizbanner.onrender.com/api/guest/premium/:guestId
```

### Test Link Guest to User (With Auth):
```bash
POST https://quizbanner.onrender.com/api/guest/link
Headers: Authorization: Bearer <jwt-token>
Body: { "guestId": "..." }
```

### Check User Premium Status:
```bash
GET https://quizbanner.onrender.com/api/user
Headers: Authorization: Bearer <jwt-token>
```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` from dev value (Render auto-generates ✅)
- [ ] Change `SESSION_SECRET` from dev value (Render auto-generates ✅)
- [ ] Use HTTPS in production (Render provides free SSL ✅)
- [ ] Use Stripe live keys (not test keys)
- [ ] Set up Stripe webhook secret
- [ ] Use production database (not SQLite)
- [ ] Set correct `APP_URL` for emails

---

## 📊 Monitoring & Debugging

### Check Render Logs:
```bash
# In Render Dashboard
1. Go to your service
2. Click "Logs" tab
3. Watch for errors
```

### Common Log Messages:
- ✅ `serving on 0.0.0.0:10000` - Server started
- ✅ `Contact form email sent successfully` - Email working
- ❌ `Failed to send contact form email` - Email issue
- ❌ `Payment system not configured` - Stripe issue

### Test Endpoints:
```bash
# Health check
curl https://quizbanner.onrender.com/

# Test contact (no auth)
curl -X POST https://quizbanner.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'

# Test auth
curl https://quizbanner.onrender.com/api/user \
  -H "Authorization: Bearer <token>"
```

---

## 🎯 Next Steps

1. ✅ **Run diagnostic scripts**:
   ```bash
   node test-email.cjs
   node check-deployment.cjs
   ```

2. ⚠️ **Fix Stripe webhook**:
   - Create webhook in Stripe Dashboard
   - Add `STRIPE_WEBHOOK_SECRET` to Render

3. ⚠️ **Choose database**:
   - Enable PostgreSQL on Render, OR
   - Set up Neon/Supabase

4. ✅ **Deploy and test**:
   - Push changes to GitHub
   - Render auto-deploys
   - Test contact form
   - Test premium features

5. 🎉 **Go live!**
