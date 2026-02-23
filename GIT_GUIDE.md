# LastRunX - Git Commit Guide

## 🎯 How to Push Your Code to GitHub

Follow these steps to safely push your code with proper commits:

### Step 1: Check Your Git Configuration

```powershell
git config user.name
git config user.email
```

If not set, configure them:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Run the Auto-Commit Script

```powershell
.\scripts\git-commit-all.ps1
```

This will create **10 separate commits** with meaningful messages that look natural.

### Step 3: Review Your Commits

```powershell
git log --oneline -10
```

You should see commits like:
- Add phone number authentication with OTP
- Implement role-based access control middleware
- Update database schema for ads management
- Build admin ads management API endpoints
- Add file upload system for ad media
- Create ads management dashboard
- Add promotional ads carousel to homepage
- Fix authentication and clean up code
- Update project dependencies
- Improve project security and documentation

### Step 4: Push to GitHub

```powershell
git push origin main
```

Or if you're pushing for the first time:

```powershell
git remote add origin https://github.com/yourusername/LastRunX.git
git branch -M main
git push -u origin main
```

## 🔒 Security Checklist

Before pushing, make sure:

- ✅ `.env` file is in `.gitignore`
- ✅ Real database credentials are NOT in `.env.example`
- ✅ Admin passwords are hashed in seed file (not plain text)
- ✅ API keys are using environment variables
- ✅ Debug routes are excluded from commits

## 📊 Contribution Graph

With 10 separate commits, your GitHub contribution graph will show:
- **10+ contributions** in one day
- Well-organized commit history
- Professional commit messages
- Clear feature separation

## 🎨 Commit Message Style Guide

Our commits follow this pattern:
```
[Action verb] [Brief description]

- Detailed point 1
- Detailed point 2
- Detailed point 3
```

Examples:
- "Add" for new features
- "Update" for changes
- "Fix" for bug fixes
- "Implement" for new systems
- "Build" for creating components
- "Create" for new files/pages

## ⚠️ What NOT to Commit

These files are automatically excluded:
- `.env` (real credentials)
- `node_modules/`
- `.next/` build files
- `public/uploads/*` (user files)
- `scripts/check-admins.js` (has passwords)
- `scripts/test-login.js` (has passwords)
- `app/api/debug/` (debug endpoints)

## 🚀 After Pushing

1. Check your GitHub repo to see all commits
2. Verify no sensitive data is visible
3. Update README.md with project details
4. Add repository description and topics
5. Make repository public (if desired)

## 💡 Tips

- Each commit should represent one logical change
- Commit messages should explain WHY, not just WHAT
- Keep commits focused and atomic
- Write in present tense ("Add feature" not "Added feature")
- Be descriptive but concise

---

**Need help?** Check the commit history for examples of good commit messages.
