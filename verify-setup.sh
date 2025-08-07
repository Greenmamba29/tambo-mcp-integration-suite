#!/bin/bash

echo "🔍 TAMBO MCP Integration Suite - Repository Verification"
echo "======================================================="
echo ""

# Check if we're in a git repository
echo "✅ Git Status:"
git status --short
echo ""

# Check if .env is properly ignored
echo "🔒 Security Check (.env file should NOT appear):"
git ls-files | grep -E "^\.env$" && echo "❌ WARNING: .env file is tracked!" || echo "✅ .env file is properly ignored"
echo ""

# Check remote configuration
echo "🌐 Remote Repository:"
git remote -v || echo "⚠️  No remote repository configured yet"
echo ""

# Check recent commits
echo "📝 Recent Commits:"
git log --oneline -5
echo ""

# Check file count
echo "📁 Repository Statistics:"
echo "Total files tracked: $(git ls-files | wc -l)"
echo "Total lines of code: $(git ls-files | xargs wc -l | tail -1)"
echo ""

# Check if ready for GitHub
echo "🚀 GitHub Ready Status:"
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote origin configured"
    echo "Ready to push with: git push -u origin main"
else
    echo "⚠️  Remote origin not configured yet"
    echo "Next step: Add remote origin as shown in setup-github-repo.md"
fi
echo ""

echo "📚 Next Steps:"
echo "1. Create repository on GitHub.com"
echo "2. Add remote origin with your repository URL"
echo "3. Update your email: git config --global user.email 'your-real-email@example.com'"
echo "4. Push to GitHub: git push -u origin main"
echo "5. Set up Vercel deployment"
echo ""
echo "🔗 See setup-github-repo.md for detailed instructions"
