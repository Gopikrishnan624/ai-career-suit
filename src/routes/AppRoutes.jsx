import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/useAuth';
import AppShell from '../components/AppShell';
import Auth from '../pages/Auth';
import Home from '../pages/Home';
import Dashboard from '../pages/ai/Dashboard';
import ResumeAnalyzer from '../pages/ai/ResumeAnalyzer';
import CareerSimulator from '../pages/ai/CareerSimulator';
import InterviewBot from '../pages/ai/InterviewBot';
import ResumeChatPage from '../pages/ai/ResumeChatPage';
import ResumeJobsPage from '../pages/ai/ResumeJobsPage';
import ResumeCreatorPage from '../pages/ai/ResumeCreatorPage';

function ProtectedRoute({ token, children }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Container fluid className="app-shell d-flex align-items-center justify-content-center">
        <div className="glass-card px-4 py-3 d-flex align-items-center gap-2">
          <Spinner size="sm" animation="border" />
          <span>Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Auth initialMode="login" />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Auth initialMode="register" />} />

        <Route
          element={(
            <ProtectedRoute token={token}>
              <AppShell />
            </ProtectedRoute>
          )}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume" element={<Navigate to="/resume/analyze" replace />} />
          <Route path="/resume/analyze" element={<ResumeAnalyzer />} />
          <Route path="/resume/chat" element={<ResumeChatPage />} />
          <Route path="/resume/jobs" element={<ResumeJobsPage />} />
          <Route path="/resume/create" element={<ResumeCreatorPage />} />
          <Route path="/simulator" element={<CareerSimulator />} />
          <Route path="/interview" element={<InterviewBot />} />
        </Route>

        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/'} replace />} />
      </Routes>
    </Router>
  );
}
