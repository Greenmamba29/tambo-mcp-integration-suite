# 🚀 Vercel Deployment Setup for TAMBO MCP Integration Suite

## Step 1: Access Vercel Dashboard

Open Vercel and sign in with your GitHub account:
- Go to: https://vercel.com
- Click **"Sign Up"** or **"Login"**  
- Choose **"Continue with GitHub"**

## Step 2: Import Your Repository

1. Click **"New Project"** or **"Add New..."** → **"Project"**
2. Find your repository: `Greenmamba29/tambo-mcp-integration-suite`
3. Click **"Import"**

## Step 3: Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (current directory) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

## Step 4: Add Environment Variables

**CRITICAL**: Add these environment variables in Vercel:

### Environment Variables Tab:

```bash
# Google Gemini AI API Key
VITE_GOOGLE_GEMINI_API_KEY=AIzaSyAl_8S6g6kkpO4f550HN4jg0mWaiXwa5FA

# TAMBO API Configuration  
VITE_TAMBO_API_KEY=tambo_2crvFKf2vvsK8WYmBToavxmgJF+jeuR0o5yNaNUBxhP1L56c6YeCZao0/voar1gR47s4yevBC0QQ/XfIfBE9aAueUIBiHEosmPHJv4JVjqY=
VITE_TAMBO_API_BASE_URL=https://api.tambo.co/v1

# ABACUS Configuration
VITE_ABACUS_APP_ID=1573da0c2c
VITE_ABACUS_BASE_URL=https://apps.abacus.ai/chatllm
```

### How to Add Environment Variables:

1. In your project settings, go to **"Environment Variables"**
2. For each variable:
   - **Name**: Copy the variable name (e.g., `VITE_GOOGLE_GEMINI_API_KEY`)
   - **Value**: Copy your actual API key value
   - **Environments**: Select **Production**, **Preview**, and **Development**
3. Click **"Add"**

## Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 2-3 minutes)
3. 🎉 Your app will be live at: `https://tambo-mcp-integration-suite.vercel.app`

## Step 6: Verify Deployment

Check that:
- ✅ App loads without errors
- ✅ All integrations work (Gemini, TAMBO, Abacus)
- ✅ API calls are successful
- ✅ No environment variable errors in console

## Step 7: Set Up Automatic Deployments

**Already configured!** Every time you push to GitHub:
1. Vercel automatically detects changes
2. Builds and deploys your updates
3. Your live site updates within minutes

## 🔧 Troubleshooting

### Build Failures:
- Check **"Functions"** → **"View Function Logs"**
- Verify all environment variables are set
- Ensure no syntax errors in code

### Environment Variable Issues:
- Variables must start with `VITE_` for Vite projects
- Double-check variable names (case-sensitive)
- Restart deployment after adding variables

### API Integration Issues:
- Test API keys in your local `.env` first
- Check API endpoint URLs
- Verify CORS settings for external APIs

## 🎯 What You'll Have After Setup:

- ✅ **Live Application**: Publicly accessible URL
- ✅ **Automatic Deployments**: Push to GitHub = Auto deploy
- ✅ **Environment Management**: Secure API key handling
- ✅ **Performance**: Global CDN and optimizations
- ✅ **Monitoring**: Build logs and analytics
- ✅ **Custom Domain**: Optional custom domain setup

## 📊 Vercel Dashboard Features:

- **Analytics**: View usage and performance metrics
- **Deployments**: See deployment history and rollback
- **Domains**: Add custom domains
- **Functions**: Monitor serverless functions
- **Integrations**: Connect to databases and services

---

## 🔗 Quick Links:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Repository**: https://github.com/Greenmamba29/tambo-mcp-integration-suite
- **Deployment Logs**: Available in Vercel project dashboard
- **Environment Variables**: Project Settings → Environment Variables

---

**Ready to deploy!** 🚀 Your TAMBO MCP Integration Suite will be live and automatically updating with every GitHub push!
