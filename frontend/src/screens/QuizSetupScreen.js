import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { updateTech, updateDifficulty, updateCount, generateQuizAction } from '../redux/quizSlice';

const TECHNOLOGIES = [
  'JavaScript', 'TypeScript', 'React', 'React Native', 'Java', 'Spring Boot', 'SQL', 
  'Docker', 'Kubernetes', 'HTML', 'CSS', 'Python', 'Django', 'Go', 'Node.js', 
  'Express', 'Git', 'AWS', 'Rust', 'C++'
];

const DIFFICULTIES_DATA = [
  {
    key: 'Foundation',
    emoji: '🌱',
    title: 'Foundation',
    desc: 'Introductory syntax, terms & language concepts',
    level: 1,
    color: '#34a853',
  },
  {
    key: 'Basic',
    emoji: '⚡',
    title: 'Basic',
    desc: 'Control flow, basic data structures & routines',
    level: 2,
    color: '#fbbc04',
  },
  {
    key: 'Intermediate',
    emoji: '🧠',
    title: 'Intermediate',
    desc: 'Core APIs, design problems & everyday usage',
    level: 3,
    color: '#1a73e8',
  },
  {
    key: 'Hard',
    emoji: '🔥',
    title: 'Hard',
    desc: 'Algorithmic efficiency, debugging & concurrency',
    level: 4,
    color: '#e28743',
  },
  {
    key: 'Advanced',
    emoji: '🏆',
    title: 'Advanced',
    desc: 'Enterprise patterns, security & optimization',
    level: 5,
    color: '#ea4335',
  },
];

const COUNTS_DATA = [
  { count: 5, label: 'Quick', duration: '⏱️ ~3m' },
  { count: 10, label: 'Standard', duration: '⏱️ ~7m' },
  { count: 20, label: 'Deep Dive', duration: '⏱️ ~15m' },
  { count: 30, label: 'Marathon', duration: '⏱️ ~25m' },
];

const getTechIcon = (tech, isSelected) => {
  const defaultColor = isSelected ? '#FFFFFF' : '#1a73e8';
  switch (tech) {
    case 'JavaScript':
      return <FontAwesome5 name="js" size={13} color={isSelected ? '#FFFFFF' : '#f7df1e'} />;
    case 'TypeScript':
      return <MaterialCommunityIcons name="language-typescript" size={15} color={isSelected ? '#FFFFFF' : '#3178c6'} />;
    case 'React':
    case 'React Native':
      return <FontAwesome5 name="react" size={13} color={isSelected ? '#FFFFFF' : '#61dafb'} />;
    case 'Java':
      return <FontAwesome5 name="java" size={13} color={isSelected ? '#FFFFFF' : '#f89820'} />;
    case 'Spring Boot':
      return <FontAwesome5 name="leaf" size={13} color={isSelected ? '#FFFFFF' : '#6db33f'} />;
    case 'SQL':
      return <FontAwesome5 name="database" size={13} color={isSelected ? '#FFFFFF' : '#4479a1'} />;
    case 'Docker':
      return <FontAwesome5 name="docker" size={13} color={isSelected ? '#FFFFFF' : '#2496ed'} />;
    case 'Kubernetes':
      return <MaterialCommunityIcons name="kubernetes" size={15} color={isSelected ? '#FFFFFF' : '#326ce5'} />;
    case 'HTML':
      return <FontAwesome5 name="html5" size={13} color={isSelected ? '#FFFFFF' : '#e34f26'} />;
    case 'CSS':
      return <FontAwesome5 name="css3-alt" size={13} color={isSelected ? '#FFFFFF' : '#1572b6'} />;
    case 'Python':
      return <FontAwesome5 name="python" size={13} color={isSelected ? '#FFFFFF' : '#3776ab'} />;
    case 'Django':
      return <MaterialCommunityIcons name="django" size={15} color={isSelected ? '#FFFFFF' : '#092e20'} />;
    case 'Go':
      return <MaterialCommunityIcons name="language-go" size={15} color={isSelected ? '#FFFFFF' : '#00add8'} />;
    case 'Node.js':
      return <FontAwesome5 name="node-js" size={13} color={isSelected ? '#FFFFFF' : '#339933'} />;
    case 'Express':
      return <Feather name="server" size={13} color={isSelected ? '#FFFFFF' : '#4e4e4e'} />;
    case 'Git':
      return <FontAwesome5 name="git-alt" size={13} color={isSelected ? '#FFFFFF' : '#f05032'} />;
    case 'AWS':
      return <FontAwesome5 name="aws" size={13} color={isSelected ? '#FFFFFF' : '#ff9900'} />;
    case 'Rust':
      return <MaterialCommunityIcons name="language-rust" size={15} color={isSelected ? '#FFFFFF' : '#000000'} />;
    case 'C++':
      return <MaterialCommunityIcons name="language-cpp" size={15} color={isSelected ? '#FFFFFF' : '#00599c'} />;
    default:
      return <Feather name="code" size={13} color={defaultColor} />;
  }
};

