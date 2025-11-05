# 🔍 Where to Find All Firebase Values

Visual guide showing exactly where to click and copy each value.

---

## 🎯 Quick Navigation

All Firebase values come from: **Firebase Console → Project Settings**

**Direct URL:** `https://console.firebase.google.com/project/YOUR_PROJECT/settings/general`

---

## 📍 Step-by-Step: Getting Firebase Config

### Step 1: Open Firebase Console

```
URL: https://console.firebase.google.com/
```

1. Select your project (e.g., "ghostlink")
2. You'll land on the Project Overview page

### Step 2: Go to Project Settings

**Two ways to get there:**

**Option A:** Click the ⚙️ gear icon (top-left, next to "Project Overview")
- Then click "Project settings"

**Option B:** Direct URL
- `https://console.firebase.google.com/project/YOUR_PROJECT_NAME/settings/general`

### Step 3: Scroll Down to "Your apps"

After clicking Project Settings, scroll down until you see:

```
┌─────────────────────────────────────────┐
│         Your apps                       │
│                                         │
│  There are no apps in your project.     │
│                                         │
│  Get started by adding Firebase to      │
│  your app                               │
│                                         │
│   [iOS icon]  [Android]  [</>Web]       │
└─────────────────────────────────────────┘
```

If you haven't created a web app yet, click `</>` (Web icon)

If you already created one, you'll see:

```
┌─────────────────────────────────────────┐
│         Your apps                       │
│                                         │
│  🌐 GhostLink                           │
│     App ID: 1:123456:web:abc123         │
│                                         │
│     [Firebase SDK snippet ▼]            │
│     [Config ▼]                          │
└─────────────────────────────────────────┘
```

### Step 4: View SDK Configuration

Click on "**SDK setup and configuration**" radio button
- OR scroll down to "Firebase SDK snippet"
- Select "**Config**" (not npm)

You'll see:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**This is it!** Copy each value from here.

---

## 📋 Value-by-Value Guide

### 1️⃣ VITE_FIREBASE_API_KEY

**Where:** `apiKey` in config object

```javascript
apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
         ⬆️ Copy this entire string
```

**Copy from:** After `"` to before `"`

**Example:**
```
Value: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**In Vercel:**
```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 2️⃣ VITE_FIREBASE_AUTH_DOMAIN

**Where:** `authDomain` in config object

```javascript
authDomain: "your-project.firebaseapp.com"
             ⬆️ Copy this entire string
```

**Format:** `project-name.firebaseapp.com`

**Example:**
```
Value: ghostlink-chat.firebaseapp.com
```

**In Vercel:**
```
Name:  VITE_FIREBASE_AUTH_DOMAIN
Value: your-project.firebaseapp.com
```

---

### 3️⃣ VITE_FIREBASE_DATABASE_URL

**Where:** `databaseURL` in config object

```javascript
databaseURL: "https://your-project-default-rtdb.firebaseio.com"
              ⬆️ Copy this entire URL
```

**Alternative location:** Realtime Database page
- Go to "Realtime Database" in left sidebar
- URL is shown at the top of the page

**Format:** `https://PROJECT-NAME-default-rtdb.REGION.firebaseio.com`

**Examples:**
```
US:     https://ghostlink-chat-default-rtdb.firebaseio.com
Europe: https://ghostlink-chat-default-rtdb.europe-west1.firebasedatabase.app
Asia:   https://ghostlink-chat-default-rtdb.asia-southeast1.firebasedatabase.app
```

**In Vercel:**
```
Name:  VITE_FIREBASE_DATABASE_URL
Value: https://your-project-default-rtdb.firebaseio.com
```

⚠️ **Most common mistake:** Forgetting `https://` or wrong region

---

### 4️⃣ VITE_FIREBASE_PROJECT_ID

**Where:** `projectId` in config object

```javascript
projectId: "your-project"
            ⬆️ Copy this
```

**Alternative location:** Top of Firebase Console (next to project name)

**Format:** Lowercase, may have hyphens

**Example:**
```
Value: ghostlink-chat
```

**In Vercel:**
```
Name:  VITE_FIREBASE_PROJECT_ID
Value: ghostlink-chat
```

---

### 5️⃣ VITE_FIREBASE_STORAGE_BUCKET

**Where:** `storageBucket` in config object

```javascript
storageBucket: "your-project.appspot.com"
                ⬆️ Copy this
```

**Format:** `project-name.appspot.com`

**Example:**
```
Value: ghostlink-chat.appspot.com
```

**In Vercel:**
```
Name:  VITE_FIREBASE_STORAGE_BUCKET
Value: your-project.appspot.com
```

---

### 6️⃣ VITE_FIREBASE_MESSAGING_SENDER_ID

**Where:** `messagingSenderId` in config object

```javascript
messagingSenderId: "123456789012"
                    ⬆️ Copy this number
```

**Format:** 12-digit number

**Example:**
```
Value: 123456789012
```

**In Vercel:**
```
Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 123456789012
```

⚠️ **Note:** This is a number but enter as text in Vercel

---

### 7️⃣ VITE_FIREBASE_APP_ID

**Where:** `appId` in config object

```javascript
appId: "1:123456789012:web:abcdef123456ghijklmn"
        ⬆️ Copy this entire string
```

**Alternative location:** "Your apps" section shows "App ID"

**Format:** `1:NUMBER:web:RANDOM_STRING`

**Example:**
```
Value: 1:123456789012:web:abcdef123456
```

**In Vercel:**
```
Name:  VITE_FIREBASE_APP_ID
Value: 1:123456789012:web:abcdef123456
```

