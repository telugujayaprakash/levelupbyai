import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from './services/api';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QuizSetupPage from './pages/QuizSetupPage';
import QuizPlayPage from './pages/QuizPlayPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import WeakTopicsPage from './pages/WeakTopicsPage';
import SettingsPage from './pages/SettingsPage';
import StreakPage from './pages/StreakPage';

// Restore token from localStorage on boot
const savedToken = localStorage.getItem('token');
if (savedToken) API.setToken(savedToken);

function AuthGuard({ children }) {
  const { token } = useSelector((s) => s.auth);
  if (!token && !savedToken) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="weak-topics" element={<WeakTopicsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="streak" element={<StreakPage />} />
          <Route path="quiz" element={<QuizSetupPage />} />
          <Route path="quiz/play" element={<QuizPlayPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
