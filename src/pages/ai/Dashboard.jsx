import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiArrowUpRight, FiBarChart2, FiBriefcase, FiCheckCircle, FiClock, FiCompass, FiEdit3, FiFileText, FiMessageSquare, FiMic, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../context/useAuth';
import { getAnalyses } from '../../services/aiService';
import SkeletonBlock from '../../components/SkeletonBlock';

const features = [
  { to: '/resume/analyze', title: 'Resume Analysis', subtitle: 'Upload a PDF and get ATS-focused feedback.', label: 'Start here', icon: FiFileText },
  { to: '/resume/chat', title: 'Resume Chat', subtitle: 'Ask follow-up questions about your resume.', label: 'Coach', icon: FiMessageSquare },
  { to: '/resume/jobs', title: 'Job Matches', subtitle: 'Find roles aligned with your experience.', label: 'Match', icon: FiBriefcase },
  { to: '/resume/create', title: 'Resume Creator', subtitle: 'Build a polished resume from guided inputs.', label: 'Create', icon: FiEdit3 },
  { to: '/simulator', title: 'Career Simulator', subtitle: 'Plan your next role transition clearly.', label: 'Plan', icon: FiCompass },
  { to: '/interview', title: 'Interview Bot', subtitle: 'Practice answers and receive scored feedback.', label: 'Practice', icon: FiMic },
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

  const latestAnalysis = analyses[0];
  const resumeCount = analyses.filter((item) => item.type === 'resume').length;
  const practiceCount = analyses.filter((item) => item.type === 'interview' || item.type === 'simulator').length;

  return (
    <Container fluid className="page-shell theme-dashboard">
        <div className="dashboard-header">
          <div>
            <div className="page-icon mb-3">
              <FiBarChart2 size={20} />
            </div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back{user?.name ? `, ${user.name}` : ''}. Choose a tool, review recent work, and keep your career prep organized.
            </p>
          </div>
          <div className="dashboard-header-actions">
            <Button as={Link} to="/resume/analyze" className="btn-brand">
              Analyze Resume
              <FiArrowRight className="ms-2" />
            </Button>
            <Button as={Link} to="/interview" variant="link" className="dashboard-secondary-action">
              Practice Interview
            </Button>
          </div>
        </div>

        {error && <Alert variant="warning">{error}</Alert>}

        <Row className="g-3 mb-4">
          <Col md={4}>
            <div className="dashboard-stat glass-card stage-1">
              <FiActivity className="dashboard-stat-icon" />
              <div>
                <span className="dashboard-stat-value">{loading ? '-' : analyses.length}</span>
                <span className="dashboard-stat-label">Saved sessions</span>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="dashboard-stat glass-card stage-2">
              <FiFileText className="dashboard-stat-icon" />
              <div>
                <span className="dashboard-stat-value">{loading ? '-' : resumeCount}</span>
                <span className="dashboard-stat-label">Resume analyses</span>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="dashboard-stat glass-card stage-3">
              <FiTrendingUp className="dashboard-stat-icon" />
              <div>
                <span className="dashboard-stat-value">{loading ? '-' : practiceCount}</span>
                <span className="dashboard-stat-label">Practice plans</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col xl={8}>
            <Card className="glass-card dashboard-section stage-1">
              <Card.Body>
                <div className="dashboard-section-head">
                  <div>
                    <Card.Title className="h4 mb-1">Tools</Card.Title>
                    <p className="text-soft mb-0">Everything you need for resume, job, and interview preparation.</p>
                  </div>
                </div>

                <Row className="g-3 mt-1">
                  {features.map((item, index) => (
                    <Col md={6} key={item.to}>
                      <Card as={Link} to={item.to} className={`dashboard-tool-card text-decoration-none stage-${(index % 4) + 1}`}>
                        <Card.Body>
                          <div className="dashboard-tool-top">
                            <span className="dashboard-tool-icon">
                              <item.icon />
                            </span>
                            <Badge bg="dark">{item.label}</Badge>
                          </div>
                          <Card.Title className="h6 mb-2">{item.title}</Card.Title>
                          <Card.Text>{item.subtitle}</Card.Text>
                          <span className="dashboard-tool-link">
                            Open
                            <FiArrowUpRight />
                          </span>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={4}>
            <Card className="glass-card dashboard-section stage-2 mb-4">
              <Card.Body>
                <Card.Title className="h4 mb-3">Next Step</Card.Title>
                <div className="dashboard-next-step">
                  <FiCheckCircle />
                  <div>
                    <strong>{latestAnalysis ? 'Continue from your latest session' : 'Start with a resume analysis'}</strong>
                    <p className="mb-0 text-soft">
                      {latestAnalysis
                        ? `Your last saved item was a ${latestAnalysis.type} session.`
                        : 'Upload your resume first to unlock better chat, job matching, and rewrite guidance.'}
                    </p>
                  </div>
                </div>
                <Button as={Link} to={latestAnalysis ? '/resume/chat' : '/resume/analyze'} className="btn-brand w-100 mt-3">
                  {latestAnalysis ? 'Open Resume Chat' : 'Analyze Resume'}
                </Button>
              </Card.Body>
            </Card>

            <Card className="glass-card dashboard-section stage-3">
              <Card.Body>
                <div className="dashboard-section-head mb-3">
                  <Card.Title className="h4 mb-0">Recent Activity</Card.Title>
                  <Button variant="outline-light" size="sm" onClick={loadAnalyses} disabled={loading} aria-label="Refresh recent analyses">
                    <FiRefreshCw />
                  </Button>
                </div>

                {loading ? (
                  <div className="d-flex flex-column gap-3">
                    {[1, 2, 3].map((item) => (
                      <div className="dashboard-activity-item" key={item}>
                        <SkeletonBlock className="skeleton-line short mb-3" />
                        <SkeletonBlock className="skeleton-line long" />
                      </div>
                    ))}
                  </div>
                ) : analyses.length > 0 ? (
                  <div className="dashboard-activity-list">
                    {analyses.slice(0, 5).map((analysis) => (
                      <div className="dashboard-activity-item" key={analysis._id}>
                        <div className="dashboard-activity-icon">
                          <FiClock />
                        </div>
                        <div>
                          <strong className="text-capitalize">{analysis.type}</strong>
                          <small>{new Date(analysis.createdAt).toLocaleString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-panel">
                    <strong>No activity yet</strong>
                    <p className="mb-0 text-soft">Use any tool to create your first saved session.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
    </Container>
  );
}
