# 🚀 Complete Vercel + Firebase Setup Guide for GhostLink

This guide walks you through every step to deploy GhostLink on Vercel with Firebase.

## 📋 What You'll Need

- A GitHub account (to push your code)
- A Vercel account (free - sign up at https://vercel.com)
- A Google account (for Firebase)
- 15-20 minutes of your time

---

## Part 1: Firebase Setup (Backend)

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Enter Project Details**
   - Project name: `ghostlink-chat` (or any name you like)
   - Click "Continue"

3. **Google Analytics (Optional)**
   - Toggle OFF "Enable Google Analytics" (recommended for privacy)
   - Click "Create project"
   - Wait for project creation (30 seconds)
   - Click "Continue"

### Step 2: Register Your Web App

1. **Add Web App**
   - In Firebase Console, click the **web icon** `</>` (in the center or under "Get started")
   - App nickname: `GhostLink Web`
   - ✅ Check "Also set up Firebase Hosting" (optional but recommended)
   - Click "Register app"

2. **Copy Firebase Configuration**
   - You'll see a code snippet like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q",
     authDomain: "ghostlink-chat.firebaseapp.com",
     databaseURL: "https://ghostlink-chat-default-rtdb.firebaseio.com",
     projectId: "ghostlink-chat",
     storageBucket: "ghostlink-chat.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456ghi789jkl"
   };
   ```
   - **COPY ALL THESE VALUES** - you'll need them later!
   - Click "Continue to console"

### Step 3: Enable Realtime Database

1. **Navigate to Realtime Database**
   - In left sidebar, click "Build" → "Realtime Database"
   - Click "Create Database"

2. **Choose Location**
   - Select a location close to your users:
     - `us-central1` - United States
     - `europe-west1` - Belgium
     - `asia-southeast1` - Singapore
   - Click "Next"

3. **Set Security Rules**
   - Select "Start in **test mode**" for now (we'll secure it later)
   - Click "Enable"
   - Wait for database creation

4. **Note Your Database URL**
   - After creation, you'll see your database URL at the top:
   - Example: `https://ghostlink-chat-default-rtdb.firebaseio.com/`
   - This should match the `databaseURL` from Step 2

### Step 4: Configure Database Security Rules

1. **Go to Rules Tab**
   - In Realtime Database page, click "Rules" tab

2. **Replace Default Rules**
   - Delete everything and paste this:

```json
{
  "rules": {
    "waitingList": {
      ".read": true,
      "$userId": {
        ".write": true,
        ".validate": "newData.hasChildren(['userId', 'nickname', 'gender', 'timestamp'])"
      }
    },
    "rooms": {
      ".read": true,
      "$roomId": {
        "users": {
          ".write": true
        },
        "messages": {
          ".write": true,
          "$messageId": {
            ".validate": "newData.hasChildren(['senderId', 'senderNickname', 'timestamp'])"
          }
        },
        "typing": {
          ".write": true
        }
      }
    }
  }
}
```

3. **Publish Rules**
   - Click "Publish" button
   - You should see "Rules published successfully"

### Step 5: Get Your Firebase Configuration Values

From Step 2, you should have these values. If not, get them here:

1. Go to Firebase Console → Project Settings (⚙️ gear icon)
2. Scroll down to "Your apps" section
3. Find your web app
4. Copy all the config values:

```
✅ apiKey: "AIzaSy..."
✅ authDomain: "your-project.firebaseapp.com"
✅ databaseURL: "https://your-project.firebaseio.com"
✅ projectId: "your-project"
✅ storageBucket: "your-project.appspot.com"
✅ messagingSenderId: "123456789012"
✅ appId: "1:123456789012:web:..."
```

**Save these somewhere safe!** You'll need them in the next part.

---

## Part 2: Vercel Deployment

### Step 1: Push Code to GitHub

