import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Edit3, Check, Shield, Key, Loader2, AlertCircle } from 'lucide-react';
import { fetchSettings, saveSettings, updateProfileName } from '../store/authSlice';
import API from '../services/api';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { settings, user } = useSelector((s) => s.auth);

  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [provider, setProvider] = useState('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [keyFocused, setKeyFocused] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);
  // eslint-disable-next-line
  useEffect(() => { if (user?.name) setDisplayName(user.name); }, [user]);
  // eslint-disable-next-line
  useEffect(() => { if (settings) { setProvider(settings.provider || 'Gemini'); setApiKey(settings.apiKey || ''); } }, [settings]);

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSavingName(true);
    await dispatch(updateProfileName({ name: displayName.trim() }));
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleSaveKey = async () => {
    setSavingKey(true);
    await dispatch(saveSettings({ provider, apiKey }));
    setSavingKey(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await API.post('/settings/test', { provider, apiKey });
      setTestResult(res.success ? 'success' : 'fail');
    } catch { setTestResult('fail'); }
    finally { setTesting(false); }
  };

  const maskedKey = keyFocused || !apiKey ? apiKey : '••••••••' + apiKey.slice(-4);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-textMain">Settings</h1>
        <p className="text-textMuted text-xs">Manage your profile and AI credentials</p>
      </div>

      {/* Profile */}
      <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <User size={12} className="text-googleBlue" />
          </div>
          <h2 className="text-googleBlue font-black text-[11px] uppercase tracking-wider">User Profile</h2>
        </div>

        <div className="mb-4">
          <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider mb-2">Email Address</label>
          <div className="flex items-center bg-bgMain border border-borderLight rounded-xl px-4 py-3 opacity-60">
            <Mail size={14} className="text-textMuted mr-3" />
            <p className="text-textMuted text-sm">{user?.email || '—'}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider mb-2">Display Name</label>
          <div className="flex items-center bg-bgMain border border-borderLight focus-within:border-googleBlue rounded-xl px-4 py-0.5 transition-colors">
            <Edit3 size={14} className="text-textMuted mr-3 shrink-0" />
            <input
              type="text"
              className="flex-1 text-textMain text-sm py-3 bg-transparent"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <p className="text-textMuted text-[10px] mt-1 ml-1">This name appears on your dashboard and achievements.</p>
        </div>

        <button
          onClick={handleSaveName}
          disabled={savingName}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            nameSaved
              ? 'bg-googleGreen/15 border border-googleGreen/30 text-googleGreen'
              : 'bg-googleBlue/15 border border-googleBlue/30 text-googleBlue hover:bg-googleBlue/20'
          }`}
        >
          {savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {nameSaved ? 'Saved!' : 'Save Display Name'}
        </button>
      </div>

      {/* AI Key */}
      <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-googleBlue/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Key size={12} className="text-googleBlue" />
          </div>
          <h2 className="text-googleBlue font-black text-[11px] uppercase tracking-wider">AI Setup</h2>
        </div>

        {/* Provider toggle */}
        <div className="flex bg-bgMain border border-borderLight rounded-2xl p-1 mb-4">
          {['Gemini', 'OpenAI'].map((p) => (
            <button
              key={p}
              onClick={() => { setProvider(p); setTestResult(null); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                provider === p ? 'bg-googleBlue text-white' : 'text-textMuted hover:text-textMain'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="bg-googleBlue/8 border border-googleBlue/15 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2">
          <AlertCircle size={13} className="text-googleBlue mt-0.5 shrink-0" />
          <p className="text-textMuted text-xs leading-relaxed">
            {provider === 'Gemini'
              ? 'Leave empty to use the built-in system key — perfect for getting started immediately.'
              : 'OpenAI requires a valid sk-... token to access gpt-4o-mini for question generation.'}
          </p>
        </div>

        {/* Key input */}
        <div className="mb-4">
          <label className="block text-textMuted text-[10px] font-bold uppercase tracking-wider mb-2">{provider} API Key</label>
          <input
            type="text"
            className="w-full bg-bgMain border border-borderLight focus:border-googleBlue text-textMain text-sm rounded-xl px-4 py-3 transition-colors"
            placeholder={keyFocused ? 'Paste API key' : 'Enter API key credentials'}
            value={maskedKey}
            onChange={(e) => { if (keyFocused) setApiKey(e.target.value); }}
            onFocus={() => setKeyFocused(true)}
            onBlur={() => setKeyFocused(false)}
          />
        </div>

        {/* Test result */}
        {testResult === 'success' && (
          <div className="flex items-center gap-2 bg-googleGreen/10 border border-googleGreen/20 rounded-xl px-4 py-3 mb-4">
            <Check size={14} className="text-googleGreen" />
            <p className="text-googleGreen text-xs font-bold">Connection successful! Key authorized.</p>
          </div>
        )}
        {testResult === 'fail' && (
          <div className="flex items-center gap-2 bg-googleRed/10 border border-googleRed/20 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={14} className="text-googleRed" />
            <p className="text-googleRed text-xs font-bold">Connection failed. Please check credentials.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 flex items-center justify-center gap-2 border border-borderLight text-textMain text-xs font-bold py-3 rounded-xl hover:border-googleBlue/40 transition-colors"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : null}
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          <button
            onClick={handleSaveKey}
            disabled={savingKey}
            className="flex-1 flex items-center justify-center gap-2 bg-googleBlue hover:bg-googleBlue/90 text-white text-xs font-bold py-3 rounded-xl transition-colors"
          >
            {savingKey ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Credentials
          </button>
        </div>
      </div>

      {/* Privacy */}
      <div className="group bg-bgCard border border-borderLight rounded-2xl p-4 flex gap-3 items-start mb-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-googleBlue/10 hover:border-googleBlue/40 transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-googleBlue/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Shield size={16} className="text-googleBlue" />
        </div>
        <div>
          <p className="text-textMain font-black text-xs mb-1 group-hover:text-googleBlue transition-colors duration-300">Privacy & Security</p>
          <p className="text-textMuted text-[10px] leading-relaxed group-hover:text-textMain transition-colors">
            API keys are sent securely to your sandboxed backend session. They are never shared, logged, or stored in plain text on external services.
          </p>
        </div>
      </div>
    </div>
  );
}
