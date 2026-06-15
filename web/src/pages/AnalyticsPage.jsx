import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, BarChart2, Calendar, Activity, Target, Brain } from 'lucide-react';
import { fetchAnalytics } from '../store/authSlice';

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { analytics } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-googleBlue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
    );
  }

  const { activityGraph, techStats, diffStats } = analytics;
  const maxActivity = Math.max(...activityGraph.data, 1);
  const totalQuestions = techStats.reduce((acc, t) => acc + t.totalQuestions, 0);
  const avgAccuracy = techStats.length > 0 
    ? Math.round(techStats.reduce((acc, t) => acc + t.accuracy, 0) / techStats.length) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-borderLight pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-textMain tracking-tight">Performance Analytics</h1>
          <p className="text-textMuted text-xs">Deep dive into your learning metrics and practice history.</p>
        </div>
        <div className="flex items-center gap-2 text-googleGreen bg-googleGreen/10 border border-googleGreen/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <Activity size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="group relative bg-bgCard border border-borderLight rounded-3xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-googleBlue/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-googleBlue/10 flex items-center justify-center text-googleBlue">
              <Brain size={16} />
            </div>
            <p className="text-textMuted text-[10px] font-bold uppercase tracking-wider">Questions Answered</p>
          </div>
          <p className="text-3xl font-black text-textMain relative z-10">{totalQuestions}</p>
        </div>

        <div className="group relative bg-bgCard border border-borderLight rounded-3xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleGreen/10 hover:border-googleGreen/40 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-googleGreen/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-googleGreen/10 flex items-center justify-center text-googleGreen">
              <Target size={16} />
            </div>
            <p className="text-textMuted text-[10px] font-bold uppercase tracking-wider">Avg Accuracy</p>
          </div>
          <p className="text-3xl font-black text-textMain relative z-10">{avgAccuracy}<span className="text-lg text-textMuted">%</span></p>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="group bg-bgCard border border-borderLight rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-googleBlue/20">
              <Calendar size={14} className="text-googleBlue" />
            </div>
            <h2 className="text-textMain font-black text-sm uppercase tracking-wider">7-Day Activity Trend</h2>
          </div>
        </div>
        
        <div className="relative h-48 mt-4">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-t border-dashed border-textMuted" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-end justify-between gap-2 z-10 px-2 pb-6">
            {activityGraph.data.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end">
                <div className="w-full flex justify-center items-end h-full relative">
                  <div
                    className="w-full max-w-[2.5rem] bg-gradient-to-t from-googleBlue/20 to-googleBlue/80 hover:to-googleBlue rounded-t-xl transition-all duration-500 cursor-pointer relative shadow-lg"
                    style={{ height: `${(val / maxActivity) * 100}%`, minHeight: val > 0 ? 12 : 4 }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-bgMain border border-borderLight text-textMain text-xs font-black px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-2 transition-all duration-300 pointer-events-none shadow-xl flex items-center gap-1 z-20">
                      <span>{val}</span>
                      <span className="text-[10px] text-textMuted font-normal">Qs</span>
                    </div>
                  </div>
                </div>
                <p className="text-textMuted text-[10px] font-bold uppercase absolute bottom-0">{activityGraph.labels[i]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technology Accuracy */}
        <div className="group bg-bgCard border border-borderLight rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-googleBlue/20">
              <TrendingUp size={14} className="text-googleBlue" />
            </div>
            <h2 className="text-textMain font-black text-sm uppercase tracking-wider">Skill Mastery</h2>
          </div>
          
          {techStats.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center bg-bgMain rounded-2xl border border-dashed border-borderLight">
               <p className="text-textMuted text-xs font-semibold">No data yet. Keep practicing!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {techStats.map((t) => {
                const isExcellent = t.accuracy >= 80;
                const isGood = t.accuracy >= 50 && t.accuracy < 80;
                const color = isExcellent ? 'from-googleGreen/50 to-googleGreen' : isGood ? 'from-orange-400/50 to-orange-400' : 'from-googleRed/50 to-googleRed';
                const textColor = isExcellent ? 'text-googleGreen' : isGood ? 'text-orange-400' : 'text-googleRed';
                
                return (
                  <div key={t.tech} className="relative group/skill">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-textMain text-sm font-black tracking-tight group-hover/skill:text-googleBlue transition-colors">{t.tech}</span>
                        <p className="text-textMuted text-[10px] mt-0.5">{t.totalQuestions} questions answered</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-black bg-bgMain border border-borderLight shadow-inner ${textColor}`}>
                        {t.accuracy}%
                      </div>
                    </div>
                    <div className="w-full h-3 bg-bgMain rounded-full overflow-hidden border border-borderLight/50 p-px relative">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
                        style={{ width: `${t.accuracy}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Difficulty Breakdown */}
        <div className="group bg-bgCard border border-borderLight rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleYellow/10 hover:border-googleYellow/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-googleYellow/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-googleYellow/20">
              <BarChart2 size={14} className="text-googleYellow" />
            </div>
            <h2 className="text-textMain font-black text-sm uppercase tracking-wider">By Difficulty</h2>
          </div>
          
          <div className="space-y-6">
            {diffStats.map((d) => (
              <div key={d.difficulty} className="group/diff">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-textMain text-sm font-black tracking-tight group-hover/diff:text-googleYellow transition-colors">{d.difficulty}</span>
                    <p className="text-textMuted text-[10px] mt-0.5">{d.totalQuestions} questions answered</p>
                  </div>
                  <div className="text-textMain text-xs font-black bg-bgMain border border-borderLight px-2 py-1 rounded shadow-inner">
                    {d.totalQuestions > 0 ? `${d.accuracy}%` : '—'}
                  </div>
                </div>
                <div className="w-full h-3 bg-bgMain rounded-full overflow-hidden border border-borderLight/50 p-px">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-googleYellow/50 to-googleYellow transition-all duration-1000 ease-out"
                    style={{ width: `${d.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