---

### 8️⃣ VITE_FREEIMAGE_API_KEY (Optional)

**Default Value:** `6d207e02198a847aa98d0a2a901485a5`

**Where to get your own:**
1. Go to: https://freeimage.host/
2. Sign up (free)
3. Go to: https://freeimage.host/page/api
4. Copy your API key

**In Vercel:**
```
Name:  VITE_FREEIMAGE_API_KEY
Value: 6d207e02198a847aa98d0a2a901485a5
```

(Or your own key if you got one)

---

## 🎯 Complete Example

Here's a complete set of values (fake but realistic format):

```
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=ghostlink-chat.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://ghostlink-chat-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=ghostlink-chat
VITE_FIREBASE_STORAGE_BUCKET=ghostlink-chat.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
```

---

## 🔍 How to Verify Values Are Correct

### Test 1: Format Check

```
✅ VITE_FIREBASE_API_KEY
   Should start with: AIzaSy
   Length: ~39 characters
   
✅ VITE_FIREBASE_AUTH_DOMAIN
   Should end with: .firebaseapp.com
   
✅ VITE_FIREBASE_DATABASE_URL
   Should start with: https://
   Should contain: firebaseio.com or firebasedatabase.app
   
✅ VITE_FIREBASE_PROJECT_ID
   Should match: Your project name (lowercase)
   No spaces, may have hyphens
   
✅ VITE_FIREBASE_STORAGE_BUCKET
   Should end with: .appspot.com
   
✅ VITE_FIREBASE_MESSAGING_SENDER_ID
   Should be: 12 digits
   
✅ VITE_FIREBASE_APP_ID
   Should start with: 1:
   Should contain: :web:
```

### Test 2: Values Match Project Name

All these should contain your project name:
- `authDomain`: `YOUR-PROJECT.firebaseapp.com`
- `databaseURL`: `YOUR-PROJECT-default-rtdb...`
- `projectId`: `YOUR-PROJECT`
- `storageBucket`: `YOUR-PROJECT.appspot.com`

Example: If project is "ghostlink-chat", all should have "ghostlink-chat"

---

## ❌ Common Mistakes

### Mistake 1: Wrong Database URL

```
❌ WRONG: https://your-project.firebaseapp.com
✅ RIGHT: https://your-project-default-rtdb.firebaseio.com
```

### Mistake 2: Missing https://

```
❌ WRONG: your-project-default-rtdb.firebaseio.com
✅ RIGHT: https://your-project-default-rtdb.firebaseio.com
```

### Mistake 3: Extra Quotes

```
❌ WRONG: "AIzaSyBxxxxx"
✅ RIGHT: AIzaSyBxxxxx
```

(In Vercel, don't include the quotes)

### Mistake 4: Spaces

```
❌ WRONG: AIzaSyBxxxxx (with space at end)
✅ RIGHT: AIzaSyBxxxxx
```

### Mistake 5: Project ID Mismatch

```
If your project URL is:
https://console.firebase.google.com/project/ghostlink-chat-abc123

Then projectId should be: ghostlink-chat-abc123
```

---

## 🆘 Still Can't Find Values?

### Option 1: Use Firebase CLI

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Get project info
firebase projects:list

# See config
firebase apps:sdkconfig WEB YOUR_APP_ID
```

### Option 2: Check Project Settings URL

Direct link to your Firebase config:
```
https://console.firebase.google.com/project/YOUR_PROJECT_NAME/settings/general
```

Replace `YOUR_PROJECT_NAME` with your actual project name

### Option 3: Create New Web App

If you can't find your existing app:
1. Firebase Console → Project Settings
2. Scroll to "Your apps"
3. Click `</>` (Web icon)
4. Register new app
5. Copy config from there

You can have multiple web apps in one project.

---

## 📸 Screenshots Locations

If this doc had images, here's what you'd see:

```
Screenshot 1: Firebase Console Homepage
- Shows: Project selection
- Arrow pointing to: Your project name

Screenshot 2: Project Settings
- Shows: Gear icon location
- Arrow pointing to: "Project settings" menu item

Screenshot 3: Your Apps Section
- Shows: Web app with config
- Highlights: Each config value

Screenshot 4: Realtime Database
- Shows: Database URL at top
- Arrow pointing to: URL to copy
```

---

## ✅ Quick Verification Checklist

Before adding to Vercel, verify:

- [ ] All 8 variable names start with `VITE_`
- [ ] apiKey starts with `AIzaSy`
- [ ] authDomain ends with `.firebaseapp.com`
- [ ] databaseURL starts with `https://`
- [ ] projectId matches your project name
- [ ] storageBucket ends with `.appspot.com`
- [ ] messagingSenderId is 12 digits
- [ ] appId contains `:web:`
- [ ] No extra spaces or quotes
- [ ] All values from same Firebase project

---

## 🎓 Summary

**Where everything is:**

1. Open: https://console.firebase.google.com/
2. Select: Your project
3. Click: ⚙️ gear icon → Project settings
4. Scroll: Down to "Your apps"
5. Select: Your web app
6. View: SDK configuration → Config
7. Copy: Each value to Vercel

**That's it!** 🎉

All values are in that one config object.

---

**Need more help?** 
- Check `VERCEL-SETUP.md` for full deployment guide
- Check `QUICK-START.md` for fast setup
- Check `TROUBLESHOOTING.md` if something's wrong

**Still stuck?** Open a GitHub issue with:
- What step you're on
- What error you see
- Screenshots (hide sensitive values!)
