# IISH Fashion - Setup Guide

This guide will walk you through setting up the IISH Fashion e-commerce platform on your local machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Payment Configuration](#payment-configuration)
6. [Admin Access](#admin-access)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher): https://nodejs.org
- **MySQL** (v8.0 or higher): https://mysql.com
- **Git**: https://git-scm.com

Verify installations:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
mysql --version   # Should show 8.0.x or higher
```

## Database Setup

### 1. Start MySQL Server

**Windows:**
```bash
# MySQL usually runs as a service
net start mysql
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### 2. Create Database

Login to MySQL:
```bash
mysql -u root -p
```

Create the database:
```sql
CREATE DATABASE iish_fashion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Import Schema

```bash
cd backend/database
mysql -u root -p iish_fashion < schema.sql
```

Or from within MySQL:
```sql
USE iish_fashion;
SOURCE backend/database/schema.sql;
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=iish_fashion
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=admin@iishfashion.com
ADMIN_PASSWORD=Admin@123

# Paystack Configuration (Optional for local development)
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Seed Database with Sample Data

```bash
npm run seed
```

This will create:
- Admin user: `admin@iishfashion.com` / `Admin@123`
- Sample customer: `customer@example.com` / `Customer@123`
- 8 sample products with images and inventory

### 5. Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at: http://localhost:5000

Test the API:
```bash
curl http://localhost:5000/health
```

## Frontend Setup

### 1. Navigate to Frontend Directory

Open a new terminal window/tab:
```bash
cd app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:
```bash
cp .env.example .env
```

The default should work for local development:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Server

```bash
npm run dev
```

The frontend will be available at: http://localhost:5173

## Payment Configuration

### Paystack Setup (Optional for local development)

1. Create a free account at https://paystack.com
2. Get your test API keys from the dashboard
3. Add to backend `.env`:
   ```env
   PAYSTACK_SECRET_KEY=sk_test_...
   PAYSTACK_PUBLIC_KEY=pk_test_...
   ```
4. For webhooks in production, set up the webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```

### Testing Payments

Use Paystack test cards:
- **Card Number**: 4084 0840 8408 4081
- **Expiry**: Any future date
- **CVV**: 000
- **PIN**: 1234

## Admin Access

### Default Admin Credentials

- **Email**: admin@iishfashion.com
- **Password**: Admin@123

### Accessing Admin Dashboard

1. Login at http://localhost:5173/login
2. Use admin credentials
3. Navigate to http://localhost:5173/admin

### Admin Features

- Dashboard with sales analytics
- Product management (add, edit, delete)
- Order management (update status, tracking)
- Customer management
- Inventory monitoring

## Project Structure

```
iish-fashion/
├── app/                      # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── layouts/          # Page layouts
│   │   ├── pages/            # Page components
│   │   │   └── admin/        # Admin pages
│   │   └── App.tsx           # Main app
│   ├── .env                  # Frontend env vars
│   └── package.json
├── backend/                  # Node.js Backend
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # External services
│   │   └── server.js         # Entry point
│   ├── database/
│   │   ├── schema.sql        # Database schema
│   │   └── seed.js           # Sample data
│   ├── .env                  # Backend env vars
│   └── package.json
└── README.md
```

## Troubleshooting

### Common Issues

#### 1. MySQL Connection Error

**Error**: `Error connecting to MySQL: Access denied`

**Solution**:
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Grant privileges:
  ```sql
  GRANT ALL PRIVILEGES ON iish_fashion.* TO 'root'@'localhost';
  FLUSH PRIVILEGES;
  ```

#### 2. Port Already in Use

**Error**: `EADDRINUSE: Address already in use :::5000`

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```

#### 3. CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Default: `FRONTEND_URL=http://localhost:5173`

#### 4. JWT Token Errors

**Error**: `Invalid or expired token`

**Solution**:
- Clear browser localStorage
- Login again
- Check `JWT_SECRET` is set correctly

#### 5. Payment Initialization Fails

**Error**: `Failed to initialize payment`

**Solution**:
- Verify Paystack API keys are correct
- Check that order total is at least ₦100 (Paystack minimum)
- Ensure backend can reach Paystack API

### Getting Help

If you encounter issues not covered here:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MySQL is running and accessible

## Next Steps

1. **Customize the design**: Edit `app/src/App.css` for styling
2. **Add more products**: Use the admin dashboard
3. **Configure email**: Set up SMTP for order notifications
4. **Deploy to production**: See README.md for deployment guide

## Development Commands

### Backend
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm run seed     # Seed database
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

For more information, see the main [README.md](README.md)
