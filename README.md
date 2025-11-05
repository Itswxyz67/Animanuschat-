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

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Itswxyz67/Animanuschat-.git
   cd Animanuschat-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Realtime Database
   - Copy your Firebase configuration

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Fill in your Firebase credentials in `.env`

5. **Set up Firebase Database Rules**
   - In Firebase Console, go to Realtime Database → Rules
   - Copy the rules from `firebase.rules.json`
   - Or use these temporary rules for development:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   ⚠️ **Warning**: The above rules are insecure. Use proper rules for production!

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy.

## 🌐 Deployment

### Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Netlify
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel
```bash
npm install -g vercel
vercel
```

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