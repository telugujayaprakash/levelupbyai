import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const StatCard = ({ title, value, icon, iconColor = '#1a73e8', colorClass = 'bg-googleBlue/10' }) => {
  return (
    <View className="flex-1 bg-bgCard border border-borderLight rounded-2xl p-3 flex-row items-center space-x-3">
      <View className={`w-9 h-9 rounded-full ${colorClass} items-center justify-center`}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] text-textMuted font-bold uppercase">{title}</Text>
        <Text className="text-sm text-textMain font-black mt-0.5" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
};

export default StatCard;
