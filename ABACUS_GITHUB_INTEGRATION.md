# 🔄 ABACUS → GitHub → Vercel Workflow Setup

## 🎯 Current Issue
- Vercel deployment is working but showing "proxy detected" 
- Need to enable ABACUS to push changes to GitHub
- GitHub should then trigger Vercel auto-deploy

## ✅ Workflow Architecture

```
ABACUS AI Changes → GitHub Repository → Vercel Deployment → filesinasnap.com
```

## 🔧 Setting Up ABACUS GitHub Integration

### Step 1: Generate GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"

2. **Configure Token Permissions**
   - **Note:** `ABACUS Integration Token`
   - **Expiration:** No expiration (or 1 year)
   - **Select scopes:**
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Write packages)

3. **Copy the Token**
   - Save it securely - you'll need it for ABACUS configuration

### Step 2: Configure ABACUS GitHub Integration

In your ABACUS dashboard/settings:

1. **Find GitHub Integration Section**
   - Look for "Git Integration", "GitHub", or "Repository Settings"

2. **Add Repository Connection**
   - **Repository URL:** `git@github.com:Greenmamba29/tambo-mcp-integration-suite.git`
   - **OR HTTPS:** `https://github.com/Greenmamba29/tambo-mcp-integration-suite.git`
   - **Branch:** `main`
   - **Access Token:** [Your GitHub token from Step 1]

3. **Configure Auto-Push Settings**
   - ✅ Enable automatic commits
   - ✅ Enable push to main branch
   - **Commit Message Format:** `ABACUS: Update components and intelligence [timestamp]`

### Step 3: Set Up ABACUS Webhook (Optional)

If ABACUS supports webhooks:

1. **Create Webhook URL**
   - Use Vercel's deploy hook: https://vercel.com/greenmamba29s-projects/tambo-mcp-integration-suite/settings/git

2. **Configure ABACUS Webhook**
   - **Webhook URL:** [Vercel deploy hook URL]
   - **Events:** Push to main branch
   - **Method:** POST

## 🔒 Security Configuration

### GitHub Repository Settings

1. **Go to Repository Settings**
   - Visit: https://github.com/Greenmamba29/tambo-mcp-integration-suite/settings

2. **Configure Branch Protection (Recommended)**
   - Go to "Branches" → Add rule for `main`
   - ✅ Require pull request reviews (optional)
   - ✅ Require status checks to pass
   - ✅ Include administrators

3. **Add ABACUS as Collaborator (Alternative)**
   - Go to "Manage access"
   - Add ABACUS service account if they provide one

## 📋 Environment Variables for ABACUS Integration

Add these to your repository (if needed):

```bash
# .env.abacus (create this file)
ABACUS_WEBHOOK_SECRET=your_webhook_secret
ABACUS_API_ENDPOINT=https://api.abacus.ai/mcp
ABACUS_PROJECT_ID=your_project_id
GITHUB_TOKEN=your_github_token
```

## 🚀 Vercel Configuration for ABACUS Updates

### Update vercel.json for ABACUS compatibility:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://apps.abacus.ai"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

## 🔄 Testing the Integration

### Step 1: Test ABACUS → GitHub
1. Make a small change in ABACUS interface
2. Check if it appears as a commit in GitHub: https://github.com/Greenmamba29/tambo-mcp-integration-suite/commits/main

### Step 2: Test GitHub → Vercel
1. Verify Vercel auto-deploys the new commit
2. Check deployment status: https://vercel.com/greenmamba29s-projects/tambo-mcp-integration-suite

### Step 3: Test End-to-End
1. ABACUS change → GitHub commit → Vercel deploy → Live update
2. Check the live site for your changes

## 🛠️ Alternative: ABACUS API Integration

If direct GitHub integration isn't available, use ABACUS API:

```javascript
// webhook endpoint to receive ABACUS updates
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { changes, timestamp } = req.body;
    
    // Process ABACUS changes
    // Commit to GitHub via GitHub API
    // Trigger Vercel deployment
    
    res.status(200).json({ success: true });
  }
}
```

## 📞 Next Steps

1. **Generate GitHub Personal Access Token**
2. **Configure ABACUS GitHub integration**
3. **Test the workflow with a small change**
4. **Verify Vercel auto-deployment**
5. **Check filesinasnap.com for updates**

## 🔧 Troubleshooting

**If ABACUS can't push to GitHub:**
- Check token permissions
- Verify repository access
- Check ABACUS logs for errors

**If Vercel doesn't auto-deploy:**
- Check GitHub webhook settings
- Verify Vercel project connection
- Check Vercel deployment logs

**If proxy errors persist:**
- Disable conflicting proxy settings
- Check DNS configuration
- Verify domain routing
