import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/useAuth';
import Navigation from '../components/Navigation';
import Auth from '../pages/Auth';
import Dashboard from '../pages/ai/Dashboard';
import ResumeAnalyzer from '../pages/ai/ResumeAnalyzer';
import CareerSimulator from '../pages/ai/CareerSimulator';
import InterviewBot from '../pages/ai/InterviewBot';

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
      {token && <Navigation />}
      <Routes>
        {!token ? (
          <>
            <Route path="*" element={<Auth />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
            <Route path="/simulator" element={<CareerSimulator />} />
            <Route path="/interview" element={<InterviewBot />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
