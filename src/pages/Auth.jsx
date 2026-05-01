import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiMoon, FiShield, FiStar, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/useAuth';
import { register, login } from '../services/aiService';
import { useTheme } from '../context/useTheme';
import pathpilotLogo from '../assets/Pathpilot.png';

export default function Auth({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: setAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const authMessage = sessionStorage.getItem('authMessage');
    if (authMessage) {
      setError(authMessage);
      sessionStorage.removeItem('authMessage');
    }
  }, []);

  useEffect(() => {
    setIsLogin(initialMode !== 'register');
    setError('');
  }, [initialMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);

      if (response.data.success) {
        setAuth(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="app-shell theme-auth auth-shell d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center auth-row">
        <Col xl={11} xxl={10}>
          <Row className="g-4 align-items-stretch justify-content-center auth-layout">
            <Col lg={6} xl={6} className="d-none d-lg-block">
              <Card className="glass-card auth-showcase stage-1 h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="topbar-kicker">Premium Career OS</div>
                  <h2 className="auth-showcase-title">Design-led AI workflows for resumes, interviews, and growth planning.</h2>
                  <p className="text-soft">
                    PathPilot gives you a focused workspace for resume feedback, interview prep, and job planning without crowding everything onto one screen.
                  </p>

                  <div className="auth-feature-stack mt-4">
                    <div className="auth-feature-card glass-panel">
                      <strong>Resume Suite</strong>
                      <span>Analyze, rewrite, chat, and create recruiter-ready resumes.</span>
                    </div>
                    <div className="auth-feature-card glass-panel">
                      <strong>Interview Bot</strong>
                      <span>Practice live answers with scoring, points, and actionable coaching.</span>
                    </div>
                    <div className="auth-feature-card glass-panel">
                      <strong>Career Simulator</strong>
                      <span>Map role transitions with AI-generated learning paths and milestones.</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} sm={10} md={8} lg={5} xl={5}>
          <Card className="glass-card auth-form-card stage-1">
            <Card.Body>
              <div className="auth-card-toolbar">
                <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                  <span className={`theme-toggle-track ${theme}`}>
                    <span className="theme-toggle-thumb">
                      {theme === 'dark' ? <FiMoon /> : <FiSun />}
                    </span>
                  </span>
                </button>
              </div>
              <div className="page-head auth-page-head">
                <img src={pathpilotLogo} alt="PathPilot logo" className="auth-logo mb-3" />
                <h1 className="h3 fw-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p>{isLogin ? 'Log in to continue your career journey.' : 'Start using PathPilot in under a minute.'}</p>
                <div className="auth-inline-links">
                  <Link to="/" className="auth-inline-link">Back to home</Link>
                </div>
              </div>

              <div className="metric-card d-flex align-items-center gap-2 mb-3 stage-2">
                <FiShield />
                <small className="mb-0">Secure token auth and private AI workspace.</small>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {!isLogin && (
                  <Form.Group className="mb-3 auth-field">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      className="glass-input"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3 auth-field">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    className="glass-input"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4 auth-field">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    className="glass-input"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button type="submit" className="btn-brand w-100 py-2" disabled={loading}>
                  {loading && <Spinner size="sm" animation="border" className="me-2" />}
                  {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <Button
                  as={Link}
                  to={isLogin ? '/register' : '/login'}
                  variant="link"
                  className="auth-mode-link text-decoration-none p-0"
                >
                  <FiStar className="me-1 mb-1" />
                  {isLogin ? 'Need an account? Register' : 'Already registered? Login'}
                </Button>
              </div>
            </Card.Body>
          </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
