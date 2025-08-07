# 🎯 ABACUS Dashboard Setup - Step by Step

## ✅ Pre-Setup Status
- DNS configured in ABACUS servers ✅
- GitHub repository ready: `git@github.com:Greenmamba29/tambo-mcp-integration-suite.git` ✅
- Production build ready ✅
- All configuration files prepared ✅

## 📋 Exact Steps for ABACUS Dashboard

### Step 1: Access Your ABACUS Dashboard
1. Open your web browser
2. Go to your ABACUS dashboard (typically `https://dashboard.abacus.ai` or similar)
3. Log in with your ABACUS credentials

### Step 2: Create New Project/Deployment
Look for one of these options:
- "New Project"
- "Deploy Application" 
- "Add Site"
- "Import from Git"

### Step 3: Connect GitHub Repository
When prompted for repository details, use:

**Repository URL:**
```
git@github.com:Greenmamba29/tambo-mcp-integration-suite.git
```
OR
```
https://github.com/Greenmamba29/tambo-mcp-integration-suite.git
```

**Branch:** `main`

**Project Name:** `TAMBO MCP Integration Suite`

### Step 4: Configure Build Settings
Set these exact build configuration values:

**Build Command:**
```
npm run build
```

**Install Command:**
```
npm install
```

**Output Directory:**
```
dist
```

**Node Version:** `18` or `20` (if asked)

**Framework:** `Vite` (should auto-detect)

### Step 5: Environment Variables
Add these environment variables in the ABACUS dashboard:

```
NODE_ENV=production
VITE_GOOGLE_GEMINI_API_KEY=AIzaSyAl_8S6g6kkpO4f550HN4jg0mWaiXwa5FA
VITE_TAMBO_API_KEY=tambo_2crvFKf2vvsK8WYmBToavxmgJF+jeuR0o5yNaNUBxhP1L56c6YeCZao0/voar1gR47s4yevBC0QQ/XfIfBE9aAueUIBiHEosmPHJv4JVjqY=
VITE_TAMBO_API_BASE_URL=https://api.tambo.co/v1
VITE_ABACUS_APP_ID=1573da0c2c
VITE_ABACUS_BASE_URL=https://apps.abacus.ai/chatllm
VITE_APP_NAME=TAMBO MCP Integration Suite
VITE_APP_VERSION=2.0.0
```

### Step 6: Domain Configuration
**Custom Domain:** `filesinasnap.com`

Since you mentioned DNS is already configured, ABACUS should:
- Automatically detect your domain
- Issue SSL certificate
- Configure HTTPS redirect

### Step 7: Deployment Settings (Advanced)
If there are advanced settings, configure:

**SPA Routing:** Enable (for single-page application)
**Auto-deploy:** Enable (deploy on every Git push)
**HTTPS:** Force HTTPS
**CDN:** Enable (if available)

## 🚀 After Setup - Testing

Once deployment completes:

1. **Test the domain:** https://filesinasnap.com
2. **Verify all routes work**
3. **Test key features:**
   - WorkflowManager (Component Designer tab)
   - AI Chat Assistant
   - Component Registry
   - Live Preview

## 📊 Expected Results

After successful deployment, you should see:
- ✅ Build successful
- ✅ Domain active: https://filesinasnap.com
- ✅ SSL certificate issued
- ✅ Auto-deploy enabled for future Git pushes

## 🔧 Troubleshooting

**If build fails:**
- Check Node.js version is 18 or higher
- Verify all environment variables are set
- Check build logs for specific errors

**If domain doesn't resolve:**
- Wait 5-10 minutes for propagation
- Check DNS settings in ABACUS
- Verify SSL certificate status

**If assets don't load:**
- Check that output directory is set to `dist`
- Verify SPA routing is enabled
- Check console for 404 errors

## 📞 What to Tell Me

After you complete these steps, let me know:
1. ✅ Did the GitHub connection work?
2. ✅ Did the build complete successfully?
3. ✅ Is the domain active at https://filesinasnap.com?
4. ❌ Any error messages or issues you encountered?

I can help troubleshoot any issues that come up during the process!
