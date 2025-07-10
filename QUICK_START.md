# 🚀 Quick Start Guide - NIAH! Project

## ⚡ 30-Second Setup

1. **Clear any previous installation issues:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - You should see a green "✅ Supabase Connected" indicator in the bottom-right corner

5. **Login with test account:**
   - Email: `admin@niah.com.br` (Admin access)
   - Or: `admin@techcorp.com` (Regular company)

That's it! The project is ready to use.

## 🔧 Troubleshooting Installation Issues

### If npm install fails with package errors:

1. **Clear everything and reinstall:**
   ```bash
   # Delete node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   
   # Clear npm cache
   npm cache clean --force
   
   # Install again
   npm install
   ```

2. **If you still get errors, try with legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **If using Windows and getting permission errors:**
   ```bash
   # Run as administrator or:
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

### Import Resolution Errors
If you see errors like "Failed to resolve import @radix-ui/react-dropdown-menu@2.1.6":

**✅ FIXED:** This was caused by corrupted import statements with version numbers. The UI components have been corrected to use proper imports without version specifiers.

If you still see these errors:
```bash
# Stop the dev server (Ctrl+C)
# Clear Vite cache
rm -rf node_modules/.vite
# Restart
npm run dev
```

### Environment Variables Issue
If you see "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')":

1. **Check your .env file exists:**
   ```bash
   ls -la .env
   ```

2. **If missing, create it:**
   ```bash
   cp .env.example .env
   ```

3. **Restart the development server:**
   ```bash
   # Stop with Ctrl+C, then:
   npm run dev
   ```

### Database Setup
If you see "Connection failed" in the bottom-right indicator:

1. **Execute the setup script** in Supabase SQL Editor:
   - Copy the content from `supabase-setup-complete.sql`
   - Go to https://supabase.com/dashboard/project/iyqrjgwqjmsnhtxbywme
   - SQL Editor > New Query > Paste and Run

2. **Refresh the page** after running the script

## 🎯 Test Logins

The system doesn't use passwords - just email addresses:

- **👑 Admin (full access):** `admin@niah.com.br`
- **🏢 TechCorp:** `admin@techcorp.com`
- **🏢 Global Services:** `contato@globalservices.com`
- **🏢 Inovação Telecom:** `contato@inovacaotelecom.com.br`

## 🎨 Features to Test

1. **Dashboard:** Metrics and charts
2. **Critérios:** Create and manage evaluation criteria
3. **Subcritérios:** Detailed criteria with colors (click on a criteria)
4. **Listas:** Evaluation lists
5. **Modal Lateral:** Side modal for creating subcriteria

## 🛠️ Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
npm run verify   # Verify installation
npm run clean    # Clean install (removes node_modules)
npm run fresh-install # Clean + reinstall
```

## 🔍 Debugging

- **Console Logs:** Check browser console (F12) for detailed logs
- **Connection Status:** Bottom-right indicator shows Supabase status
- **Network Tab:** Check if API calls are working

## 📱 Mobile Testing

The app is responsive. To test on your phone:

```bash
# Start with host access
npm run dev -- --host

# Your app will be available at:
# http://your-local-ip:3000
```

## 🚨 Common Issues & Solutions

### "Module not found" errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Failed to resolve import" with version numbers
**✅ FIXED:** UI components were corrupted with version numbers in imports. This has been corrected.

### Tailwind performance warning
**✅ FIXED:** Updated tailwind.config.js to avoid matching node_modules.

### "EACCES" permission errors (Mac/Linux)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
# Or use a node version manager like nvm
```

### "Failed to resolve import" in browser
```bash
# Clear Vite cache and restart
rm -rf node_modules/.vite
npm run dev
```

### TypeScript errors
```bash
# Check types
npx tsc --noEmit

# If errors persist, restart TypeScript server in your IDE
```

## ✅ What Was Fixed

- **Import Resolution:** Removed version numbers from all UI component imports
- **Tailwind Config:** Fixed content patterns to avoid performance issues
- **Dependencies:** All packages now use correct import syntax
- **Error Handling:** Better fallbacks for environment variables

---

**Need help?** Check the full README.md or the error messages in the browser console - they're very descriptive! 🎉

**Still having issues?** The project includes fallback configurations and should work even with missing environment variables.