1. **Make sure your code is on GitHub**
   ```bash
   # If not already pushed
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Verify on GitHub**
   - Go to https://github.com/Itswxyz67/Animanuschat-
   - Make sure all files are there

### Step 2: Sign Up for Vercel

1. **Go to Vercel**
   - Open: https://vercel.com/signup
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub

2. **Install Vercel GitHub App**
   - Select your account
   - Choose "All repositories" or select specific repo
   - Click "Install"

### Step 3: Import Your Project

1. **Import Repository**
   - On Vercel dashboard, click "Add New..." → "Project"
   - Find `Animanuschat-` repository
   - Click "Import"

2. **Configure Project**
   - Project Name: `ghostlink` (or keep default)
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)

### Step 4: Add Environment Variables

This is the **MOST IMPORTANT** step! Click "Environment Variables" section and add each one:

#### Variable 1: VITE_FIREBASE_API_KEY
```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
```
(Replace with YOUR apiKey from Firebase)

#### Variable 2: VITE_FIREBASE_AUTH_DOMAIN
```
Name:  VITE_FIREBASE_AUTH_DOMAIN
Value: ghostlink-chat.firebaseapp.com
```
(Replace with YOUR authDomain)

#### Variable 3: VITE_FIREBASE_DATABASE_URL
```
Name:  VITE_FIREBASE_DATABASE_URL
Value: https://ghostlink-chat-default-rtdb.firebaseio.com
```
(Replace with YOUR databaseURL)

#### Variable 4: VITE_FIREBASE_PROJECT_ID
```
Name:  VITE_FIREBASE_PROJECT_ID
Value: ghostlink-chat
```
(Replace with YOUR projectId)

#### Variable 5: VITE_FIREBASE_STORAGE_BUCKET
```
Name:  VITE_FIREBASE_STORAGE_BUCKET
Value: ghostlink-chat.appspot.com
```
(Replace with YOUR storageBucket)

#### Variable 6: VITE_FIREBASE_MESSAGING_SENDER_ID
```
Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789012
```
(Replace with YOUR messagingSenderId)

#### Variable 7: VITE_FIREBASE_APP_ID
```
Name:  VITE_FIREBASE_APP_ID
Value: 1:123456789012:web:abc123def456ghi789jkl
```
(Replace with YOUR appId)

#### Variable 8: VITE_FREEIMAGE_API_KEY (Optional)
```
Name:  VITE_FREEIMAGE_API_KEY
Value: 6d207e02198a847aa98d0a2a901485a5
```
(This is the default key, or get your own from https://freeimage.host/page/api)

### Step 5: Deploy!

1. **Click "Deploy"**
   - Vercel will start building your app
   - This takes 1-2 minutes
   - Watch the build logs (optional)

2. **Wait for Success**
   - You'll see "Congratulations!" when done
   - Your app is now live! 🎉

3. **Get Your URL**
   - You'll get a URL like: `https://ghostlink-abc123.vercel.app`
   - Click "Visit" to open your app

---

## Part 3: Testing Your Deployment

### Test 1: App Loads
1. Open your Vercel URL
2. You should see the GhostLink landing page
3. No errors in browser console (F12 → Console)

### Test 2: Firebase Connection
1. Fill out the landing page (gender, preferences)
2. Click "Start Chatting"
3. Should show "Searching for someone..."

### Test 3: Two-User Test
1. Open your app in 2 different browsers (or incognito mode)
2. Both users click "Start Chatting"
3. They should match and be able to chat
4. Test sending messages
5. Test image upload
6. Test skip button

### Test 4: Check Firebase Database
1. Go to Firebase Console → Realtime Database
2. You should see data appear:
   - `/waitingList` - When searching
   - `/rooms` - When chatting
   - `/rooms/{roomId}/messages` - When messaging

---

## 🔧 Troubleshooting

### Problem: "Initializing Firebase" Forever

**Cause:** Environment variables not set correctly

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all 7 Firebase variables are there
3. Check for typos (especially the databaseURL)
4. Redeploy: Deployments tab → ⋯ menu → Redeploy

### Problem: "Permission Denied" in Firebase

**Cause:** Database rules too restrictive

**Solution:**
1. Firebase Console → Realtime Database → Rules
2. Make sure rules match the ones in Step 4 above
3. Click "Publish"
4. Wait 30 seconds and try again

### Problem: Image Upload Fails

