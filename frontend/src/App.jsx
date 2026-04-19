import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const Landing        = lazy(() => import('./pages/Landing'));
const SignIn         = lazy(() => import('./pages/auth/SignIn'));
const SignUp         = lazy(() => import('./pages/auth/SignUp'));
const Dashboard      = lazy(() => import('./pages/app/Dashboard'));
const Transactions   = lazy(() => import('./pages/app/Transactions'));
const AddTransaction = lazy(() => import('./pages/app/AddTransaction'));
const Goals          = lazy(() => import('./pages/app/Goals'));
const Reports        = lazy(() => import('./pages/app/Reports'));
const Wealth         = lazy(() => import('./pages/app/Wealth'));
const Subscriptions  = lazy(() => import('./pages/app/Subscriptions'));
const HealthScore    = lazy(() => import('./pages/app/HealthScore'));
const AIChat         = lazy(() => import('./pages/app/AIChat'));
const Leaderboard    = lazy(() => import('./pages/app/Leaderboard'));
const Settings       = lazy(() => import('./pages/app/Settings'));
const Profile        = lazy(() => import('./pages/app/Profile'));

function AppShell({ children }) {
  return (
    <AuthProvider>
      <FinanceProvider>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </FinanceProvider>
    </AuthProvider>
  );
}

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontSize:32 }}>
      ⚡
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/app/signin.html" element={<Navigate to="/signin" replace />} />
        <Route path="/app/signup.html" element={<Navigate to="/signup" replace />} />
        <Route path="/app/dashboard.html" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/transactions.html" element={<Navigate to="/app/transactions" replace />} />
        <Route path="/app/add-expense.html" element={<Navigate to="/app/add?type=expense" replace />} />
        <Route path="/app/add-income.html" element={<Navigate to="/app/add?type=income" replace />} />
        <Route path="/app/goals.html" element={<Navigate to="/app/goals" replace />} />
        <Route path="/app/reports.html" element={<Navigate to="/app/reports" replace />} />
        <Route path="/app/wealth.html" element={<Navigate to="/app/wealth" replace />} />
        <Route path="/app/subscriptions.html" element={<Navigate to="/app/subscriptions" replace />} />
        <Route path="/app/health-score.html" element={<Navigate to="/app/health-score" replace />} />
        <Route path="/app/ai-chat.html" element={<Navigate to="/app/ai-chat" replace />} />
        <Route path="/app/leaderboard.html" element={<Navigate to="/app/leaderboard" replace />} />
        <Route path="/app/settings.html" element={<Navigate to="/app/settings" replace />} />
        <Route path="/app/profile.html" element={<Navigate to="/app/profile" replace />} />

        <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/app/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/app/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/app/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/app/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/app/wealth" element={<ProtectedRoute><Wealth /></ProtectedRoute>} />
        <Route path="/app/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
        <Route path="/app/health-score" element={<ProtectedRoute><HealthScore /></ProtectedRoute>} />
        <Route path="/app/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/app/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </BrowserRouter>
  );
}
