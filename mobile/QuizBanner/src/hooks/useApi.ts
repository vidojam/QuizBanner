import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Question } from '../types';
import { Alert } from 'react-native';

// Query keys
export const QUERY_KEYS = {
  questions: ['questions'] as const,
  question: (id: string) => ['question', id] as const,
  user: ['user'] as const,
  preferences: ['preferences'] as const,
  studySessions: ['studySessions'] as const,
  templates: ['templates'] as const,
};

// Auth Hooks
export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.user,
    queryFn: apiService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !error && !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
}

// Question Hooks
export function useQuestions() {
  return useQuery({
    queryKey: QUERY_KEYS.questions,
    queryFn: apiService.getQuestions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.question(id),
    queryFn: () => apiService.getQuestion(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionData: Omit<Question, 'id' | 'userId'>) =>
      apiService.createQuestion(questionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to create question: ${error.message}`);
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Question> }) =>
      apiService.updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
      queryClient.setQueryData(
        QUERY_KEYS.question(updatedQuestion.id),
        updatedQuestion
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to update question: ${error.message}`);
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to delete question: ${error.message}`);
    },
  });
}

export function useDeleteAllQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.deleteAllQuestions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to delete questions: ${error.message}`);
    },
  });
}

export function useReorderQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionIds: string[]) => apiService.reorderQuestions(questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions });
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to reorder questions: ${error.message}`);
    },
  });
}

// Preferences Hooks
export function usePreferences() {
  return useQuery({
    queryKey: QUERY_KEYS.preferences,
    queryFn: apiService.getPreferences,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: any) => apiService.updatePreferences(preferences),
    onSuccess: (updatedPreferences) => {
      queryClient.setQueryData(QUERY_KEYS.preferences, updatedPreferences);
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to update preferences: ${error.message}`);
    },
  });
}

// Study Session Hooks
export function useStudySessions() {
  return useQuery({
    queryKey: QUERY_KEYS.studySessions,
    queryFn: apiService.getStudySessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateStudySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionData: any) => apiService.createStudySession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.studySessions });
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to create study session: ${error.message}`);
    },
  });
}

// Template Hooks
export function useTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: apiService.getTemplates,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateData: any) => apiService.createTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.templates });
    },
    onError: (error: Error) => {
      Alert.alert('Error', `Failed to create template: ${error.message}`);
    },
  });
}