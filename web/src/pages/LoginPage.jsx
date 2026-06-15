import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Send, ArrowRight, Info, Edit2 } from 'lucide-react';
import { sendOtp, verifyOtp, clearError } from '../store/authSlice';
import logo from '../assets/levelUp-logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  useEffect(() => { if (token) navigate('/'); }, [token, navigate]);
  useEffect(() => { dispatch(clearError()); setSendError(''); setOtpSent(false); setOtp(''); }, [dispatch]);

  const handleSendOtp = async () => {
    if (!email.trim()) { setSendError('Please enter your email address.'); return; }
    setSendError(''); setSending(true);
    const result = await dispatch(sendOtp({ email: email.trim() }));
    setSending(false);
    if (sendOtp.fulfilled.match(result)) { setOtpSent(true); }
    else { setSendError(result.payload || 'Failed to send code. Please try again.'); }
  };

  const handleVerify = () => {
    if (!otp.trim()) return;
    dispatch(verifyOtp({ email: email.trim(), otp: otp.trim() }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgCard relative overflow-hidden">
      {/* Decorative gradient background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-googleBlue/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-googleGreen/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-googleBlue/5 flex items-center justify-center mb-6">
            <img src={logo} alt="Level Up" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-textMain text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-textMuted text-sm font-semibold text-center max-w-[280px]">
            Enter your email to receive a secure one-time passcode. No password needed.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-googleBlue/5 border border-borderLight">
          
          {/* Information banner */}
          <div className="flex items-start gap-3 bg-bgCard border border-borderLight rounded-2xl p-4 mb-6">
            <Info size={16} className="text-googleBlue mt-0.5 shrink-0" />
            <p className="text-textMuted text-xs leading-relaxed">
              If you don't have an account, one will be created automatically when you verify your email.
            </p>
          </div>

          {/* Error Message */}
          {(error || sendError) && (
            <div className="bg-googleRed/10 border border-googleRed/20 rounded-2xl px-4 py-3 mb-6">
              <p className="text-googleRed text-[11px] font-bold text-center">{error || sendError}</p>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-5">
            <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
              Email Address
            </label>
            <div className={`flex items-center bg-bgCard border rounded-2xl px-4 py-1.5 transition-colors duration-300 ${
              otpSent ? 'border-borderLight opacity-70' : 'border-borderLight focus-within:border-googleBlue focus-within:shadow-md focus-within:shadow-googleBlue/10 bg-white'
            }`}>
              <Mail size={18} className="text-textMuted mr-3 shrink-0" />
              <input
                type="email"
                className="flex-1 text-textMain text-sm py-3 bg-transparent outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setOtpSent(false); setSendError(''); }}
                disabled={otpSent}
              />
              {otpSent && (
                <button onClick={() => { setOtpSent(false); setOtp(''); }} className="text-googleBlue hover:text-googleBlue/80 p-2">
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* OTP Input */}
          {otpSent && (
            <div className="mb-6 animate-fade-in">
              <div className="flex justify-between items-center mb-2 mx-1">
                <label className="text-textMuted text-[10px] font-bold uppercase tracking-wider">Verification Code</label>
                <button onClick={handleSendOtp} disabled={sending} className="text-googleBlue text-[10px] font-bold hover:underline transition-all">
                  Resend Code
                </button>
              </div>
              <div className="flex items-center bg-white border border-borderLight focus-within:border-googleBlue focus-within:shadow-md focus-within:shadow-googleBlue/10 rounded-2xl px-4 py-1.5 transition-colors duration-300">
                <Lock size={18} className="text-textMuted mr-3 shrink-0" />
                <input
                  type="number"
                  maxLength={4}
                  className="flex-1 text-textMain text-3xl font-black py-3 bg-transparent tracking-[0.5em] outline-none"
                  placeholder="· · · ·"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 4))}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="w-full mt-2 bg-googleBlue hover:bg-[#1557b0] text-white font-bold text-sm rounded-2xl py-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-googleBlue/20 hover:shadow-xl hover:shadow-googleBlue/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-googleBlue/20"
            >
              {sending ? <span className="animate-pulse">Sending Passcode…</span> : (<><Send size={18} /> Request Passcode</>)}
            </button>
          ) : (
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full mt-2 bg-googleBlue hover:bg-[#1557b0] text-white font-bold text-sm rounded-2xl py-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-googleBlue/20 hover:shadow-xl hover:shadow-googleBlue/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-googleBlue/20"
            >
              {loading ? <span className="animate-pulse">Verifying…</span> : (<>Verify & Sign In <ArrowRight size={18} /></>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
