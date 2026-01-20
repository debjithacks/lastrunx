<div align="center">
  
# 🎮 SkillArena - Gaming Tournament Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

**A comprehensive skill-based gaming tournament platform with real-time management, payments, and analytics.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## 📸 Screenshots

<div align="center">

### Landing Page
![Landing Page](https://placehold.co/1200x600/4F46E5/FFFFFF/png?text=SkillArena+Landing+Page&font=roboto)
*Modern, responsive landing page with tournament listings*

### User Dashboard
![User Profile](https://placehold.co/1200x600/8B5CF6/FFFFFF/png?text=User+Profile+Dashboard&font=roboto)
*Comprehensive user profile with stats and game profiles*

### Admin Dashboard
![Admin Dashboard](https://placehold.co/1200x600/EC4899/FFFFFF/png?text=Admin+Dashboard+Analytics&font=roboto)
*Powerful admin panel with analytics and management tools*

### Tournament Management
![Tournaments](https://placehold.co/1200x600/10B981/FFFFFF/png?text=Tournament+Management&font=roboto)
*Real-time tournament management with live updates*

</div>

---

## ✨ Features

### 🎯 For Users
- **Tournament Participation** - Join skill-based tournaments for multiple games (BGMI, FreeFire, COD Mobile)
- **Wallet System** - Integrated payment system with Razorpay
- **Real-time Leaderboards** - Live rankings and statistics
- **Game Profiles** - Manage multiple game accounts
- **KYC Verification** - Secure identity verification for withdrawals
- **Coupon System** - Apply discounts and promotional codes
- **Tournament History** - Track past performances and winnings
- **Phone OTP** - Secure phone verification
- **Password Management** - Token-based password reset

### 🛠️ For Admins
- **Comprehensive Dashboard** - Real-time analytics and insights
- **User Management** - Role-based access control (6 roles)
- **Tournament Management** - Create, update, and manage tournaments
- **Withdrawal Processing** - Approve/reject withdrawal requests
- **KYC Verification** - Review and verify user documents
- **Coupon Management** - Create and manage promotional codes
- **Dispute Resolution** - Handle user disputes and fines
- **Notification System** - Send targeted notifications
- **Activity Logging** - Complete audit trail
- **Prize Distribution** - Automatic prize calculation and distribution

---

## 🚀 Tech Stack

<table>
<tr>
<td>

**Frontend**
- ⚡ Next.js 16.1.1 (App Router)
- 🎨 Tailwind CSS
- 📘 TypeScript
- 🔐 NextAuth.js

</td>
<td>

**Backend**
- 🗄️ PostgreSQL
- 🔧 Prisma ORM
- 🔒 bcrypt (Password Hashing)
- ✅ Zod (Validation)

</td>
<td>

**Integrations**
- 💳 Razorpay (Payments)
- 📧 SMTP (Emails)
- 📱 SMS Gateway
- ☁️ AWS S3 (File Storage)

</td>
</tr>
</table>

---

## 🎯 Demo

### Live Demo
🔗 **Coming Soon**

### Test Credentials

**User Account:**
```
Email: demo@example.com
Password: demo123
```

**Admin Account:**
```
Email: admin@yourdomain.com
Password: admin123
```

---

## 💻 Installation

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Razorpay account (for payments)

### Step 1: Clone Repository

```bash
git clone https://github.com/debjithacks/lastrunx.git
cd skillarena-nextjs
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### Step 4: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Create admin user
node scripts/create-admin.js
```

### Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
skillarena-nextjs/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/               # Admin endpoints (11 routes)
│   │   ├── auth/                # Authentication (4 routes)
│   │   ├── user/                # User endpoints (6 routes)
│   │   ├── tournaments/         # Tournament APIs (2 routes)
│   │   ├── leaderboard/         # Leaderboard API
│   │   └── webhooks/            # Payment webhooks
│   ├── admin/                   # Admin dashboard pages
│   ├── profile/                 # User profile
│   └── (public pages)/          # Landing, login, signup
├── components/                   # React components
│   ├── admin/                   # Admin components
│   └── (shared components)      # Navigation, Footer, etc.
├── lib/                         # Utilities
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client
│   ├── admin-utils.ts           # Admin utilities
│   └── otp.ts                   # OTP management
├── prisma/                      # Database
│   └── schema.prisma            # Database schema (15 models)
├── public/                      # Static assets
├── middleware.ts                # Route protection
└── types/                       # TypeScript types
```

---

## 🗄️ Database Schema

<details>
<summary><b>View Database Models (15 total)</b></summary>

### Core Models
- **User** - User accounts with roles and wallet
- **GameProfile** - User's game accounts
- **Tournament** - Tournament details
- **Registration** - User tournament registrations

### Financial
- **Transaction** - Payment records
- **Coupon** - Discount codes
- **CouponUsage** - Coupon redemptions
- **Fine** - User penalties

### Management
- **Dispute** - User disputes
- **NotificationTemplate** - Notification templates
- **NotificationHistory** - Sent notifications
- **AdminActivity** - Audit logs

### Authentication (NextAuth)
- **Account** - OAuth accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

</details>

---

## 🔐 API Endpoints

<details>
<summary><b>View All API Routes (35+ endpoints)</b></summary>

### Authentication
```
POST   /api/auth/register         - User registration
POST   /api/auth/send-otp         - Send phone OTP
POST   /api/auth/verify-otp       - Verify OTP
POST   /api/auth/forgot-password  - Request password reset
POST   /api/auth/reset-password   - Reset password
```

### User
```
GET    /api/user/profile          - Get user profile
GET    /api/user/stats            - User statistics
GET    /api/user/tournament-history - Tournament history
POST   /api/user/withdraw         - Request withdrawal
POST   /api/user/kyc              - Submit KYC
GET    /api/user/kyc              - Get KYC status
GET    /api/user/game-profiles    - List game profiles
POST   /api/user/game-profiles    - Add game profile
PUT    /api/user/game-profiles/[id] - Update profile
DELETE /api/user/game-profiles/[id] - Delete profile
```

### Tournament
```
POST   /api/tournaments/[id]/apply-coupon - Apply coupon
GET    /api/tournaments/[id]/room-details - Get room info
```

### Leaderboard
```
GET    /api/leaderboard           - Global leaderboard
```

### Admin
```
GET    /api/admin/analytics       - Dashboard stats
GET    /api/admin/users           - List users
PUT    /api/admin/users/[id]      - Update user
POST   /api/admin/users/[id]/fine - Issue fine
GET    /api/admin/tournaments     - List tournaments
POST   /api/admin/tournaments     - Create tournament
POST   /api/admin/tournaments/[id]/results - Submit results
GET    /api/admin/coupons         - List coupons
POST   /api/admin/coupons         - Create coupon
DELETE /api/admin/coupons/[id]    - Delete coupon
GET    /api/admin/withdrawals     - List withdrawals
PUT    /api/admin/withdrawals/[id] - Approve/reject
GET    /api/admin/kyc             - List KYC requests
PUT    /api/admin/kyc/[id]        - Verify KYC
GET    /api/admin/disputes        - List disputes
PUT    /api/admin/disputes/[id]   - Resolve dispute
POST   /api/admin/notifications/send - Send notification
GET    /api/admin/notifications/templates - List templates
```

### Webhook
```
POST   /api/webhooks/razorpay     - Payment webhook
```

</details>

---

## 🎨 Features Breakdown

### Wallet System
- Add money via Razorpay
- Automatic webhook processing
- Transaction history
- Withdrawal with KYC

### Tournament System
- Multiple game support
- Time-based room access (15-30 min window)
- Automatic prize distribution
- Result verification

### Coupon System
- Global/Game/Tournament specific
- Percentage or fixed discount
- Usage limits and expiry
- First-time user targeting

### Admin Features
- Role-based permissions (6 roles)
- Real-time analytics dashboard
- Bulk operations
- Comprehensive audit logging

---

## 🚧 Roadmap

- [ ] Real-time chat for tournaments
- [ ] Live streaming integration
- [ ] Mobile app (React Native)
- [ ] AI-powered fraud detection
- [ ] Multi-language support
- [ ] Social features (friends, teams)
- [ ] Achievement system
- [ ] Referral program

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Debjit Ghosh**

- GitHub: [@debjithacks](https://github.com/debjithacks)
- Repository: [lastrunx](https://github.com/debjithacks/lastrunx)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- Razorpay for payment integration
- All contributors and supporters

---

## 📞 Support

For support, email support@yourdomain.com or join our Discord server.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Debjit Ghosh](https://github.com/debjithacks)

</div>
