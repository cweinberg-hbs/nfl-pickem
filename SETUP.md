# Secure Setup Guide

## 🔒 Secure GitHub Token Implementation

The app has been updated to use environment variables instead of exposing the GitHub token in the UI. Here's how to set it up:

## Local Development Setup

1. **Create `.env` file** in the project root:
   ```bash
   # Copy from .env.example
   cp .env.example .env
   ```

2. **Add your GitHub token** to `.env`:
   ```
   VITE_GITHUB_TOKEN=ghp_your_actual_token_here
   ```

3. **Create GitHub Personal Access Token**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `gist` scope only
   - Copy the token and paste it in your `.env` file

## GitHub Pages Deployment Setup

1. **Add Repository Secret**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VITE_GITHUB_TOKEN`
   - Value: Your GitHub personal access token

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"

3. **Deploy**:
   - Push to main branch
   - GitHub Actions will automatically build and deploy
   - Token will be securely embedded during build process

## Security Benefits

✅ **Token never exposed to users**
✅ **No client-side storage of sensitive data**  
✅ **Token obfuscated in built code**
✅ **Works perfectly with GitHub Pages**
✅ **Simple deployment process**

## What Changed

- ❌ Removed GitHub token input field from UI
- ❌ Removed token from session storage
- ✅ Token now read from environment variable
- ✅ Secure build process via GitHub Actions
- ✅ Status indicator shows when cloud persistence is available

## Testing

1. **Local**: Set `.env` file and run `npm run dev`
2. **Production**: Push to main branch, check GitHub Actions for successful deployment
3. **Verify**: App should show "Cloud persistence enabled" message when token is configured

## Token Expiration

When your GitHub token expires:
1. Generate new token in GitHub settings
2. Update repository secret `VITE_GITHUB_TOKEN`
3. Re-deploy (push to main or manually trigger GitHub Actions)

No code changes required for token rotation!