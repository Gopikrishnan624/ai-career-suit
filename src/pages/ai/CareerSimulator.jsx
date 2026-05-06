import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import { FiCompass, FiMap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { simulateCareer } from '../../services/aiService';
import { FiAlertCircle, FiArrowRight, FiBookOpen, FiCheckCircle, FiClock, FiFlag, FiTarget } from 'react-icons/fi';
import StructuredAiRenderer from '../../components/StructuredAiRenderer';

export default function CareerSimulator() {
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: '',
    experience: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentRole || !formData.targetRole || !formData.experience) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await simulateCareer(formData);
      setResult(response.data.simulation);
    } catch (err) {
      setError(err.response?.data?.error || 'Error simulating career');
    } finally {
      setLoading(false);
    }
  };

  const getReadableSimulation = (simulation) => {
    if (typeof simulation === 'string') return simulation;
    if (simulation?.text && typeof simulation.text === 'string') return simulation.text;

    return `\`\`\`json\n${JSON.stringify(simulation, null, 2)}\n\`\`\``;
  };

  const isStructuredSimulation = (simulation) => (
    simulation &&
    typeof simulation === 'object' &&
    !Array.isArray(simulation) &&
    (
      Array.isArray(simulation.skills) ||
      Array.isArray(simulation.learningPath) ||
      typeof simulation.timeline === 'string' ||
      Array.isArray(simulation.opportunities) ||
      Array.isArray(simulation.obstacles)
    )
  );

  return (
    <Container fluid className="page-shell theme-simulator">
        <div className="page-head">
          <div className="page-icon">
            <FiCompass size={20} />
          </div>
          <h1 className="display-6 fw-bold mb-2">Career Simulator</h1>
          <p>Map possible growth paths and identify the next best milestones.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!result && (
          <Card className="glass-card stage-1 mb-4">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Current Role</Form.Label>
                    <Form.Control
                      className="glass-input"
                      type="text"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Target Role</Form.Label>
                    <Form.Control
                      className="glass-input"
                      type="text"
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Years of Experience</Form.Label>
                    <Form.Control
                      className="glass-input"
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Key Skills</Form.Label>
                    <Form.Control
                      className="glass-input"
                      type="text"
                      name="skills"
                      placeholder="React, Node.js, SQL"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Button type="submit" className="btn-brand mt-4" disabled={loading}>
                  <FiMap className="me-2 mb-1" />
                  {loading && <Spinner animation="border" size="sm" className="me-2" />}
                  {loading ? 'Simulating...' : 'Generate 5-Year Path'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}

        {result && (
          <Card className="glass-card stage-2">
            <Card.Body>
              <Row className="align-items-center mb-3">
                <Col>
                  <Card.Title className="h4 mb-0">Simulation Output</Card.Title>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-light" onClick={() => setResult(null)}>
                    Try Another Scenario
                  </Button>
                </Col>
              </Row>
              {isStructuredSimulation(result) ? (
                <div className="result-block">
                  {result.timeline && (
                    <div className="metric-card mb-3 d-flex align-items-start gap-2">
                      <FiClock className="mt-1" />
                      <div>
                        <strong className="d-block mb-1">Estimated Timeline</strong>
                        <span>{result.timeline}</span>
                      </div>
                    </div>
                  )}

                  {Array.isArray(result.skills) && result.skills.length > 0 && (
                    <Card className="glass-panel mb-3">
                      <Card.Body>
                        <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                          <FiTarget />
                          Skills To Develop
                        </Card.Title>
                        <div className="d-flex flex-wrap gap-2">
                          {result.skills.map((skill, index) => (
                            <Badge key={index} bg="info" className="py-2 px-3 fw-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {Array.isArray(result.learningPath) && result.learningPath.length > 0 && (
                    <Card className="glass-panel mb-3">
                      <Card.Body>
                        <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                          <FiBookOpen />
                          Learning Path
                        </Card.Title>
                        <ListGroup variant="flush">
                          {result.learningPath.map((step, index) => (
                            <ListGroup.Item
                              key={index}
                              className="bg-transparent text-light border-secondary-subtle d-flex align-items-start gap-2"
                            >
                              <FiArrowRight className="mt-1 flex-shrink-0" />
                              <span>{step}</span>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  )}

                  <Row className="g-3 mb-3">
                    {Array.isArray(result.opportunities) && result.opportunities.length > 0 && (
                      <Col lg={6}>
                        <Card className="glass-panel h-100">
                          <Card.Body>
                            <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                              <FiFlag />
                              Opportunities
                            </Card.Title>
                            <ListGroup variant="flush">
                              {result.opportunities.map((item, index) => (
                                <ListGroup.Item
                                  key={index}
                                  className="bg-transparent text-light border-secondary-subtle d-flex align-items-start gap-2"
                                >
                                  <FiCheckCircle className="mt-1 flex-shrink-0 text-info" />
                                  <span>{item}</span>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}

                    {Array.isArray(result.obstacles) && result.obstacles.length > 0 && (
                      <Col lg={6}>
                        <Card className="glass-panel h-100">
                          <Card.Body>
                            <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                              <FiAlertCircle />
                              Obstacles and Solutions
                            </Card.Title>
                            <div className="d-flex flex-column gap-3">
                              {result.obstacles.map((item, index) => (
                                <div key={index} className="metric-card">
                                  <div className="d-flex align-items-start gap-2 mb-1">
                                    <FiAlertCircle className="mt-1 text-warning" />
                                    <strong>{item?.obstacle || 'Obstacle'}</strong>
                                  </div>
                                  <div className="d-flex align-items-start gap-2">
                                    <FiArrowRight className="mt-1 text-info" />
                                    <span>{item?.solution || 'No solution provided.'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              ) : (
                <div className="glass-panel p-3 result-block">
                  {result && typeof result === 'object' && !Array.isArray(result) && !result?.text ? (
                    <StructuredAiRenderer content={result} />
                  ) : (
                    <div className="analysis-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getReadableSimulation(result)}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        )}
    </Container>
  );
}
