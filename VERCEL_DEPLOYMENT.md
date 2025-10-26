# Deploying to Vercel

This guide will help you deploy this full-stack application to Vercel.

## Prerequisites

1. A Vercel account (sign up at vercel.com)
2. Your Firebase service account key JSON
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Code

The necessary configuration files have been created:
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.ts` - Serverless function for API routes

## Step 2: Update package.json

You need to add a build script for Vercel. Update your `package.json` scripts section to include:

```json
"scripts": {
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "vercel-build": "vite build",
  "start": "NODE_ENV=production node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

The key addition is the `"vercel-build": "vite build"` line.

## Step 3: Push to Git

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
```

2. Create a repository on GitHub and push:
```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Step 4: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

## Step 5: Set Environment Variables

In your Vercel project settings, add the following environment variable:

- **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
- **Value**: Your entire Firebase service account JSON (paste the complete JSON object)

To get your Firebase service account key:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the entire JSON content

## Step 6: Deploy

Click "Deploy" and Vercel will:
1. Build your frontend (Vite app)
2. Create serverless functions from your API routes
3. Deploy everything to a global CDN

## Important Notes

### Database Connection
- Your Firebase Realtime Database must allow connections from Vercel's IP ranges
- Make sure your Firebase database rules are properly configured

### API Routes
All your API routes (e.g., `/api/leaderboard/entries`) will work automatically as serverless functions.

### Environment
- Production deployments will use `NODE_ENV=production` automatically
- Preview deployments (from pull requests) get their own unique URLs

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally with `npm run check`

### API Errors
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is set correctly
- Check Vercel function logs in the dashboard
- Ensure Firebase database rules allow access

### CORS Issues
If you encounter CORS errors, you may need to add CORS middleware to `api/index.ts`:

```typescript
import cors from 'cors';
app.use(cors());
```

## Alternative: Deploy Backend Elsewhere

If Vercel's serverless functions have limitations for your use case, consider:

1. **Deploy frontend to Vercel** (just the React app)
2. **Deploy backend to Railway/Render/Fly.io** (the Express server)
3. Update frontend to point to the backend URL

This separation might be better for:
- WebSocket connections
- Long-running processes
- Heavy backend workloads

## Next Steps

After deployment:
1. Test all features on the production URL
2. Set up custom domain (optional)
3. Configure preview deployments for PR reviews
4. Monitor function usage and costs in Vercel dashboard
