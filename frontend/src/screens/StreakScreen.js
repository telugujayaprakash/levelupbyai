import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import API from '../services/api';
import { getLocalDateString } from '../utils/date';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const getLocalDateOfTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const StreakScreen = ({ onBack, streakCount = 0, lastActiveDate = '' }) => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  
  // Calendar month/year navigation state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await API.get('/stats/history');
        setSessions(response);
      } catch (error) {
        console.error('Failed to load history for streak calendar:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Timezone-safe practiced today check
  const todayStr = getLocalDateString();
  const practicedToday = lastActiveDate === todayStr;

  // Calendar calculations
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(y => y - 1);
    } else {
      setCalMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(y => y + 1);
    } else {
      setCalMonth(m => m + 1);
    }
  };

  // Check if a specific YYYY-MM-DD had quiz completions
  const hasPracticed = (dateStr) => {
    return sessions.some(s => getLocalDateOfTimestamp(s.completedAt) === dateStr);
  };

  // Get activities for selected date
  const selectedDateSessions = sessions.filter(
    s => getLocalDateOfTimestamp(s.completedAt) === selectedDate
  );

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  };

  // Generate calendar days
  const calendarCells = [];
  // Empty offset days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `empty-${i}`, dayNum: null });
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      key: `day-${d}`,
      dayNum: d,
      dateStr,
      isPracticed: hasPracticed(dateStr),
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate
    });
  }

  // Format header display date
  const formatSelectedHeader = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ScrollView className="flex-1 bg-bgMain">
      <View className="bg-[#e28743] pt-12 pb-6 px-5 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center" 
            onPress={onBack}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-black tracking-tight">Streak Details</Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-row items-center justify-between mt-2 mb-4">
          <View>
            <View className="bg-white/25 px-3 py-1 rounded-full self-start mb-2">
              <Text className="text-white text-[9px] font-black uppercase tracking-wider">Streak Society</Text>
            </View>
            <Text className="text-white text-4xl font-black">{streakCount} Day</Text>
            <Text className="text-white text-lg font-bold mt-1">streak active!</Text>
          </View>
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-lg border-4 border-white/40">
            {streakCount > 0 ? (
              <FontAwesome5 name="fire" size={48} color="#e6a200" />
            ) : (
              <Feather name="wind" size={44} color="#8E9AA8" />
            )}
          </View>
        </View>

        <View className="bg-bgCard/95 border border-borderLight rounded-2xl p-4 flex-row items-center space-x-3.5 mt-2">
          <View className="w-10 h-10 rounded-xl bg-googleBlue/10 items-center justify-center">
            <Feather name="shield" size={20} color="#1a73e8" />
          </View>
          <View className="flex-1">
            <Text className="text-textMain text-xs font-black">Streak Protect Enabled</Text>
            <Text className="text-textMuted text-[10px] mt-0.5 leading-relaxed">
              {practicedToday 
                ? "Your streak is protected for today. Great job practicing!"
                : "Complete any quiz today to secure your streak flame."}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-6">
        <Text className="text-textMain text-lg font-black mb-4">Streak Calendar</Text>

        <View className="bg-bgCard border border-borderLight rounded-3xl p-5 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={handlePrevMonth} className="p-1">
              <Feather name="chevron-left" size={20} color="#8E9AA8" />
            </TouchableOpacity>
            <Text className="text-textMain text-base font-black">
              {MONTHS[calMonth]} {calYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} className="p-1">
              <Feather name="chevron-right" size={20} color="#8E9AA8" />
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-2">
            {WEEKDAYS.map((day) => (
              <Text key={day} className="flex-1 text-center text-textMuted text-xs font-black">
                {day}
              </Text>
            ))}
          </View>

          {loading ? (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="small" color="#1a73e8" />
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {calendarCells.map((cell) => {
                if (cell.dayNum === null) {
                  return <View key={cell.key} className="w-[14.28%] h-10" />;
                }

                let textStyle = 'text-textMain';
                let cellStyle = 'rounded-full items-center justify-center w-8 h-8 self-center';
                let wrapStyle = 'w-[14.28%] h-10 justify-center items-center my-0.5';

                if (cell.isPracticed) {
                  cellStyle += ' bg-googleYellow/20 border-2 border-googleYellow';
                  textStyle = 'text-[#e6a200] font-black';
                }

                if (cell.isSelected) {
                  cellStyle += ' border-2 border-googleBlue';
                }

                if (cell.isToday && !cell.isPracticed) {
                  textStyle = 'text-googleBlue font-bold';
                }

                return (
                  <TouchableOpacity
                    key={cell.key}
                    className={wrapStyle}
                    onPress={() => setSelectedDate(cell.dateStr)}
                  >
                    <View className={cellStyle}>
                      <Text className={`text-xs font-bold ${textStyle}`}>{cell.dayNum}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <Text className="text-textMain text-sm font-black mb-3">
          Activity for {formatSelectedHeader(selectedDate)}
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color="#1a73e8" className="py-6" />
        ) : selectedDateSessions.length > 0 ? (
          <View className="space-y-3 mb-12">
            {selectedDateSessions.map((session) => (
              <View key={session._id} className="bg-bgCard border border-borderLight rounded-2xl p-4 flex-row justify-between items-center">
                <View className="flex-1 mr-4">
                  <Text className="text-textMain text-sm font-black">{session.technology}</Text>
                  <Text className="text-textMuted text-[10px] font-bold uppercase tracking-wider mt-0.5">
                    {session.difficulty} • {formatActivityTime(session.completedAt)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-googleGreen text-sm font-black">
                    {session.score} / {session.totalQuestions}
                  </Text>
                  <View className="bg-googleBlue/10 px-2 py-0.5 rounded-md mt-1">
                    <Text className="text-googleBlue text-[8px] font-black uppercase">
                      +{session.score * 10 + 50 + (session.score === session.totalQuestions ? 100 : 0)} XP
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-bgCard border border-dashed border-borderLight rounded-2xl p-6 items-center justify-center mb-12">
            <Feather name="calendar" size={24} color="#8E9AA8" className="mb-2" />
            <Text className="text-textMuted text-xs text-center leading-relaxed">
              No quiz activities logged on this date.
            </Text>
            <Text className="text-textMuted text-[10px] text-center mt-1">
              Practicing daily locks in your daily streak!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default StreakScreen;
