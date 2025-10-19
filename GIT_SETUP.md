# Git Setup Guide for UCM AI

## Initial Setup

### 1. Initialize Git Repository

```bash
# Initialize git in the project root
git init

# Check status
git status
```

### 2. Add All Files

```bash
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status
```

### 3. Create Initial Commit

```bash
# Commit with descriptive message
git commit -m "Initial commit: UCM AI - Universal Consent Manager

- Complete consent management platform
- Cookie banner with GPC detection
- Multi-framework support (TCFv2.2, GPPv2)
- Google Consent Mode integration
- Admin dashboard with audit logs
- Docker deployment ready
- Complete documentation (9 files)
- Frontend: Next.js 14 with TypeScript
- Backend: FastAPI with PostgreSQL/SQLite
- All features tested and working"
```

## Connect to Remote Repository

### Option 1: GitHub

```bash
# Create repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/ucm-ai.git

# Or with SSH:
git remote add origin git@github.com:YOUR_USERNAME/ucm-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option 2: GitLab

```bash
# Create repository on GitLab first, then:
git remote add origin https://gitlab.com/YOUR_USERNAME/ucm-ai.git

# Or with SSH:
git remote add origin git@gitlab.com:YOUR_USERNAME/ucm-ai.git

# Push to GitLab
git branch -M main
git push -u origin main
```

### Option 3: Bitbucket

```bash
# Create repository on Bitbucket first, then:
git remote add origin https://bitbucket.org/YOUR_USERNAME/ucm-ai.git

# Or with SSH:
git remote add origin git@bitbucket.org:YOUR_USERNAME/ucm-ai.git

# Push to Bitbucket
git branch -M main
git push -u origin main
```

## Verify Remote

```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/ucm-ai.git (fetch)
# origin  https://github.com/YOUR_USERNAME/ucm-ai.git (push)
```

## Branch Strategy

### Create Development Branch

```bash
# Create and switch to dev branch
git checkout -b dev

# Push dev branch
git push -u origin dev
```

### Create Feature Branches

```bash
# For new features
git checkout -b feature/cookie-scanner
git checkout -b feature/email-receipts

# For bug fixes
git checkout -b fix/banner-display
git checkout -b fix/gpc-detection
```

## Common Git Commands

### Daily Workflow

```bash
# Check status
git status

# Add specific files
git add frontend/app/product/page.tsx
git add backend/app.py

# Add all changes
git add .

# Commit changes
git commit -m "Add cookie scanning feature"

# Push to remote
git push

# Pull latest changes
git pull
```

### Branching

```bash
# List branches
git branch

# Switch branch
git checkout main
git checkout dev

# Create and switch
git checkout -b feature/new-feature

# Delete branch
git branch -d feature/old-feature
```

### Viewing History

```bash
# View commit history
git log

# View compact history
git log --oneline

# View with graph
git log --graph --oneline --all
```

## .gitignore Explanation

The `.gitignore` file excludes:

### Python/Backend
- `__pycache__/` - Python cache files
- `*.pyc` - Compiled Python files
- `.venv/` - Virtual environment
- `*.db` - SQLite databases
- `.pytest_cache/` - Test cache

### Node/Frontend
- `node_modules/` - NPM packages
- `.next/` - Next.js build files
- `build/`, `dist/` - Build outputs

### Environment
- `.env` - Environment variables
- `.env.local` - Local environment
- `*.log` - Log files

### IDE/OS
- `.vscode/` - VS Code settings
- `.idea/` - IntelliJ settings
- `.DS_Store` - macOS files

## Pre-Push Checklist

Before pushing to remote:

- [ ] All tests passing
- [ ] No sensitive data (API keys, passwords)
- [ ] .env files not committed
- [ ] Documentation updated
- [ ] Code formatted
- [ ] No debug code
- [ ] Commit message is clear

## Sensitive Data

### Never Commit:
- ❌ `.env` files
- ❌ API keys
- ❌ Passwords
- ❌ Database credentials
- ❌ Private keys
- ❌ Personal data

### Use Environment Variables:
```bash
# Create .env.example instead
cp .env.local .env.example

# Remove sensitive values
# Edit .env.example to have placeholders
```

## Repository Structure

```
ucm-ai/
├── .git/                    # Git repository (auto-created)
├── .gitignore              # Git ignore rules
├── README.md               # Main documentation
├── docs/                   # Documentation folder
├── backend/                # Backend code
├── frontend/               # Frontend code
└── docker-compose.yml      # Docker config
```

## Collaboration

### Clone Repository

```bash
# Clone via HTTPS
git clone https://github.com/YOUR_USERNAME/ucm-ai.git

# Clone via SSH
git clone git@github.com:YOUR_USERNAME/ucm-ai.git

# Navigate to project
cd ucm-ai
```

### Pull Requests

1. Fork the repository
2. Create feature branch
3. Make changes
4. Commit and push
5. Create pull request
6. Wait for review

### Code Review

```bash
# Fetch latest changes
git fetch origin

# Review changes
git diff main origin/main

# Merge after approval
git merge origin/main
```

## Tags and Releases

### Create Version Tags

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# Push all tags
git push --tags
```

### Semantic Versioning

- `v1.0.0` - Major release
- `v1.1.0` - Minor release (new features)
- `v1.0.1` - Patch release (bug fixes)

## Troubleshooting

### Undo Last Commit

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Discard Local Changes

```bash
# Discard all changes
git reset --hard

# Discard specific file
git checkout -- filename
```

### Fix Wrong Remote URL

```bash
# Remove remote
git remote remove origin

# Add correct remote
git remote add origin NEW_URL
```

### Large Files

If you accidentally committed large files:

```bash
# Remove from history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch PATH_TO_FILE' \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

## GitHub-Specific Features

### Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `ucm-ai`
3. Description: "Universal Consent Manager - Privacy-first consent platform"
4. Choose Public or Private
5. Don't initialize with README (we have one)
6. Click "Create repository"

### Add Repository Topics

On GitHub, add topics:
- `consent-management`
- `privacy`
- `gdpr`
- `ccpa`
- `gpc`
- `cookie-banner`
- `nextjs`
- `fastapi`
- `docker`
- `typescript`

### Create GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: docker-compose up -d && docker-compose exec backend pytest
```

## Best Practices

1. **Commit Often**: Small, focused commits
2. **Clear Messages**: Descriptive commit messages
3. **Branch Strategy**: Use feature branches
4. **Pull Before Push**: Always pull latest changes
5. **Review Changes**: Check `git diff` before committing
6. **Test First**: Ensure tests pass before pushing
7. **Document Changes**: Update docs with code changes

## Quick Reference

```bash
# Status and info
git status              # Check status
git log                 # View history
git diff                # View changes

# Basic workflow
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push                # Push to remote
git pull                # Pull from remote

# Branching
git branch              # List branches
git checkout -b name    # Create branch
git merge branch        # Merge branch

# Remote
git remote -v           # View remotes
git remote add origin URL  # Add remote
git push -u origin main    # Push to remote
```

## Next Steps

After pushing to Git:

1. ✅ Add repository description
2. ✅ Add topics/tags
3. ✅ Create README badges
4. ✅ Set up GitHub Pages (optional)
5. ✅ Enable GitHub Actions (optional)
6. ✅ Add collaborators
7. ✅ Create issues/milestones
8. ✅ Set up branch protection

---

**Ready to push!** 🚀

Follow the steps above to get your code on Git.
