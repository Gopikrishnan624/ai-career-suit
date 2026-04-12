import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { FiBriefcase, FiStar, FiTrendingUp } from 'react-icons/fi';
import { recommendJobsFromResume } from '../../services/aiService';
import { loadResumeWorkspace } from '../../utils/resumeWorkspace';

export default function ResumeJobsPage() {
  const [workspace] = useState(() => loadResumeWorkspace());
  const [jobLoading, setJobLoading] = useState(false);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [error, setError] = useState('');

  const handleRecommendJobs = async () => {
    if (!workspace.resumeText) {
      setError('Analyze a resume first to get job recommendations.');
      return;
    }

    try {
      setJobLoading(true);
      setError('');
      const response = await recommendJobsFromResume({ resumeText: workspace.resumeText });
      setJobRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Error generating job recommendations');
    } finally {
      setJobLoading(false);
    }
  };

  useEffect(() => {
    if (workspace.resumeText) {
      handleRecommendJobs();
    }
  }, []);

  return (
    <Container fluid className="page-shell theme-resume">
      <div className="page-head page-head-compact">
        <div className="page-icon">
          <FiBriefcase size={20} />
        </div>
        <h1 className="display-6 fw-bold mb-2">Job Recommendations</h1>
        <p>See the roles your resume is closest to and how to position yourself better.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!workspace.resumeText && (
        <Alert variant="warning">
          No analyzed resume found in your workspace yet. Start from Resume Analysis first.
        </Alert>
      )}

      <Card className="glass-card mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="topbar-kicker">Matching Engine</div>
            <strong>AI role matching from extracted resume content</strong>
          </div>
          <Button className="btn-brand" onClick={handleRecommendJobs} disabled={jobLoading}>
            {jobLoading && <Spinner animation="border" size="sm" className="me-2" />}
            {jobLoading ? 'Refreshing...' : 'Refresh Matches'}
          </Button>
        </Card.Body>
      </Card>

      {jobRecommendations.length > 0 ? (
        <Row className="g-4">
          {jobRecommendations.map((job, index) => (
            <Col xl={4} md={6} key={`${job.title || 'job'}-${index}`}>
              <Card className="glass-card h-100 app-feature-card">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <Badge bg="warning" text="dark">
                      <FiStar className="me-1" />
                      {job.matchScore ?? 0}% match
                    </Badge>
                    <FiTrendingUp />
                  </div>
                  <Card.Title className="fw-bold">{job.title || `Recommended Role ${index + 1}`}</Card.Title>
                  <Card.Text className="text-light opacity-75">{job.reason || 'Potential fit based on your background.'}</Card.Text>

                  <div className="glass-panel p-3 mb-3">
                    <div className="structured-label">Skills To Highlight</div>
                    <div className="d-flex flex-wrap gap-2">
                      {(job.skillsToHighlight || []).length > 0 ? (
                        job.skillsToHighlight.map((skill) => (
                          <Badge bg="dark" key={skill} className="structured-badge">{skill}</Badge>
                        ))
                      ) : (
                        <span className="text-light opacity-75">No highlighted skills provided.</span>
                      )}
                    </div>
                  </div>

                  <div className="metric-card">
                    <strong className="d-block mb-1">Next Step</strong>
                    <span>{job.nextStep || 'Tailor your resume and start applying.'}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="glass-card">
          <Card.Body>
            <p className="text-light opacity-75 mb-0">Run the matcher to generate resume-based role recommendations.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
