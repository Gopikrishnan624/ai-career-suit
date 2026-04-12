import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiEdit3, FiLayers, FiPenTool } from 'react-icons/fi';
import StructuredAiRenderer from '../../components/StructuredAiRenderer';
import { createResumeWithAI } from '../../services/aiService';

const resumeTemplates = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean corporate format for software, business, and operations roles.',
  },
  {
    id: 'creative-impact',
    name: 'Creative Impact',
    description: 'Stronger project storytelling for design, product, and marketing roles.',
  },
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Simple recruiter-friendly layout optimized for ATS readability.',
  },
];

const creatorQuestions = [
  { key: 'fullName', label: 'Full Name', placeholder: 'Your name' },
  { key: 'targetRole', label: 'Target Role', placeholder: 'Frontend Developer' },
  { key: 'contactInfo', label: 'Contact Details', placeholder: 'Email, phone, LinkedIn, portfolio' },
  { key: 'summary', label: 'Professional Summary', placeholder: 'A short intro about your profile' },
  { key: 'skills', label: 'Skills', placeholder: 'React, Node.js, MongoDB, teamwork, problem solving' },
  { key: 'experience', label: 'Work Experience', placeholder: 'Company, role, duration, achievements' },
  { key: 'projects', label: 'Projects', placeholder: 'Project names, stack, impact, responsibilities' },
  { key: 'education', label: 'Education', placeholder: 'Degree, college, graduation year' },
  { key: 'certifications', label: 'Certifications', placeholder: 'Optional certifications or courses' },
];

export default function ResumeCreatorPage() {
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [createdResume, setCreatedResume] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(resumeTemplates[0]);
  const [creatorAnswers, setCreatorAnswers] = useState(
    creatorQuestions.reduce((acc, question) => ({ ...acc, [question.key]: '' }), {})
  );
  const [error, setError] = useState('');

  const handleCreatorChange = (e) => {
    setCreatorAnswers((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateResume = async (e) => {
    e.preventDefault();

    if (!creatorAnswers.fullName || !creatorAnswers.targetRole || !creatorAnswers.skills) {
      setError('Please fill at least name, target role, and skills for resume creation.');
      return;
    }

    try {
      setCreatorLoading(true);
      setError('');
      const answerText = creatorQuestions
        .map((question) => `${question.label}: ${creatorAnswers[question.key] || 'Not provided'}`)
        .join('\n');

      const response = await createResumeWithAI({
        templateName: selectedTemplate.name,
        answers: answerText,
      });

      setCreatedResume(response.data.resume);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating resume');
    } finally {
      setCreatorLoading(false);
    }
  };

  return (
    <Container fluid className="page-shell theme-resume">
      <div className="page-head page-head-compact">
        <div className="page-icon">
          <FiEdit3 size={20} />
        </div>
        <h1 className="display-6 fw-bold mb-2">Resume Creator</h1>
        <p>Answer guided questions, choose a template, and generate a polished recruiter-ready resume.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col xl={5}>
          <Card className="glass-card h-100">
            <Card.Body>
              <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                <FiLayers />
                Choose Resume Model
              </Card.Title>
              <div className="d-flex flex-column gap-3">
                {resumeTemplates.map((template) => (
                  <label key={template.id} className={`template-card ${selectedTemplate.id === template.id ? 'active' : ''}`}>
                    <Form.Check
                      type="radio"
                      name="resumeTemplate"
                      checked={selectedTemplate.id === template.id}
                      onChange={() => setSelectedTemplate(template)}
                      label={
                        <span>
                          <strong>{template.name}</strong>
                          <span className="d-block text-light opacity-75">{template.description}</span>
                        </span>
                      }
                    />
                  </label>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={7}>
          <Card className="glass-card">
            <Card.Body>
              <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                <FiPenTool />
                Candidate Details
              </Card.Title>

              <Form onSubmit={handleCreateResume}>
                <Row className="g-3">
                  {creatorQuestions.map((question) => (
                    <Col md={question.key === 'fullName' || question.key === 'targetRole' ? 6 : 12} key={question.key}>
                      <Form.Group>
                        <Form.Label>{question.label}</Form.Label>
                        <Form.Control
                          as={question.key === 'fullName' || question.key === 'targetRole' ? 'input' : 'textarea'}
                          rows={question.key === 'fullName' || question.key === 'targetRole' ? undefined : 3}
                          className="glass-input"
                          name={question.key}
                          value={creatorAnswers[question.key]}
                          onChange={handleCreatorChange}
                          placeholder={question.placeholder}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </Row>

                <Button type="submit" className="btn-brand mt-3" disabled={creatorLoading}>
                  {creatorLoading && <Spinner animation="border" size="sm" className="me-2" />}
                  {creatorLoading ? 'Creating Resume...' : 'Generate Resume'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {createdResume && (
        <Card className="glass-card mt-4">
          <Card.Body>
            <Card.Title className="h5 mb-3">Generated Resume</Card.Title>
            <div className="glass-panel p-3 result-block">
              <StructuredAiRenderer content={createdResume} />
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
