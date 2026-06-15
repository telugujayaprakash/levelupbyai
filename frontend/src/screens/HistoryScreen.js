import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import API from '../services/api';

const HistoryScreen = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await API.get('/stats/history');
        setSessions(response);
      } catch (error) {
        console.error('Failed to load sessions history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccuracyColor = (score, total) => {
    const acc = (score / total) * 100;
    if (acc >= 80) return 'text-googleGreen';
    if (acc >= 60) return 'text-googleYellow';
    return 'text-googleRed';
  };

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity className="mr-3 w-10 h-10 rounded-full bg-bgCard border border-borderLight items-center justify-center" onPress={onBack}>
          <Feather name="arrow-left" size={18} color="#202124" />
        </TouchableOpacity>
        <Text className="text-textMain text-2xl font-black ml-2">Practice History</Text>
      </View>

      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
      ) : sessions.length > 0 ? (
        <View className="space-y-3 mb-12">
          {sessions.map((session) => (
            <View key={session._id} className="bg-bgCard border border-borderLight rounded-3xl p-5">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-textMain text-base font-black">{session.technology}</Text>
                  <Text className="text-textMuted text-xs font-bold mt-0.5">{session.difficulty}</Text>
                </View>
                <View className="items-end">
                  <Text className={`text-base font-black ${getAccuracyColor(session.score, session.totalQuestions)}`}>
                    {session.score} / {session.totalQuestions}
                  </Text>
                  <Text className="text-textMuted text-[10px] font-bold mt-0.5">SCORE</Text>
                </View>
              </View>

              <View className="border-t border-borderLight pt-3 mt-3 flex-row justify-between items-center">
                <Text className="text-textMuted text-[10px] font-bold">
                  Completed: {formatDate(session.completedAt)}
                </Text>
                <View className="bg-googleBlue/10 px-2.5 py-1 rounded-lg">
                  <Text className="text-googleBlue text-[9px] font-black uppercase">
                    +{session.score * 10 + 50 + (session.score === session.totalQuestions ? 100 : 0)} XP
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="py-20 items-center justify-center px-6">
          <Text className="text-textMuted text-base text-center">
            No completed practice sessions found. Time to generate a new quiz and practice!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default HistoryScreen;
