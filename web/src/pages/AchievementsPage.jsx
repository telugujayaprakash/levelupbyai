import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Award, CheckCircle, X, Share2, Copy, Check } from 'lucide-react';
import { fetchDashboard } from '../store/authSlice';

export default function AchievementsPage() {
  const dispatch = useDispatch();
  const { achievements, achievementsProgress, user } = useSelector((s) => s.auth);
  const [activeBadge, setActiveBadge] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { dispatch(fetchDashboard()); }, [dispatch]);

  const handleCopy = (badge) => {
    navigator.clipboard.writeText(`🏆 I earned the "${badge.name}" practice badge on Level Up! I've successfully completed: "${badge.desc}". Join me and build your developer streak! 🚀🧠`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const earnedNames = achievements.map((a) => a.badge);
  const locked = achievementsProgress
    .filter((p) => !earnedNames.includes(p.name))
    .sort((a, b) => (b.current / b.target) - (a.current / a.target));
  const unlocked = achievementsProgress.filter((p) => earnedNames.includes(p.name));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-textMain">Achievements</h1>
        <p className="text-textMuted text-xs">Track your milestones and earn achievements</p>
      </div>

      {/* Summary */}
      <div className="group bg-yellow-500/10 border-2 border-b-4 border-yellow-500/20 rounded-3xl p-5 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/10 hover:border-yellow-500/40 transition-all duration-300">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-200 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
          <Award size={28} className="text-white" />
        </div>
        <div>
          <p className="text-textMain font-black text-2xl leading-none group-hover:text-yellow-400 transition-colors duration-300">{unlocked.length} <span className="text-textMuted text-base font-semibold">/ {achievementsProgress.length}</span></p>
          <p className="text-yellow-500 text-[11px] font-bold uppercase tracking-wider mt-1 group-hover:text-yellow-400 transition-colors">Unlocked</p>
        </div>
        <div className="ml-auto w-1/4">
          <div className="w-full h-3 bg-bgMain rounded-full overflow-hidden border border-borderLight">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${achievementsProgress.length > 0 ? (unlocked.length / achievementsProgress.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-textMuted text-[10px] mt-2 text-right font-black uppercase">
            {achievementsProgress.length > 0 ? Math.round((unlocked.length / achievementsProgress.length) * 100) : 0}% Done
          </p>
        </div>
      </div>

      {/* In Progress */}
      {locked.length > 0 && (
        <div className="mt-8">
          <h2 className="text-textMain font-black text-sm uppercase tracking-wider mb-4">In Progress — Keep Going! 💪</h2>
          <div className="grid grid-cols-1 gap-4">
            {locked.map((badge) => {
              const pct = Math.round((badge.current / badge.target) * 100);
              const remaining = badge.target - badge.current;
              return (
                <div key={badge.name} className="group bg-bgCard border-2 border-b-4 border-borderLight rounded-3xl p-5 flex items-center gap-5 hover:-translate-y-1 hover:border-b-[4px] hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/30 transition-all duration-300 cursor-pointer">
                  {/* Gamified locked icon container */}
                  <div className="w-16 h-16 rounded-full bg-bgMain border-4 border-borderLight flex items-center justify-center text-3xl shrink-0 grayscale opacity-50 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-textMain font-black text-[15px] group-hover:text-googleBlue transition-colors duration-300">{badge.name}</p>
                      <span className="text-textMuted text-xs font-black shrink-0 ml-2 group-hover:text-textMain transition-colors">{badge.current} / {badge.target}</span>
                    </div>
                    <p className="text-textMuted text-xs mb-3">{badge.desc}</p>
                    
                    {/* Thick Progress bar */}
                    <div className="w-full h-3 bg-bgMain rounded-full overflow-hidden border border-borderLight relative">
                      <div
                        className="h-full bg-googleBlue rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    
                    <p className="text-googleBlue text-[11px] font-bold mt-2 tracking-wide uppercase">
                      {remaining === 0 ? '🎉 Almost there!' : `Just ${remaining} more to unlock!`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {unlocked.length > 0 && (
        <div className="mt-8">
          <h2 className="text-textMain font-black text-sm uppercase tracking-wider mb-4">Unlocked 🏆</h2>
          <div className="grid grid-cols-1 gap-4">
            {unlocked.map((badge) => (
              <div key={badge.name} onClick={() => setActiveBadge(badge)} className="group relative bg-yellow-500/5 border-2 border-b-4 border-yellow-500/30 rounded-3xl p-5 flex items-center gap-5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-500/20 hover:border-yellow-500/60 transition-all duration-300 cursor-pointer overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                
                {/* Gamified unlocked icon */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-yellow-200 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-orange-500/20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 z-10">
                  {badge.icon}
                </div>
                <div className="flex-1 z-10">
                  <p className="text-textMain font-black text-[15px] group-hover:text-yellow-400 transition-colors duration-300">{badge.name}</p>
                  <p className="text-textMuted text-xs mt-1 group-hover:text-textMain transition-colors">{badge.desc}</p>
                </div>
                <CheckCircle size={24} className="text-yellow-400 shrink-0 group-hover:scale-125 transition-transform duration-300 z-10" />
              </div>
            ))}
          </div>
        </div>
      )}

      {achievementsProgress.length === 0 && (
        <div className="text-center py-12 bg-bgCard border-2 border-borderLight rounded-3xl">
          <p className="text-textMuted text-sm font-bold">Complete your first quiz to start earning achievements!</p>
        </div>
      )}
      {/* Premium Web Share Modal */}
      {activeBadge && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white border-4 border-yellow-500 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center animate-slide-up text-center">
            <button 
              onClick={() => setActiveBadge(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-bgCard hover:bg-borderLight border border-borderLight flex items-center justify-center transition-colors"
            >
              <X size={16} className="text-textMuted" />
            </button>
            
            {/* Sparkles */}
            <div className="flex justify-center gap-6 absolute -top-8 w-full select-none">
              <span className="text-2xl animate-bounce">✨</span>
              <span className="text-3xl">🏆</span>
              <span className="text-2xl animate-bounce">✨</span>
            </div>

            <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-4 border-yellow-500/40 flex items-center justify-center text-5xl mb-4 mt-4 shadow-inner">
              {activeBadge.icon}
            </div>

            <h3 className="text-textMain font-black text-xl mb-1">{activeBadge.name}</h3>
            <span className="text-googleGreen text-xs font-black uppercase tracking-wider mb-4">Milestone Unlocked!</span>

            <div className="bg-bgCard border border-borderLight rounded-2xl p-4 w-full mb-6">
              <p className="text-textMuted text-xs font-semibold leading-relaxed">{activeBadge.desc}</p>
              <div className="border-t border-borderLight my-3 w-full" />
              <div className="flex justify-around items-center">
                <div>
                  <p className="text-textMuted text-[8px] font-black uppercase">Champion</p>
                  <p className="text-textMain text-sm font-black mt-0.5 truncate max-w-[80px]">{user?.name?.split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-textMuted text-[8px] font-black uppercase">Level</p>
                  <p className="text-googleBlue text-sm font-black mt-0.5">{user?.level || 1}</p>
                </div>
                <div>
                  <p className="text-textMuted text-[8px] font-black uppercase">XP</p>
                  <p className="text-googleYellow text-sm font-black mt-0.5">{user?.xp || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleCopy(activeBadge)}
                className={`flex-1 py-3.5 rounded-xl font-bold text-xs uppercase transition-all duration-300 border flex items-center justify-center gap-1.5 ${
                  copied 
                    ? 'bg-googleGreen/15 border-googleGreen/30 text-googleGreen' 
                    : 'bg-bgCard border-borderLight text-textMain hover:border-googleBlue/40'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Info'}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `🏆 I earned the "${activeBadge.name}" practice badge on Level Up! I've successfully completed "${activeBadge.desc}". Join me and build your developer streak! 🚀🧠 #LevelUp`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-googleBlue hover:bg-[#1557b0] text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-googleBlue/20"
              >
                <Share2 size={14} /> Share
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
