import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

export default function App() {
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success!', `Backend connected: ${JSON.stringify(data)}`);
      } else {
        Alert.alert('Error', `Backend connection failed: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Error', `Connection failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Quiz Mobile App</Text>
      <Text style={styles.subtitle}>Connected to QuizBanner Backend</Text>
      
      <Button
        title="🔗 Test Backend Connection"
        onPress={testConnection}
        color="#007AFF"
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
});