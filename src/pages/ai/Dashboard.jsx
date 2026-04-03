import { useEffect, useState } from 'react';
import { Alert, Badge, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowUpRight, FiBarChart2, FiCompass, FiFileText, FiMic } from 'react-icons/fi';
import { useAuth } from '../../context/useAuth';
import { getAnalyses } from '../../services/aiService';

const features = [
  { to: '/resume', title: 'Resume Analyzer', subtitle: 'Extract and improve resume quality', tone: 'warning', icon: FiFileText },
  { to: '/simulator', title: 'Career Simulator', subtitle: 'Model next steps in your growth path', tone: 'primary', icon: FiCompass },
  { to: '/interview', title: 'Interview Bot', subtitle: 'Generate practice questions with feedback', tone: 'success', icon: FiMic },
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
    <Container fluid className="app-shell theme-dashboard">
      <Container>
        <div className="page-head">
          <div className="page-icon">
            <FiBarChart2 size={20} />
          </div>
          <h1 className="display-6 fw-bold mb-2">Dashboard</h1>
          {user && <p>Welcome back, {user.email}</p>}
        </div>

        {error && <Alert variant="warning">{error}</Alert>}

        <Row className="g-4 mb-4">
          {features.map((item, index) => (
            <Col md={4} key={item.to}>
              <Card as={Link} to={item.to} className={`glass-card h-100 text-decoration-none stage-${index + 1}`}>
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
    </Container>
  );
}
