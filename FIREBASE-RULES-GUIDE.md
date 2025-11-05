# Firebase Realtime Database Rules Guide

This guide explains how to properly set up and deploy Firebase Realtime Database security rules for GhostLink.

## Understanding the Rules Files

The repository contains the following Firebase rules-related files:

- **`firebase.rules.json`** - Security rules in JSON format (for manual copy-paste to Firebase Console)
- **`database.rules.json`** - Security rules in JSON format (for Firebase CLI deployment)
- **`firebase.json`** - Firebase project configuration that references `database.rules.json`

## Database Structure

The security rules validate the following database structure:

```
/waitingList
  /{userId}
    - userId: string (required)
    - nickname: string (required, non-empty)
    - gender: string (required, must be: 'male', 'female', or 'other')
    - genderPreference: string (required, must be: 'male', 'female', or 'any')
    - tags: array (optional)
    - nsfwEnabled: boolean (optional)
    - timestamp: number (required)

/rooms
  /{roomId}
    - createdAt: number (required)
    - nsfwEnabled: boolean (optional)
    /users
      /{userId}
        - nickname: string (required)
        - connected: boolean (required)
        - joinedAt: number (required)
    /messages
      /{messageId}
        - senderId: string (required)
        - senderNickname: string (required)
        - text: string (required if imageUrl not present)
        - imageUrl: string (required if text not present)
        - timestamp: number (required)
        - type: string (required, must be: 'text' or 'image')
    /typing
      /{userId}: boolean
```

## Method 1: Deploy Using Firebase CLI (Recommended)

This is the recommended method as it's automated and less error-prone.

### Prerequisites
```bash
npm install -g firebase-tools
```

### Steps

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Initialize Firebase (if not already done)**
   ```bash
   firebase init
   ```
   - Select "Realtime Database" and "Hosting"
   - Choose your Firebase project
   - Accept the default `database.rules.json` file
   - Set public directory to `dist`
   - Configure as single-page app: Yes

3. **Deploy the rules**
   ```bash
   firebase deploy --only database
   ```

4. **Verify deployment**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to your project
   - Go to Realtime Database → Rules
   - Verify the rules match the content of `database.rules.json`

## Method 2: Manual Deployment via Firebase Console

If you prefer to manually copy and paste the rules:

1. **Go to Firebase Console**
   - Navigate to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Realtime Database → Rules tab

2. **Copy the rules**
   - Open `firebase.rules.json` in a text editor
   - Copy the entire content

3. **Paste and publish**
   - Paste the content into the Firebase Console rules editor
   - Click "Publish"

⚠️ **Important**: Make sure to copy the ENTIRE JSON object including the outer `{ "rules": { ... } }` wrapper.

## Common Errors and Solutions

### Error: "Expected '/' or '*'"

**Cause**: You tried to paste a text representation of the database structure instead of the actual rules JSON.

**Solution**: Make sure you're copying from `firebase.rules.json` or `database.rules.json`, NOT from the documentation or README that shows the database structure.

### Error: "Unexpected token"

**Cause**: Invalid JSON format, possibly due to missing commas or brackets.

**Solution**: 
1. Validate the JSON file: `python3 -m json.tool firebase.rules.json`
2. Use the Firebase CLI method instead of manual copy-paste

### Error: "Rules must be an object"

**Cause**: The rules are not wrapped in a proper JSON object.

**Solution**: Ensure the file starts with `{"rules": {` and ends with `}}`

## Testing the Rules

After deploying, test that the rules work correctly:

1. **Test waiting list write**
   ```javascript
   // This should succeed
   await set(ref(db, 'waitingList/test-user-id'), {
     userId: 'test-user-id',
     nickname: 'Ghost#123',
     gender: 'male',
     genderPreference: 'any',
     tags: ['gaming'],
     nsfwEnabled: false,
     timestamp: Date.now()
   });
   ```

2. **Test room creation**
   ```javascript
   // This should succeed
   await set(ref(db, 'rooms/test-room-id'), {
     users: {
       'user1': {
         nickname: 'Ghost#123',
         connected: true,
         joinedAt: Date.now()
       }
     },
     createdAt: Date.now(),
     nsfwEnabled: false
   });
   ```

3. **Test message write**
   ```javascript
   // This should succeed
   await set(ref(db, 'rooms/test-room-id/messages/msg1'), {
     senderId: 'user1',
     senderNickname: 'Ghost#123',
     text: 'Hello!',
     timestamp: Date.now(),
     type: 'text'
   });
   ```

## Security Considerations

The current rules provide basic validation but allow public read/write access. For production use, consider:

1. **Authentication**: Require user authentication before allowing writes
2. **Rate Limiting**: Use Firebase Cloud Functions to prevent abuse
3. **Data Validation**: The rules validate data types and required fields
4. **User-specific Access**: Consider restricting users to only modify their own data

### Example: More Restrictive Rules

For a more secure setup, you could modify the rules to:

```json
{
  "rules": {
    "waitingList": {
      ".read": true,
      "$userId": {
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "rooms": {
      ".read": "auth != null",
      "$roomId": {
        "users": {
          "$userId": {
            ".write": "auth != null && auth.uid == $userId"
          }
        },
        "messages": {
          ".write": "auth != null && data.child('users').hasChild(auth.uid)"
        }
      }
    }
  }
}
```

However, this would require implementing Firebase Authentication in the app, which changes the anonymous nature of GhostLink.

## Troubleshooting

If you encounter issues:

1. **Check the Firebase Console logs** for detailed error messages
2. **Validate JSON** before deploying: `python3 -m json.tool database.rules.json`
3. **Use Firebase CLI** for automated deployment to avoid manual errors
4. **Check permissions** ensure you have admin access to the Firebase project
5. **Clear cache** in Firebase Console if changes don't appear immediately

## References

- [Firebase Realtime Database Rules Documentation](https://firebase.google.com/docs/database/security)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Rules Simulator](https://firebase.google.com/docs/database/security/test-rules)
