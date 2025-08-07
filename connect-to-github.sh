#!/bin/bash

echo "🚀 TAMBO MCP Integration Suite - GitHub Connection"
echo "================================================="
echo ""

# Check if repository exists on GitHub
echo "📋 Step 1: Verify GitHub Repository"
echo "Please ensure you've created the repository at:"
echo "https://github.com/Greenmamba29/tambo-mcp-integration-suite"
echo ""

# Set up authentication
echo "🔑 Step 2: Authentication Setup"
echo "You'll need a Personal Access Token from:"
echo "https://github.com/settings/personal-access-tokens/new"
echo ""
echo "Token settings:"
echo "- Name: TAMBO MCP Integration Suite"
echo "- Permissions needed: 'repo' and 'workflow'"
echo ""

# Add remote and push
echo "📤 Step 3: Connecting Repository"
echo "Adding GitHub remote..."

git remote add origin https://github.com/Greenmamba29/tambo-mcp-integration-suite.git

echo "✅ Remote added successfully"
echo ""

echo "📤 Ready to push to GitHub!"
echo "Run the following command and use your Personal Access Token when prompted:"
echo ""
echo "git push -u origin main"
echo ""
echo "When prompted:"
echo "- Username: Greenmamba29"
echo "- Password: [paste your Personal Access Token]"
echo ""

# Prepare for Vercel
echo "🌐 Next: Vercel Setup"
echo "After successful push, we'll set up Vercel deployment"
echo ""

# Environment variables reminder
echo "🔒 Environment Variables for Vercel:"
echo "You'll need to add these in Vercel:"
cat .env.example
echo ""
echo "Your actual values are in .env (which is safely ignored by Git)"
