#!/bin/bash

# 🔧 Domain Redirect Fix Script for FilesInASnap.com
# This script helps identify and fix the SSL certificate issue

echo "🔍 TAMBO MCP SSL Certificate Fix Script"
echo "========================================"

echo ""
echo "1. Testing current domain configuration..."

echo ""
echo "🔗 Testing filesinasnap.com (should be primary):"
curl -I https://filesinasnap.com 2>/dev/null | grep -E "(HTTP|location|server)" || echo "❌ Connection failed"

echo ""
echo "🔗 Testing www.filesinasnap.com (should redirect to primary):"
curl -I https://www.filesinasnap.com 2>/dev/null | grep -E "(HTTP|location|server)" || echo "❌ Connection failed"

echo ""
echo "2. Checking SSL certificate status..."

echo ""
echo "🔒 SSL Certificate for filesinasnap.com:"
echo | openssl s_client -connect filesinasnap.com:443 -servername filesinasnap.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null || echo "❌ SSL check failed"

echo ""
echo "🔒 SSL Certificate for www.filesinasnap.com:"
echo | openssl s_client -connect www.filesinasnap.com:443 -servername www.filesinasnap.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null || echo "❌ SSL check failed"

echo ""
echo "3. Analyzing the issue..."

# Check if filesinasnap.com redirects to www
REDIRECT_CHECK=$(curl -I https://filesinasnap.com 2>/dev/null | grep "location: https://www.filesinasnap.com")
if [[ -n "$REDIRECT_CHECK" ]]; then
    echo "❌ ISSUE FOUND: filesinasnap.com is redirecting to www.filesinasnap.com"
    echo "   This is causing the SSL certificate mismatch!"
    echo ""
    echo "🔧 SOLUTION NEEDED:"
    echo "   1. Set filesinasnap.com as PRIMARY domain"
    echo "   2. Set www.filesinasnap.com to REDIRECT to filesinasnap.com"
    echo ""
    echo "📋 Manual Steps Required:"
    echo "   1. Go to: https://vercel.com/dashboard"
    echo "   2. Select project: tambo-mcp-integration-suite" 
    echo "   3. Go to Settings → Domains"
    echo "   4. For filesinasnap.com: Set as 'Primary Domain'"
    echo "   5. For www.filesinasnap.com: Set to 'Redirect to filesinasnap.com'"
else
    echo "✅ Domain redirect appears correct"
fi

echo ""
echo "4. Vercel project status..."
vercel project inspect 2>/dev/null || echo "ℹ️  Run 'vercel login' if you need to authenticate"

echo ""
echo "5. Available Vercel domains..."
vercel domains list 2>/dev/null || echo "ℹ️  Authentication may be required"

echo ""
echo "🚀 Next Steps:"
echo "1. Fix domain configuration in Vercel Dashboard (see instructions above)"
echo "2. Wait 5-10 minutes for SSL certificate to propagate"
echo "3. Clear browser cache and test again"
echo "4. Run this script again to verify the fix"

echo ""
echo "📚 Complete instructions available in:"
echo "   • SSL_FIX_GUIDE.md"
echo "   • DOMAIN_SETUP_INSTRUCTIONS.md"

echo ""
echo "✅ Script completed. Check the output above for specific issues and solutions."
