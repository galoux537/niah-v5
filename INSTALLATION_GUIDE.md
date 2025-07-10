# NIAH! Installation Guide

## Quick Fix for Current Errors

If you're experiencing dependency or build errors, follow these steps:

### 1. Clean Installation (Recommended)

```bash
# Remove existing modules and lock file
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Install with legacy peer deps (fixes compatibility issues)
npm install --legacy-peer-deps
```

### 2. Start Development Server

```bash
npm run dev
```

The application should now start successfully at `http://localhost:3000`

## Alternative Installation Methods

### Option A: Using Yarn (if npm issues persist)
```bash
yarn install
yarn dev
```

### Option B: Using pnpm
```bash
pnpm install
pnpm dev
```

## Common Issues & Solutions

### Issue: "ERESOLVE unable to resolve dependency tree"
**Solution**: Use `--legacy-peer-deps` flag
```bash
npm install --legacy-peer-deps
```

### Issue: "Port 3000 already in use"
**Solution**: Use different port
```bash
npm run dev -- --port 3001
```

### Issue: PostCSS/Tailwind errors
**Solution**: Ensure clean installation
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Issue: Import resolution errors
**Solution**: The latest package.json fixes import syntax. Ensure you have the updated files.

## Environment Setup (Optional)

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials (optional - app works in demo mode):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Verification

After successful installation, you should see:
- ✅ Server starts without errors
- ✅ Browser opens to `http://localhost:3000`
- ✅ Application loads with login screen
- ✅ Demo login works (any email/password)
- ✅ Dashboard displays with sample data

## Still Having Issues?

1. **Check Node.js version**: Ensure you're using Node.js 18+
   ```bash
   node --version
   ```

2. **Try different package manager**: 
   - npm: `npm install --legacy-peer-deps`
   - yarn: `yarn install`
   - pnpm: `pnpm install`

3. **Clear all caches**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json .next .vite
   ```

4. **Check for global conflicts**: Ensure no global packages conflict
   ```bash
   npm list -g --depth=0
   ```

The application is designed to work out-of-the-box with these steps. All features including authentication (demo mode), dashboard, agents page, and modals should function correctly.