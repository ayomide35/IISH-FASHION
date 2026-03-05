# 🚀 IISH Fashion - Production Setup Guide (FREE)

This guide will help you deploy your e-commerce website live for FREE.

---

## Step 1: Get Hosting (Where Your Website Lives) - **FREE**

You can use free subdomains without buying a domain:

- **Frontend**: `your-app.vercel.app` (free)
- **Backend**: `your-app.onrender.com` (free)

---

## Step 2: Set Up Production Database

### Option A: Aiven (Free MySQL)
1. Go to [aiven.io](https://aiven.io)
2. Sign up with GitHub
3. Create a new MySQL service (Free tier)
4. Get the connection details:
   - Host (e.g., `mysql-iish-fashion.aivencloud.com`)
   - Port: `13092`
   - Database name: `iish_fashion`
   - Username: `avnadmin`
   - Password: `your-password`

### Option B: PlanetScale (Free MySQL)
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up
3. Create a database
4. Get connection string

---

## Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder with these values:

```env
# Database (From your hosting provider)
DB_HOST=your-database-host
DB_PORT=13092
DB_NAME=iish_fashion
DB_USER=your-username
DB_PASSWORD=your-password

# JWT (Generate a random secret - use a password generator)
JWT_SECRET=your-super-secret-key-min-32-characters-long!

# Paystack (For payments - get from paystack.com)
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key

# Server
NODE_ENV=production
PORT=5000

# Frontend URL (Your live website address)
FRONTEND_URL=https://your-domain.com
```

---

## Step 4: Get Paystack Account (For Payments)

1. Go to [paystack.com](https://paystack.com)
2. Sign up as a merchant
3. Complete business verification
4. Get your API keys from Settings → API Keys
5. Use TEST keys for now, switch to LIVE keys later

---

## Step 5: Deploy Backend

### Using Render (Free):
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create a new "Web Service"
4. Connect your GitHub repository
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables from Step 4
6. Click Deploy

---

## Step 6: Deploy Frontend

### Using Vercel (Free):
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Set directory to `app`
5. Add Environment Variable:
   - `VITE_API_URL` = your-backend-url (e.g., https://iish-fashion-api.onrender.com)
6. Click Deploy

---

## Step 7: Update API URL in Frontend

Your frontend is already configured to use environment variables! Just set `VITE_API_URL` when deploying:

### On Vercel:
1. Go to your project settings
2. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-name.onrender.com/api`

The frontend will automatically use this instead of localhost.

---

## Step 8: Test Your Live Website

1. Visit your domain (e.g., `iishfashion.com`)
2. Register a new account
3. Try adding a product to cart
4. Try the checkout process
5. Check Paystack dashboard for test transactions

---

## Quick Checklist Before Going Live

- [ ] Database hosted (not localhost) - Free from Aiven or PlanetScale
- [ ] Backend deployed with environment variables on Render
- [ ] Frontend deployed with correct API URL on Vercel
- [ ] Paystack account set up with API keys
- [ ] Test checkout works
- [ ] HTTPS enabled (automatic with Vercel/Render)

---

## Need Help?

If you get stuck at any step, let me know which step you're on and what error you're seeing!

Good luck! 🎉

