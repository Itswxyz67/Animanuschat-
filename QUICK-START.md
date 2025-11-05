# ⚡ Quick Start - Deploy in 10 Minutes

The fastest way to get GhostLink running on Vercel with Firebase.

## 🎯 What You'll Get

After following this guide:
- ✅ Live chat app at `yourname.vercel.app`
- ✅ Real-time messaging
- ✅ Anonymous matching
- ✅ Free hosting

## 📝 Step-by-Step Checklist

### Part 1: Firebase Setup (5 minutes)

#### ☐ Step 1: Create Firebase Project
1. Go to: https://console.firebase.google.com/
2. Click "**Add project**"
3. Name it: `ghostlink` (or anything you like)
4. Disable Google Analytics
5. Click "**Create project**"
6. Wait 30 seconds → Click "**Continue**"

#### ☐ Step 2: Register Web App
1. Click the `</>` (web) icon in the center
2. App nickname: `GhostLink`
3. Click "**Register app**"
4. **IMPORTANT:** Copy this config and save it:

```javascript
const firebaseConfig = {
  apiKey: "COPY_THIS_VALUE",
  authDomain: "COPY_THIS_VALUE",
  databaseURL: "COPY_THIS_VALUE",
  projectId: "COPY_THIS_VALUE",
  storageBucket: "COPY_THIS_VALUE",
  messagingSenderId: "COPY_THIS_VALUE",
  appId: "COPY_THIS_VALUE"
};
```

5. Click "**Continue to console**"

