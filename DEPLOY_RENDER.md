# Deploying QuizBanner to Render with Custom Domain

## Prerequisites
1. GitHub account with QuizBanner repository
2. Render account (sign up at https://render.com)
3. Domain purchased (quizbanner.com from Namecheap, GoDaddy, etc.)

## Step 1: Prepare Your Repository

Your repository is already set up! The `render.yaml` file has been created with the deployment configuration.

## Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Blueprint"**
3. **Connect GitHub Repository**:
   - Click "Connect GitHub"
   - Select your `QuizBanner` repository
   - Click "Connect"
4. **Configure Service**:
   - Render will detect `render.yaml` automatically
   - Click "Apply"
5. **Set Environment Variables**:
   - Go to your service settings
   - Add these secret values:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
     - `EMAIL_USER`: vidojam@gmail.com
     - `EMAIL_PASSWORD`: Your Gmail app password
6. **Deploy**: Click "Manual Deploy" → "Deploy latest commit"

Your app will be live at: `https://quizbanner.onrender.com`

## Step 3: Purchase Domain (if not already done)

1. Go to a domain registrar:
   - **Namecheap**: https://www.namecheap.com (~$10-15/year)
   - **Google Domains**: https://domains.google
   - **GoDaddy**: https://www.godaddy.com
2. Search for `quizbanner.com`
3. Purchase the domain

## Step 4: Add Custom Domain to Render

1. **In Render Dashboard**:
   - Go to your `quizbanner` service
   - Click "Settings" tab
   - Scroll to "Custom Domains"
   - Click "Add Custom Domain"
   - Enter: `quizbanner.com`
   - Click "Save"
   - Also add: `www.quizbanner.com`

2. **Render will show you DNS records**:
   ```
   Type: A
   Name: @
   Value: 216.24.57.1
   
   Type: CNAME
   Name: www
   Value: quizbanner.onrender.com
   ```

## Step 5: Configure DNS at Your Domain Registrar

### For Namecheap:
1. Log into Namecheap
2. Go to "Domain List" → Click "Manage" next to quizbanner.com
3. Go to "Advanced DNS" tab
4. Add these records:
   ```
   Type: A Record
   Host: @
   Value: 216.24.57.1
   TTL: Automatic
   
   Type: CNAME Record
   Host: www
   Value: quizbanner.onrender.com
   TTL: Automatic
   ```
5. Remove any existing A or CNAME records for @ and www
6. Save changes

### For GoDaddy:
1. Log into GoDaddy
2. Go to "My Products" → "DNS"
3. Add the same A and CNAME records as above

### For Google Domains:
1. Go to "DNS" settings
2. Add Custom Resource Records with the values above

## Step 6: Wait for DNS Propagation

- DNS changes take 15 minutes to 48 hours (usually ~1 hour)
- Check status at: https://dnschecker.org
- Enter `quizbanner.com` to see if it's propagated globally

## Step 7: Enable SSL (HTTPS)

Render automatically provisions SSL certificates once DNS is configured:
1. Wait for DNS to propagate
2. Render will auto-generate Let's Encrypt SSL certificate
3. Your site will be available at: `https://quizbanner.com`

## Step 8: Update Stripe Settings

1. Go to Stripe Dashboard
2. Update your webhook URL to: `https://quizbanner.com/api/stripe/webhook`
3. Update allowed domains in Stripe settings

## Step 9: Test Your Deployment

1. Visit `https://quizbanner.com`
2. Test guest access
3. Test registration and login
4. Test premium upgrade with Stripe test card: `4242 4242 4242 4242`
5. Test contact form
6. Test on mobile device

## Troubleshooting

**Site Not Loading:**
- Check DNS propagation at dnschecker.org
- Verify DNS records match Render's instructions exactly
- Wait up to 48 hours for full propagation

**Stripe Not Working:**
- Update webhook URL in Stripe dashboard
- Verify environment variables are set in Render
- Check Render logs for errors

**Database Issues:**
- Render free tier uses ephemeral storage (resets on restart)
- For persistent data, upgrade to paid plan or use PostgreSQL
- To use PostgreSQL: Uncomment database section in render.yaml

**Email Not Working:**
- Verify EMAIL_PASSWORD is Gmail App Password (not regular password)
- Get app password at: https://myaccount.google.com/apppasswords
- Check Render logs for email errors

## Cost Breakdown

- **Render Free Tier**: $0/month (with limitations: sleeps after inactivity)
- **Render Starter Plan**: $7/month (always on, better performance)
- **Domain**: $10-15/year
- **Stripe Fees**: 2.9% + $0.30 per transaction

## Upgrading from Free Tier

When you're ready for production:
1. Upgrade to Render Starter plan ($7/month)
2. Add PostgreSQL database for persistence
3. Enable auto-deploy on git push
4. Set up monitoring and alerts

## Free Tier Limitations

- Service sleeps after 15 minutes of inactivity
- Wakes up on first request (takes ~30 seconds)
- Ephemeral storage (resets on restart)
- 750 hours/month free (enough for one service)

**Your app is now live at https://quizbanner.com! 🎉**
