# GhostLink Deployment Guide

This guide will help you deploy GhostLink to production.

## Prerequisites

- Node.js 18+ installed
- Firebase account
- Git installed
- (Optional) Netlify or Vercel account for hosting

## Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "ghostlink-chat")
4. Disable Google Analytics (optional, recommended for privacy)
5. Click "Create project"

### 1.2 Enable Realtime Database

1. In Firebase Console, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose a location (closest to your users)
4. Start in **Test Mode** for now (we'll secure it later)
5. Click "Enable"

### 1.3 Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Register your app (name: "GhostLink Web")
5. Copy the Firebase configuration object

### 1.4 Configure Firebase Security Rules

**📖 For detailed instructions, see: [FIREBASE-RULES-GUIDE.md](FIREBASE-RULES-GUIDE.md)**

#### Quick Setup Options:

**Option A: Using Firebase CLI (Recommended)**
```bash
firebase deploy --only database
```

**Option B: Manual Setup via Console**
1. Go to Realtime Database → Rules tab
2. Copy the entire content from `firebase.rules.json`
3. Paste into the Firebase Console rules editor
4. Click "Publish"

⚠️ **Important**: Copy the rules from `firebase.rules.json` or `database.rules.json` files, NOT the database structure documentation. See [FIREBASE-RULES-GUIDE.md](FIREBASE-RULES-GUIDE.md) for troubleshooting common errors.

## Step 2: Environment Configuration

### 2.1 Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### 2.2 Fill in Firebase Credentials

Edit `.env` and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# FreeImage API (default provided)
VITE_FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
```

⚠️ **Never commit `.env` to version control!** It's in `.gitignore` by default.

## Step 3: Build the Application

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build for production
npm run build
```

The built files will be in the `dist` folder.

## Step 4: Deployment Options

### Option A: Firebase Hosting (Recommended)

**Pros:** Free tier, automatic SSL, global CDN, easy setup
**Cons:** Limited to Firebase ecosystem

1. **Install Firebase Tools**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Hosting**
   ```bash
   firebase init hosting
   ```
   
   - Select your Firebase project
   - Set public directory: `dist`
   - Configure as single-page app: `Yes`
   - Don't overwrite `dist/index.html`

4. **Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

5. **Set Environment Variables** (if using CI/CD)
   - Go to Firebase Console → Hosting
   - Add your environment variables in the build configuration

Your app will be live at `https://your-project.web.app`

### Option B: Netlify

**Pros:** Simple deployment, great CI/CD, free SSL
**Cons:** Limited build minutes on free tier

#### Method 1: Deploy from GitHub

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables in Site Settings → Environment Variables
6. Deploy!

#### Method 2: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option C: Vercel

**Pros:** Excellent performance, serverless functions, free SSL
**Cons:** Limited to Vercel ecosystem

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
npm run build
vercel --prod
```

Add environment variables in the Vercel dashboard or via CLI:
```bash
vercel env add VITE_FIREBASE_API_KEY
```

### Option D: Custom Server (VPS/Cloud)

If deploying to your own server:

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Upload `dist` folder** to your server

3. **Configure web server** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name ghostlink.example.com;
       
       root /var/www/ghostlink/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
   }
   ```

4. **Enable SSL** with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d ghostlink.example.com
   ```

## Step 5: Post-Deployment Checklist

- [ ] Test the live site
- [ ] Verify Firebase connection
- [ ] Test matchmaking with multiple users
- [ ] Test image upload functionality
- [ ] Verify NSFW mode works
- [ ] Test on mobile devices
- [ ] Check Firebase database for data
- [ ] Review Firebase security rules
- [ ] Set up monitoring (Firebase Console)
- [ ] Add custom domain (optional)
- [ ] Enable analytics (optional, but not recommended for privacy)

## Step 6: Monitoring & Maintenance

### Firebase Console Monitoring

1. Go to Firebase Console
2. Check Realtime Database usage
3. Monitor for errors in logs
4. Check for abuse patterns

### Performance Monitoring

Optional: Enable Firebase Performance Monitoring
```bash
npm install firebase/performance
```

Then in your app:
```javascript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

### Database Cleanup

Consider adding Firebase Cloud Functions to clean up old data:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Clean up rooms older than 1 hour with no users
exports.cleanupOldRooms = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const db = admin.database();
    const roomsRef = db.ref('rooms');
    const snapshot = await roomsRef.once('value');
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    snapshot.forEach((child) => {
      const room = child.val();
      if (room.createdAt < now - oneHour) {
        const users = room.users || {};
        const hasActiveUsers = Object.values(users).some(u => u.connected);
        if (!hasActiveUsers) {
          child.ref.remove();
        }
      }
    });
  });
```

Deploy functions:
```bash
firebase deploy --only functions
```

## Troubleshooting

### Build Errors

**Problem:** Build fails with module errors
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Connection Issues

**Problem:** App shows "Initializing Firebase" forever
**Solution:** 
- Check that all Firebase environment variables are set correctly
- Verify Firebase project is active
- Check browser console for errors

### Image Upload Fails

**Problem:** Image upload returns error
**Solution:**
- FreeImage.host API might be down or rate limited
- Try a different image
- Check API key is valid
- Consider implementing fallback to Firebase Storage

### Matchmaking Not Working

**Problem:** Users stuck on "Searching"
**Solution:**
- Need at least 2 users online simultaneously
- Check Firebase database rules allow read/write
- Verify waiting list is being written to Firebase

## Scaling Considerations

For high traffic:

1. **Use Firebase Hosting CDN** - Handles millions of requests
2. **Implement proper rate limiting** - Add Firebase Cloud Functions
3. **Add caching** - Cache static assets aggressively
4. **Monitor costs** - Firebase has generous free tier but monitor usage
5. **Consider Firebase Extensions** - For moderation, analytics, etc.

## Cost Estimates

### Free Tier Limits (Firebase)

- **Realtime Database:** 1GB storage, 10GB/month download
- **Hosting:** 10GB storage, 360MB/day transfer
- **Expected capacity:** ~10,000 daily active users on free tier

### Paid Tier Costs (if exceeded)

- **Realtime Database:** $5/GB storage, $1/GB download
- **Hosting:** $0.026/GB storage, $0.15/GB transfer
- **Typical cost:** $10-50/month for 100k daily users

## Security Hardening

Before going live:

1. Review `SECURITY.md`
2. Update Firebase security rules
3. Enable Firebase App Check (prevents API abuse)
4. Add rate limiting
5. Implement content moderation
6. Set up error reporting (Sentry)

## Support & Updates

- Keep dependencies updated: `npm update`
- Monitor Firebase SDK releases
- Check for security advisories
- Follow semantic versioning for updates

---

For questions or issues, please open a GitHub issue or contact the maintainers.
