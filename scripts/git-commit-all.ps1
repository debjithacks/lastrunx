Write-Host "🚀 Starting Git Commits for LastRunX..." -ForegroundColor Cyan
Write-Host ""

# Configure git if needed
$gitUser = git config user.name
if (-not $gitUser) {
    Write-Host "⚠️  Git user not configured. Please run:" -ForegroundColor Yellow
    Write-Host "git config --global user.name 'Your Name'"
    Write-Host "git config --global user.email 'your.email@example.com'"
    exit 1
}

Write-Host "👤 Committing as: $gitUser" -ForegroundColor Green
Write-Host ""

# Commit 1: Phone Authentication
Write-Host "📱 Commit 1/8: Adding phone authentication..." -ForegroundColor Cyan
git add app/(auth)/login/page.tsx app/(auth)/login/phone/ app/(auth)/signup/page.tsx
git add app/api/auth/send-otp/route.ts app/api/auth/verify-otp/route.ts app/api/auth/phone/
git add lib/validation.ts
git commit -m "Add phone number authentication with OTP

- Implemented country code selector with 9 countries
- Added phone number validation for different regions
- Created OTP verification flow
- Integrated with existing login/signup pages"

Write-Host "✅ Phone authentication committed" -ForegroundColor Green
Write-Host ""

# Commit 2: RBAC Middleware
Write-Host "🔐 Commit 2/8: Setting up role-based access control..." -ForegroundColor Cyan
git add lib/admin-auth.ts
git commit -m "Implement role-based access control middleware

- Added admin authorization helpers
- Created SuperAdmin and Manager role checks
- Implemented section-level access control
- Added helper functions for permission validation"

Write-Host "✅ RBAC middleware committed" -ForegroundColor Green
Write-Host ""

# Commit 3: Database Schema
Write-Host "🗄️  Commit 3/8: Updating database schema..." -ForegroundColor Cyan
git add prisma/schema.prisma prisma/migrations/ prisma/seed.ts
git commit -m "Update database schema for ads management

- Added Ad model with media support
- Created enums for ad types and placements
- Added device targeting options
- Updated seed file with sample data"

Write-Host "✅ Database schema committed" -ForegroundColor Green
Write-Host ""

# Commit 4: Ads API Routes
Write-Host "🔌 Commit 4/8: Creating ads management APIs..." -ForegroundColor Cyan
git add app/api/admin/ads/ app/api/ads/
git commit -m "Build admin ads management API endpoints

- Created CRUD operations for ads
- Added filtering and pagination support
- Implemented priority conflict detection
- Built tracking system for impressions/clicks
- Added public API for fetching active ads"

Write-Host "✅ Ads API routes committed" -ForegroundColor Green
Write-Host ""

# Commit 5: Upload System
Write-Host "📤 Commit 5/8: Adding file upload functionality..." -ForegroundColor Cyan
git add app/api/upload/route.ts public/uploads/ next.config.ts
git commit -m "Add file upload system for ad media

- Implemented local file storage
- Added image and video upload support
- Created validation for file types and sizes
- Updated Next.js config for larger uploads"

Write-Host "✅ File upload committed" -ForegroundColor Green
Write-Host ""

# Commit 6: Ads Admin UI
Write-Host "🎨 Commit 6/8: Building ads management interface..." -ForegroundColor Cyan
git add app/admin/(main)/ads/
git add components/admin/Sidebar.tsx
git commit -m "Create ads management dashboard

- Built ads listing page with filters
- Added create and edit forms
- Implemented media preview
- Added role-based sidebar navigation
- Created delete confirmation modal"

Write-Host "✅ Ads UI committed" -ForegroundColor Green
Write-Host ""

# Commit 7: Homepage Integration
Write-Host "🏠 Commit 7/8: Integrating ads on homepage..." -ForegroundColor Cyan
git add app/(public)/page.tsx components/AdCarousel.tsx
git commit -m "Add promotional ads carousel to homepage

- Created auto-sliding ad carousel component
- Implemented impression and click tracking
- Added device-specific ad targeting
- Optimized for performance with lazy loading"

Write-Host "✅ Homepage integration committed" -ForegroundColor Green
Write-Host ""

# Commit 8: Auth Improvements
Write-Host "🔧 Commit 8/8: Fixing authentication bugs..." -ForegroundColor Cyan
git add lib/auth.ts
git add app/api/admin/tournaments/
git commit -m "Fix authentication and clean up code

- Removed deprecated 2FA field references
- Fixed session handling for admin routes
- Updated tournament API structure
- General code cleanup and optimization"

Write-Host "✅ Authentication fixes committed" -ForegroundColor Green
Write-Host ""

# Commit 9: Package Updates
Write-Host "📦 Commit 9/9: Updating dependencies..." -ForegroundColor Cyan
git add package.json package-lock.json
git commit -m "Update project dependencies

- Updated Next.js and related packages
- Added new dependencies for file handling
- Locked package versions for stability"

Write-Host "✅ Dependencies committed" -ForegroundColor Green
Write-Host ""

# Commit 10: Documentation
Write-Host "📝 Commit 10/10: Adding project documentation..." -ForegroundColor Cyan
git add .gitignore CONTRIBUTING.md scripts/.gitignore
git add app/api/debug/
git commit -m "Improve project security and documentation

- Updated gitignore for sensitive files
- Added contributing guidelines
- Excluded debug routes from production
- Protected admin scripts from commits"

Write-Host "✅ Documentation committed" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All commits created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review commits: git log --oneline -10"
Write-Host "2. Push to GitHub: git push origin main"
Write-Host ""
