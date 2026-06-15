import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, Zap, ArrowRight, RotateCcw } from 'lucide-react';
import { submitQuiz, clearQuiz, fetchDashboard } from '../store/authSlice';
import { getLocalDateString } from '../utils/date';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPlayPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quiz, quizResult } = useSelector((s) => s.auth);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-textMuted">No active quiz. Please set one up first.</p>
        <button onClick={() => navigate('/quiz')} className="text-googleBlue font-bold text-sm hover:underline">
          Go to Quiz Setup
        </button>
      </div>
    );
  }

  const questions = quiz.questions || [];

  if (quizResult) {
    const score = attempts.filter((a) => a.isCorrect).length;
    const pct = Math.round((score / questions.length) * 100);
    const isPerfect = score === questions.length;
    return (
      <div className="relative overflow-hidden w-full max-w-lg mx-auto">
        {pct >= 80 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => {
              const left = Math.random() * 100;
              const delay = Math.random() * 4;
              const size = Math.random() * 1.5 + 1;
              const emoji = ['⭐', '✨', '🎉', '🔥'][Math.floor(Math.random() * 4)];
              return (
                <div
                  key={i}
                  className="absolute bottom-0 text-2xl animate-confetti"
                  style={{
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    fontSize: `${size}rem`,
                  }}
                >
                  {emoji}
                </div>
              );
            })}
          </div>
        )}

        <div className="animate-slide-up">
          <div className="group bg-bgCard border border-borderLight rounded-[2rem] p-6 text-center hover:-translate-y-1 hover:shadow-2xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300 relative overflow-hidden">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
              pct >= 80 ? 'bg-googleGreen/15 border-2 border-googleGreen' : pct >= 50 ? 'bg-orange-500/15' : 'bg-googleRed/15'
            }`}>
              <Award size={36} className={isPerfect ? 'text-googleYellow' : pct >= 80 ? 'text-googleGreen' : pct >= 50 ? 'text-orange-400' : 'text-googleRed'} />
            </div>
            <h2 className="text-3xl font-black text-textMain">
              {isPerfect ? 'Perfect Mastery! 👑' : `${pct}%`}
            </h2>
          <p className="text-textMuted text-sm mt-1 mb-6">
            {score} / {questions.length} correct
          </p>

          {quizResult.newBadges?.length > 0 && (
            <div className="bg-googleGreen/10 border border-googleGreen/20 rounded-2xl p-4 mb-5">
              <p className="text-googleGreen font-black text-sm mb-1">🏆 New Achievement{quizResult.newBadges.length > 1 ? 's' : ''} Unlocked!</p>
              <p className="text-textMain text-xs">{quizResult.newBadges.join(', ')}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 bg-googleBlue/10 border border-googleBlue/20 rounded-2xl p-3 mb-6">
            <Zap size={16} className="text-googleBlue" />
            <p className="text-googleBlue font-bold text-sm">+{quizResult.xpGained} XP earned</p>
          </div>

          <div className="space-y-2 text-left mb-6 max-h-52 overflow-y-auto scrollbar-hide">
            {attempts.map((att, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                att.isCorrect ? 'bg-googleGreen/5 border-googleGreen/20' : 'bg-googleRed/5 border-googleRed/20'
              }`}>
                {att.isCorrect
                  ? <CheckCircle size={14} className="text-googleGreen mt-0.5 shrink-0" />
                  : <XCircle size={14} className="text-googleRed mt-0.5 shrink-0" />
                }
                <div>
                  <p className="text-textMain text-xs font-semibold">{att.question}</p>
                  {!att.isCorrect && (
                    <p className="text-textMuted text-[10px] mt-0.5">Correct: {att.correctAnswer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { dispatch(clearQuiz()); navigate('/quiz'); }}
              className="flex-1 flex items-center justify-center gap-2 border border-borderLight text-textMain font-bold text-sm py-3 rounded-2xl hover:border-googleBlue/40 transition-colors"
            >
              <RotateCcw size={14} /> New Quiz
            </button>
            <button
              onClick={() => { dispatch(clearQuiz()); dispatch(fetchDashboard()); navigate('/'); }}
              className="flex-1 flex items-center justify-center gap-2 bg-googleBlue text-white font-bold text-sm py-3 rounded-2xl hover:bg-googleBlue/90 transition-colors"
            >
              Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }

  const q = questions[current];
  const options = q?.options || [];
  const progress = ((current) / questions.length) * 100;

  const handleSelect = (opt) => {
    if (answered) return;
    const correctOption = q.options[q.correctAnswer];
    setSelected(opt);
    setAnswered(true);
    setAttempts((prev) => [...prev, {
      question: q.question,
      selectedAnswer: opt,
      correctAnswer: correctOption,
      isCorrect: opt === correctOption,
      topic: q.topic || 'General',
    }]);
  };

  const handleNext = async () => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setSubmitting(true);
      const score = [...attempts].filter((a) => a.isCorrect).length;
      await dispatch(submitQuiz({
        technology: quiz.technology || 'General',
        difficulty: quiz.difficulty || 'Intermediate',
        score,
        totalQuestions: questions.length,
        attempts,
        clientDate: getLocalDateString(),
        specificTopic: quiz.specificTopic,
      }));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-textMuted text-sm font-semibold">{current + 1} / {questions.length}</p>
        <p className="text-textMuted text-sm">{quiz.technology} · {quiz.difficulty}</p>
      </div>
      <div className="w-full h-1.5 bg-borderLight rounded-full overflow-hidden">
        <div
          className="h-full bg-googleBlue rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="group bg-bgCard border border-borderLight rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <p className="text-textMain font-black text-lg leading-relaxed group-hover:text-googleBlue transition-colors duration-300">{q?.question}</p>
        {q?.topic && (
          <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-googleBlue bg-googleBlue/10 border border-googleBlue/20 px-2.5 py-1 rounded-full">
            {q.topic}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt, i) => {
          const correctOption = q.options[q.correctAnswer];
          const isCorrect = answered && opt === correctOption;
          const isWrong = answered && opt === selected && opt !== correctOption;
          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                isCorrect
                  ? 'bg-googleGreen/10 border-googleGreen/40 text-googleGreen'
                  : isWrong
                  ? 'bg-googleRed/10 border-googleRed/40 text-googleRed'
                  : answered
                  ? 'bg-bgCard border-borderLight text-textMuted opacity-60'
                  : 'group bg-bgCard border-borderLight text-textMain hover:border-googleBlue/40 hover:bg-googleBlue/5 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-googleBlue/10'
              }`}
            >
              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 transition-transform duration-300 ${
                !answered ? 'group-hover:scale-110 group-hover:border-googleBlue' : ''
              } ${
                isCorrect ? 'border-googleGreen' : isWrong ? 'border-googleRed' : 'border-borderLight'
              }`}>
                {isCorrect ? <CheckCircle size={14} /> : isWrong ? <XCircle size={14} /> : OPTION_LABELS[i]}
              </span>
              <span className="font-semibold text-sm">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Next */}
      {answered && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="w-full mt-2 bg-googleBlue text-white font-black text-sm uppercase tracking-wider rounded-2xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-googleBlue/20 hover:bg-googleBlue/90 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : current + 1 < questions.length ? (<>Next Question <ArrowRight size={15} /></>) : (<>Finish Quiz <Award size={15} /></>)}
        </button>
      )}
    </div>
  );
}