#### ☐ Step 3: Enable Realtime Database
1. Left sidebar → "**Build**" → "**Realtime Database**"
2. Click "**Create Database**"
3. Choose location (closest to you):
   - US: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-southeast1`
4. Click "**Next**"
5. Select "**Start in test mode**"
6. Click "**Enable**"
7. Wait 30 seconds for database creation

#### ☐ Step 4: Set Database Rules
1. Click "**Rules**" tab (in Realtime Database page)
2. **Delete everything** and paste this:

```json
{
  "rules": {
    "waitingList": {
      ".read": true,
      "$userId": {
        ".write": true
      }
    },
    "rooms": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click "**Publish**"
4. ✅ Firebase setup complete!

---

### Part 2: Vercel Deployment (5 minutes)

#### ☐ Step 5: Sign Up for Vercel
1. Go to: https://vercel.com/signup
2. Click "**Continue with GitHub**"
3. Login to GitHub
4. Click "**Authorize Vercel**"

#### ☐ Step 6: Import Project
1. On Vercel, click "**Add New...**" → "**Project**"
2. Find your repo: `Animanuschat-`
3. Click "**Import**"

#### ☐ Step 7: Configure Build Settings
- Framework: **Vite** (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`

Leave these as default ✅

#### ☐ Step 8: Add Environment Variables

Click "**Environment Variables**" and add these **ONE BY ONE**:

**Variable 1:**
```
Name:  VITE_FIREBASE_API_KEY
Value: [Paste your apiKey from Step 2]
```
Click "Add"

**Variable 2:**
```
Name:  VITE_FIREBASE_AUTH_DOMAIN
Value: [Paste your authDomain from Step 2]
```
Click "Add"

**Variable 3:**
```
Name:  VITE_FIREBASE_DATABASE_URL
Value: [Paste your databaseURL from Step 2]
```
Click "Add"

**Variable 4:**
```
Name:  VITE_FIREBASE_PROJECT_ID
Value: [Paste your projectId from Step 2]
```
Click "Add"

**Variable 5:**
```
Name:  VITE_FIREBASE_STORAGE_BUCKET
Value: [Paste your storageBucket from Step 2]
```
Click "Add"

**Variable 6:**
```
Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
Value: [Paste your messagingSenderId from Step 2]
```
Click "Add"

**Variable 7:**
```
Name:  VITE_FIREBASE_APP_ID
Value: [Paste your appId from Step 2]
```
Click "Add"

**Variable 8 (Optional):**
```
Name:  VITE_FREEIMAGE_API_KEY
Value: 6d207e02198a847aa98d0a2a901485a5
```
Click "Add"

#### ☐ Step 9: Deploy
1. Click "**Deploy**"
2. Wait 1-2 minutes (watch the logs if you want)
3. Look for "**Congratulations!**" message
4. Click "**Visit**" to see your app!

✅ **Done! Your app is live!** 🎉

---

## 🧪 Testing Your App

### Test 1: Open App
1. Go to your Vercel URL (e.g., `yourname.vercel.app`)
2. Should see GhostLink landing page
3. Press F12 → Console → No errors

### Test 2: Two Users
1. Open your URL in Chrome
2. Open same URL in Incognito mode (Ctrl+Shift+N)
3. Both: Select gender → Click "Start Chatting"
4. Should match and chat!

### Test 3: Send Messages
1. Type message → Send
2. Should appear immediately on other side
3. Try sending an image
4. Try skip button

---

## 🆘 Something Wrong?

### App shows "Initializing Firebase" forever

**Fix:**
1. Vercel → Your Project → Settings → Environment Variables
2. Check all 7 variables are there (VITE_FIREBASE_...)
3. Check for typos
4. Redeploy: Deployments → ⋯ → Redeploy

### "Permission Denied" error

**Fix:**
1. Firebase Console → Realtime Database → Rules
2. Make sure rules from Step 4 are published
3. Wait 30 seconds and try again

### Can't match with anyone

**Normal:** You need 2 users online at same time
**Solution:** Open 2 browser windows to test

### Image upload fails

**Normal:** Free API has rate limits
**Solution:** Try smaller image (under 2MB)

---

## 📋 Environment Variables Copy-Paste Template

Copy this template and fill with YOUR values from Firebase:

```
VITE_FIREBASE_API_KEY=AIzaSy________________YOUR_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
```

---

## 🎓 Where to Get Each Value

All values come from Firebase Console → Project Settings (⚙️) → Your apps → SDK setup

| Variable | Where to Find |
|----------|---------------|
| `apiKey` | Firebase Config object |
| `authDomain` | Firebase Config object |
| `databaseURL` | Firebase Config object OR Realtime Database page URL |
| `projectId` | Firebase Config object OR Project Settings |
| `storageBucket` | Firebase Config object |
| `messagingSenderId` | Firebase Config object |
| `appId` | Firebase Config object |
| `FREEIMAGE_API_KEY` | Optional - use default `6d207e02198a847aa98d0a2a901485a5` |

---

## 💡 Pro Tips

1. **Bookmark your URLs:**
   - Firebase Console: `console.firebase.google.com/project/YOUR_PROJECT`
   - Vercel Dashboard: `vercel.com/dashboard`
   - Your Live App: `yourname.vercel.app`

2. **Auto-deploy on push:**
   - Any `git push` to GitHub automatically deploys to Vercel
   - No need to manually redeploy

3. **Free forever:**
   - Both Firebase and Vercel have generous free tiers
   - Good for ~10,000 daily users
   - Monitor usage in dashboards

4. **Custom domain:**
   - Vercel Settings → Domains → Add your domain
   - Free SSL certificate included

---

## 🚀 Next Steps

After deployment:

1. **Share your URL** with friends to test
2. **Monitor Firebase** usage in console
3. **Check Vercel** analytics
4. **Customize** the app (edit code → git push)
5. **Add custom domain** (optional)

---

## 📞 Need Help?

- Check `VERCEL-SETUP.md` for detailed guide
- Check `TROUBLESHOOTING.md` for common issues
- Open GitHub issue for bugs
- Firebase docs: firebase.google.com/docs
- Vercel docs: vercel.com/docs

---

## ✅ Success Checklist

- [x] Firebase project created
- [x] Realtime Database enabled
- [x] Database rules published
- [x] Firebase config copied
- [x] Vercel account created
- [x] Project imported to Vercel
- [x] 8 environment variables added
- [x] App deployed successfully
- [x] App loads in browser
- [x] Two users can match
- [x] Messages work in real-time
- [x] Images upload successfully

**All checked? You're live! 🎉👻**

---

## 🎯 Your Live App

```
Your URL: https://__________.vercel.app

Firebase Project: https://console.firebase.google.com/project/___________

Vercel Dashboard: https://vercel.com/___________/___________
```

Fill these in and bookmark them!

---

**Time to Complete:** 10 minutes  
**Difficulty:** Easy  
**Cost:** $0 (Free tier)  
**Support:** 24/7 via docs + community

**Happy chatting! 👻**
