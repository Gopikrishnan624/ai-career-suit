import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiFileText, FiUploadCloud, FiZap } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeResume } from '../../services/aiService';

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
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing resume');
    } finally {
      setLoading(false);
    }
  };

  const getReadableAnalysis = (analysis) => {
    if (typeof analysis === 'string') return analysis;
    if (analysis?.text && typeof analysis.text === 'string') return analysis.text;

    return `\`\`\`json\n${JSON.stringify(analysis, null, 2)}\n\`\`\``;
  };

  return (
    <Container fluid className="app-shell theme-resume">
      <Container>
        <div className="page-head">
          <div className="page-icon">
            <FiFileText size={20} />
          </div>
          <h1 className="display-6 fw-bold mb-2">Resume Analyzer</h1>
          <p>Upload a resume and get AI insights to sharpen impact and ATS performance.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!result && (
          <Card className="glass-card stage-1 mb-4">
            <Card.Body>
              <div className="metric-card d-flex align-items-center gap-2 mb-3 stage-2">
                <FiZap />
                <small>ATS keyword scan, strengths, gaps, and action plan in seconds.</small>
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

                <Button type="submit" className="btn-brand" disabled={loading || !file}>
                  <FiUploadCloud className="me-2 mb-1" />
                  {loading && <Spinner animation="border" size="sm" className="me-2" />}
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
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
                  <Card.Title className="h4 mb-0">Analysis Result</Card.Title>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-light" onClick={() => setResult(null)}>
                    Analyze Another
                  </Button>
                </Col>
              </Row>
              <div className="glass-panel p-3 result-block">
                <div className="analysis-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {getReadableAnalysis(result)}
                  </ReactMarkdown>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </Container>
  );
}
