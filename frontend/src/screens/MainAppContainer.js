import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { updateDifficulty, updateCount, setSpecificTopic, generateQuizAction } from '../redux/quizSlice';
import { loadSession } from '../redux/authSlice';

// Screens
import LoginScreen from './LoginScreen';
import DashboardScreen from './DashboardScreen';
import AnalyticsScreen from './AnalyticsScreen';
import AchievementsScreen from './AchievementsScreen';
import WeakTopicsScreen from './WeakTopicsScreen';
import SettingsScreen from './SettingsScreen';
import QuizSetupScreen from './QuizSetupScreen';
import QuizPlayScreen from './QuizPlayScreen';
import HistoryScreen from './HistoryScreen';
import StreakScreen from './StreakScreen';

const MainAppContainer = () => {
  const dispatch = useDispatch();
  const { token, user, isCheckingSession } = useSelector((state) => state.auth);
  const { quizState } = useSelector((state) => state.quiz);
  const insets = useSafeAreaInsets();
  
  // Navigation destination flow: 'MainTabs' | 'QuizSetup' | 'QuizPlay' | 'History'
  const [currentScreen, setCurrentScreen] = useState('MainTabs');
  // Tab index mapping: 0: Analytics, 1: Dashboard, 2: Settings, 3: Achievements, 4: Weak Topics
  const [activeTabIdx, setActiveTabIdx] = useState(1); 

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  // Loading Session Flow
  if (isCheckingSession) {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  // Unauthenticated Flow
  if (!token) {
    return (
      <View className="flex-1 bg-bgMain">
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <LoginScreen />
      </View>
    );
  }

  // Full-screen loader plate during quiz generation
  if (quizState === 'loading') {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center px-6">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text className="text-textMain text-lg font-black mt-4 text-center">Generating AI Practice Quiz...</Text>
        <Text className="text-textMuted text-xs text-center mt-2 leading-relaxed max-w-[280px]">
          Please wait while AI constructs your tailored questions. This may take a few seconds.
        </Text>
      </View>
    );
  }

  const handleStartWeakTopicQuiz = (tech, topic) => {
    dispatch(setSpecificTopic({ tech, topic }));
    dispatch(updateDifficulty('Intermediate'));
    dispatch(updateCount(5));

    dispatch(generateQuizAction({
      technology: tech,
      difficulty: 'Intermediate',
      count: 5,
      specificTopic: topic
    })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        setCurrentScreen('QuizPlay');
      } else {
        alert(res.payload || 'Failed to generate quiz.');
      }
    });
  };

  // Authenticated Screen Rendering
  const renderScreen = () => {
    switch (currentScreen) {
      case 'QuizSetup':
        return (
          <QuizSetupScreen
            onQuizGenerated={() => setCurrentScreen('QuizPlay')}
            onBack={() => setCurrentScreen('MainTabs')}
          />
        );
      case 'QuizPlay':
        return (
          <QuizPlayScreen
            onBackToDashboard={() => setCurrentScreen('MainTabs')}
          />
        );
      case 'History':
        return (
          <HistoryScreen
            onBack={() => setCurrentScreen('MainTabs')}
          />
        );
      case 'Streak':
        return (
          <StreakScreen
            onBack={() => setCurrentScreen('MainTabs')}
            streakCount={user?.streak || 0}
            lastActiveDate={user?.lastActiveDate || ''}
          />
        );
      case 'MainTabs':
      default:
        // Render Active Tab inside Main Scaffold
        switch (activeTabIdx) {
          case 0:
            return <AnalyticsScreen />;
          case 1:
            return (
              <DashboardScreen
                onStartNewQuiz={() => setCurrentScreen('QuizSetup')}
                onViewHistory={() => setCurrentScreen('History')}
                onViewStreak={() => setCurrentScreen('Streak')}
                onNavigateToSetup={() => setCurrentScreen('QuizSetup')}
                onNavigateToWeakTopics={() => setActiveTabIdx(4)}
                onPracticeWeakTopic={handleStartWeakTopicQuiz}
                onNavigateToSettings={() => setActiveTabIdx(2)}
              />
            );
          case 2:
            return <SettingsScreen />;
          case 3:
            return <AchievementsScreen />;
          case 4:
            return (
              <WeakTopicsScreen 
                onBack={() => setActiveTabIdx(1)}
                onNavigateToSetup={() => setCurrentScreen('QuizSetup')} 
                onPracticeWeakTopic={handleStartWeakTopicQuiz}
              />
            );
          default:
            return null;
        }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bgMain" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Active screen content */}
      <View className="flex-1 pt-3">
        {renderScreen()}
      </View>

      {/* Floating Action Button (FAB) for Achievements (Badges) */}
      {currentScreen === 'MainTabs' && (
        <TouchableOpacity
          className={`absolute rounded-full w-14 h-14 items-center justify-center border ${
            activeTabIdx === 3
              ? 'bg-googleBlue border-transparent'
              : 'bg-white border-borderLight'
          }`}
          style={{
            position: 'absolute',
            bottom: Math.max(insets.bottom, 14) + 65, // Floats above the custom navigation bar
            right: 20,
            shadowColor: activeTabIdx === 3 ? '#1a73e8' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: activeTabIdx === 3 ? 0.35 : 0.15,
            shadowRadius: 6,
            elevation: 6,
            zIndex: 99,
          }}
          onPress={() => setActiveTabIdx(3)}
        >
          <Feather 
            name="award" 
            size={24} 
            color={activeTabIdx === 3 ? '#FFFFFF' : '#1a73e8'} 
          />
        </TouchableOpacity>
      )}

      {/* Custom Bottom Navigation Bar with 3 centered tabs: Analytics, Dashboard, Settings */}
      {currentScreen === 'MainTabs' && (
        <View 
          className="bg-bgCard border-t border-borderLight flex-row pt-3 pb-2.5 justify-around items-center px-1"
          style={{ paddingBottom: Math.max(insets.bottom, 14) }}
        >
          {/* Tab 1: Analytics */}
          <TouchableOpacity
            className="items-center flex-1 py-0.5"
            onPress={() => setActiveTabIdx(0)}
          >
            <View className={`px-4 py-1.5 rounded-2xl items-center justify-center ${activeTabIdx === 0 ? 'bg-googleBlue/15' : ''}`}>
              <Feather name="trending-up" size={18} color={activeTabIdx === 0 ? '#1a73e8' : '#8E9AA8'} />
            </View>
            <Text className={`text-[9px] mt-1 font-extrabold ${activeTabIdx === 0 ? 'text-textMain' : 'text-textMuted'}`}>
              Analytics
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Dashboard */}
          <TouchableOpacity
            className="items-center flex-1 py-0.5"
            onPress={() => setActiveTabIdx(1)}
          >
            <View className={`px-4 py-1.5 rounded-2xl items-center justify-center ${activeTabIdx === 1 ? 'bg-googleBlue/15' : ''}`}>
              <Feather name="grid" size={18} color={activeTabIdx === 1 ? '#1a73e8' : '#8E9AA8'} />
            </View>
            <Text className={`text-[9px] mt-1 font-extrabold ${activeTabIdx === 1 ? 'text-textMain' : 'text-textMuted'}`}>
              Dashboard
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Settings */}
          <TouchableOpacity
            className="items-center flex-1 py-0.5"
            onPress={() => setActiveTabIdx(2)}
          >
            <View className={`px-4 py-1.5 rounded-2xl items-center justify-center ${activeTabIdx === 2 ? 'bg-googleBlue/15' : ''}`}>
              <Feather name="settings" size={18} color={activeTabIdx === 2 ? '#1a73e8' : '#8E9AA8'} />
            </View>
            <Text className={`text-[9px] mt-1 font-extrabold ${activeTabIdx === 2 ? 'text-textMain' : 'text-textMuted'}`}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MainAppContainer;
