# Contributing to GhostLink

Thank you for your interest in contributing to GhostLink! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Focus on constructive feedback
- Help create a welcoming environment

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of React, Firebase, and TailwindCSS

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Animanuschat-.git
   cd Animanuschat-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
Animanuschat-/
├── public/              # Static assets
│   └── ghost-icon.svg   # App icon
├── src/
│   ├── components/      # React components
│   │   ├── LandingPage.jsx    # Initial screen
│   │   ├── ChatRoom.jsx       # Main chat interface
│   │   ├── MessageList.jsx    # Message display
│   │   └── MessageInput.jsx   # Input and controls
│   ├── services/        # External services
│   │   ├── firebase.js        # Firebase config
│   │   └── imageUpload.js     # Image upload service
│   ├── utils/           # Utility functions
│   │   ├── nickname.js        # Nickname generation
│   │   └── filters.js         # Content filtering
│   ├── hooks/           # Custom React hooks (empty for now)
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── .env.example         # Environment template
├── firebase.rules.json  # Database security rules
└── package.json         # Dependencies
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep components small and focused

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Build the project
npm run build

# Test manually in browser
npm run dev
```

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve bug description"
# or
git commit -m "docs: update documentation"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:
- Clear description of changes
- Screenshots (if UI changes)
- Testing steps
- Related issue number (if applicable)

## Code Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Use arrow functions for inline callbacks
- Destructure props and state
- Keep components under 300 lines
- Extract reusable logic to custom hooks

**Good:**
```jsx
const MessageBubble = ({ message, isSent }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
      {message.text}
      <span>{formatTime(message.timestamp)}</span>
    </div>
  );
};
```

**Bad:**
```jsx
function MessageBubble(props) {
  return (
    <div className={props.isSent ? 'message sent' : 'message received'}>
      {props.message.text}
    </div>
  );
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use semantic class names
- Keep responsive design in mind

### Firebase

- Use async/await instead of promises
- Handle errors gracefully
- Clean up listeners on unmount
- Use transactions for concurrent writes

## Areas for Contribution

### High Priority

- [ ] Improve matchmaking algorithm
- [ ] Add end-to-end encryption
- [ ] Implement report/block functionality
- [ ] Better content moderation
- [ ] Add comprehensive tests

### Medium Priority

- [ ] Voice messages
- [ ] Video chat support
- [ ] Multiple language support (i18n)
- [ ] Better emoji picker
- [ ] Giphy integration
- [ ] Location-based matching

### Low Priority

- [ ] Custom themes
- [ ] Profile customization
- [ ] Chat history export
- [ ] Group chat rooms
- [ ] Admin dashboard

### Bug Fixes

Check [Issues](https://github.com/Itswxyz67/Animanuschat-/issues) for known bugs.

## Testing Guidelines

Currently, the project doesn't have automated tests. Contributions to add testing are welcome!

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] App loads without errors
- [ ] Can select gender and preferences
- [ ] Matchmaking works with 2 browser tabs
- [ ] Messages send and receive
- [ ] Images upload successfully
- [ ] Skip button works
- [ ] Leave chat works
- [ ] Theme toggle works
- [ ] NSFW mode warning shows
- [ ] Typing indicator appears
- [ ] Connection status updates
- [ ] Mobile responsive (test on phone or DevTools)

### Future Testing

We'd love to add:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright
- Firebase emulator tests

## Documentation

When adding features:

1. Update README.md if needed
2. Add JSDoc comments to functions
3. Update DEPLOYMENT.md for config changes
4. Create examples for complex features

Example JSDoc:
```javascript
/**
 * Uploads an image to FreeImage.host
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file) => {
  // implementation
};
```

## Security

- Never commit secrets or API keys
- Don't include sensitive data in logs
- Sanitize user input
- Follow OWASP guidelines
- Report security issues privately

## Performance

- Optimize images before uploading
- Minimize bundle size
- Use code splitting for large features
- Avoid unnecessary re-renders
- Profile performance with React DevTools

## Questions?

- Open a GitHub Discussion
- Comment on related issues
- Ask in Pull Request comments

## Recognition

All contributors will be acknowledged in:
- GitHub contributors page
- Project README
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GhostLink! 👻
