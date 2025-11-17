import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import StudyScreen from './src/screens/StudyScreen';
import AddQuestionScreen from './src/screens/AddQuestionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthWrapper from './src/components/AuthWrapper';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function QuestionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="QuestionsList" 
        component={QuestionsScreen}
        options={{ title: 'My Questions' }}
      />
      <Stack.Screen 
        name="AddQuestion" 
        component={AddQuestionScreen}
        options={{ title: 'Add Question' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Questions') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Study') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'QuizBanner' }}
      />
      <Tab.Screen 
        name="Questions" 
        component={QuestionsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Study" 
        component={StudyScreen}
        options={{ title: 'Study Mode' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        <NavigationContainer>
          <StatusBar style="light" />
          <MainTabs />
        </NavigationContainer>
      </AuthWrapper>
    </QueryClientProvider>
  );
}