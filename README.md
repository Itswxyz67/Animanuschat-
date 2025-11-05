# 👻 GhostLink - Anonymous Chat App

A free, anonymous 1-on-1 random chat application with no login required. Connect with strangers based on shared interests, gender preferences, and more!

## ✨ Features

- 🚀 **No Account Required** - Start chatting instantly
- 🎭 **Completely Anonymous** - Random nicknames (Ghost#XXX)
- 🔍 **Smart Matching** - Match by gender preference and interest tags
- 💬 **Real-time Chat** - Instant messaging with typing indicators
- 📸 **Image Sharing** - Send images anonymously via FreeImage.host
- ⏭️ **Skip Feature** - Find a new chat partner anytime
- 🌓 **Dark/Light Theme** - Toggle between themes
- 🔞 **NSFW Mode** - Optional 18+ mode with age verification
- 📱 **Mobile Friendly** - Responsive design for all devices
- 🔒 **Privacy First** - No tracking, no data collection, messages auto-delete

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Backend**: Firebase Realtime Database
- **Image Upload**: FreeImage.host API
- **Animations**: Framer Motion
- **Other**: Emoji Picker, Axios, UUID

## 📦 Quick Setup & Deployment

### 🚀 Deploy to Vercel (Recommended - 10 minutes)

**Want to get your app live immediately?**

👉 **Follow this guide:** [QUICK-START.md](QUICK-START.md)

Or for detailed instructions: [VERCEL-SETUP.md](VERCEL-SETUP.md)

**Need help finding Firebase values?** 
👉 See: [WHERE-TO-FIND-VALUES.md](WHERE-TO-FIND-VALUES.md)

### 🏠 Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Itswxyz67/Animanuschat-.git
   cd Animanuschat-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (get your config values)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database
   - Copy your Firebase configuration
   - 📖 **Detailed guide:** [WHERE-TO-FIND-VALUES.md](WHERE-TO-FIND-VALUES.md)

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
   ```

5. **Set up Firebase Database Rules**
   - **Option A (CLI)**: Run `firebase deploy --only database`
   - **Option B (Console)**: Copy rules from `firebase.rules.json` and paste in Firebase Console
   - 📖 **Detailed guide with troubleshooting:** [FIREBASE-RULES-GUIDE.md](FIREBASE-RULES-GUIDE.md)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Open a second incognito window to test matchmaking

## 🚀 Deployment to Production

### Vercel (Easiest - Recommended)
**Step-by-step guide:** [VERCEL-SETUP.md](VERCEL-SETUP.md)

Quick version:
1. Push code to GitHub
2. Import to Vercel
3. Add 8 environment variables
4. Deploy!

**10 minute guide:** [QUICK-START.md](QUICK-START.md)

### Other Hosting Options

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Firebase Hosting
- Netlify
- Custom VPS/Server

## 📚 Documentation

- 📖 **[Quick Start Guide](QUICK-START.md)** - Deploy in 10 minutes
- 🚀 **[Vercel Setup](VERCEL-SETUP.md)** - Detailed Vercel deployment
- 🔍 **[Where to Find Values](WHERE-TO-FIND-VALUES.md)** - Firebase config help
- 📦 **[Full Deployment Guide](DEPLOYMENT.md)** - All hosting options
- 🔥 **[Firebase Rules Guide](FIREBASE-RULES-GUIDE.md)** - Database security rules setup
- 🔒 **[Security Policy](SECURITY.md)** - Security info & vulnerabilities
- 🎯 **[Features Overview](FEATURES.md)** - Complete feature list
- 🤝 **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

## ⚙️ Environment Variables

Create a `.env` file with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# FreeImage.host API (default provided)
VITE_FREEIMAGE_API_KEY=6d207e02198a847aa98d0a2a901485a5
```

## 🎮 How to Use

1. **Select Your Profile**
   - Choose your gender
   - Choose who you want to chat with
   - Add interest tags (optional)
   - Toggle NSFW mode if desired (18+ only)

2. **Start Chatting**
   - Click "Start Chatting"
   - Wait for matchmaking to find a partner
   - Chat freely!

3. **Features During Chat**
   - Send text messages or images
   - See when your partner is typing
   - Use emojis
   - Skip to next person anytime
   - Leave chat when done

## 🔒 Privacy & Security

- **No Login Required** - No accounts, no passwords
- **No Personal Data Collected** - We don't store any user information
- **Temporary Messages** - All messages are deleted when users disconnect
- **Anonymous** - Random nicknames generated each session
- **No Tracking** - No cookies, no analytics
- **Secure** - Images uploaded to third-party service (FreeImage.host)

## 🔞 NSFW Mode

When enabled:
- Age verification warning (18+ confirmation)
- Only matches with other NSFW users
- More permissive content filters
- Users must explicitly opt-in

## 📝 Firebase Database Structure

```
/waitingList
  /{userId}
    - nickname
    - gender
    - genderPreference
    - tags[]
    - nsfwEnabled
    - timestamp

/rooms
  /{roomId}
    /users
      /{userId}
        - nickname
        - connected
        - joinedAt
    /messages
      /{messageId}
        - senderId
        - senderNickname
        - text or imageUrl
        - timestamp
        - type
    /typing
      /{userId}: boolean
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## ⚠️ Disclaimer

This app is for entertainment purposes. Users are responsible for their own conduct. We do not moderate content and are not liable for user interactions.

## 🐛 Known Issues

- Image upload may fail if FreeImage.host API is down
- Matchmaking may be slow if few users are online
- Messages are not encrypted end-to-end

## 💡 Future Enhancements

- [ ] Video chat support
- [ ] Voice messages
- [ ] Better content moderation
- [ ] Report/block functionality
- [ ] Language filters
- [ ] Location-based matching
- [ ] Group chat rooms

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Made with 👻 by the GhostLink team