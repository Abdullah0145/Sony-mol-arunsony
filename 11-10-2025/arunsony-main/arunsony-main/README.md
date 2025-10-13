# MLM Elite Club App

## Authentication & Logout Functionality

This app includes a complete authentication system with secure logout functionality.

### Features

#### Login
- Email and password authentication
- Remember Me functionality
- Loading states during authentication
- Automatic navigation after successful login

#### Logout
- **Secure Logout**: Click the logout button in the Profile screen
- **Confirmation Dialog**: Users must confirm before logging out
- **Success Message**: Shows confirmation after successful logout
- **Automatic Navigation**: Redirects to login screen after logout
- **Data Cleanup**: Removes all user data and session information

#### Security Features
- **Session Timeout**: Automatically logs out users after 30 minutes of inactivity
- **Data Persistence**: User sessions persist across app restarts
- **Secure Storage**: User data stored securely using AsyncStorage
- **Activity Tracking**: Monitors app state changes to reset session timers

### How to Use

#### To Logout:
1. Navigate to the Profile screen (bottom tab)
2. Scroll down to the "Quick Actions" section
3. Tap the "Logout" button (red text with logout icon)
4. Confirm logout in the dialog
5. You'll see a success message
6. You'll be automatically redirected to the login screen

#### To Login:
1. Enter any non-empty email and password
2. Optionally enable "Remember Me"
3. Tap the Login button
4. You'll be automatically redirected to the main app

### Technical Implementation

- **AuthContext**: Manages authentication state across the app
- **AsyncStorage**: Persists user sessions securely
- **Session Management**: Automatic timeout and activity tracking
- **Navigation**: Automatic routing based on authentication state
- **Error Handling**: Graceful error handling for all auth operations

### File Structure

```
components/
├── AuthContext.tsx          # Main authentication logic
├── LoadingScreen.tsx        # Loading screen component
└── useUserActivity.ts       # User activity tracking hook

screens/
├── LoginScreen.tsx          # Login form
├── ProfileScreen.tsx        # Profile with logout button
├── SplashScreen.tsx         # Initial loading screen
└── WelcomeScreen.tsx        # Welcome screen

app.tsx                      # Main app with auth provider
```

### Dependencies

- `@react-native-async-storage/async-storage` - Secure data storage
- `@react-navigation/native` - Navigation system
- `react-native-safe-area-context` - Safe area handling

### Security Notes

- User sessions are automatically cleared on logout
- Session timeout prevents unauthorized access
- All user data is removed from device storage on logout
- Authentication state is managed centrally and securely
