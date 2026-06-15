import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Award, AlertCircle, Settings, LogOut, Zap } from 'lucide-react';
import { logout } from '../store/authSlice';
import logo from '../assets/levelUp-logo.png';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/achievements', icon: Award, label: 'Achievements' },
  { to: '/weak-topics', icon: AlertCircle, label: 'Weak Topics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-bgCard border-r border-borderLight flex flex-col shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-borderLight">
        <img src={logo} alt="Level Up" className="w-9 h-9 rounded-xl object-contain" />
        <div>
          <p className="text-textMain font-black text-base leading-none">Level Up</p>
          <p className="text-googleBlue text-[10px] font-bold uppercase tracking-widest mt-0.5">in tech</p>
        </div>
      </div>

      {/* User badge */}
      {user && (
        <div className="mx-4 mt-4 bg-bgMain border border-borderLight rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-googleBlue/20 border border-googleBlue/30 flex items-center justify-center text-googleBlue font-black text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-textMain text-sm font-bold truncate">{user.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap size={10} className="text-googleBlue" />
              <p className="text-textMuted text-[10px]">Level {user.level} · {user.xp} XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-googleBlue text-white border border-googleBlue/20'
                  : 'text-textMuted hover:text-textMain hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-googleBlue' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-textMuted hover:text-googleRed hover:bg-googleRed/5 transition-all duration-200"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
