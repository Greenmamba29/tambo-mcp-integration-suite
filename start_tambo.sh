#!/bin/bash

# 🚀 TAMBO MCP Integration Suite - Quick Start Script
# This script starts your AI-powered MCP suite locally

echo "🧠 Starting TAMBO MCP Integration Suite..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct directory."
    echo "   Please run this from the tambo_mcp_integration_suite folder"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "🌟 Features Available:"
echo "   • TAMBO BUDDY (AI Chat Assistant)"
echo "   • WorkflowManager (Visual Design Workflow)"
echo "   • Component Registry (48+ Components)"
echo "   • Live Code Editor & Preview"
echo "   • Enterprise Console with AI Analysis"
echo ""
echo "📍 Access your TAMBO MCP Suite at:"
echo "   👉 http://localhost:5173"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
