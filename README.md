# IISH Fashion - Full-Stack E-Commerce Platform

A premium streetwear e-commerce platform built with React, Node.js, Express, and MySQL. Designed for the modern Nigerian market with integrated payment solutions.

![IISH Fashion](https://via.placeholder.com/800x400?text=IISH+Fashion)

## Features

### Frontend
- **Luxury UI/UX**: Premium design inspired by high-end fashion brands
- **Responsive Design**: Mobile-first approach for all devices
- **Product Catalog**: Browse round-neck and sleeveless shirts
- **Shopping Cart**: Add, update, and remove items
- **User Authentication**: JWT-based secure login/register
- **Checkout Flow**: Seamless payment integration
- **Order Tracking**: Track orders in real-time
- **Wishlist**: Save favorite items for later

### Backend
- **RESTful API**: Clean, well-documented API endpoints
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: USER and ADMIN roles
- **Payment Integration**: Paystack for Nigerian payments
- **Inventory Management**: Real-time stock tracking
- **Order Management**: Complete order lifecycle

### Admin Dashboard
- **Sales Analytics**: Revenue, orders, and customer insights
- **Product Management**: CRUD operations for products
- **Order Management**: Update order statuses
- **Customer Management**: View and manage customers
- **Inventory Alerts**: Low stock notifications

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS
- React Router DOM
- Lucide React (Icons)
- Sonner (Toast notifications)

### Backend
- Node.js
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- bcryptjs (Password hashing)
- Paystack API
- Multer (File uploads)

### Database
- MySQL 8.0+
- Pre-configured schema with relationships
- Stored procedures for inventory management

## Project Structure

```
iish-fashion/
├── app/                    # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth, Cart)
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin dashboard pages
│   │   └── App.tsx         # Main app component
│   └── package.json
├── backend/                # Node.js Backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # External services (Paystack)
│   │   └── server.js       # Entry point
│   ├── database/
│   │   ├── schema.sql      # Database schema
│   │   └── seed.js         # Sample data
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Paystack account (for payments)

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE iish_fashion;

# Import schema
USE iish_fashion;
SOURCE backend/database/schema.sql;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
# - Database credentials
# - JWT secrets
# - Paystack API keys

# Run database seeder
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd app

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Admin Dashboard**: Login with admin credentials

## Default Credentials

### Admin
- **Email**: admin@iishfashion.com
- **Password**: Admin@123

### Customer (Demo)
- **Email**: customer@example.com
- **Password**: Customer@123

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List all products
- `GET /api/products/:slug` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/new-arrivals` - Get new arrivals
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item

### Orders
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/track/:orderNumber` - Track order

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `GET /api/payments/verify` - Verify payment callback
- `POST /api/payments/webhook` - Paystack webhook

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/analytics/inventory` - Inventory report

## Payment Integration

This project uses **Paystack** for Nigerian payment processing:

- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- USSD payments
- QR code payments

### Setup
1. Create a Paystack account at https://paystack.com
2. Get your API keys from the dashboard
3. Add keys to backend `.env`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_...
   PAYSTACK_PUBLIC_KEY=pk_test_...
   ```
4. Set up webhook URL in Paystack dashboard: `https://yourdomain.com/api/payments/webhook`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=iish_fashion
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Backend Deployment
1. Set up a VPS (DigitalOcean, AWS, etc.)
2. Install Node.js and MySQL
3. Clone repository and install dependencies
4. Set up environment variables
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name iish-api
   ```

### Frontend Deployment
1. Build the application:
   ```bash
   cd app
   npm run build
   ```
2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Input validation with express-validator
- Rate limiting on auth endpoints
- CORS configuration
- Helmet.js for security headers
- SQL injection protection via parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For support, email hello@iishfashion.com or join our Slack channel.

---

Built with ❤️ in Nigeria by IISH Fashion Team
