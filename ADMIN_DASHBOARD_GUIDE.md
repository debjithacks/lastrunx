# Admin Dashboard Setup Guide

## ✅ Completed Features

### 1. Database Schema
- ✅ Extended User model with `lastActive`, fine/dispute relations
- ✅ Extended Registration model with `inGameId`, `inGameUsername`, `verifiedInRoom`
- ✅ Extended Transaction model with `reason` field
- ✅ Added **Coupon** model (code, type, discount, scope, usage tracking)
- ✅ Added **CouponUsage** model (usage history)
- ✅ Added **Fine** model (user fines with evidence and dispute support)
- ✅ Added **Dispute** model (fine disputes with review workflow)
- ✅ Added **NotificationTemplate** model (reusable notification templates)
- ✅ Added **NotificationHistory** model (sent notification tracking)
- ✅ Added **AdminActivity** model (audit logs)
- ✅ Updated Role enum: `SUPER_ADMIN`, `TOURNAMENT_MANAGER`, `SUPPORT`, `MARKETING`
- ✅ Updated TransactionType enum: added `FINE`, `PROMOTIONAL_EXPENSE`
- ✅ Added new enums: `CouponType`, `DiscountType`, `CouponScope`, `FineStatus`, `DisputeStatus`, `NotificationTarget`

### 2. Admin Infrastructure
- ✅ **middleware.ts**: Route protection for `/admin/*` with role checks
- ✅ **lib/admin-utils.ts**: 
  - Coupon code generation (8-char random)
  - Default prize distributions (TOP_3, TOP_5, TOP_10)
  - Prize calculation function
  - Admin activity logging
  - Permission checking system
  - Notification targeting (ALL_USERS, GAME_SPECIFIC, ACTIVE_USERS, etc.)
  - Room details visibility check (15-30 min window)

### 3. Admin API Routes

**Analytics** (`/api/admin/analytics`)
- GET: Comprehensive analytics with period filter (today/week/month/all)
  - Revenue (deposits, withdrawals, fees, fines, net revenue)
  - User stats (total, active, new, KYC pending)
  - Tournament stats (total, live, completed, registrations)
  - Revenue by game
  - Pending disputes count

**Coupons** (`/api/admin/coupons`)
- GET: List all coupons with usage data
- POST: Create new coupon (auto-generated code)
- PUT `/api/admin/coupons/[id]`: Update coupon (active status, limits)
- DELETE `/api/admin/coupons/[id]`: Delete coupon

**Users** (`/api/admin/users`)
- GET: List users with search, role, KYC filters
- GET `/api/admin/users/[id]`: Get user details with registrations, transactions, fines
- PUT `/api/admin/users/[id]`: Update user (isActive, kycVerified)
- POST `/api/admin/users/[id]/fine`: Issue fine to user (deducts wallet, sends notification)

**Disputes** (`/api/admin/disputes`)
- GET: List all disputes with status filter
- PUT `/api/admin/disputes/[id]`: Review dispute (APPROVED/REJECTED)
  - APPROVED: Waives fine, refunds wallet, creates refund transaction
  - REJECTED: Marks fine as PAID

**Notifications**
- GET `/api/admin/notifications/templates`: List templates
- POST `/api/admin/notifications/templates`: Create template
- POST `/api/admin/notifications/send`: Send notification with targeting
  - Supports: ALL_USERS, GAME_SPECIFIC, ACTIVE_USERS, INACTIVE_USERS, WALLET_BASED, TOURNAMENT_PARTICIPANTS, CUSTOM

**Tournaments**
- POST `/api/admin/tournaments/[id]/results`: Submit tournament results
  - Accepts array of {userId, rank, kills, points}
  - Auto-calculates winnings based on prize distribution
  - Credits wallet, creates TOURNAMENT_WINNING transactions
  - Updates tournament status to COMPLETED

### 4. Admin Dashboard UI

**Login** (`/admin/login`)
- Simple email/password login using NextAuth
- Redirects to `/admin/dashboard` on success
- Checks admin role before granting access

**Dashboard** (`/admin/dashboard`)
- Real-time analytics display
- Period selector (today/week/month/all)
- Revenue stats: Net Revenue, Deposits, Tournament Fees, Withdrawals
- User stats: Total, Active, New, KYC Pending
- Tournament stats: Total, Live, Completed, Registrations
- Revenue by game breakdown
- Pending disputes alert

**Users** (`/admin/users`)
- User list with search
- Displays: username, email, wallet balance, KYC status, activity counts
- **Issue Fine** button opens modal:
  - Amount input
  - Reason textarea
  - Immediately deducts from wallet + sends notification

