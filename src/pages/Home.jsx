import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBarChart2, FiBriefcase, FiCompass, FiFileText, FiMessageSquare, FiMic, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import pathpilotLogo from '../assets/Pathpilot.png';

const features = [
  {
    to: '/resume/analyze',
    title: 'Resume Analyzer',
    description: 'Upload a resume and get structured ATS feedback, clarity checks, and practical fixes.',
    icon: FiFileText,
  },
  {
    to: '/resume/chat',
    title: 'Resume Chat',
    description: 'Ask follow-up questions about your resume and improve each section faster.',
    icon: FiMessageSquare,
  },
  {
    to: '/resume/jobs',
    title: 'Job Matches',
    description: 'See which roles fit your profile and where you need stronger positioning.',
    icon: FiBriefcase,
  },
  {
    to: '/simulator',
    title: 'Career Simulator',
    description: 'Explore growth paths, role transitions, and next-step learning plans.',
    icon: FiCompass,
  },
  {
    to: '/interview',
    title: 'Interview Bot',
    description: 'Practice answers, build confidence, and get coaching in a focused space.',
    icon: FiMic,
  },
  {
    to: '/dashboard',
    title: 'Dashboard',
    description: 'Jump into the full workspace after login and continue where you left off.',
    icon: FiBarChart2,
  },
];

export default function Home() {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <Container fluid className="app-shell home-shell">
      <div className="home-topbar">
        <Link to="/" className="home-brand">
          <img src={pathpilotLogo} alt="PathPilot logo" className="brand-logo brand-logo-lg" />
          <div>
            <strong>PathPilot</strong>
            <div className="app-brand-subtitle">Focused AI tools for resumes, jobs, and interviews</div>
          </div>
        </Link>

        <div className="home-topbar-actions">
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <span className={`theme-toggle-track ${theme}`}>
              <span className="theme-toggle-thumb">
                {theme === 'dark' ? <FiMoon /> : <FiSun />}
              </span>
            </span>
          </button>
          {token ? (
            <Button className="btn-brand" onClick={() => navigate('/dashboard')}>
              Open Workspace
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="outline-light">Login</Button>
              <Button as={Link} to="/register" className="btn-brand">Register</Button>
            </>
          )}
        </div>
      </div>

      <section className="glass-card home-hero">
        <Row className="align-items-center g-4">
          <Col lg={7}>
            <div className="topbar-kicker">Public Home</div>
            <h1 className="home-title">A cleaner starting point for PathPilot.</h1>
            <p className="home-copy">
              The homepage is now separate from the working tools, so visitors can understand the product first and then choose to login or register.
            </p>
            <div className="home-actions">
              {token ? (
                <Button className="btn-brand hero-btn" onClick={() => navigate('/dashboard')}>
                  Go to dashboard
                  <FiArrowRight className="ms-2" />
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/login" className="btn-brand hero-btn">
                    Login
                    <FiArrowRight className="ms-2" />
                  </Button>
                  <Button as={Link} to="/register" variant="outline-light" className="hero-btn-secondary">
                    Create account
                  </Button>
                </>
              )}
            </div>
          </Col>
          <Col lg={5}>
            <div className="glass-panel home-highlight">
              <div className="topbar-kicker">Why this feels better</div>
              <h2>Less mixed UI, more clear flow.</h2>
              <p className="mb-0 text-soft">
                Public users see the product overview here. Logged-in users get a simpler workspace focused on tools instead of extra decorative widgets.
              </p>
            </div>
          </Col>
        </Row>
      </section>

      <section className="home-section">
        <div className="page-head page-head-compact">
          <div className="topbar-kicker">Explore Pages</div>
          <h2 className="h3 fw-bold mb-2">Everything routes from one home page</h2>
          <p>These are the main pages available inside the product after authentication.</p>
        </div>

        <Row className="g-4">
          {features.map((feature) => (
            <Col md={6} xl={4} key={feature.title}>
              <Card
                as={Link}
                to={token ? feature.to : '/login'}
                className="glass-card h-100 home-feature-card text-decoration-none"
              >
                <Card.Body>
                  <div className="page-icon">
                    <feature.icon size={18} />
                  </div>
                  <Card.Title className="fw-bold">{feature.title}</Card.Title>
                  <Card.Text className="text-light opacity-75 mb-0">{feature.description}</Card.Text>
                  <div className="home-card-link">
                    {token ? 'Open page' : 'Login to open'}
                    <FiArrowRight className="ms-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
}
