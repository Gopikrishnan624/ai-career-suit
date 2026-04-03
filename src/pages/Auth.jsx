import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiLock, FiShield, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/useAuth';
import { register, login } from '../services/aiService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

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
    <Container fluid className="app-shell theme-auth d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={5} xl={4}>
          <Card className="glass-card stage-1 p-3 p-md-4">
            <Card.Body>
              <div className="page-head">
                <div className="page-icon">
                  <FiLock size={20} />
                </div>
                <h1 className="h3 fw-bold mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p>{isLogin ? 'Log in to continue your career journey.' : 'Start using AI Career Suite in under a minute.'}</p>
              </div>

              <div className="metric-card d-flex align-items-center gap-2 mb-3 stage-2">
                <FiShield />
                <small className="mb-0">Secure token auth and private AI workspace.</small>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {!isLogin && (
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      className="glass-input"
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
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

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    className="glass-input"
                    type="password"
                    name="password"
                    placeholder="Enter password"
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
                  variant="link"
                  className="text-light text-decoration-none p-0"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                >
                  <FiStar className="me-1 mb-1" />
                  {isLogin ? 'Need an account? Register' : 'Already registered? Login'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
