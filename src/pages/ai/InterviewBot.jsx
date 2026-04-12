import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import {
  FiAlertCircle,
  FiAward,
  FiCheckCircle,
  FiMessageCircle,
  FiMic,
  FiPlayCircle,
  FiRotateCw,
  FiTrendingUp,
} from 'react-icons/fi';
import { generateInterviewQuestions, scoreInterviewAnswer } from '../../services/aiService';
import StructuredAiRenderer from '../../components/StructuredAiRenderer';

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
  const [totalPoints, setTotalPoints] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);
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
      setTotalPoints(0);
      setAnswerHistory([]);
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
      const pointsAwarded = response.data.pointsAwarded ?? response.data.feedback?.pointsAwarded ?? 0;
      setTotalPoints((current) => current + pointsAwarded);
      setAnswerHistory((current) => [
        ...current,
        {
          question: questions[currentQuestionIndex],
          pointsAwarded,
          score: response.data.feedback?.score ?? 0,
        },
      ]);
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
    setTotalPoints(0);
    setAnswerHistory([]);
    setError('');
  };

  return (
    <Container fluid className="page-shell theme-interview">
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
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <strong>Question {currentQuestionIndex + 1} of {questions.length}</strong>
                  <Badge bg="warning" text="dark">
                    <FiAward className="me-1" />
                    {totalPoints} points
                  </Badge>
                </div>
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
                  <Card.Title className="h4 mb-0 d-flex align-items-center gap-2">
                    Feedback
                    <Badge bg="warning" text="dark">
                      <FiAward className="me-1" />
                      +{feedback?.pointsAwarded ?? feedback?.score ?? 0} points
                    </Badge>
                  </Card.Title>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-light" onClick={handleNextQuestion}>
                    <FiCheckCircle className="me-1 mb-1" />
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                  </Button>
                </Col>
              </Row>

              {feedback && typeof feedback === 'object' && !Array.isArray(feedback) ? (
                <div className="result-block">
                  <Row className="g-3 mb-3">
                    <Col md={4}>
                      <Card className="glass-panel h-100">
                        <Card.Body>
                          <div className="structured-label">Score</div>
                          <div className="display-6 fw-bold">{feedback.score ?? 0}/{feedback.maxScore ?? 10}</div>
                          <small className="text-light opacity-75">AI evaluation score for this answer.</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="glass-panel h-100">
                        <Card.Body>
                          <div className="structured-label">Points Earned</div>
                          <div className="display-6 fw-bold text-warning">{feedback.pointsAwarded ?? feedback.score ?? 0}</div>
                          <small className="text-light opacity-75">Added to the user total after this question.</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="glass-panel h-100">
                        <Card.Body>
                          <div className="structured-label">Question Progress</div>
                          <div className="display-6 fw-bold">{currentQuestionIndex + 1}/{questions.length}</div>
                          <small className="text-light opacity-75">Current position in the interview round.</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="glass-panel mb-3">
                    <Card.Body>
                      <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                        <FiTrendingUp />
                        Feedback Summary
                      </Card.Title>
                      <p className="mb-0 text-light">{feedback.feedback || 'No summary feedback provided.'}</p>
                    </Card.Body>
                  </Card>

                  <Row className="g-3 mb-3">
                    <Col lg={6}>
                      <Card className="glass-panel h-100">
                        <Card.Body>
                          <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                            <FiCheckCircle />
                            Strengths
                          </Card.Title>
                          {Array.isArray(feedback.strengths) && feedback.strengths.length > 0 ? (
                            <ListGroup variant="flush">
                              {feedback.strengths.map((item, index) => (
                                <ListGroup.Item
                                  key={index}
                                  className="bg-transparent text-light border-secondary-subtle d-flex align-items-start gap-2"
                                >
                                  <FiCheckCircle className="mt-1 flex-shrink-0 text-info" />
                                  <span>{item}</span>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          ) : (
                            <p className="text-light opacity-75 mb-0">No strengths were provided.</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={6}>
                      <Card className="glass-panel h-100">
                        <Card.Body>
                          <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                            <FiAlertCircle />
                            Improvements
                          </Card.Title>
                          {Array.isArray(feedback.improvements) && feedback.improvements.length > 0 ? (
                            <ListGroup variant="flush">
                              {feedback.improvements.map((item, index) => (
                                <ListGroup.Item
                                  key={index}
                                  className="bg-transparent text-light border-secondary-subtle d-flex align-items-start gap-2"
                                >
                                  <FiAlertCircle className="mt-1 flex-shrink-0 text-warning" />
                                  <span>{item}</span>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          ) : (
                            <p className="text-light opacity-75 mb-0">No improvement notes were provided.</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {feedback.sampleBetterAnswer && (
                    <Card className="glass-panel">
                      <Card.Body>
                        <Card.Title className="h5 mb-3">Sample Better Answer</Card.Title>
                        <div className="analysis-markdown">
                          <StructuredAiRenderer content={feedback.sampleBetterAnswer} />
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="glass-panel p-3 result-block">
                  <StructuredAiRenderer content={feedback} />
                </div>
              )}

              <div className="glass-panel p-3 mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Total Score</strong>
                  <Badge bg="success">{totalPoints} points earned</Badge>
                </div>
                {answerHistory.length > 0 && (
                  <small className="text-light opacity-75">
                    Latest round score: {answerHistory[answerHistory.length - 1]?.score ?? 0}/10
                  </small>
                )}
              </div>
            </Card.Body>
          </Card>
        )}
    </Container>
  );
}
