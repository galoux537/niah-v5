# Supabase Setup Guide for NIAH!

This guide will help you set up Supabase authentication for the NIAH! platform.

## 🚀 Quick Start

The NIAH! app works in **demo mode** without any setup, but you can optionally configure Supabase for real authentication.

## 📋 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in to your account
4. Click "New Project"
5. Fill in your project details:
   - **Name**: NIAH Platform (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
6. Click "Create new project"
7. Wait for the project to be set up (usually takes 1-2 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure Environment Variables

1. In your project root, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

### 4. Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Scroll down to **Site URL** and add your development URL:
   ```
   http://localhost:3000
   ```
3. Add any additional URLs you'll use (like your production domain)
4. Save the settings

### 5. Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Try to sign up with a real email address
4. Check your email for the confirmation link
5. Click the confirmation link to verify your account

## 🔧 Authentication Features

Once configured, your app will have:

- ✅ **Real user registration** with email verification
- ✅ **Secure login/logout** functionality
- ✅ **Session persistence** across browser refreshes
- ✅ **Password reset** functionality
- ✅ **Multi-tenant security** (users only see their own data)

## 🛡️ Security Notes

- The **anon key** is safe to expose in client-side code
- Supabase handles all security and authentication flows
- Row Level Security (RLS) is automatically enabled
- Users are isolated from each other's data

## 🔄 Demo Mode vs. Supabase

| Feature | Demo Mode | Supabase Mode |
|---------|-----------|---------------|
| Authentication | ✅ Any email/password works | ✅ Real email verification |
| Data Persistence | ❌ Resets on refresh | ✅ Persistent across sessions |
| Multi-user | ❌ Single demo session | ✅ Multiple real users |
| Security | ❌ Demo only | ✅ Production-ready |
| Setup Required | ❌ None | ✅ Basic configuration |

## 🚨 Troubleshooting

### "Invalid login credentials" error
- Make sure you've confirmed your email address
- Check that your Supabase URL and key are correct in `.env`
- Verify the Site URL is set to `http://localhost:3000`

### Email confirmation not working
- Check your spam folder
- Verify the Site URL in Supabase settings
- Make sure email delivery is enabled in your Supabase project

### Environment variables not loading
- Make sure your `.env` file is in the project root
- Restart your development server after changing `.env`
- Verify the variable names start with `VITE_`

### Project not found error
- Double-check your Supabase project URL
- Make sure your project is active (not paused)
- Verify you're using the correct credentials

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your setup against this guide
3. The app always works in demo mode as a fallback

## 🎯 Next Steps

Once Supabase is configured:
1. **Production Deployment**: Add your production URL to Supabase Site URLs
2. **Custom Domains**: Configure custom email templates
3. **User Management**: Use Supabase dashboard to manage users
4. **Analytics**: View authentication metrics in Supabase

---

**Remember**: The app works perfectly in demo mode, so Supabase setup is optional for testing and development!