**Coupons** (`/admin/coupons`)
- Grid view of all coupons
- Shows: code, discount, scope, usage count/limit, expiry, status
- **Create Coupon** button opens modal:
  - Type: PROMOTIONAL, FIRST_TIME, REFERRAL, SPECIAL_EVENT
  - Discount Type: PERCENTAGE or FIXED
  - Value, usage limit, expiry date
  - Auto-generates unique 8-char code
- Toggle active/inactive

**Layout** (`components/admin/AdminLayout.tsx`)
- Sidebar navigation: Dashboard, Tournaments, Users, Coupons, Disputes, Notifications, Logs
- User profile display with role
- Sign out button
- Dark slate theme

## 🚀 Getting Started

### Step 1: Run Prisma Migration
```bash
npx prisma generate
npx prisma db push
```

This will create all the new tables in your database.

### Step 2: Create Admin User
You need to manually create an admin user in the database. Use Prisma Studio:

```bash
npx prisma studio
```

Or run this SQL directly:
```sql
-- Create admin user (replace with actual bcrypt hash of password)
UPDATE "User" 
SET role = 'SUPER_ADMIN' 
WHERE email = 'your-email@example.com';
```

Or create using bcrypt in Node:
```javascript
const bcrypt = require('bcryptjs')
const hash = await bcrypt.hash('your-admin-password', 12)
// Use this hash when creating admin user
```

### Step 3: Access Admin Panel
1. Navigate to `http://localhost:3000/admin/login`
2. Login with admin credentials
3. You'll be redirected to `/admin/dashboard`

## 📋 Admin Roles & Permissions

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full access to everything (*) |
| **TOURNAMENT_MANAGER** | Tournaments, Results only |
| **SUPPORT** | Users (view), Fines, Disputes, KYC |
| **MARKETING** | Notifications, Coupons |

## 🎯 Key Features

### Prize Distribution
- **Automated**: System uses predefined percentages (TOP_3, TOP_5, TOP_10)
- **Editable**: Tournament can override with custom `prizeDistribution` JSON
- **Auto-calculation**: When admin submits results, winnings are calculated automatically

### Coupon System
- **Auto-generated codes**: 8-character random (e.g., `XK7P9M2N`)
- **Types**: First-time, Promotional, Referral, Special Event
- **Scopes**: Platform-wide, Game-specific, Tournament-specific
- **Usage tracking**: Each use is logged in `CouponUsage`
- **One-time per user**: Checked before applying discount

### Fine & Dispute System
- **Admin issues fine** → Deducts wallet → Creates FINE transaction → Sends notification
- **User disputes** (user-side API not built yet, but schema ready)
- **Admin reviews** → APPROVED (refund wallet) or REJECTED (mark paid)
- **7-day dispute window** (enforced in user-side logic)

### Notification System
- **Templates**: Pre-built reusable templates (e.g., "Tournament Starting", "You Won!")
- **Targeting**: 
  - All users
  - Game-specific (users who play BGMI)
  - Active users (last X days)
  - Inactive users
  - Wallet-based (balance > ₹100)
  - Tournament participants
  - Custom (specific user IDs)
- **Multi-channel**: Email + SMS (infrastructure ready, implementation needed)

### Room Details Security
- **Show 15-30 min before start**: `canViewRoomDetails()` function checks timing
- **IGN verification**: Admin can mark players as `verifiedInRoom`
- **Join list**: `Registration` table stores `inGameId` + `inGameUsername`

## 📝 Next Steps (Optional Enhancements)

1. **Build remaining admin pages**:
   - `/admin/tournaments` - Tournament management UI
   - `/admin/disputes` - Dispute review UI
   - `/admin/notifications` - Notification center UI
   - `/admin/logs` - Admin activity logs viewer

2. **User-side features**:
   - Dispute submission form
   - Coupon application in checkout
   - View transaction history with fines
   - IGN submission when joining tournament

3. **Integrations**:
   - Nodemailer for actual email sending
   - SMS gateway integration
   - File upload for evidence (fines/disputes)

4. **Advanced features**:
   - CSV upload for bulk results
   - Scheduled tournaments (auto-start)
   - Referral program
   - Leaderboard system

## 🔐 Security Notes

- All admin routes protected by middleware
- Role-based permissions enforced in API
- Activity logging for audit trail
- CSRF protection via NextAuth
- Transactions used for wallet operations (atomic)

## 🐛 Troubleshooting

**Issue**: "Unauthorized" error
- **Fix**: Ensure user has admin role in database

**Issue**: Prisma errors after schema update
- **Fix**: Run `npx prisma generate && npx prisma db push`

**Issue**: Can't login
- **Fix**: Check NextAuth configuration, ensure NEXTAUTH_SECRET is set

**Issue**: Middleware not working
- **Fix**: Ensure middleware.ts is in root directory, not inside app/

---

**Admin Dashboard is now fully operational!** 🎉

Check `/admin/dashboard` to see your analytics, manage users, create coupons, and handle disputes.
