import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '../types';

const { width, height } = Dimensions.get('window');

export default function StudyScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Mock questions - replace with actual data
  const questions: Question[] = [
    {
      id: '1',
      userId: 'user1',
      question: 'What is React Native?',
      answer: 'A framework for building native mobile apps using React and JavaScript',
      category: 'Programming',
      tags: ['React', 'Mobile'],
      duration: 5,
      customColor: null,
      timesReviewed: 0,
      lastReviewed: null,
      performanceScore: 0.5,
      order: 0,
    },
    {
      id: '2',
      userId: 'user1',
      question: 'What is the capital of France?',
      answer: 'Paris',
      category: 'Geography',
      tags: ['Europe', 'Capitals'],
      duration: 3,
      customColor: null,
      timesReviewed: 0,
      lastReviewed: null,
      performanceScore: 0.5,
      order: 1,
    },
  ];

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isAutoPlay && !showAnswer) {
      const timer = setTimeout(() => {
        setShowAnswer(true);
      }, (currentQuestion?.duration || 5) * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, showAnswer, isAutoPlay, currentQuestion?.duration]);

  useEffect(() => {
    if (isAutoPlay && showAnswer) {
      const timer = setTimeout(() => {
        nextQuestion();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAnswer, isAutoPlay]);

  const nextQuestion = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const prevQuestion = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={64} color="#6b7280" />
        <Text style={styles.emptyText}>No questions available</Text>
        <Text style={styles.emptySubtext}>Add some questions to start studying</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#334155', '#475569']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.autoPlayButton}
            onPress={() => setIsAutoPlay(!isAutoPlay)}
          >
            <Ionicons
              name={isAutoPlay ? 'pause' : 'play'}
              size={20}
              color="white"
            />
            <Text style={styles.autoPlayText}>
              {isAutoPlay ? 'Pause' : 'Auto'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>

        {/* Question Card */}
        <TouchableOpacity 
          style={styles.questionContainer}
          onPress={toggleAnswer}
          activeOpacity={0.9}
        >
          <View style={styles.questionCard}>
            {/* Category Badge */}
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>
              <Text style={styles.durationBadge}>{currentQuestion.duration}s</Text>
            </View>

            {/* Question */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Answer */}
            {showAnswer && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>Answer:</Text>
                <Text style={styles.answerText}>{currentQuestion.answer}</Text>
                
                {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {currentQuestion.tags.map((tag, index) => (
                      <Text key={index} style={styles.tag}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Tap Hint */}
            {!showAnswer && (
              <Text style={styles.tapHint}>Tap to reveal answer</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Navigation Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={prevQuestion}
            disabled={questions.length <= 1}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.answerButton}
            onPress={toggleAnswer}
          >
            <Ionicons
              name={showAnswer ? 'eye-off' : 'eye'}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={nextQuestion}
            disabled={questions.length <= 1}
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Study Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity style={styles.modeButton}>
            <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.modeText}>Flashcards</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, styles.activeModeButton]}>
            <Ionicons name="tv-outline" size={20} color="white" />
            <Text style={[styles.modeText, styles.activeModeText]}>Screensaver</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  autoPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  autoPlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  progressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  durationBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
  },
  answerContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  answerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  tapHint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 40,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    gap: 12,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  activeModeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  activeModeText: {
    color: 'white',
  },
});