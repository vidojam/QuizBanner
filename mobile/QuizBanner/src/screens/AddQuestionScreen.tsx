import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCreateQuestion } from '../hooks/useApi';

export default function AddQuestionScreen() {
  const navigation = useNavigation();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState('5');

  const createQuestionMutation = useCreateQuestion();

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Error', 'Please fill in both question and answer fields');
      return;
    }

    const questionData = {
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim() || null,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : null,
      duration: parseInt(duration) || 5,
      customColor: null,
      timesReviewed: 0,
      lastReviewed: null,
      performanceScore: 0.5,
      order: 0, // Will be set by backend
    };

    createQuestionMutation.mutate(questionData, {
      onSuccess: () => {
        Alert.alert('Success', 'Question added successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Question *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your question..."
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Answer *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the answer..."
            value={answer}
            onChangeText={setAnswer}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Programming, Geography, History..."
            value={category}
            onChangeText={setCategory}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="Separate with commas: React, JavaScript, Mobile"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Duration (seconds)</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, createQuestionMutation.isPending && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={createQuestionMutation.isPending}
        >
          {createQuestionMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="checkmark-circle" size={24} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {createQuestionMutation.isPending ? 'Saving...' : 'Save Question'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});