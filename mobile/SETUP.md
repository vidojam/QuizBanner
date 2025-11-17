# React Native Mobile App - Backend Connection Setup

## 🔧 Setup Instructions

### 1. **Start Your Backend Server**
First, make sure your main QuizBanner backend is running:
```bash
# In your main project root
cd c:\Users\vidoj\.vscode\QuizBanner
npm run dev
```

### 2. **Configure Mobile App API URL**
Update the API URL in the mobile app to point to your backend:

**For Android Emulator:** Uses `http://10.0.2.2:5000` (already configured)

**For Physical Device:** 
1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt
   - **Mac/Linux**: Run `ifconfig | grep "inet "` in Terminal
2. Update `src/config/index.ts` with your IP:
   ```typescript
   API_BASE_URL: 'http://YOUR_IP_ADDRESS:5000'
   ```

### 3. **Install Expo CLI and Start Mobile App**
```bash
# Install Expo CLI globally (if not already installed)
npm install -g @expo/cli

# Navigate to mobile app
cd mobile/QuizBanner

# Start the development server
npx expo start
```

### 4. **Test on Device**
1. **Install Expo Go** on your mobile device:
   - **iOS**: App Store
   - **Android**: Google Play Store

2. **Scan QR Code** displayed in your terminal with:
   - **iOS**: Camera app or Expo Go
   - **Android**: Expo Go app

### 5. **Backend API Endpoints Used**
The mobile app connects to these endpoints:
- `GET /api/auth/user` - Get current user
- `GET /api/questions` - Fetch all questions  
- `POST /api/questions` - Create new question
- `PATCH /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/preferences` - Get user preferences

### 6. **Authentication Flow**
- Mobile app checks authentication via `/api/auth/user`
- If not authenticated, shows login screen
- Login redirects to your backend's `/api/login`
- Uses session-based authentication (cookies)

## 🐛 Troubleshooting

### "Network request failed"
- Check that your backend is running on port 5000
- Verify the IP address in mobile app config
- Make sure your device and computer are on the same network

### "Cannot connect to backend"
- Ensure your computer's firewall allows connections on port 5000
- Try disabling Windows Firewall temporarily for testing

### "Authentication failed"
- The mobile app authentication works through web browser
- After login in browser, return to the mobile app

## 🔄 Data Sync
The mobile app now:
✅ Fetches real questions from your backend  
✅ Creates new questions via API  
✅ Deletes questions with confirmation  
✅ Shows loading states and error handling  
✅ Automatically refreshes data  
✅ Uses the same authentication system as your web app

Your mobile app is now fully connected to your existing backend! 📱