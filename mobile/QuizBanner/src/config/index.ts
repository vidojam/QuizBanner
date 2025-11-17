import Constants from 'expo-constants';

// Configuration for different environments
const config = {
  development: {
    // Backend URL configuration for different platforms
    API_BASE_URL: (() => {
      if (__DEV__) {
        // For development mode
        const Platform = require('react-native').Platform;
        if (Platform.OS === 'android') {
          return 'http://10.0.2.2:5000'; // Android emulator
        } else if (Platform.OS === 'ios') {
          return 'http://localhost:5000'; // iOS simulator
        } else {
          return 'http://localhost:5000'; // Web
        }
      }
      return 'http://localhost:5000';
    })(),
    
    // For physical devices, uncomment and use your computer's IP:
    // API_BASE_URL: 'http://192.168.1.XXX:5000', // Replace XXX with your IP
  },
  
  production: {
    API_BASE_URL: 'https://your-production-domain.com',
  },
};

// Determine environment
const ENV = __DEV__ ? 'development' : 'production';

export default {
  ...config[ENV],
  ENV,
};

// Instructions for finding your IP address:
// 
// Windows:
// 1. Open Command Prompt
// 2. Type: ipconfig
// 3. Look for "IPv4 Address" under your network adapter
// 
// Mac/Linux:
// 1. Open Terminal
// 2. Type: ifconfig | grep "inet " | grep -v 127.0.0.1
// 3. Use the IP address shown (usually starts with 192.168 or 10.0)
// 
// Then replace the API_BASE_URL above with: http://YOUR_IP:5000