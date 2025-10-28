# SPA GitHub Pages Routing Fix

## Problem
GitHub Pages doesn't automatically serve `index.html` for Single Page Applications (SPAs). When users visit:
- `https://cweinberg-hbs.github.io/nfl-pickem/` ❌ Returns 404
- `https://cweinberg-hbs.github.io/nfl-pickem/index.html` ✅ Works

## Solution Implemented

### ✅ **SPA GitHub Pages Redirect System**

Implemented the standard solution using the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) approach:

#### **1. Created `public/404.html`**
- Automatically served by GitHub Pages for any 404 error
- Contains redirect script that converts URL path to query parameters
- Shows loading spinner while redirecting
- Maintains the original URL structure

#### **2. Updated `index.html`**
- Added script to handle redirected URLs
- Converts query parameters back to proper URL paths
- Uses `window.history.replaceState()` to clean up the URL

### **How It Works**

1. **User visits**: `https://cweinberg-hbs.github.io/nfl-pickem/`
2. **GitHub Pages**: Returns `404.html` (no index.html at root)
3. **404.html script**: Redirects to `/?/` 
4. **index.html loads**: Main app loads successfully
5. **index.html script**: Cleans up URL to show `/nfl-pickem/`

### **Files Modified**

- ✅ `public/404.html` - Created SPA redirect handler
- ✅ `index.html` - Added URL cleanup script
- ✅ Both files automatically included in build (`dist/`)

## Alternative Solutions Considered

### **Option 1: Jekyll Bypass (Not Needed)**
```
# Add .nojekyll file to disable Jekyll processing
```
*Not needed because GitHub Actions deployment already handles this.*

### **Option 2: Server Configuration (Not Available)**
```
# .htaccess or nginx config
RewriteRule ^(?!.*\.).*$ /index.html [L]
```
*Not available on GitHub Pages static hosting.*

### **Option 3: Hash Routing (Not Ideal)**
```javascript
// Use hash-based routing instead of history API
// URLs would look like: /nfl-pickem/#/
```
*Would work but creates less clean URLs.*

## Testing the Fix

### **Local Testing**
```bash
npm run build
cd dist
python -m http.server 8000
# Visit http://localhost:8000 - should work
```

### **Production Testing**
After deployment, test these URLs:
- ✅ `https://cweinberg-hbs.github.io/nfl-pickem/`
- ✅ `https://cweinberg-hbs.github.io/nfl-pickem/index.html`
- ✅ Any invalid path should redirect to main app

## Benefits

- ✅ **Clean URLs**: Users can visit the base URL directly
- ✅ **Bookmarking**: Any URL works correctly
- ✅ **SEO Friendly**: Search engines can index the main page
- ✅ **No Breaking Changes**: Existing functionality unchanged
- ✅ **Standard Solution**: Used by thousands of GitHub Pages SPAs

## Deployment Status

- ✅ Files created and built successfully
- ✅ Ready for deployment via GitHub Actions
- ✅ No additional configuration needed

The next deployment will include these fixes and resolve the 404 issue for the base URL.