**Cause:** FreeImage.host API issue

**Solutions:**
1. Try a smaller image (under 2MB)
2. Check if FreeImage.host is down
3. Get your own API key from https://freeimage.host/page/api

### Problem: Build Fails on Vercel

**Cause:** Missing dependencies or build errors

**Solution:**
1. Check build logs in Vercel
2. Make sure `package.json` is correct
3. Try building locally first: `npm run build`
4. If local build works, redeploy to Vercel

### Problem: Matches Not Happening

**Cause:** Need 2+ users online simultaneously

**Solution:**
1. Open 2 browser windows
2. Use incognito mode for second window
3. Both users click "Start Chatting" within a few seconds
4. Should match automatically

---

## 📊 Environment Variables Quick Reference

Copy this and fill in your values:

```env
# Firebase Configuration (Get from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...YOUR_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123...

# Image Upload API (Optional - default provided)
VITE_FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
```

---

## 🎯 Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Firebase connection works
- [ ] Two users can match and chat
- [ ] Messages send in real-time
- [ ] Images upload successfully
- [ ] Skip button works
- [ ] Theme toggle works
- [ ] NSFW warning appears
- [ ] Mobile responsive
- [ ] Custom domain added (optional)

---

## 🌐 Adding a Custom Domain (Optional)

### Step 1: Buy a Domain
- Buy from Namecheap, GoDaddy, or Google Domains
- Example: `ghostlink.chat`

### Step 2: Add to Vercel
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain: `ghostlink.chat`
3. Vercel will show DNS records to add

### Step 3: Configure DNS
1. Go to your domain registrar's DNS settings
2. Add the records Vercel provides:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Step 4: Wait for Propagation
- DNS changes take 10 minutes to 48 hours
- Vercel will automatically issue SSL certificate
- Your app will be live at your custom domain!

---

## 💰 Cost Breakdown

### Free Tier Includes:
- **Vercel**: Unlimited bandwidth, 100GB/month
- **Firebase Realtime Database**: 1GB storage, 10GB/month download
- **Firebase Hosting**: 10GB storage, 360MB/day (if used)
- **FreeImage.host**: Free API with rate limits

### Expected Capacity:
- ~10,000 daily active users on free tier
- ~100,000 messages per day
- ~1,000 image uploads per day

### If You Exceed Free Tier:
- **Vercel Pro**: $20/month (100GB/month, team features)
- **Firebase Blaze (Pay as you go)**:
  - Database: $5/GB stored, $1/GB downloaded
  - Typical: $10-50/month for 100k DAU

---

## 🔒 Security Best Practices

After deployment:

1. **Monitor Firebase Usage**
   - Check Firebase Console daily
   - Set up billing alerts
   - Watch for unusual activity

2. **Update Dependencies**
   ```bash
   npm update
   git push
   ```
   Vercel auto-deploys on push

3. **Review Database Rules**
   - Test read/write permissions
   - Ensure only authorized access

4. **Enable Firebase App Check** (Advanced)
   - Prevents API abuse
   - Free on Firebase Blaze plan

---

## 📞 Need Help?

### Resources:
- Firebase Docs: https://firebase.google.com/docs
- Vercel Docs: https://vercel.com/docs
- GitHub Issues: https://github.com/Itswxyz67/Animanuschat-/issues

### Common Issues:
- Check browser console (F12 → Console)
- Check Vercel build logs
- Check Firebase Database rules
- Verify environment variables

---

## ✅ Success!

If you can:
- ✅ Open your Vercel URL
- ✅ See the landing page
- ✅ Match with another user
- ✅ Send and receive messages

**Congratulations! GhostLink is live! 🎉👻**

Share your URL and start connecting people anonymously!

---

## 📝 Quick Command Reference

```bash
# Local development
npm install
npm run dev

# Build locally
npm run build

# Deploy to Vercel (if using CLI)
vercel --prod

# Update and redeploy
git add .
git commit -m "Update"
git push origin main
# Vercel auto-deploys on push!
```

---

**Last Updated:** 2025-11-05  
**Author:** GhostLink Team  
**Version:** 1.0.0
