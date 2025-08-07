# Essential Files to Upload to GitHub First

## 🎯 Priority Files (Upload These First):

### 1. Root Configuration Files:
- `package.json` - Project dependencies and scripts
- `package-lock.json` - Dependency lock file  
- `vercel.json` - Vercel deployment configuration
- `.gitignore` - Git ignore file (protects your API keys)
- `.env.example` - Environment variable template
- `README.md` - Project documentation

### 2. Build Configuration:
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `index.html` - Main HTML template

### 3. Source Code (src folder):
Upload the entire `src/` folder contents:
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Main React component  
- `src/components/` - All React components
- `src/services/` - API integration services
- `src/hooks/` - Custom React hooks

### 4. Public Assets:
- `public/favicon.ico`
- `public/robots.txt`

## 📤 Quick Upload Method:

### Option A: Drag & Drop to GitHub
1. Go to: https://github.com/Greenmamba29/tambo-mcp-integration-suite
2. Click "uploading an existing file"
3. Drag and drop the files above

### Option B: Use Git Command Line (if token works)
```bash
git push origin main
```
(Use your Personal Access Token as password)

## 🌐 After Files are on GitHub:

### Vercel Deployment:
1. Go to: https://vercel.com/new
2. Import: `Greenmamba29/tambo-mcp-integration-suite`
3. Framework: **Vite** (should auto-detect)
4. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Environment Variables in Vercel:
```bash
VITE_GOOGLE_GEMINI_API_KEY=your_new_regenerated_google_api_key_here
VITE_TAMBO_API_KEY=your_tambo_api_key_here
VITE_TAMBO_API_BASE_URL=https://api.tambo.co/v1
VITE_ABACUS_APP_ID=your_abacus_app_id_here
VITE_ABACUS_BASE_URL=https://apps.abacus.ai/chatllm
```

## 🎉 Result:
- ✅ Live app at: `https://tambo-mcp-integration-suite.vercel.app`
- ✅ Automatic deployments on GitHub pushes
- ✅ Professional deployment workflow

---

**Priority:** Get the core files on GitHub first, then deploy to Vercel! 🚀
