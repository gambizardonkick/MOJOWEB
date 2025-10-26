# Quick Start: Deploy to Vercel

## 📦 What's Been Set Up

I've created these files for Vercel deployment:
- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless API handler
- `VERCEL_DEPLOYMENT.md` - Full deployment guide

## 🚀 Quick Deploy Steps

### 1. Add Build Script
Open `package.json` and add this line to the `scripts` section:
```json
"vercel-build": "vite build",
```

Your scripts should look like:
```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "vercel-build": "vite build",  // ← ADD THIS LINE
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Ready for Vercel"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Set these settings:
   - Framework: **Vite**
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/public`
5. Add environment variable:
   - Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: Your Firebase service account JSON
6. Click **Deploy**

### 4. Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the entire JSON content
6. Paste it into Vercel environment variables

## ⚠️ Important Notes

- **Firebase Database**: This app needs Firebase to work. Make sure you have the credentials ready.
- **First deployment**: May take 2-3 minutes to build
- **Updates**: Just push to GitHub and Vercel auto-deploys

## 🔍 Need More Details?

See `VERCEL_DEPLOYMENT.md` for comprehensive instructions and troubleshooting.

## 💡 Alternative Options

If Vercel doesn't work well for your needs, consider:
- **Railway.app** - Better for full-stack Node.js apps
- **Render.com** - Supports both web services and static sites
- **Fly.io** - Great for Node.js with databases

These platforms are often simpler for Express apps like this one.
