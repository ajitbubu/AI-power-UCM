#!/bin/bash

# UCM AI - Git Push Helper Script
# This script helps you push the project to a Git repository

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         UCM AI - Git Repository Setup                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Initializing now..."
    git init
    echo "✅ Git initialized"
    echo ""
fi

# Check current status
echo "📊 Current Git Status:"
git status --short
echo ""

# Add all files
echo "📦 Adding all files to Git..."
git add .
echo "✅ Files added"
echo ""

# Show what will be committed
echo "📝 Files to be committed:"
git status --short
echo ""

# Ask for commit message
echo "💬 Enter commit message (or press Enter for default):"
read -r COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit: UCM AI - Universal Consent Manager

- Complete consent management platform
- Cookie banner with GPC detection
- Multi-framework support (TCFv2.2, GPPv2)
- Google Consent Mode integration
- Admin dashboard with audit logs
- Docker deployment ready
- Complete documentation
- Frontend: Next.js 14 with TypeScript
- Backend: FastAPI with PostgreSQL/SQLite
- All features tested and working"
fi

# Commit
echo ""
echo "💾 Creating commit..."
git commit -m "$COMMIT_MSG"
echo "✅ Commit created"
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "🌐 Remote 'origin' already configured"
    git remote -v
    echo ""
    
    # Ask if user wants to push
    echo "🚀 Push to remote? (y/n)"
    read -r PUSH_CONFIRM
    
    if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
        echo "📤 Pushing to remote..."
        git push -u origin main
        echo "✅ Pushed successfully!"
    else
        echo "⏭️  Skipping push. You can push later with: git push -u origin main"
    fi
else
    echo "⚠️  No remote repository configured"
    echo ""
    echo "To add a remote repository:"
    echo "  GitHub:    git remote add origin https://github.com/YOUR_USERNAME/ucm-ai.git"
    echo "  GitLab:    git remote add origin https://gitlab.com/YOUR_USERNAME/ucm-ai.git"
    echo "  Bitbucket: git remote add origin https://bitbucket.org/YOUR_USERNAME/ucm-ai.git"
    echo ""
    echo "Then run: git push -u origin main"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Done!                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 For more information, see: GIT_SETUP.md"