const QuizSetupScreen = ({ onQuizGenerated, onBack }) => {
  const dispatch = useDispatch();
  const { selectedTech, selectedDifficulty, selectedCount } = useSelector((state) => state.quiz);

  const handleGenerate = async () => {
    dispatch(generateQuizAction({
      technology: selectedTech,
      difficulty: selectedDifficulty,
      count: selectedCount,
      specificTopic: null // Always general quiz configuration from this screen
    })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        onQuizGenerated();
      } else {
        alert(res.payload || 'Failed to generate quiz.');
      }
    });
  };

  const renderLevelDots = (level, isSelected, activeColor) => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <View 
          key={i} 
          className={`w-1.5 h-1.5 rounded-full mx-0.5 ${
            i <= level 
              ? (isSelected ? 'bg-white' : '') 
              : (isSelected ? 'bg-white/30' : 'bg-borderLight')
          }`}
          style={(!isSelected && i <= level) ? { backgroundColor: activeColor } : {}}
        />
      );
    }
    return <View className="flex-row items-center">{dots}</View>;
  };

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity 
          className="mr-3 w-10 h-10 rounded-full bg-white border border-borderLight items-center justify-center shadow-sm"
          style={styles.floatingButtonShadow}
          onPress={onBack}
        >
          <Feather name="arrow-left" size={18} color="#202124" />
        </TouchableOpacity>
        <View className="ml-1">
          <Text className="text-textMain text-2xl font-black">Configure Practice</Text>
          <Text className="text-textMuted text-xs mt-0.5">Customize your AI-powered quiz</Text>
        </View>
      </View>

      {/* Choose Technology Grid */}
      <Text className="text-textMain text-base font-black mb-3">Select Technology</Text>
      <View className="flex-row flex-wrap mb-6">
        {TECHNOLOGIES.map((tech) => {
          const isSelected = selectedTech === tech;
          return (
            <TouchableOpacity
              key={tech}
              className={`flex-row items-center px-4 py-2.5 rounded-full mr-2 mb-2 border ${
                isSelected 
                  ? 'bg-googleBlue border-transparent' 
                  : 'bg-white border-borderLight'
              }`}
              style={isSelected ? styles.activeBlueShadow : styles.inactivePillShadow}
              onPress={() => dispatch(updateTech(tech))}
            >
              <View className="mr-1.5">
                {getTechIcon(tech, isSelected)}
              </View>
              <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-textMain'}`}>
                {tech}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Choose Difficulty Selection */}
      <Text className="text-textMain text-base font-black mb-3">Choose Difficulty</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="flex-row mb-6 py-1"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {DIFFICULTIES_DATA.map((diff) => {
          const isSelected = selectedDifficulty === diff.key;
          return (
            <TouchableOpacity
              key={diff.key}
              className={`w-[170px] h-[125px] rounded-3xl p-4 mr-3 border flex-col justify-between ${
                isSelected 
                  ? 'bg-googleBlue border-transparent' 
                  : 'bg-white border-borderLight'
              }`}
              style={isSelected ? styles.activeBlueShadow : styles.inactiveCardShadow}
              onPress={() => dispatch(updateDifficulty(diff.key))}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-xl">{diff.emoji}</Text>
                {renderLevelDots(diff.level, isSelected, diff.color)}
              </View>
              <View className="mt-2 flex-1 justify-end">
                <Text className={`text-sm font-black ${isSelected ? 'text-white' : 'text-textMain'}`}>
                  {diff.title}
                </Text>
                <Text 
                  numberOfLines={2} 
                  className={`text-[9px] font-medium leading-relaxed mt-0.5 ${
                    isSelected ? 'text-white/85' : 'text-textMuted'
                  }`}
                >
                  {diff.desc}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Question Count Selection */}
      <Text className="text-textMain text-base font-black mb-3">Questions Count</Text>
      <View className="flex-row space-x-2.5 mb-8">
        {COUNTS_DATA.map((item) => {
          const isSelected = selectedCount === item.count;
          return (
            <TouchableOpacity
              key={item.count}
              className={`flex-1 py-3.5 border rounded-2xl items-center justify-center flex-col ${
                isSelected 
                  ? 'bg-googleBlue border-transparent' 
                  : 'bg-white border-borderLight'
              }`}
              style={isSelected ? styles.activeBlueShadow : styles.inactivePillShadow}
              onPress={() => dispatch(updateCount(item.count))}
            >
              <Text className={`text-base font-black ${isSelected ? 'text-white' : 'text-textMain'}`}>
                {item.count}
              </Text>
              <Text className={`text-[8px] font-bold mt-0.5 ${isSelected ? 'text-white/80' : 'text-textMuted'}`}>
                {item.duration}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        className="bg-googleBlue rounded-2xl py-4 items-center justify-center mb-12 flex-row border-b-4 border-[#0d59c2]"
        style={styles.generateButtonShadow}
        onPress={handleGenerate}
      >
        <Feather name="zap" size={16} color="#FFFFFF" className="mr-1.5" />
        <Text className="text-white text-sm font-black uppercase tracking-wider">Generate Practice Quiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  floatingButtonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  inactivePillShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inactiveCardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activeBlueShadow: {
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  generateButtonShadow: {
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
});

export default QuizSetupScreen;
