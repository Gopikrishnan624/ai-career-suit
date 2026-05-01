import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowUpRight, FiBarChart2, FiBriefcase, FiCompass, FiEdit3, FiFileText, FiMessageSquare, FiMic, FiTrendingUp, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/useAuth';
import { getAnalyses } from '../../services/aiService';
import SkeletonBlock from '../../components/SkeletonBlock';
import pathpilotLogo from '../../assets/Pathpilot.png';

const features = [
  { to: '/resume/analyze', title: 'Resume Analysis', subtitle: 'Extract insights and ATS feedback from a PDF resume', tone: 'warning', icon: FiFileText },
  { to: '/resume/chat', title: 'Resume Chat', subtitle: 'Ask targeted follow-up questions about your resume', tone: 'info', icon: FiMessageSquare },
  { to: '/resume/jobs', title: 'Job Matches', subtitle: 'Discover job roles that best fit your resume', tone: 'success', icon: FiBriefcase },
  { to: '/resume/create', title: 'Resume Creator', subtitle: 'Generate a polished resume from guided answers', tone: 'dark', icon: FiEdit3 },
  { to: '/simulator', title: 'Career Simulator', subtitle: 'Model next steps in your growth path', tone: 'primary', icon: FiCompass },
  { to: '/interview', title: 'Interview Bot', subtitle: 'Practice and score answers like a real app flow', tone: 'success', icon: FiMic },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAnalyses();
      setAnalyses(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load analysis history right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="page-shell theme-dashboard">
        <div className="page-head">
          <div className="page-icon">
            <FiBarChart2 size={20} />
          </div>
          <h1 className="display-6 fw-bold mb-2">Dashboard</h1>
          {user && <p>Welcome back, {user.email}. Pick a workspace and keep momentum across the whole app.</p>}
        </div>

        {error && <Alert variant="warning">{error}</Alert>}

        <Card className="glass-card dashboard-hero mb-4 stage-1">
          <Card.Body>
            <Row className="align-items-center g-4">
              <Col lg={7}>
                <div className="topbar-kicker">Career Workspace</div>
                <h2 className="hero-title">One app for resume prep, AI coaching, job targeting, and interview practice.</h2>
                <p className="text-light opacity-75 mb-0">
                  Each tool now lives in its own page so the experience feels more focused, faster to navigate, and closer to a real product.
                </p>
                <div className="hero-actions mt-4">
                  <Link to="/resume/analyze" className="btn btn-brand hero-btn">
                    <FiZap className="me-2" />
                    Start Resume Suite
                  </Link>
                  <Link to="/interview" className="btn btn-outline-light hero-btn-secondary">
                    Open Interview Bot
                  </Link>
                </div>
              </Col>
              <Col lg={5}>
                <div className="hero-logo-wrap">
                  <img src={pathpilotLogo} alt="PathPilot logo" className="hero-logo" />
                  <div className="hero-logo-caption glass-panel">
                    <span>PathPilot Workspace</span>
                    <small>Resume suite, interview bot, and career simulator in one product.</small>
                  </div>
                  <div className="hero-chart glass-panel">
                    <div className="hero-chart-head">
                      <strong>Workflow Activity</strong>
                      <small>Animated productivity snapshot</small>
                    </div>
                    <div className="hero-chart-bars">
                      {[82, 55, 94, 68, 76].map((value, index) => (
                        <div key={index} className="hero-chart-bar-wrap">
                          <div className="hero-chart-bar" style={{ '--bar-height': `${value}%`, animationDelay: `${index * 120}ms` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="glass-card metric-surface stage-2">
              <Card.Body>
                <div className="metric-icon">
                  <FiActivity />
                </div>
                <div className="metric-value">{analyses.length}</div>
                <div className="metric-title">Saved AI Sessions</div>
                <small className="text-light opacity-75">Every analysis is stored so your workflow keeps context.</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="glass-card metric-surface stage-3">
              <Card.Body>
                <div className="metric-icon">
                  <FiTrendingUp />
                </div>
                <div className="metric-value">Resume + Interview</div>
                <div className="metric-title">Connected Journey</div>
                <small className="text-light opacity-75">Move from resume analysis into role prep and practice instantly.</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="glass-card metric-surface stage-4">
              <Card.Body>
                <div className="metric-icon">
                  <FiZap />
                </div>
                <div className="metric-value">PathPilot</div>
                <div className="metric-title">Portfolio-Ready UI</div>
                <small className="text-light opacity-75">A cleaner, richer SaaS interface suitable for demos and real users.</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {features.map((item, index) => (
            <Col md={6} xl={4} key={item.to}>
              <Card as={Link} to={item.to} className={`glass-card h-100 text-decoration-none stage-${(index % 4) + 1} app-feature-card`}>
                <Card.Body>
                  <Badge bg={item.tone} className="mb-3">Tool</Badge>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <item.icon size={20} />
                    <FiArrowUpRight />
                  </div>
                  <Card.Title className="fw-bold">{item.title}</Card.Title>
                  <Card.Text className="text-light opacity-75">{item.subtitle}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="glass-card stage-4">
          <Card.Body>
            <Card.Title className="h4 mb-3 d-flex align-items-center gap-2">
              <FiActivity />
              Recent Analyses
            </Card.Title>
            {loading ? (
              <Row className="g-3">
                {[1, 2, 3].map((item) => (
                  <Col sm={6} lg={4} key={item}>
                    <div className="glass-panel p-3 h-100">
                      <SkeletonBlock className="skeleton-line short mb-3" />
                      <SkeletonBlock className="skeleton-line medium mb-2" />
                      <SkeletonBlock className="skeleton-line long" />
                    </div>
                  </Col>
                ))}
              </Row>
            ) : analyses.length > 0 ? (
              <Row className="g-3">
                {analyses.map((analysis) => (
                  <Col sm={6} lg={4} key={analysis._id}>
                    <div className="glass-panel p-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-capitalize">{analysis.type}</strong>
                        <Badge bg="dark">Saved</Badge>
                      </div>
                      <small className="text-light opacity-75">
                        {new Date(analysis.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-light opacity-75 mb-0">No analyses yet. Start from any tool above.</p>
            )}
          </Card.Body>
        </Card>
    </Container>
  );
}
