import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Modal, Share, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { fetchDashboard } from '../redux/authSlice';

const AchievementsScreen = () => {
  const dispatch = useDispatch();
  const { achievementsProgress, dashboardLoading, user } = useSelector((state) => state.auth);
  const [activeBadge, setActiveBadge] = useState(null);

  const handleShare = async (badge) => {
    try {
      await Share.share({
        message: `🏆 I earned the "${badge.name}" practice badge on Level Up! I've successfully completed "${badge.desc}". Join me and build your daily developer streak! 🚀🧠 #LevelUpApp`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (dashboardLoading && (!achievementsProgress || achievementsProgress.length === 0)) {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center">
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  const progressList = achievementsProgress || [];
  const completedBadges = progressList.filter(item => item.current >= item.target);
  const lockedBadges = progressList.filter(item => item.current < item.target);

  // Sort locked badges by progress percentage descending (closest to unlock first)
  const sortedLockedBadges = [...lockedBadges].sort((a, b) => {
    const ratioA = a.current / a.target;
    const ratioB = b.current / b.target;
    return ratioB - ratioA;
  });

  const completionPercent = progressList.length > 0
    ? Math.round((completedBadges.length / progressList.length) * 100)
    : 0;

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      <Text className="text-textMain text-2xl font-black">Practice Badges</Text>
      <Text className="text-textMuted text-xs mt-1 mb-6">Unlock achievements by practicing and maintaining streaks</Text>

      {/* Overview Card */}
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-6 shadow-xl">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center space-x-3">
            <View className="w-10 h-10 rounded-full bg-googleBlue/15 items-center justify-center">
              <Feather name="award" size={20} color="#1a73e8" />
            </View>
            <View>
              <Text className="text-textMain text-sm font-black">Unlocked Milestones</Text>
              <Text className="text-textMuted text-xs font-bold mt-0.5">
                {completedBadges.length} of {progressList.length} completed
              </Text>
            </View>
          </View>
          <View className="bg-googleBlue/10 px-3 py-1 rounded-full border border-googleBlue/20">
            <Text className="text-googleBlue text-[11px] font-black">{completionPercent}% done</Text>
          </View>
        </View>

        {/* Global Progress Bar */}
        <View className="w-full h-2 bg-[#dadce0] rounded-full overflow-hidden">
          <View
            className="h-full bg-googleBlue"
            style={{ width: `${completionPercent}%` }}
          />
        </View>
      </View>

      {/* Locked / In Progress Badges */}
      <Text className="text-textMain text-lg font-bold mb-3">Up Next (Near Completion)</Text>
      {sortedLockedBadges.length > 0 ? (
        <View className="space-y-3 mb-6">
          {sortedLockedBadges.map((badge) => {
            const ratio = badge.current / badge.target;
            const percentage = Math.round(ratio * 100);
            const remaining = badge.target - badge.current;

            return (
              <View key={badge.name} className="bg-bgCard border border-borderLight rounded-3xl p-5 flex-col shadow-md">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row space-x-3 flex-1 mr-4 items-center">
                    <View className="w-11 h-11 rounded-2xl bg-borderLight items-center justify-center">
                      <Text className="text-lg opacity-40">{badge.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-textMain text-sm font-black">{badge.name}</Text>
                      <Text className="text-textMuted text-xs mt-0.5 leading-relaxed">{badge.desc}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-textMain text-xs font-black">{badge.current} / {badge.target}</Text>
                    <Text className="text-textMuted text-[8px] font-bold uppercase mt-0.5">Progress</Text>
                  </View>
                </View>

                {/* Progress bar and details */}
                <View className="flex-row items-center space-x-3">
                  <View className="flex-1 h-1.5 bg-bgMain border border-borderLight rounded-full overflow-hidden">
                    <View
                      className="h-full bg-googleYellow"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="text-googleYellow text-[10px] font-black">{percentage}%</Text>
                </View>

                {/* Duolingo Motivation Indicator */}
                <View className="mt-3 pt-2.5 border-t border-borderLight flex-row items-center space-x-1.5">
                  <Feather name="zap" size={10} color="#fbbc04" />
                  <Text className="text-textMuted text-[10px] font-bold">
                    Just <Text className="text-googleYellow font-black">{remaining}</Text> more {badge.name.includes('Streak') ? 'streak day(s)' : badge.name.includes('Quiz') ? 'quiz(zes)' : badge.name.includes('Question') ? 'question(s)' : 'practice session(s)'} to unlock!
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="bg-bgCard border border-borderLight rounded-3xl p-6 mb-6 items-center justify-center">
          <Feather name="check-circle" size={24} color="#34a853" />
          <Text className="text-textMain text-sm font-black mt-2">All Badges Unlocked!</Text>
          <Text className="text-textMuted text-xs text-center mt-1">Excellent work, you are a master learner!</Text>
        </View>
      )}

      {/* Completed Badges */}
      <Text className="text-textMain text-lg font-bold mb-3 mt-4">Completed Badges</Text>
      {completedBadges.length > 0 ? (
        <View className="space-y-3 mb-12">
          {completedBadges.map((badge) => (
            <TouchableOpacity 
              key={badge.name} 
              className="bg-googleGreen/10 border border-googleGreen/20 rounded-3xl p-5 flex-row items-center justify-between shadow-md active:opacity-85"
              onPress={() => setActiveBadge(badge)}
            >
              <View className="flex-row space-x-3 flex-1 mr-4 items-center">
                <View className="w-11 h-11 rounded-2xl bg-googleGreen/20 items-center justify-center border border-googleGreen/30">
                  <Text className="text-xl">{badge.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-textMain text-sm font-black">{badge.name}</Text>
                  <Text className="text-textMuted text-xs mt-0.5 leading-relaxed">{badge.desc}</Text>
                </View>
              </View>
              <View className="w-8 h-8 rounded-full bg-googleGreen/20 items-center justify-center border border-googleGreen/30">
                <Feather name="check" size={14} color="#34a853" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="bg-bgCard border border-borderLight border-dashed rounded-3xl p-6 mb-12 items-center justify-center">
          <Text className="text-textMuted text-xs text-center leading-relaxed">
            No completed badges yet. Practicing more technologies and unlocking daily streaks to earn your first gold badge!
          </Text>
        </View>
      )}
      {/* Shareable Badge Modal */}
      <Modal
        visible={activeBadge !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveBadge(null)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white rounded-[2.5rem] p-6 w-full max-w-[340px] border-4 border-googleYellow shadow-2xl relative items-center overflow-hidden">
            <TouchableOpacity 
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-bgCard border border-borderLight items-center justify-center z-10"
              onPress={() => setActiveBadge(null)}
            >
              <Feather name="x" size={16} color="#5f6368" />
            </TouchableOpacity>

            {/* Sparkles */}
            <View className="flex-row justify-center space-x-12 absolute -top-8 w-full">
              <Text className="text-2xl">✨</Text>
              <Text className="text-3xl">🏆</Text>
              <Text className="text-2xl">✨</Text>
            </View>

            {/* Badge Icon */}
            <View className="w-24 h-24 rounded-full bg-googleYellow/15 border-4 border-googleYellow/40 items-center justify-center mb-4 mt-4 shadow-inner">
              <Text className="text-5xl">{activeBadge?.icon}</Text>
            </View>

            {/* Content Info */}
            <Text className="text-textMain text-xl font-black text-center mb-1">{activeBadge?.name}</Text>
            <Text className="text-googleGreen text-xs font-black uppercase tracking-wider mb-3">Completed Achievement</Text>
            
            <View className="bg-bgCard border border-borderLight rounded-2xl p-4 w-full mb-6 items-center">
              <Text className="text-textMuted text-xs text-center leading-relaxed font-bold">{activeBadge?.desc}</Text>
              <View className="w-full border-t border-borderLight my-3" />
              
              {/* User stats */}
              <View className="flex-row justify-around w-full">
                <View className="items-center">
                  <Text className="text-textMuted text-[8px] font-black uppercase">Champion</Text>
                  <Text className="text-textMain text-sm font-black mt-0.5" numberOfLines={1}>{user?.name?.split(' ')[0] || 'Learner'}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-textMuted text-[8px] font-black uppercase">Level</Text>
                  <Text className="text-googleBlue text-sm font-black mt-0.5">{user?.level || 1}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-textMuted text-[8px] font-black uppercase">Total XP</Text>
                  <Text className="text-googleYellow text-sm font-black mt-0.5">{user?.xp || 0}</Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View className="flex-row space-x-3 w-full">
              <TouchableOpacity
                className="flex-1 bg-bgCard border border-borderLight py-3.5 rounded-2xl items-center justify-center"
                onPress={() => setActiveBadge(null)}
              >
                <Text className="text-textMain text-xs font-black uppercase">Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-googleBlue py-3.5 rounded-2xl flex-row items-center justify-center space-x-1.5 shadow-lg shadow-googleBlue/20"
                onPress={() => {
                  const b = activeBadge;
                  setActiveBadge(null);
                  handleShare(b);
                }}
              >
                <Feather name="share-2" size={13} color="#FFFFFF" />
                <Text className="text-white text-xs font-black uppercase">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AchievementsScreen;
