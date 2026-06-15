import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import API from '../services/api';
import CustomActivityChart from '../components/CustomActivityChart';

const AnalyticsScreen = () => {
  const { user, stats } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ activityGraph: { labels: [], data: [] }, techStats: [], diffStats: [] });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await API.get('/stats/analytics');
        setData(response);
      } catch (error) {
        console.error('Failed to load analytics details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const getTechColor = (accuracy) => {
    if (accuracy >= 80) return 'bg-googleGreen';
    if (accuracy >= 60) return 'bg-googleYellow';
    return 'bg-googleRed';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Foundation': return 'bg-googleBlue';
      case 'Basic': return 'bg-googleGreen';
      case 'Intermediate': return 'bg-googleYellow';
      case 'Hard':
      case 'Advanced': return 'bg-googleRed';
      default: return 'bg-googleRed';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center">
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      <Text className="text-textMain text-2xl font-black">Analytics Dashboard</Text>
      <Text className="text-textMuted text-xs mt-1 mb-6">Track your learning milestones & technology progress</Text>

      {/* Stats row */}
      <View className="flex-row space-x-3 mb-6">
        <View className="flex-1 bg-bgCard border border-borderLight rounded-2xl p-4">
          <Text className="text-textMuted text-[10px] font-bold uppercase">Total XP</Text>
          <Text className="text-textMain text-2xl font-black mt-1">{user?.xp || 0}</Text>
          <Text className="text-textMuted text-[10px] mt-0.5">Level {user?.level || 1}</Text>
        </View>

        <View className="flex-1 bg-bgCard border border-borderLight rounded-2xl p-4">
          <Text className="text-textMuted text-[10px] font-bold uppercase">Accuracy</Text>
          <Text className="text-textMain text-2xl font-black mt-1">{stats.accuracy}%</Text>
          <Text className="text-textMuted text-[10px] mt-0.5">Total: {stats.totalQuestions} Q</Text>
        </View>
      </View>

      {/* Chart Section */}
      <Text className="text-textMain text-lg font-bold mb-3">Activity & Progress Trend</Text>
      <View className="bg-bgCard border border-borderLight rounded-3xl p-4 mb-6">
        <Text className="text-[#1a73e8] text-xs font-bold mb-2">Weekly Practice Strength</Text>
        <CustomActivityChart
          data={data.activityGraph.data}
          labels={data.activityGraph.labels}
        />
        <View className="flex-row items-center space-x-4 mt-3">
          <View className="flex-row items-center space-x-1">
            <View className="w-2.5 h-2.5 rounded-sm bg-googleBlue" />
            <Text className="text-textMuted text-[10px] font-bold">Core Activity</Text>
          </View>
          <View className="flex-row items-center space-x-1">
            <View className="w-2.5 h-2.5 rounded-sm bg-googleBlue/30" />
            <Text className="text-textMuted text-[10px] font-bold">Historical Trend</Text>
          </View>
        </View>
      </View>

      {/* Tech accuracy breakdown */}
      <Text className="text-textMain text-lg font-bold mb-3">Accuracy by Technology</Text>
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-6 space-y-4">
        {data.techStats.length > 0 ? (
          data.techStats.map((item, index) => (
            <View key={index} className="space-y-1.5">
              <View className="flex-row justify-between items-center">
                <Text className="text-textMain text-sm font-black">{item.tech}</Text>
                <Text className="text-textMuted text-xs font-bold">{item.accuracy}% ({item.totalQuestions} Q)</Text>
              </View>
              <View className="w-full h-2 bg-[#dadce0] rounded-full overflow-hidden">
                <View
                  className={`h-full ${getTechColor(item.accuracy)}`}
                  style={{ width: `${item.accuracy}%` }}
                />
              </View>
            </View>
          ))
        ) : (
          <Text className="text-textMuted text-xs text-center py-4">
            Practice a variety of techs to view accuracy breakdown!
          </Text>
        )}
      </View>

      {/* Difficulty breakdown */}
      <Text className="text-textMain text-lg font-bold mb-3">Performance by Difficulty</Text>
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-12 space-y-4">
        {data.diffStats.map((item, index) => (
          <View key={index} className="space-y-1.5">
            <View className="flex-row justify-between items-center">
              <Text className="text-textMain text-sm font-black">{item.difficulty}</Text>
              <Text className="text-textMuted text-xs font-bold">
                {item.totalQuestions > 0 ? `${item.accuracy}% (${item.totalQuestions} Q)` : '0% (0 Q)'}
              </Text>
            </View>
            <View className="w-full h-2 bg-[#dadce0] rounded-full overflow-hidden">
              <View
                className={`h-full ${getDifficultyColor(item.difficulty)}`}
                style={{ width: `${item.totalQuestions > 0 ? item.accuracy : 0}%` }}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;
