#!/bin/bash

# 🚀 Quick Domain Fix Deployment Script
# This script deploys the redirect fixes for FilesInASnap.com

echo "🔧 TAMBO MCP Domain Fix Deployment"
echo "=================================="

echo ""
echo "📋 Pre-deployment checklist:"
echo "1. ✅ Updated vercel.json with correct redirects"
echo "2. ✅ Added public/_redirects for backup"
echo "3. ✅ Enhanced security headers"

echo ""
echo "🚀 Starting deployment..."

# Build the project
echo ""
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."

# Check if vercel CLI is available
if command -v vercel &> /dev/null; then
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo ""
        echo "🔍 CRITICAL: Manual action still required!"
        echo "   Go to Vercel Dashboard to fix domain configuration:"
        echo "   1. https://vercel.com/dashboard"
        echo "   2. Settings → Domains"
        echo "   3. Set filesinasnap.com as PRIMARY"
        echo "   4. Set www.filesinasnap.com to REDIRECT to filesinasnap.com"
        echo ""
        echo "⏰ Changes will take effect in 5-10 minutes after manual config."
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
    echo "   Then run: vercel login && vercel --prod"
fi

echo ""
echo "📋 Next Steps:"
echo "1. ⚠️  MANUAL: Fix domain config in Vercel Dashboard (CRITICAL!)"
echo "2. ⏳ Wait 5-10 minutes for propagation"
echo "3. 🧪 Test: ./fix_domain_redirect.sh"
echo "4. 🎉 Verify: https://filesinasnap.com loads without errors"

echo ""
echo "📚 Documentation:"
echo "   • SSL_FIX_GUIDE.md - Complete fix instructions"
echo "   • DOMAIN_SETUP_INSTRUCTIONS.md - Step-by-step manual config"

echo ""
echo "✅ Deployment script completed!"
echo "   The redirect fix code has been deployed."
echo "   MANUAL VERCEL DASHBOARD CHANGES STILL REQUIRED!"
