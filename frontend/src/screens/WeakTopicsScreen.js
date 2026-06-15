import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchDashboard } from '../redux/authSlice';
import { setSpecificTopic, resetQuiz } from '../redux/quizSlice';

const WeakTopicsScreen = ({ onBack, onNavigateToSetup, onPracticeWeakTopic }) => {
  const dispatch = useDispatch();
  const { weakAreas } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const handlePracticeTopic = (tech, topic) => {
    onPracticeWeakTopic(tech, topic);
  };

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity className="mr-3 w-10 h-10 rounded-full bg-bgCard border border-borderLight items-center justify-center" onPress={onBack}>
          <Feather name="arrow-left" size={18} color="#202124" />
        </TouchableOpacity>
        <View className="ml-1">
          <Text className="text-textMain text-2xl font-black">Weak-Topic Analyzer</Text>
          <Text className="text-textMuted text-xs mt-0.5">Grouped incorrect attempts by priority focus areas</Text>
        </View>
      </View>

      {weakAreas.length > 0 ? (
        <View className="space-y-3 mb-12">
          {weakAreas.map((item, index) => (
            <View key={index} className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-3">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-3 flex-1 mr-4">
                  <View className="w-10 h-10 rounded-full bg-googleRed/10 items-center justify-center">
                    <Feather name="alert-circle" size={18} color="#ea4335" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-textMain text-base font-black" numberOfLines={1}>{item.topic}</Text>
                    <Text className="text-textMuted text-xs font-bold mt-0.5">
                      {item.technology}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-googleRed rounded-full px-4 py-2"
                  onPress={() => handlePracticeTopic(item.technology, item.topic)}
                >
                  <Text className="text-white text-xs font-black">Re-test</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center py-20 px-6">
          <View className="w-16 h-16 bg-googleGreen/10 rounded-full items-center justify-center mb-4">
            <Feather name="award" size={32} color="#34a853" />
          </View>
          <Text className="text-textMain text-lg font-black text-center">A+ Standings!</Text>
          <Text className="text-textMuted text-xs text-center mt-2 leading-relaxed">
            You do not have any weak topics under 80% accuracy in your historic quiz attempts. Keep it up!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default WeakTopicsScreen;
