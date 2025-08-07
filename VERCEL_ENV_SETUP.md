# 🔑 Vercel Environment Variables Setup

## 🎯 Easy Method: Via Vercel Dashboard

### Step 1: Access Environment Variables
1. Go to: https://vercel.com/greenmamba29s-projects/tambo-mcp-integration-suite
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar

### Step 2: Add Each Variable
Add these one by one (Name → Value → Production → Save):

```
VITE_GOOGLE_GEMINI_API_KEY
AIzaSyAl_8S6g6kkpO4f550HN4jg0mWaiXwa5FA

VITE_TAMBO_API_KEY
tambo_2crvFKf2vvsK8WYmBToavxmgJF+jeuR0o5yNaNUBxhP1L56c6YeCZao0/voar1gR47s4yevBC0QQ/XfIfBE9aAueUIBiHEosmPHJv4JVjqY=

VITE_TAMBO_API_BASE_URL
https://api.tambo.co/v1

VITE_ABACUS_APP_ID
1573da0c2c

VITE_ABACUS_BASE_URL
https://apps.abacus.ai/chatllm

VITE_APP_NAME
TAMBO MCP Integration Suite

VITE_APP_VERSION
2.0.0

NODE_ENV
production
```

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Check "Use existing Build Cache" for faster build

## 🚀 Alternative: Command Line Method

If you prefer command line, run these commands:

```bash
npx vercel env add VITE_GOOGLE_GEMINI_API_KEY production
# Enter: AIzaSyAl_8S6g6kkpO4f550HN4jg0mWaiXwa5FA

npx vercel env add VITE_TAMBO_API_KEY production  
# Enter the long tambo key

npx vercel env add VITE_TAMBO_API_BASE_URL production
# Enter: https://api.tambo.co/v1

npx vercel env add VITE_ABACUS_APP_ID production
# Enter: 1573da0c2c

npx vercel env add VITE_ABACUS_BASE_URL production
# Enter: https://apps.abacus.ai/chatllm

npx vercel env add VITE_APP_NAME production
# Enter: TAMBO MCP Integration Suite

npx vercel env add VITE_APP_VERSION production
# Enter: 2.0.0

npx vercel env add NODE_ENV production
# Enter: production
```

## ✅ After Setup

Your app will have full functionality:
- 🤖 AI Chat with Gemini integration
- 🔗 TAMBO API connectivity  
- 🧠 ABACUS intelligence routing
- 📊 Real-time analytics
- 🛠️ Component management tools

## 🎯 Test After Environment Setup

Visit your deployment and verify:
- ✅ AI Chat responds properly
- ✅ Component Designer works
- ✅ No console errors about missing API keys
- ✅ ABACUS integration functions correctly
