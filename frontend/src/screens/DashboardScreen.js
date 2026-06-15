import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchDashboard, logout } from '../redux/authSlice';
import { setSpecificTopic, resetQuiz } from '../redux/quizSlice';
import StatCard from '../components/StatCard';
import { getLocalDateString } from '../utils/date';

const BADGES_LIST = [
  { name: 'First Quiz', desc: 'Completed your first AI practice quiz', icon: '🥇' },
  { name: '10 Quizzes', desc: 'Completed 10 comprehensive quizzes', icon: '🏆' },
  { name: '100 Questions', desc: 'Answered 100 questions fully', icon: '🧠' },
  { name: '7 Day Streak', desc: 'Completed quizzes 7 days in a row', icon: '🔥' },
  { name: 'SQL Master', desc: 'Earned 80%+ score on 3 SQL practices', icon: '💾' },
  { name: 'Java Expert', desc: 'Earned 80%+ score on 3 Java practices', icon: '⚡' }
];

const DashboardScreen = ({ onStartNewQuiz, onViewHistory, onViewStreak, onNavigateToSetup, onNavigateToWeakTopics, onPracticeWeakTopic, onNavigateToSettings }) => {
  const dispatch = useDispatch();
  const { user, stats, recentTechs, weakAreas, achievements, dashboardLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (dashboardLoading && !user) {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center px-6">
        <View className="w-20 h-20 bg-googleBlue/10 border border-googleBlue/20 rounded-full items-center justify-center mb-6 shadow-xl shadow-googleBlue/40">
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
        <Text className="text-textMain text-lg font-black tracking-tight text-center">Syncing Practice Workspace...</Text>
        <Text className="text-textMuted text-xs text-center mt-2 leading-relaxed max-w-[260px]">
          Retrieving your practice history, streaks, and achievements from secure cloud servers.
        </Text>
      </View>
    );
  }

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const streak = user?.streak || 0;

  // Progress calculations
  const currentLevelXpBase = (level - 1) * 500;
  const nextLevelXpTarget = level * 500;
  const progressInLevel = xp - currentLevelXpBase;
  const levelProgressRatio = Math.max(0, Math.min(1, progressInLevel / 500));

  // Duolingo client active date calculations
  const todayStr = getLocalDateString();
  const isPracticedToday = user?.lastActiveDate === todayStr;

  const earnedBadgesSet = new Set(achievements.map(a => a.badge));

  const handlePracticeWeakTopic = (tech, topic) => {
    onPracticeWeakTopic(tech, topic);
  };

  const getTechEmoji = (tech) => {
    switch (tech?.toLowerCase()?.trim()) {
      case 'react':
      case 'react native': return '⚛️';
      case 'java': return '☕';
      case 'javascript':
      case 'js': return '🟨';
      case 'typescript':
      case 'ts': return '🔷';
      case 'sql':
      case 'mysql':
      case 'postgres': return '💾';
      case 'docker': return '🐋';
      case 'kubernetes':
      case 'k8s': return '☸️';
      default: return '🧠';
    }
  };

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      {/* Header Bar */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center space-x-2.5">
          <Image
            source={require('../assets/LevelUp-logo.png')}
            className="w-10 h-10 rounded-xl"
            resizeMode="contain"
          />
          <View>
            <Text className="text-textMain text-base font-black tracking-tight leading-tight">Level Up</Text>
            <Text className="text-googleBlue text-[9px] font-black uppercase tracking-widest mt-0.5">in tech</Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          <View className="bg-bgCard rounded-full px-3 py-1.5 flex-row items-center space-x-1.5 border border-borderLight shadow-sm shadow-black/5">
            <View className="w-2.5 h-2.5 rounded-full bg-googleBlue" />
            <Text className="text-textMain text-xs font-black">Level {level}</Text>
          </View>

          <TouchableOpacity
            className="w-10 h-10 bg-bgCard rounded-full items-center justify-center border border-borderLight shadow-sm shadow-black/5"
            onPress={onNavigateToSettings}
          >
            <Text className="text-textMain text-xs font-black">
              {user?.name?.slice(0, 2)?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Streak & XP side-by-side cards */}
      <View className="flex-row space-x-3 mb-4">
        {/* Streak Card */}
        <TouchableOpacity
          className={`flex-1 border rounded-3xl p-4 flex justify-between ${streak > 0
            ? 'bg-googleYellow/10 border-googleYellow/30 shadow-lg shadow-googleYellow/5'
            : 'bg-bgCard border-borderLight'
            }`}
          onPress={onViewStreak}
        >
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-textMuted text-[10px] font-black uppercase tracking-wider">Streak</Text>
            {isPracticedToday ? (
              <View className="w-6 h-6 rounded-full bg-googleYellow/20 items-center justify-center">
                <Text className="text-sm">🔥</Text>
              </View>
            ) : (
              <View className="w-6 h-6 rounded-full bg-borderLight items-center justify-center">
                <Text className="text-xs">❄️</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-baseline space-x-1 mt-1">
            <Text className={`text-3xl font-black ${streak > 0 ? 'text-googleYellow' : 'text-textMain'}`}>{streak}</Text>
            <Text className="text-textMuted text-xs font-bold">days</Text>
          </View>

          <Text className={`text-[9px] font-bold mt-2 ${isPracticedToday ? 'text-googleGreen' : 'text-googleYellow'}`}>
            {isPracticedToday ? 'Practiced today! Active' : 'Practice today to lock!'}
          </Text>
        </TouchableOpacity>

        {/* XP Card */}
        <View className="flex-1 bg-googleBlue/10 border border-googleBlue/30 rounded-3xl p-4 flex justify-between shadow-lg shadow-googleBlue/5">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-textMuted text-[10px] font-black uppercase tracking-wider">Total XP</Text>
            <View className="w-6 h-6 rounded-full bg-googleBlue/15 items-center justify-center">
              <Feather name="star" size={11} color="#1a73e8" />
            </View>
          </View>

          <View className="flex-row items-baseline space-x-1 mt-1">
            <Text className="text-textMain text-3xl font-black">{xp}</Text>
            <Text className="text-textMuted text-xs font-bold">XP</Text>
          </View>

          {/* Progress Bar & Lvl Label */}
          <View className="mt-2.5">
            <View className="w-full h-1.5 bg-[#dadce0] rounded-full overflow-hidden mb-1">
              <View
                className="h-full bg-googleBlue"
                style={{ width: `${levelProgressRatio * 100}%` }}
              />
            </View>
            <Text className="text-textMuted text-[8px] font-bold">Lvl {level} • {500 - progressInLevel} XP to Lvl {level + 1}</Text>
          </View>
        </View>
      </View>

      {/* Accuracy & Completed (Row 1) */}
      <View className="flex-row space-x-3 mb-3">
        <StatCard title="Accuracy" value={`${stats.accuracy}%`} icon="target" iconColor="#34a853" colorClass="bg-googleGreen/10" />
        <StatCard title="Total Quiz taken" value={`${stats.totalQuizzes}`} icon="award" iconColor="#fbbc04" colorClass="bg-googleYellow/10" />
      </View>

      {/* Questions (Row 2, full-width) */}
      <View className="mb-6">
        <View className="bg-bgCard border border-borderLight rounded-3xl p-4 flex-row items-center space-x-4">
          <View className="w-11 h-11 rounded-full bg-googleBlue/10 items-center justify-center">
            <Feather name="help-circle" size={18} color="#1a73e8" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Total Questions Answered</Text>
            <Text className="text-lg text-textMain font-black mt-0.5">{stats.totalQuestions} questions</Text>
          </View>
          <View className="bg-googleBlue/15 px-3 py-1 rounded-full">
            <Text className="text-googleBlue text-[9px] font-black uppercase">Keep Going🔥</Text>
          </View>
        </View>
      </View>

      {/* Continue Learning card */}
      <Text className="text-textMain text-lg font-bold mb-3">Continue Learning</Text>
      {recentTechs.length > 0 ? (
        <View className="bg-googleBlue rounded-3xl p-5 mb-6 shadow-lg shadow-googleBlue/20">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white/80 text-xs font-bold uppercase">Active Practice</Text>
              <Text className="text-white text-2xl font-black">{recentTechs[0]}</Text>
            </View>
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
              <Text className="text-2xl">{getTechEmoji(recentTechs[0])}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center bg-black/15 rounded-2xl p-3">
            <Text className="text-white/90 text-xs font-bold uppercase">Resume practice quiz</Text>
            <TouchableOpacity
              className="bg-white rounded-full px-4 py-2"
              onPress={onStartNewQuiz}
            >
              <Text className="text-googleBlue text-xs font-black">Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="bg-bgCard border border-borderLight border-dashed rounded-3xl p-6 mb-6 items-center">
          <Text className="text-textMuted text-xs text-center mb-4">
            No completed practices yet. Start your very first AI-generated quiz to track metrics and badges!
          </Text>
          <TouchableOpacity
            className="bg-googleBlue rounded-full px-6 py-2.5"
            onPress={onStartNewQuiz}
          >
            <Text className="text-white text-xs font-bold">Generate Quiz</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* New Quiz button */}
      {recentTechs.length > 0 && (
        <TouchableOpacity
          className="bg-googleBlue/15 border border-googleBlue/30 rounded-3xl py-4 flex-row justify-center items-center mb-6"
          onPress={onStartNewQuiz}
        >
          <Text className="text-textMain text-base font-black">+ Start New Quiz</Text>
        </TouchableOpacity>
      )}

      {/* Recent Technologies */}
      {recentTechs.length > 1 && (
        <View className="mb-6">
          <Text className="text-textMain text-lg font-bold mb-3">Recent Technologies</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentTechs}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-bgCard border border-borderLight rounded-2xl px-4 py-3 mr-2"
                onPress={onStartNewQuiz}
              >
                <Text className="text-textMain text-sm font-bold">{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Weak Areas */}
      {weakAreas.length > 0 ? (
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-textMain text-lg font-bold">Weak Areas</Text>
            <TouchableOpacity onPress={onNavigateToWeakTopics}>
              <Text className="text-googleBlue text-xs font-black">View All</Text>
            </TouchableOpacity>
          </View>
          {weakAreas.slice(0, 3).map((item, index) => (
            <View key={index} className="bg-bgCard border border-borderLight rounded-2xl p-4 mb-2 flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-textMain text-sm font-black">{item.topic}</Text>
                <Text className="text-textMuted text-xs mt-0.5">{item.technology}</Text>
              </View>
              <TouchableOpacity
                className="bg-googleRed/10 border border-googleRed/20 rounded-xl px-4 py-2"
                onPress={() => handlePracticeWeakTopic(item.technology, item.topic)}
              >
                <Text className="text-googleRed text-xs font-bold">Practice</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View className="mb-6">
          <Text className="text-textMain text-lg font-bold mb-3">Weak Areas</Text>
          <TouchableOpacity
            className="bg-bgCard border border-borderLight rounded-3xl p-5 flex-row items-center justify-between"
            onPress={onNavigateToWeakTopics}
          >
            <View className="flex-row items-center space-x-3 flex-1 mr-4">
              <View className="w-10 h-10 rounded-full bg-googleGreen/10 items-center justify-center">
                <Feather name="check-circle" size={18} color="#34a853" />
              </View>
              <View className="flex-1">
                <Text className="text-textMain text-sm font-black">All topics looking strong!</Text>
                <Text className="text-textMuted text-[10px] mt-0.5 leading-relaxed">No weak areas identified. Tap to analyze historic quiz attempts.</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#8E9AA8" />
          </TouchableOpacity>
        </View>
      )}

      {/* Badges & Achievements */}
      <View className="mb-8">
        <Text className="text-textMain text-lg font-bold mb-3">Badges & Achievements</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BADGES_LIST}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => {
            const isEarned = earnedBadgesSet.has(item.name);
            return (
              <View className={`w-32 bg-bgCard border border-borderLight rounded-2xl p-3 mr-3 items-center justify-center ${!isEarned && 'opacity-50'}`}>
                <View className="w-12 h-12 rounded-full bg-bgMain items-center justify-center mb-2">
                  <Text className="text-2xl">{isEarned ? item.icon : '🔒'}</Text>
                </View>
                <Text className="text-textMain text-xs font-bold text-center" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-textMuted text-[8px] text-center mt-1" numberOfLines={2}>
                  {item.desc}
                </Text>
              </View>
            );
          }}
        />
      </View>

      {/* History link */}
      <TouchableOpacity
        className="flex-row justify-center items-center py-6 mb-12 space-x-1.5"
        onPress={onViewHistory}
      >
        <Text className="text-googleBlue text-sm font-black">View Deep Practiced History</Text>
        <Feather name="arrow-right" size={14} color="#1a73e8" />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DashboardScreen;
