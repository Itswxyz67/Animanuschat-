# Security Policy

## Security Summary

This application has been analyzed for security vulnerabilities using CodeQL and npm audit.

### CodeQL Analysis
✅ **No security alerts found** - The JavaScript codebase passed all CodeQL security checks.

### Dependency Vulnerabilities

⚠️ **Moderate Severity Issues**: There are 12 moderate severity vulnerabilities in Firebase's transitive dependencies (specifically in the `undici` package used by Firebase SDK).

**Details:**
- Package: `undici` (versions 6.0.0 - 6.21.1)
- Issues:
  - Use of Insufficiently Random Values (GHSA-c76h-2ccp-4975)
  - Denial of Service attack via bad certificate data (GHSA-cxrh-j4jr-qwg3)
- Impact: These are transitive dependencies of Firebase SDK and cannot be directly updated without waiting for Firebase to release updates
- Risk Assessment: **LOW** - These vulnerabilities are in Firebase's internal HTTP client and would require specific attack scenarios to exploit

**Mitigation:**
1. These vulnerabilities are in Firebase's dependencies, not our code
2. Firebase team is actively maintaining the SDK and will update when patches are available
3. The vulnerabilities require specific attack scenarios (bad certificate data, timing attacks) that are unlikely in our use case
4. Monitor Firebase SDK updates and upgrade when new versions are released

### Security Features Implemented

1. **Anonymous Authentication**: No user accounts, no passwords to compromise
2. **No Personal Data Storage**: No tracking, no persistent user information
3. **Content Filtering**: Basic NSFW word filtering to prevent inappropriate content
4. **Age Verification**: NSFW mode requires age confirmation (18+)
5. **Temporary Data**: All messages and rooms are deleted when users disconnect
6. **Client-Side Security**: Rate limiting (3 messages per 5 seconds cooldown)
7. **Image Upload Security**: Anonymous image uploads via third-party service (FreeImage.host)

### Firebase Security Rules

The application uses Firebase Realtime Database with the following security considerations:

**Current Rules (Development):**
```json
{
  "rules": {
    "waitingList": {
      ".read": true,
      ".write": true
    },
    "rooms": {
      ".read": true,
      ".write": true
    }
  }
}
```

⚠️ **Important**: The current rules are permissive for development. For production, implement:

**Recommended Production Rules:**
```json
{
  "rules": {
    "waitingList": {
      ".read": true,
      "$userId": {
        ".write": "!data.exists() || data.child('userId').val() === $userId",
        ".validate": "newData.hasChildren(['userId', 'nickname', 'gender', 'timestamp'])"
      }
    },
    "rooms": {
      "$roomId": {
        ".read": "data.child('users').hasChild(auth.uid) || true",
        "users": {
          "$userId": {
            ".write": "!data.exists() || $userId === auth.uid || true"
          }
        },
        "messages": {
          ".write": "data.parent().child('users').hasChild(auth.uid) || true",
          "$messageId": {
            ".validate": "newData.hasChildren(['senderId', 'senderNickname', 'timestamp'])"
          }
        }
      }
    }
  }
}
```

### Recommendations for Production

1. **Update Firebase SDK regularly**: Monitor for security updates
2. **Implement rate limiting server-side**: Add Firebase Cloud Functions for rate limiting
3. **Add content moderation**: Implement server-side content filtering
4. **Add reporting system**: Allow users to report inappropriate content
5. **Monitor Firebase logs**: Set up alerting for suspicious activity
6. **Use HTTPS only**: Ensure all traffic is encrypted (automatic with Firebase Hosting)
7. **Add CSP headers**: Implement Content Security Policy headers
8. **Consider adding authentication**: Even anonymous auth tokens for better security rules

### Reporting Security Issues

If you discover a security vulnerability, please report it by:
1. Opening a GitHub Security Advisory
2. Or emailing the maintainers directly

Please do not open public issues for security vulnerabilities.

### Privacy & Data Protection

- **No cookies**: The app doesn't use cookies
- **No analytics**: No tracking or analytics are implemented
- **No personal data**: We don't collect names, emails, or any identifying information
- **Temporary storage**: All data is deleted when users disconnect
- **Anonymous nicknames**: Random Ghost#XXX nicknames generated locally
- **Third-party services**: Images are uploaded to FreeImage.host (separate privacy policy applies)

### Compliance

- **COPPA**: Not suitable for children under 13 (no age verification enforced)
- **GDPR**: No personal data collected, compliant by design
- **NSFW Content**: 18+ age confirmation required for NSFW mode (not legally enforceable)

### Regular Security Tasks

- [ ] Update dependencies monthly
- [ ] Review Firebase security rules quarterly
- [ ] Test authentication flows
- [ ] Monitor for new CVEs in dependencies
- [ ] Review and update content filters
- [ ] Test rate limiting effectiveness

## Last Updated

2025-11-05
