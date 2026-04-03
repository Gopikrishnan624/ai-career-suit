import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiBarChart2, FiFileText, FiCompass, FiMic, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/useAuth';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <Container fluid className="px-3 px-md-4 pt-3 pb-0">
      <Navbar expand="lg" className="glass-nav px-3 px-lg-4" variant="dark">
        <Navbar.Brand role="button" onClick={() => navigate('/dashboard')} className="fw-bold">
          <span className="brand-mark">
            <FiZap />
          </span>
          AI Career Suite
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto gap-lg-2">
            <Nav.Link
              className={`nav-link-soft ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              <FiBarChart2 className="me-1 mb-1" />
              Dashboard
            </Nav.Link>
            <Nav.Link
              className={`nav-link-soft ${location.pathname === '/resume' ? 'active' : ''}`}
              onClick={() => navigate('/resume')}
            >
              <FiFileText className="me-1 mb-1" />
              Resume Analyzer
            </Nav.Link>
            <Nav.Link
              className={`nav-link-soft ${location.pathname === '/simulator' ? 'active' : ''}`}
              onClick={() => navigate('/simulator')}
            >
              <FiCompass className="me-1 mb-1" />
              Career Simulator
            </Nav.Link>
            <Nav.Link
              className={`nav-link-soft ${location.pathname === '/interview' ? 'active' : ''}`}
              onClick={() => navigate('/interview')}
            >
              <FiMic className="me-1 mb-1" />
              Interview Bot
            </Nav.Link>
          </Nav>

          {user && (
            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <small className="text-light opacity-75 user-email">{user.email}</small>
              <Button size="sm" variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
}
