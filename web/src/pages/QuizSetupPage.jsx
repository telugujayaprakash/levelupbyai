import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Cpu, BarChart2, Hash, Search, ChevronRight, Loader2 } from 'lucide-react';
import { generateQuiz } from '../store/authSlice';

const TECHNOLOGIES = [
  'JavaScript','TypeScript','Python','Java','React','Node.js','Express',
  'MongoDB','SQL','PostgreSQL','MySQL','HTML/CSS','C++','C#','PHP',
  'Spring Boot','Django','FastAPI','Docker','Kubernetes',
];

const DIFFICULTIES = ['Foundation','Basic','Intermediate','Hard','Advanced'];
const COUNTS = [5, 10, 15, 20];

export default function QuizSetupPage() {
  const [tech, setTech] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizLoading, error } = useSelector((s) => s.auth);

  const filtered = TECHNOLOGIES.filter((t) => t.toLowerCase().includes(search.toLowerCase()));

  const handleGenerate = async () => {
    if (!tech) return;
    const result = await dispatch(generateQuiz({ technology: tech, difficulty, count, specificTopic: topic }));
    if (generateQuiz.fulfilled.match(result)) navigate('/quiz/play');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-textMain">New Quiz</h1>
        <p className="text-textMuted text-xs">Configure your AI-powered practice session</p>
      </div>

      {error && (
        <div className="bg-googleRed/10 border border-googleRed/20 rounded-2xl px-4 py-3">
          <p className="text-googleRed text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Technology */}
      <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Cpu size={12} className="text-googleBlue" />
          </div>
          <h2 className="text-textMain font-black text-[11px] uppercase tracking-wider">Technology</h2>
        </div>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            className="w-full bg-bgMain border border-borderLight focus:border-googleBlue text-textMain text-sm rounded-xl pl-9 pr-4 py-2.5 transition-colors"
            placeholder="Search technology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-hide">
          {filtered.map((t) => (
            <button
              key={t}
              onClick={() => setTech(t)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all duration-150 ${
                tech === t
                  ? 'bg-googleBlue text-white border-googleBlue shadow-lg shadow-googleBlue/20'
                  : 'bg-bgMain border-borderLight text-textMuted hover:border-googleBlue/50 hover:text-textMain'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart2 size={12} className="text-googleBlue" />
          </div>
          <h2 className="text-textMain font-black text-[11px] uppercase tracking-wider">Difficulty</h2>
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all duration-150 ${
                difficulty === d
                  ? 'bg-googleBlue text-white border-googleBlue'
                  : 'bg-bgMain border-borderLight text-textMuted hover:text-textMain hover:border-googleBlue/40'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Count + Topic */}
      <div className="grid grid-cols-1 gap-4">
        <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Hash size={12} className="text-googleBlue" />
            </div>
            <h2 className="text-textMain font-black text-[11px] uppercase tracking-wider">Questions</h2>
          </div>
          <div className="flex gap-2">
            {COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`flex-1 py-2.5 text-sm font-black rounded-xl border transition-all ${
                  count === c
                    ? 'bg-googleBlue text-white border-googleBlue'
                    : 'bg-bgMain border-borderLight text-textMuted hover:text-textMain'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
          <h2 className="text-textMain font-black text-[11px] uppercase tracking-wider mb-3 group-hover:text-googleBlue transition-colors">Specific Topic <span className="text-textMuted font-normal normal-case text-[10px] group-hover:text-textMain transition-colors">(optional)</span></h2>
          <input
            type="text"
            className="w-full bg-bgMain border border-borderLight focus:border-googleBlue text-textMain text-sm rounded-xl px-4 py-2.5 transition-colors"
            placeholder="e.g. Promises, Hooks..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!tech || quizLoading}
        className="w-full bg-googleBlue hover:bg-[#1557b0] text-white font-black text-sm uppercase tracking-wider rounded-2xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-googleBlue/20 disabled:opacity-50 disabled:pointer-events-none"
      >
        {quizLoading ? (
          <><Loader2 size={16} className="animate-spin" /> Generating with AI…</>
        ) : (
          <>{tech ? `Generate ${count} ${tech} Questions` : 'Select a Technology First'} <ChevronRight size={16} /></>
        )}
      </button>
    </div>
  );
}
