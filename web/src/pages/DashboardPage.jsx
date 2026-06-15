import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Target, BookOpen, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import { fetchDashboard, generateQuiz, clearError } from '../store/authSlice';
import { getLocalDateString } from '../utils/date';

const StatCard = ({ icon: Icon, color, label, value, sub, className = '' }) => (
  <div className={`group bg-bgCard border border-borderLight rounded-2xl p-4 flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300 cursor-pointer ${className}`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-black text-textMain leading-none transition-colors duration-300">{value}</p>
      <p className="text-textMuted text-[10px] font-bold uppercase tracking-wider mt-1 group-hover:text-textMain transition-colors">{label}</p>
      {sub && <p className="text-googleBlue text-[10px] font-bold mt-1">{sub}</p>}
    </div>
  </div>
);

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, stats, recentTechs, weakAreas, dashboardLoading, error } = useSelector((s) => s.auth);
  const [loadingArea, setLoadingArea] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(clearError());
  }, [dispatch]);

  const today = getLocalDateString();
  const practisedToday = user?.lastActiveDate === today;

  const handlePractice = async (area) => {
    setLoadingArea(area.topic);
    const result = await dispatch(generateQuiz({
      technology: area.technology,
      difficulty: 'Intermediate',
      count: 5,
      specificTopic: area.topic
    }));
    setLoadingArea(null);
    if (generateQuiz.fulfilled.match(result)) {
      navigate('/quiz/play');
    }
  };

  if (dashboardLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-googleBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-xl font-black text-textMain">
            {practisedToday ? '🔥' : '👋'} Hey, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-textMuted text-xs mt-1">
            {practisedToday ? "You've practiced today. Keep the streak alive!" : "Start a quiz to build your streak today."}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-googleRed/10 border border-googleRed/20 rounded-2xl px-4 py-3">
          <p className="text-googleRed text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Streak banner */}
      <div
        onClick={() => navigate('/streak')}
        className={`group rounded-2xl p-4 border flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer ${practisedToday
          ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60 hover:shadow-orange-500/10'
          : 'bg-bgCard border-borderLight hover:border-googleBlue/40 hover:shadow-googleBlue/10'
          }`}
      >
        <div className="text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{practisedToday ? '🔥' : '❄️'}</div>
        <div className="flex-1">
          <p className="text-textMain font-black text-base">{user?.streak || 0}-Day Streak</p>
          <p className={`text-xs font-semibold mt-0.5 transition-colors ${practisedToday ? 'text-orange-400 group-hover:text-orange-300' : 'text-textMuted group-hover:text-textMain'}`}>
            {practisedToday ? 'Streak active today!' : 'Complete a quiz to protect your streak!'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          className="col-span-2"
          icon={Target}
          color="bg-googleBlue/15 text-googleBlue"
          label="Overall Accuracy"
          value={`${stats.accuracy}%`}
          sub={stats.accuracy >= 80 ? '🏆 Excellent!' : stats.accuracy >= 50 ? '📈 Keep going' : '💪 Keep practicing'}
        />
        <StatCard
          icon={BookOpen}
          color="bg-googleGreen/15 text-googleGreen"
          label="Quizzes"
          value={stats.totalQuizzes}
        />
        <StatCard
          icon={Zap}
          color="bg-googleYellow/15 text-googleYellow"
          label="Answers"
          value={stats.totalQuestions}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Recent Technologies */}
        <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={12} className="text-googleBlue" />
            </div>
            <h2 className="text-textMain font-black text-[11px] uppercase tracking-wider">Recent Technologies</h2>
          </div>
          {recentTechs.length === 0 ? (
            <p className="text-textMuted text-xs text-center py-4">No quizzes yet. Start practicing!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentTechs.map((tech) => (
                <span key={tech} className="bg-googleBlue/10 border border-googleBlue/20 text-googleBlue text-[10px] font-bold px-2.5 py-1 rounded-full group-hover:bg-googleBlue/20 transition-colors">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleRed/10 hover:border-googleRed/40 transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-googleRed/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target size={12} className="text-googleRed" />
            </div>
            <h2 className="text-textMain font-black text-[11px] uppercase tracking-wider">Areas to Improve</h2>
          </div>
          {weakAreas.length === 0 ? (
            <p className="text-textMuted text-xs text-center py-4">No weak areas found yet. Keep practicing!</p>
          ) : (
            <div className="space-y-2">
              {weakAreas.slice(0, 3).map((area, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-borderLight last:border-0 group/item hover:bg-white/5 px-2 rounded-lg transition-colors -mx-2">
                  <div>
                    <p className="text-textMain text-sm font-semibold group-hover/item:text-googleBlue transition-colors">{area.topic}</p>
                    <p className="text-textMuted text-[10px]">{area.technology}</p>
                  </div>
                  <button
                    disabled={loadingArea === area.topic}
                    onClick={() => handlePractice(area)}
                    className="bg-googleRed/10 border border-googleRed/20 hover:bg-googleRed hover:text-white rounded-xl px-3 py-1.5 text-[11px] font-bold text-googleRed transition-all duration-200 flex items-center gap-1 disabled:opacity-50"
                  >
                    {loadingArea === area.topic ? (
                      <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Practice'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div
        onClick={() => navigate('/quiz')}
        className="bg-googleBlue/10 hover:bg-googleBlue/20 border border-googleBlue/20 hover:border-googleBlue/50 rounded-2xl p-4 cursor-pointer flex items-center justify-between transition-all duration-300 group mt-2 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/20"
      >
        <div>
          <p className="text-textMain font-black text-sm group-hover:text-googleBlue transition-colors">Ready for a challenge?</p>
          <p className="text-textMuted text-[11px] mt-0.5 group-hover:text-textMain transition-colors">Generate an AI-powered quiz.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-googleBlue shadow-lg shadow-googleBlue/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}
