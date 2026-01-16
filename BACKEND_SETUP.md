# 🎮 LastRunx Backend Setup Guide

## 📋 Quick Start Checklist

### 1. **Install PostgreSQL Database**
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/

# After installation, create database
psql -U postgres
CREATE DATABASE lastrunx_db;
\q
```

### 2. **Setup Environment Variables**
Create `.env` file in root directory:
```bash
cp .env.example .env
```

Then update these required values:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/lastrunx_db?schema=public"
NEXTAUTH_SECRET="your-super-secret-key-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. **Initialize Prisma Database**
```bash
cd skillarena-nextjs
npx prisma generate
npx prisma db push
```

### 4. **Create Admin User (Optional)**
```bash
npx prisma studio
# Open http://localhost:5555
# Manually create a user with role="ADMIN"
```

### 5. **Run Development Server**
```bash
npm run dev
```

---

## 🔐 Authentication Setup

### Register API: `POST /api/auth/register`
```json
{
  "email": "user@example.com",
  "username": "player123",
  "password": "SecurePass123!",
  "phone": "+919876543210"
}
```

### Login: `POST /api/auth/signin`
Use the built-in NextAuth login at `/login`

---

## 💰 Razorpay Setup (Payment Gateway)

### 1. Create Razorpay Account
- Visit: https://razorpay.com/
- Sign up for test account
- Get API keys from Dashboard

### 2. Update .env
```env
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_secret_key"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"
```

### 3. Test Payment Flow
```javascript
// Create order
POST /api/payment/create-order
{
  "amount": 500
}

// Verify payment
POST /api/payment/verify
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

---

## 🏆 Tournament Management

### Create Tournament (Admin): `POST /api/admin/tournaments`
```json
{
  "game": "BGMI",
  "title": "BGMI Solo Classic",
  "description": "Compete in solo battle royale",
  "image": "/images/games/bgmi.avif",
  "entryFee": 25,
  "prizePool": 2500,
  "maxPlayers": 100,
  "minPlayers": 50,
  "mode": "SOLO",
  "startTime": "2026-01-20T18:00:00Z",
  "status": "UPCOMING"
}
```

### Get All Tournaments: `GET /api/tournaments`
```
GET /api/tournaments?game=BGMI&status=UPCOMING
```

### Join Tournament: `POST /api/tournaments/[id]/join`
Requires authentication. Deducts entry fee from wallet.

---

## 📊 Database Schema

### Users Table
- id, email, username, password (hashed)
- phone, phoneVerified
- walletBalance, role (USER/ADMIN)
- kycVerified, isActive

### Tournaments Table
- id, game, title, description
- entryFee, prizePool, maxPlayers
- startTime, endTime, status
- roomId, roomPassword

### Registrations Table
- userId, tournamentId
- paymentStatus, rank, kills, points
- winnings, status

### Transactions Table
- userId, type (DEPOSIT/WITHDRAWAL/TOURNAMENT_FEE)
- amount, status
- razorpayOrderId, razorpayPaymentId

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/transactions` - Transaction history

### Tournaments
- `GET /api/tournaments` - List tournaments
- `GET /api/tournaments/[id]` - Tournament details
- `POST /api/tournaments/[id]/join` - Join tournament

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Admin
- `GET /api/admin/tournaments` - List all tournaments
- `POST /api/admin/tournaments` - Create tournament

---

## 🚀 Deployment Checklist

### Before Production:
- [ ] Update DATABASE_URL with production database
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure Razorpay live keys
- [ ] Setup email service (SMTP)
- [ ] Enable KYC verification
- [ ] Add rate limiting
- [ ] Setup monitoring (Sentry)
- [ ] Configure CORS
- [ ] Add SSL certificate
- [ ] Setup backups

### Database Migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push
```

---

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

### Test Tournament Creation (Admin)
```bash
# First login as admin, then:
curl -X POST http://localhost:3000/api/admin/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "game": "BGMI",
    "title": "Test Tournament",
    "entryFee": 50,
    "prizePool": 5000,
    "maxPlayers": 100,
    "mode": "SOLO",
    "startTime": "2026-01-25T18:00:00Z"
  }'
```

---

## 📝 Next Steps

1. **Email Service**: Setup nodemailer for confirmation emails
2. **SMS Integration**: Add Twilio/MSG91 for OTP
3. **File Upload**: Configure AWS S3 for screenshots
4. **Admin Panel**: Build admin dashboard UI
5. **Wallet**: Add withdrawal functionality
6. **KYC**: Implement document verification
7. **Leaderboard**: Add ranking system
8. **Notifications**: Real-time updates with WebSocket

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
# Windows: Services > PostgreSQL > Restart
```

### Prisma Client Error
```bash
npx prisma generate
npm run dev
```

### Authentication Issues
- Clear cookies
- Check NEXTAUTH_SECRET is set
- Verify database connection

---

## 📚 Documentation Links

- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Razorpay API](https://razorpay.com/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
