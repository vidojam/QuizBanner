import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    darkMode: false,
    autoAdvance: true,
    soundEnabled: true,
    notifications: true,
    defaultDuration: 5,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Feature coming soon!');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Feature coming soon!');
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your questions and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'All data has been reset.');
        }},
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Study Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="play-forward" size={20} color="#6366f1" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Auto Advance</Text>
              <Text style={styles.settingDescription}>
                Automatically move to next question
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoAdvance}
            onValueChange={(value) => updateSetting('autoAdvance', value)}
            trackColor={{ false: '#f3f4f6', true: '#ddd6fe' }}
            thumbColor={settings.autoAdvance ? '#6366f1' : '#9ca3af'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={20} color="#10b981" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Play sounds for interactions
              </Text>
            </View>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
            thumbColor={settings.soundEnabled ? '#10b981' : '#9ca3af'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color="#f59e0b" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Study Reminders</Text>
              <Text style={styles.settingDescription}>
                Get notified to review questions
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
            trackColor={{ false: '#f3f4f6', true: '#fef3c7' }}
            thumbColor={settings.notifications ? '#f59e0b' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={20} color="#6b7280" />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch to dark theme
              </Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => updateSetting('darkMode', value)}
            trackColor={{ false: '#f3f4f6', true: '#e5e7eb' }}
            thumbColor={settings.darkMode ? '#6b7280' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
          <View style={styles.actionInfo}>
            <Ionicons name="download" size={20} color="#3b82f6" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Export Data</Text>
              <Text style={styles.actionDescription}>
                Save your questions and progress
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleImportData}>
          <View style={styles.actionInfo}>
            <Ionicons name="cloud-upload" size={20} color="#10b981" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Import Data</Text>
              <Text style={styles.actionDescription}>
                Restore from backup file
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleResetData}>
          <View style={styles.actionInfo}>
            <Ionicons name="refresh" size={20} color="#ef4444" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Reset All Data</Text>
              <Text style={styles.actionDescription}>
                Delete all questions and progress
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>QuizBanner Mobile</Text>
          <Text style={styles.infoValue}>Version 1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionInfo}>
            <Ionicons name="help-circle" size={20} color="#8b5cf6" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Help & Support</Text>
              <Text style={styles.actionDescription}>
                Get help and send feedback
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <View style={styles.actionInfo}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Rate App</Text>
              <Text style={styles.actionDescription}>
                Help us improve QuizBanner
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for learners everywhere</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    marginTop: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});