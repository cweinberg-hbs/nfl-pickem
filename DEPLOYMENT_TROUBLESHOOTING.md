# GitHub Pages Deployment Troubleshooting

## Issues Fixed

### ✅ **Build Configuration**
- **Issue**: Vite was building for root path (`/`) instead of GitHub Pages subdirectory
- **Solution**: Added `base: '/nfl-pickem/'` to `vite.config.js`
- **Verification**: Built files now reference `/nfl-pickem/assets/` correctly

### ✅ **Workflow Optimization**
- **Issue**: Workflow had unnecessary pull request triggers and split jobs
- **Solution**: Simplified to single job that builds and deploys on main branch pushes only
- **Alternative**: Created backup workflow using `peaceiris/actions-gh-pages` action

## Deployment Status Check

### 1. **GitHub Repository Settings**
Ensure GitHub Pages is configured correctly:
- Go to repository Settings → Pages
- Source should be: **"GitHub Actions"** (not "Deploy from a branch")

### 2. **Repository Secrets**
Verify the secret is set:
- Go to Settings → Secrets and variables → Actions
- Should have secret named: `VITE_GITHUB_TOKEN`
- Value should be your GitHub Personal Access Token with `gist` scope

### 3. **Workflow Execution**
Check if workflows are running:
- Go to Actions tab in your repository
- Look for recent workflow runs
- Check for any error messages in failed runs

### 4. **Build Verification**
The build process should generate:
```
dist/
├── index.html (with /nfl-pickem/ paths)
├── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

## Current Workflow Files

### Primary: `.github/workflows/deploy.yml`
- Uses official GitHub Actions for Pages deployment
- More reliable and modern approach

### Backup: `.github/workflows/deploy-alternative.yml`
- Uses `peaceiris/actions-gh-pages` action
- Has debug output to troubleshoot build issues
- Can be renamed to `deploy.yml` if primary fails

## Expected GitHub Pages URL

Your app should be available at:
```
https://cweinberg-hbs.github.io/nfl-pickem/
```

## Debugging Steps

### 1. **Local Build Test** ✅
```bash
npm run build
ls -la dist/
# Should show: index.html, 404.html, assets/
cat dist/index.html  # Should show /nfl-pickem/ paths and SPA script
```

### 2. **GitHub Actions Logs**
- Check Actions tab for build/deploy logs
- Look for "Upload artifact" and "Deploy to GitHub Pages" steps
- Verify no permission or authentication errors

### 3. **Pages Deployment Status**
- Go to Settings → Pages
- Should show recent deployment with green checkmark
- Click on deployment to see details

### 4. **Browser Console**
If page loads but shows errors:
- Open browser developer tools
- Check Console for JavaScript errors
- Check Network tab for failed resource loads

## Common Issues & Solutions

### **404 Error**
- ✅ **Fixed**: Updated `vite.config.js` with correct base path
- ✅ **Fixed**: Workflow deploys `dist/` directory correctly
- ✅ **Fixed**: Added SPA routing support with `404.html` redirect system

### **Blank Page**
- Check browser console for JavaScript errors
- Verify GitHub token is set as repository secret
- Check if build included all necessary assets

### **CSS/JS Not Loading**
- ✅ **Fixed**: Assets now reference correct `/nfl-pickem/` path
- Verify workflow uploaded `dist/assets/` directory

### **GitHub Token Issues**
- Token should have `gist` scope only
- Token should be classic Personal Access Token (not fine-grained)
- Secret should be named exactly `VITE_GITHUB_TOKEN`

## Next Steps

1. **Push to main branch** to trigger deployment
2. **Check Actions tab** for workflow execution
3. **Visit GitHub Pages URL** to verify deployment
4. **Check browser console** if issues persist

## Manual Deployment (Last Resort)

If workflows fail, you can manually deploy:
```bash
npm run build
# Then manually upload dist/ contents to gh-pages branch
```