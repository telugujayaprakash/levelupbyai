import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Flame, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, Calendar, ArrowLeft, Award, Zap } from 'lucide-react';
import { fetchDashboard } from '../store/authSlice';
import { getLocalDateString } from '../utils/date';
import API from '../services/api';

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

export default function StreakPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, lastActiveDate, dashboardLoading } = useSelector((s) => s.auth);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  // Calendar navigation state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  useEffect(() => {
    dispatch(fetchDashboard());

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
  }, [dispatch]);

  const streakCount = user?.streak || 0;
  const todayStr = getLocalDateString();
  const practicedToday = user?.lastActiveDate === todayStr;

  // Calendar calculations
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const hasPracticed = (dateStr) => {
    return sessions.some((s) => getLocalDateOfTimestamp(s.completedAt) === dateStr);
  };

  const selectedDateSessions = sessions.filter(
    (s) => getLocalDateOfTimestamp(s.completedAt) === selectedDate
  );

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Calendar grid construction
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ key: `empty-${i}`, dayNum: null });
  }
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

  const formatSelectedHeader = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Orange Card Header (Duolingo-like card styling) */}
      <div className="relative bg-gradient-to-br from-orange-400 to-orange-500 rounded-[2.5rem] p-8 shadow-xl text-white overflow-hidden">
        {/* Header toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="font-black text-sm tracking-wide">Streak Dashboard</span>
        </div>

        {/* Details Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
          <div>
            <span className="inline-block bg-white/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/10 mb-3">
              Streak Society Member
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{streakCount} Day Streak!</h1>
            <p className="text-white/95 text-sm font-semibold mt-2">
              {practicedToday
                ? 'Great job! You completed a quiz today to keep the flame active.'
                : 'Practice any quiz today to secure and build your streak.'}
            </p>
          </div>

          <div className="w-24 h-24 md:w-32 md:h-32 bg-white/95 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg shrink-0 select-none">
            {streakCount > 0 ? (
              <Flame size={56} className="text-[#e6a200] fill-[#e6a200] animate-pulse" />
            ) : (
              <Flame size={56} className="text-textMuted/55" />
            )}
          </div>
        </div>

        {/* Protection card banner */}
        <div className="bg-bgCard/95 border border-borderLight text-textMain rounded-2xl p-4 flex items-center gap-4 mt-8">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            practicedToday ? 'bg-googleGreen/10 text-googleGreen' : 'bg-googleYellow/10 text-googleYellow'
          }`}>
            {practicedToday ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          </div>
          <div>
            <p className="font-black text-xs">Streak Safety Guard</p>
            <p className="text-textMuted text-[10px] mt-0.5 leading-relaxed">
              {practicedToday
                ? 'Locked in for today! Check back tomorrow to keep building the streak.'
                : 'Your daily streak resets at midnight if no practice quizzes are submitted. Do a quick 5-question test now!'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar on left, Activity on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Card */}
        <div className="lg:col-span-7 bg-bgCard border border-borderLight rounded-3xl p-6 shadow-sm">
          <h2 className="text-textMain font-black text-base mb-6">Streak Calendar</h2>

          {/* Navigation Month */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-bgMain rounded-xl border border-borderLight text-textMuted transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="text-textMain font-black text-sm">
              {MONTHS[calMonth]} {calYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-bgMain rounded-xl border border-borderLight text-textMuted transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday columns */}
          <div className="grid grid-cols-7 gap-y-2 text-center text-textMuted text-xs font-black mb-4">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Day Cells grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-googleBlue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-y-3.5 justify-items-center">
              {calendarCells.map((cell) => {
                if (cell.dayNum === null) {
                  return <div key={cell.key} className="w-9 h-9" />;
                }

                let textStyle = 'text-textMain';
                let cellStyle = 'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:border-googleBlue/40';

                if (cell.isPracticed) {
                  cellStyle += ' bg-googleYellow/15 border-2 border-googleYellow';
                  textStyle = 'text-[#e6a200] font-black';
                } else {
                  cellStyle += ' bg-bgMain border border-borderLight';
                }

                if (cell.isSelected) {
                  cellStyle += ' ring-2 ring-googleBlue ring-offset-2 ring-offset-bgCard';
                }

                if (cell.isToday && !cell.isPracticed) {
                  textStyle = 'text-googleBlue font-bold';
                  cellStyle += ' border-googleBlue';
                }

                return (
                  <button
                    key={cell.key}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={cellStyle}
                  >
                    <span className={textStyle}>{cell.dayNum}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Activity details */}
        <div className="lg:col-span-5 bg-bgCard border border-borderLight rounded-3xl p-6 shadow-sm flex flex-col min-h-[350px]">
          <h2 className="text-textMain font-black text-base mb-2">Practice Activity</h2>
          <p className="text-textMuted text-[11px] mb-5">{formatSelectedHeader(selectedDate)}</p>

          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-6 h-6 border-2 border-googleBlue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedDateSessions.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {selectedDateSessions.map((session) => (
                <div key={session._id} className="bg-bgMain border border-borderLight rounded-2xl p-4 flex items-center justify-between group hover:border-googleBlue/40 transition-colors">
                  <div>
                    <h4 className="text-textMain font-black text-sm group-hover:text-googleBlue transition-colors">{session.technology}</h4>
                    <p className="text-textMuted text-[10px] font-bold mt-1 uppercase tracking-wider">
                      {session.difficulty} • {formatActivityTime(session.completedAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-googleGreen font-black text-sm flex items-center gap-1">
                      <Award size={13} /> {session.score} / {session.totalQuestions}
                    </span>
                    <div className="bg-googleBlue/10 text-googleBlue text-[8px] font-black px-2 py-0.5 rounded-md mt-1.5 uppercase flex items-center gap-0.5">
                      <Zap size={9} /> +{session.score * 10 + 50 + (session.score === session.totalQuestions ? 100 : 0)} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-borderLight rounded-2xl bg-bgMain">
              <Calendar className="text-textMuted mb-3" size={28} />
              <p className="text-textMain font-black text-sm">No activity recorded</p>
              <p className="text-textMuted text-[10px] mt-1.5 leading-relaxed max-w-[200px]">
                Complete an AI quiz to verify your daily subject knowledge and locked-in streak!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
