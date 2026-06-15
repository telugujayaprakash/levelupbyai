import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectAnswer, submitAnswer, nextQuestion, resetQuiz, generateQuizAction, submitQuizAction } from '../redux/quizSlice';

const AnimatedStar = ({ star }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(star.delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        })
      ])
    ).start();
  }, [anim, star.delay]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 650]
  });
  
  const opacity = anim.interpolate({
    inputRange: [0, 0.15, 0.85, 1],
    outputRange: [0, 1, 1, 0]
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${star.left}%`,
        transform: [{ translateY }, { rotate }],
        opacity,
        zIndex: 99,
      }}
    >
      <Text style={{ fontSize: star.size }}>{star.emoji}</Text>
    </Animated.View>
  );
};

const QuizPlayScreen = ({ onBackToDashboard }) => {
  const dispatch = useDispatch();
  const {
    quizState,
    questions,
    currentQuestionIndex,
    selectedAnswerIndex,
    isAnswerSubmitted,
    score,
    currentAttempts,
    completedSession,
    errorMessage,
    selectedTech,
    selectedDifficulty,
    selectedCount,
    specificTopic
  } = useSelector((state) => state.quiz);

  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (completedSession) {
      const newStars = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        left: Math.random() * 80 + 10,
        delay: Math.random() * 1500,
        size: Math.random() * 18 + 14,
        emoji: ['⭐', '✨', '🎉', '🔥'][Math.floor(Math.random() * 4)]
      }));
      setStars(newStars);
    } else {
      setStars([]);
    }
  }, [completedSession]);

  const handleRetry = () => {
    dispatch(generateQuizAction({
      technology: selectedTech,
      difficulty: selectedDifficulty,
      count: selectedCount,
      specificTopic
    }));
  };

  const handleFinish = () => {
    dispatch(submitQuizAction({
      technology: selectedTech,
      difficulty: selectedDifficulty,
      score,
      totalQuestions: questions.length,
      attempts: currentAttempts
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      dispatch(nextQuestion());
    } else {
      handleFinish();
    }
  };

  if (quizState === 'loading') {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center px-6">
        <View className="w-24 h-24 bg-googleBlue/10 border border-googleBlue/20 rounded-full items-center justify-center mb-6 shadow-2xl shadow-googleBlue/50">
          <ActivityIndicator size="large" color="#1a73e8" />
        </View>
        <Text className="text-textMain text-lg font-black tracking-tight text-center">Assembling AI Practice Hub...</Text>
        <Text className="text-textMuted text-xs text-center mt-2 leading-relaxed max-w-[260px]">
          Synthesizing {selectedTech} code challenges, customized correct scenarios, and topic validation rules.
        </Text>
      </View>
    );
  }

  if (quizState === 'error') {
    return (
      <View className="flex-1 bg-bgMain items-center justify-center px-6">
        <View className="mb-4">
          <Feather name="alert-triangle" size={44} color="#ea4335" />
        </View>
        <Text className="text-textMain text-lg font-black text-center">Oops, Action Failed</Text>
        <Text className="text-textMuted text-xs text-center mt-2 leading-relaxed">{errorMessage}</Text>
        <TouchableOpacity
          className="bg-googleBlue rounded-full px-8 py-3 mt-6"
          onPress={handleRetry}
        >
          <Text className="text-white text-xs font-black uppercase">Retry Generation</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Quiz Results View
  if (completedSession) {
    const accuracy = Math.round((score / questions.length) * 100);
    const xpGained = score * 10 + 50 + (score === questions.length ? 100 : 0);
    
    // Extract unique strong and weak topics from active attempts
    const strongTopics = [...new Set(currentAttempts.filter(a => a.isCorrect).map(a => a.topic))];
    const weakTopics = [...new Set(currentAttempts.filter(a => !a.isCorrect).map(a => a.topic))];

    const isPerfect = score === questions.length;
    return (
      <View className="flex-1 bg-bgMain relative">
        {stars.map((star) => (
          <AnimatedStar key={star.id} star={star} />
        ))}
        <ScrollView className="flex-1 px-6 py-8">
          <View className="items-center mt-6 mb-4">
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 border-2 ${
              isPerfect ? 'bg-googleYellow/15 border-googleYellow' : 'bg-googleBlue/10 border-googleBlue/20'
            }`}>
              <Feather name={isPerfect ? "crown" : "award"} size={36} color={isPerfect ? "#fbbc04" : "#1a73e8"} />
            </View>
            <Text className="text-textMain text-2xl font-black">
              {isPerfect ? 'Perfect Mastery! 👑' : 'Practice Complete!'}
            </Text>
            {isPerfect && (
              <Text className="text-googleYellow text-[10px] font-black uppercase mt-1 tracking-wider">Flawless 100% Score</Text>
            )}
          </View>

        {/* Results Card */}
        <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-6 flex-row justify-around">
          <View className="items-center">
            <Text className="text-textMuted text-[10px] font-bold uppercase">Score</Text>
            <Text className="text-[#1a73e8] text-xl font-black mt-1">{score} / {questions.length}</Text>
          </View>
          <View className="items-center">
            <Text className="text-textMuted text-[10px] font-bold uppercase">Accuracy</Text>
            <Text className={`text-xl font-black mt-1 ${accuracy >= 80 ? 'text-googleGreen' : 'text-googleRed'}`}>{accuracy}%</Text>
          </View>
          <View className="items-center">
            <Text className="text-textMuted text-[10px] font-bold uppercase">XP Awarded</Text>
            <Text className="text-[#FF9800] text-xl font-black mt-1">+{xpGained} XP</Text>
          </View>
        </View>

        {/* Topics list */}
        <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-6 space-y-4">
          {strongTopics.length > 0 && (
            <View>
              <Text className="text-googleGreen text-xs font-black uppercase mb-2.5">Strong Topics Discovered:</Text>
              {strongTopics.map((topic, i) => (
                <View key={i} className="flex-row items-center space-x-2 mb-1.5">
                  <Feather name="check" size={12} color="#34a853" />
                  <Text className="text-textMain text-xs font-bold">{topic}</Text>
                </View>
              ))}
            </View>
          )}

          {weakTopics.length > 0 && (
            <View>
              <Text className="text-googleRed text-xs font-black uppercase mb-2.5">Weak Topics (Action Needed):</Text>
              {weakTopics.map((topic, i) => (
                <View key={i} className="flex-row items-center space-x-2 mb-1.5">
                  <Feather name="x" size={12} color="#ea4335" />
                  <Text className="text-textMain text-xs font-bold">{topic}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action button */}
        <View className="space-y-3 mb-12">
          <TouchableOpacity
            className="bg-googleBlue rounded-2xl py-3.5 items-center"
            onPress={handleRetry}
          >
            <Text className="text-white text-sm font-black uppercase">Retry Same Setup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-bgMain border border-borderLight rounded-2xl py-3.5 items-center"
            onPress={() => {
              dispatch(resetQuiz());
              onBackToDashboard();
            }}
          >
            <Text className="text-textMain text-sm font-bold uppercase">Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
  }

  // Active question play view
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <ScrollView className="flex-1 bg-bgMain px-4 py-6">
      {/* Progress header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-textMain text-xs font-bold">
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <Text className="text-googleBlue text-xs font-black uppercase">{selectedDifficulty}</Text>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-1.5 bg-[#dadce0] rounded-full overflow-hidden mb-4">
        <View
          className="h-full bg-googleBlue"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </View>

      {/* Subtopic focused tag */}
      <View className="bg-googleBlue/10 border border-googleBlue/20 rounded-xl px-3 py-2 self-start mb-4">
        <Text className="text-textMain text-xs font-bold">Topic: {currentQuestion.topic}</Text>
      </View>

      {/* Question Card */}
      <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-4 shadow-xl">
        <Text className="text-textMain text-base font-black leading-relaxed">
          {currentQuestion.question}
        </Text>
      </View>

      {/* 4 Interactive Option Cards */}
      <View className="space-y-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedAnswerIndex === idx;
          const isCorrect = idx === currentQuestion.correctAnswer;
          const letter = ['A', 'B', 'C', 'D'][idx];

          let optionStyle = 'bg-bgCard border-borderLight';
          let letterBg = 'bg-[#dadce0]';
          let letterText = 'text-textMuted';

          if (isAnswerSubmitted) {
            if (isCorrect) {
              optionStyle = 'bg-googleGreen/10 border-googleGreen';
              letterBg = 'bg-googleGreen';
              letterText = 'text-white';
            } else if (isSelected) {
              optionStyle = 'bg-googleRed/10 border-googleRed';
              letterBg = 'bg-googleRed';
              letterText = 'text-white';
            }
          } else if (isSelected) {
            optionStyle = 'bg-googleBlue/10 border-googleBlue';
            letterBg = 'bg-googleBlue';
            letterText = 'text-white';
          }

          return (
            <TouchableOpacity
              key={idx}
              className={`border rounded-2xl p-4 flex-row items-center space-x-3 ${optionStyle}`}
              onPress={() => dispatch(selectAnswer(idx))}
              disabled={isAnswerSubmitted}
            >
              <View className={`w-8 h-8 rounded-full items-center justify-center ${letterBg}`}>
                <Text className={`text-xs font-black ${letterText}`}>{letter}</Text>
              </View>
              <Text className="text-textMain text-sm font-bold flex-1">{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Contextual wrong / correct explanation display */}
      {isAnswerSubmitted && (
        <View className={`rounded-3xl p-5 mb-6 ${
          selectedAnswerIndex === currentQuestion.correctAnswer 
            ? 'bg-googleGreen/10 border border-googleGreen/20' 
            : 'bg-googleRed/10 border border-googleRed/20'
        }`}>
          <Text className={`text-sm font-black uppercase mb-2 ${
            selectedAnswerIndex === currentQuestion.correctAnswer ? 'text-googleGreen' : 'text-googleRed'
          }`}>
            {selectedAnswerIndex === currentQuestion.correctAnswer ? 'Correct Response' : 'Incorrect Response'}
          </Text>

          <Text className="text-textMain text-xs leading-relaxed font-bold">
            Correct Explanation: {currentQuestion.correctExplanation}
          </Text>

          {selectedAnswerIndex !== currentQuestion.correctAnswer && currentQuestion.wrongExplanations?.[selectedAnswerIndex] && (
            <Text className="text-googleRed text-xs font-bold leading-relaxed mt-2">
              Why selected was wrong: {currentQuestion.wrongExplanations[selectedAnswerIndex]}
            </Text>
          )}
        </View>
      )}

      {/* Footer Navigation Button */}
      {!isAnswerSubmitted ? (
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center justify-center mb-12 ${
            selectedAnswerIndex !== null ? 'bg-googleBlue' : 'bg-[#dadce0]'
          }`}
          onPress={() => dispatch(submitAnswer())}
          disabled={selectedAnswerIndex === null}
        >
          <Text className={`text-sm font-black uppercase ${
            selectedAnswerIndex !== null ? 'text-white' : 'text-textMuted'
          }`}>Submit Answer</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="bg-googleBlue rounded-2xl py-4 items-center justify-center mb-12"
          onPress={handleNext}
        >
          <Text className="text-white text-sm font-black uppercase">
            {currentQuestionIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default QuizPlayScreen;
