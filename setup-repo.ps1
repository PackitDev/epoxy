# Epoxy Repository Setup Script
# This script initializes the Epoxy git repository and pushes it to GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GithubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "epoxy"
)

Write-Host "🚀 Setting up Epoxy GitHub Repository" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the Epoxy directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the Epoxy directory" -ForegroundColor Red
    exit 1
}

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Git is not installed" -ForegroundColor Red
    exit 1
}

# Initialize git if not already initialized
if (!(Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Add all files
Write-Host "📝 Adding files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: Epoxy v1.0.0-beta.1"
    Write-Host "✅ Commit created" -ForegroundColor Green
} else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

# Add remote
$remoteUrl = "https://github.com/$GithubUsername/$RepoName.git"
Write-Host "🔗 Adding remote: $remoteUrl" -ForegroundColor Yellow

$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "⚠️  Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -eq "y") {
        git remote set-url origin $remoteUrl
        Write-Host "✅ Remote updated" -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Rename branch to main
Write-Host "🌿 Setting default branch to 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch renamed" -ForegroundColor Green

# Push to GitHub
Write-Host ""
Write-Host "📤 Ready to push to GitHub!" -ForegroundColor Cyan
Write-Host "Repository: $remoteUrl" -ForegroundColor White
Write-Host ""
$response = Read-Host "Push now? (y/n)"

if ($response -eq "y") {
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://github.com/$GithubUsername/$RepoName" -ForegroundColor White
        Write-Host "2. Create a release tag:" -ForegroundColor White
        Write-Host "   git tag v1.0.0-beta.1" -ForegroundColor Gray
        Write-Host "   git push origin v1.0.0-beta.1" -ForegroundColor Gray
        Write-Host "3. Watch the builds at: https://github.com/$GithubUsername/$RepoName/actions" -ForegroundColor White
    } else {
        Write-Host "❌ Push failed. Make sure:" -ForegroundColor Red
        Write-Host "   1. The repository exists on GitHub" -ForegroundColor White
        Write-Host "   2. You have push access" -ForegroundColor White
        Write-Host "   3. You're authenticated (git credential manager)" -ForegroundColor White
    }
} else {
    Write-Host "⏭️  Skipped push. Run manually when ready:" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
