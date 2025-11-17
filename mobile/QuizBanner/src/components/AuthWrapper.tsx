import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useApi';
import { apiService } from '../services/apiService';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleLogin = () => {
    const loginUrl = apiService.getLoginUrl();
    Linking.openURL(loginUrl);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#d946ef']}
        style={styles.loginContainer}
      >
        <View style={styles.loginContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="school" size={64} color="white" />
            <Text style={styles.logoText}>QuizBanner</Text>
            <Text style={styles.tagline}>Mobile Study Companion</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="flash" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Smart Flashcards</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="trending-up" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Track Progress</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="tv" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featureText}>Screensaver Mode</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In to Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#6366f1" />
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Secure authentication powered by Replit
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  loginContainer: {
    flex: 1,
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 60,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
  },
  disclaimer: {
    marginTop: 32,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});