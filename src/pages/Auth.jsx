import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { FiMoon, FiStar, FiSun } from 'react-icons/fi';
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
    </Container>
  );
}
