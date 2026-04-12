import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBriefcase, FiFileText, FiMessageSquare, FiUploadCloud, FiUserCheck, FiZap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StructuredAiRenderer from '../../components/StructuredAiRenderer';
import { analyzeResume } from '../../services/aiService';
import { clearResumeWorkspace, saveResumeWorkspace } from '../../utils/resumeWorkspace';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await analyzeResume(file);
      setResult(response.data.analysis);
      saveResumeWorkspace({
        resumeText: response.data.resumeText || '',
        analysis: response.data.analysis,
      });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing resume');
    } finally {
      setLoading(false);
    }
  };

  const getReadableContent = (content) => {
    if (typeof content === 'string') return content;
    if (content?.text && typeof content.text === 'string') return content.text;
    return `\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
  };

  const hasStructuredAnalysis = result && typeof result === 'object' && !Array.isArray(result) && !result?.text;

  return (
    <Container fluid className="page-shell theme-resume">
      <div className="page-head page-head-compact">
        <div className="page-icon">
          <FiFileText size={20} />
        </div>
        <h1 className="display-6 fw-bold mb-2">Resume Analysis</h1>
        <p>Upload a PDF, extract resume intelligence, and unlock the rest of the resume suite.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="glass-card stage-1 mb-4">
        <Card.Body>
          <div className="metric-card d-flex align-items-center gap-2 mb-3 stage-2">
            <FiZap />
            <small>Run one analysis and use the result across chat, job matches, and resume improvement tools.</small>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>PDF Resume</Form.Label>
              <Form.Control className="glass-input" type="file" accept=".pdf" onChange={handleFileChange} />
            </Form.Group>

            {file && (
              <Alert variant="success" className="py-2">
                Selected: {file.name}
              </Alert>
            )}

            <div className="d-flex flex-wrap gap-2">
              <Button type="submit" className="btn-brand" disabled={loading || !file}>
                <FiUploadCloud className="me-2 mb-1" />
                {loading && <Spinner animation="border" size="sm" className="me-2" />}
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
              {result && (
                <Button
                  variant="outline-light"
                  onClick={() => {
                    setResult(null);
                    clearResumeWorkspace();
                  }}
                >
                  Clear Analysis
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={8}>
          <Card className="glass-card stage-2">
            <Card.Body>
              <Card.Title className="h5 mb-3">Analysis Result</Card.Title>
              {result ? (
                <div className="glass-panel p-3 result-block">
                  {hasStructuredAnalysis ? (
                    <StructuredAiRenderer content={result} />
                  ) : (
                    <div className="analysis-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getReadableContent(result)}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state-panel">
                  <strong>No analysis yet</strong>
                  <p className="mb-0 text-light opacity-75">Upload a PDF resume to unlock chat, job matching, and resume improvements across the app.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="glass-card stage-3 h-100">
            <Card.Body>
              <Card.Title className="h5 mb-3">Continue In Resume Suite</Card.Title>
              <Row className="g-3">
                {[
                  { to: '/resume/chat', icon: FiMessageSquare, title: 'Resume Chat', subtitle: 'Talk to an AI coach about your uploaded resume.' },
                  { to: '/resume/jobs', icon: FiBriefcase, title: 'Job Matches', subtitle: 'Find roles that fit your background and positioning.' },
                  { to: '/resume/create', icon: FiUserCheck, title: 'Resume Creator', subtitle: 'Build a fresh resume with guided questions.' },
                ].map((item) => (
                  <Col xs={12} key={item.to}>
                    <Card as={Link} to={item.to} className="glass-panel text-decoration-none quick-link-card">
                      <Card.Body>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <item.icon />
                          <FiArrowRight />
                        </div>
                        <strong>{item.title}</strong>
                        <p className="text-light opacity-75 mb-0">{item.subtitle}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
