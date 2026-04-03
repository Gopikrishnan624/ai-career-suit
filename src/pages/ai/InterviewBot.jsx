import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiCheckCircle, FiMessageCircle, FiMic, FiPlayCircle, FiRotateCw } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateInterviewQuestions, scoreInterviewAnswer } from '../../services/aiService';

export default function InterviewBot() {
  const [stage, setStage] = useState('setup');
  const [formData, setFormData] = useState({
    jobDescription: '',
    userBackground: '',
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizeQuestions = (questionsPayload) => {
    if (Array.isArray(questionsPayload)) {
      return questionsPayload
        .map((item) => (typeof item === 'string' ? item : item?.question))
        .filter((q) => typeof q === 'string' && q.trim().length > 0);
    }

    if (typeof questionsPayload === 'string') {
      return questionsPayload.split('\n').map((q) => q.trim()).filter(Boolean);
    }

    if (questionsPayload?.questions && Array.isArray(questionsPayload.questions)) {
      return questionsPayload.questions
        .map((item) => (typeof item === 'string' ? item : item?.question))
        .filter((q) => typeof q === 'string' && q.trim().length > 0);
    }

    if (typeof questionsPayload?.text === 'string') {
      return questionsPayload.text.split('\n').map((q) => q.trim()).filter(Boolean);
    }

    return [];
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    if (!formData.jobDescription || !formData.userBackground) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await generateInterviewQuestions(formData);
      const parsedQuestions = normalizeQuestions(response.data.questions);
      if (parsedQuestions.length === 0) {
        throw new Error('AI returned questions in an unexpected format. Please try again.');
      }
      setQuestions(parsedQuestions);
      setStage('questions');
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error generating questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await scoreInterviewAnswer({
        question: questions[currentQuestionIndex],
        userAnswer,
      });
      setFeedback(response.data.feedback);
      setStage('scoring');
    } catch (err) {
      setError(err.response?.data?.error || 'Error scoring answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(null);
      setStage('questions');
    } else {
      resetInterview();
    }
  };

  const resetInterview = () => {
    setStage('setup');
    setFormData({ jobDescription: '', userBackground: '' });
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setError('');
  };

  const getReadableFeedback = (value) => {
    if (typeof value === 'string') return value;
    if (value?.text && typeof value.text === 'string') return value.text;
    return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
  };

  return (
    <Container fluid className="app-shell theme-interview">
      <Container>
        <div className="page-head">
          <div className="page-icon">
            <FiMic size={20} />
          </div>
          <h1 className="display-6 fw-bold mb-2">Interview Bot</h1>
          <p>Simulate interview rounds and iterate with AI feedback.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {stage === 'setup' && (
          <Card className="glass-card stage-1">
            <Card.Body>
              <div className="metric-card d-flex align-items-center gap-2 mb-3 stage-2">
                <FiMessageCircle />
                <small>Generate role-specific questions and practice responses with coaching.</small>
              </div>
              <Form onSubmit={handleGenerateQuestions}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    className="glass-input"
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleFormChange}
                    placeholder="Paste the role requirements"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Your Background</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    className="glass-input"
                    name="userBackground"
                    value={formData.userBackground}
                    onChange={handleFormChange}
                    placeholder="Summarize your experience"
                    required
                  />
                </Form.Group>

                <Button type="submit" className="btn-brand" disabled={loading}>
                  <FiPlayCircle className="me-2 mb-1" />
                  {loading && <Spinner animation="border" size="sm" className="me-2" />}
                  {loading ? 'Generating...' : 'Generate Questions'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}

        {stage === 'questions' && questions.length > 0 && (
          <Card className="glass-card stage-2">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <strong>Question {currentQuestionIndex + 1} of {questions.length}</strong>
                <Button variant="outline-light" size="sm" onClick={resetInterview}>
                  <FiRotateCw className="me-1" />
                  Reset
                </Button>
              </div>

              <div className="glass-panel p-3 mb-3 fw-semibold">
                {questions[currentQuestionIndex]}
              </div>

              <Form onSubmit={handleSubmitAnswer}>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={6}
                    className="glass-input"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer..."
                  />
                </Form.Group>

                <Button type="submit" className="btn-brand" disabled={loading}>
                  {loading && <Spinner animation="border" size="sm" className="me-2" />}
                  {loading ? 'Evaluating...' : 'Submit Answer'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        )}

        {stage === 'scoring' && feedback && (
          <Card className="glass-card stage-3">
            <Card.Body>
              <Row className="align-items-center mb-3">
                <Col>
                  <Card.Title className="h4 mb-0">Feedback</Card.Title>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-light" onClick={handleNextQuestion}>
                    <FiCheckCircle className="me-1 mb-1" />
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                  </Button>
                </Col>
              </Row>

              <div className="glass-panel p-3 result-block">
                <div className="analysis-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {getReadableFeedback(feedback)}
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
