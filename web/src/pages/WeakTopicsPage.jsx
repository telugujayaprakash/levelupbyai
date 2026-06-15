import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Target, ArrowRight, TrendingDown, CheckCircle, BrainCircuit } from 'lucide-react';
import { fetchDashboard, generateQuiz, clearError } from '../store/authSlice';

export default function WeakTopicsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { weakAreas, dashboardLoading, error } = useSelector((s) => s.auth);
  const [loadingArea, setLoadingArea] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(clearError());
  }, [dispatch]);

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

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-borderLight pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-textMain tracking-tight">Targeted Practice</h1>
          <p className="text-textMuted text-xs">Focus areas identified from incorrect quiz attempts</p>
        </div>
        {weakAreas.length > 0 && (
          <div className="flex items-center gap-2 text-googleRed bg-googleRed/10 border border-googleRed/20 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <Target size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{weakAreas.length} Focus Area{weakAreas.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-googleRed/10 border border-googleRed/20 rounded-2xl px-4 py-3">
          <p className="text-googleRed text-sm font-semibold">{error}</p>
        </div>
      )}

      {dashboardLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-googleBlue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        </div>
      ) : weakAreas.length === 0 ? (
        <div className="group relative bg-googleGreen/5 border-2 border-googleGreen/20 rounded-[2rem] p-12 text-center overflow-hidden hover:shadow-2xl hover:shadow-googleGreen/10 hover:border-googleGreen/40 transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
          <div className="w-24 h-24 mx-auto bg-googleGreen/10 border-4 border-googleGreen/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-googleGreen/20">
            <CheckCircle size={40} className="text-googleGreen" />
          </div>
          <h2 className="text-3xl font-black text-textMain mb-2 group-hover:text-googleGreen transition-colors">You're unstoppable!</h2>
          <p className="text-textMuted text-sm">No weak areas found. Keep crushing it!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weakAreas.map((area, i) => {
              return (
                <div key={i} className="group relative bg-bgCard border border-borderLight rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border mb-3 bg-googleRed/10 border-googleRed/30 text-googleRed">
                        {area.technology}
                      </span>
                      <h3 className="text-textMain font-black text-lg leading-tight">{area.topic}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePractice(area)}
                    disabled={loadingArea === area.topic}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all duration-300 border bg-googleRed/10 border-googleRed/30 text-googleRed hover:bg-googleRed hover:text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingArea === area.topic ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play size={14} />
                    )}
                    {loadingArea === area.topic ? 'Generating...' : 'Jump into Practice'}
                  </button>
                </div>
              );
            })}
          </div>

          <div
            onClick={() => navigate('/quiz')}
            className="group relative bg-googleBlue/10 border border-googleBlue/20 rounded-[2rem] p-6 cursor-pointer flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-googleBlue/20 hover:border-googleBlue/50 overflow-hidden mt-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
            <div className="w-12 h-12 rounded-2xl bg-googleBlue/20 border border-googleBlue/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative z-10 shadow-lg shadow-googleBlue/20">
              <BrainCircuit size={24} className="text-googleBlue" />
            </div>
            <div className="flex-1 relative z-10">
              <h3 className="text-textMain font-black text-sm group-hover:text-googleBlue transition-colors duration-300">Generate Custom Training</h3>
              <p className="text-textMuted text-xs mt-1">Start a new AI-generated quiz tailored specifically to these weak areas to improve your overall mastery.</p>
            </div>
            <ArrowRight size={20} className="text-googleBlue shrink-0 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
          </div>
        </>
      )}
    </div>
  );
}
