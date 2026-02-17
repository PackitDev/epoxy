# Epoxy Deployment Guide

## Setting Up GitHub Repository

### 1. Create a New GitHub Repository

1. Go to https://github.com/new
2. Repository name: `epoxy`
3. Description: "Visual Package & Module Manager for Packet SDK"
4. Make it **Public** (so GitHub Actions is free)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### 2. Push Epoxy to the New Repository

From the `Epoxy` directory:

```bash
cd "S:\Effec-t SDK\Epoxy"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Epoxy v1.0.0-beta.1"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/epoxy.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Actions

GitHub Actions should be enabled by default, but verify:

1. Go to your repo: `https://github.com/YOUR_USERNAME/epoxy`
2. Click "Actions" tab
3. If prompted, click "I understand my workflows, go ahead and enable them"

### 4. Create Your First Release

```bash
# Make sure you're in the Epoxy directory
cd "S:\Effec-t SDK\Epoxy"

# Create and push a version tag
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

This will trigger the GitHub Actions workflow that will:
- Build Epoxy for Windows, macOS, and Linux
- Create a GitHub Release with all installers
- Upload the installers as release assets

### 5. Monitor the Build

1. Go to `https://github.com/YOUR_USERNAME/epoxy/actions`
2. You'll see the "Build and Release Epoxy" workflow running
3. Wait for all 3 builds (Windows, macOS, Linux) to complete (~5-10 minutes)
4. Once complete, go to `https://github.com/YOUR_USERNAME/epoxy/releases`
5. You'll see your release with all 3 installers!

### 6. Download the Installers

Once the workflow completes:

1. Go to the Releases page
2. Download:
   - `Epoxy-Setup.exe` (Windows)
   - `Epoxy-*.dmg` (macOS)
   - `Epoxy-*.AppImage` (Linux)

### 7. Update the Website (Optional)

If you want to auto-update the website with new releases, you need to:

1. Create a Personal Access Token (PAT):
   - Go to https://github.com/settings/tokens/new
   - Name: "Epoxy Website Updater"
   - Expiration: No expiration
   - Scopes: Check `repo` (all)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. Add the token to your Epoxy repo secrets:
   - Go to `https://github.com/YOUR_USERNAME/epoxy/settings/secrets/actions`
   - Click "New repository secret"
   - Name: `WEBSITE_UPDATE_TOKEN`
   - Value: Paste your PAT
   - Click "Add secret"

3. Update the workflow file:
   - Edit `.github/workflows/update-website.yml`
   - Change `repository: ${{ github.repository_owner }}/packet-website` to match your website repo name

Now whenever you create a new release, it will automatically update the website downloads!

## Creating Future Releases

1. Update version in `package.json`
2. Commit changes: `git commit -am "Bump version to v1.0.0-beta.2"`
3. Push: `git push`
4. Create tag: `git tag v1.0.0-beta.2`
5. Push tag: `git push origin v1.0.0-beta.2`
6. GitHub Actions will automatically build and release!

## Troubleshooting

### Build Fails

- Check the Actions logs: `https://github.com/YOUR_USERNAME/epoxy/actions`
- Common issues:
  - Missing dependencies: Make sure `package.json` is up to date
  - Build errors: Test locally with `npm run electron:build`

### macOS Build Issues

- macOS builds require code signing for distribution
- For now, the unsigned DMG will work but show a warning
- To properly sign: Add Apple Developer certificates to GitHub Secrets

### Release Not Created

- Make sure you pushed a **tag** (not just a commit)
- Tag must match pattern: `v*.*.*` or `v*.*.*-*`
- Check Actions tab for errors

## Manual Build (Without GitHub Actions)

If you prefer to build manually:

```bash
# Windows
npm run electron:build

# macOS (requires Mac)
npm run electron:build

# Linux
npm run electron:build
```

Installers will be in the `release/` directory.
