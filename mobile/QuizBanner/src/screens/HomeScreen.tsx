import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuestions, useAuth } from '../hooks/useApi';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: questions = [], isLoading } = useQuestions();
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Test backend connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await apiService.healthCheck();
      Alert.alert(
        'Connection Success! 🎉', 
        `Backend is running!\nStatus: ${result.status}\nEnvironment: ${result.environment}\nTime: ${new Date(result.timestamp).toLocaleTimeString()}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Connection Failed ❌', 
        `Could not connect to backend.\nError: ${errorMessage}\n\nMake sure the server is running on localhost:5000`
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Calculate real stats from API data
  const stats = {
    totalQuestions: questions.length,
    masteredQuestions: questions.filter(q => q.performanceScore > 0.7).length,
    studySessions: questions.reduce((sum, q) => sum + q.timesReviewed, 0),
    totalStudyTime: `${Math.floor(questions.reduce((sum, q) => sum + (q.timesReviewed * q.duration), 0) / 60)}m`,
  };

  const recentQuestions = questions
    .sort((a, b) => {
      const aDate = a.lastReviewed ? new Date(a.lastReviewed).getTime() : 0;
      const bDate = b.lastReviewed ? new Date(b.lastReviewed).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 3)
    .map(q => ({
      id: q.id,
      question: q.question,
      category: q.category || 'Uncategorized',
      mastered: q.performanceScore > 0.7,
    }));

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </Text>
          <Text style={styles.subtitle}>Ready to study?</Text>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Ionicons name="library-outline" size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{stats.masteredQuestions}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Ionicons name="school-outline" size={24} color="#8b5cf6" />
            <Text style={styles.statNumber}>{stats.studySessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Ionicons name="time-outline" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{stats.totalStudyTime}</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardPrimary]}
            onPress={() => navigation.navigate('Study' as never)}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.actionGradient}
            >
              <Ionicons name="play-circle" size={32} color="white" />
              <Text style={styles.actionText}>Start Study</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardSecondary]}
            onPress={() => navigation.navigate('Questions' as never)}
          >
            <View style={styles.actionContent}>
              <Ionicons name="add-circle-outline" size={32} color="#6366f1" />
              <Text style={[styles.actionText, styles.actionTextSecondary]}>Add Question</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardTest]}
            onPress={testConnection}
            disabled={isTestingConnection}
          >
            <View style={styles.actionContent}>
              {isTestingConnection ? (
                <ActivityIndicator size={32} color="#10b981" />
              ) : (
                <Ionicons name="wifi" size={32} color="#10b981" />
              )}
              <Text style={[styles.actionText, styles.actionTextTest]}>
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Questions</Text>
        <View style={styles.recentQuestions}>
          {recentQuestions.map((item) => (
            <View key={item.id} style={styles.questionCard}>
              <View style={styles.questionContent}>
                <Text style={styles.questionText} numberOfLines={2}>
                  {item.question}
                </Text>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <View style={styles.questionStatus}>
                <Ionicons 
                  name={item.mastered ? "checkmark-circle" : "time"} 
                  size={20} 
                  color={item.mastered ? "#10b981" : "#f59e0b"} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Study Streak */}
      <View style={styles.section}>
        <View style={styles.streakCard}>
          <LinearGradient
            colors={['#f59e0b', '#ef4444']}
            style={styles.streakGradient}
          >
            <Ionicons name="flame" size={32} color="white" />
            <Text style={styles.streakNumber}>7</Text>
            <Text style={styles.streakLabel}>Day Streak!</Text>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  statCardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionCardPrimary: {
    height: 100,
  },
  actionCardSecondary: {
    height: 100,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
  },
  actionTextSecondary: {
    color: '#6366f1',
  },
  actionCardTest: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  actionTextTest: {
    color: '#10b981',
  },
  recentQuestions: {
    gap: 8,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
  },
  questionStatus: {
    marginLeft: 12,
  },
  streakCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  streakGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  streakLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});