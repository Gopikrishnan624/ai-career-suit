import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowUpRight, FiBarChart2, FiBriefcase, FiCompass, FiEdit3, FiFileText, FiMessageSquare, FiMic } from 'react-icons/fi';
import { useAuth } from '../../context/useAuth';
import { getAnalyses } from '../../services/aiService';

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
              </Col>
              <Col lg={5}>
                <div className="hero-orbit">
                  <div className="hero-orbit-card glass-panel">
                    <FiFileText />
                    Resume Suite
                  </div>
                  <div className="hero-orbit-card glass-panel">
                    <FiMic />
                    Interview Prep
                  </div>
                  <div className="hero-orbit-card glass-panel">
                    <FiCompass />
                    Growth Planning
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

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
              <div className="d-flex align-items-center gap-2">
                <Spinner size="sm" animation="border" />
                <span>Loading history...</span>
              </div>
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
