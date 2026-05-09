import { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { FiArrowLeft, FiDownload, FiEdit3, FiFileText, FiLayers, FiPenTool, FiPrinter } from 'react-icons/fi';
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

const printableResumeStyles = `
  * { box-sizing: border-box; }
  .resume-document { width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; color: #172033; box-shadow: 0 20px 60px rgba(17, 32, 51, 0.18); }
  .resume-inner { padding: 20mm; }
  .resume-header { border-bottom: 2px solid #172033; padding-bottom: 14px; margin-bottom: 18px; }
  .resume-name { margin: 0; font-size: 32px; line-height: 1.05; letter-spacing: 0; }
  .resume-role { margin: 8px 0 0; font-size: 15px; font-weight: 700; color: #315c88; text-transform: uppercase; letter-spacing: 0.08em; }
  .resume-contact { margin-top: 10px; font-size: 12px; color: #4d5f73; white-space: pre-line; }
  .resume-section { margin-top: 16px; break-inside: avoid; }
  .resume-section h2 { margin: 0 0 7px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.11em; color: #172033; }
  .resume-section p { margin: 0; font-size: 12.5px; line-height: 1.55; white-space: pre-line; }
  .resume-list { margin: 0; padding-left: 18px; }
  .resume-list li { margin: 0 0 5px; font-size: 12.5px; line-height: 1.45; }
  .resume-skills { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .resume-skills li { border: 1px solid #c7d2df; border-radius: 999px; padding: 4px 8px; font-size: 11.5px; line-height: 1.2; }
  .resume-document.creative-impact .resume-inner { padding: 0; display: grid; grid-template-columns: 72mm 1fr; min-height: 297mm; }
  .resume-document.creative-impact .resume-header { margin: 0; padding: 20mm 12mm; border: 0; background: #16324f; color: #ffffff; }
  .resume-document.creative-impact .resume-name, .resume-document.creative-impact .resume-role, .resume-document.creative-impact .resume-contact { color: #ffffff; }
  .resume-document.creative-impact .resume-main { padding: 20mm 16mm; }
  .resume-document.creative-impact .resume-section h2 { color: #b95b39; }
  .resume-document.ats-classic .resume-inner { padding: 18mm; }
  .resume-document.ats-classic .resume-header { text-align: center; border-bottom: 1px solid #222222; }
  .resume-document.ats-classic .resume-name { font-size: 28px; }
  .resume-document.ats-classic .resume-role { color: #222222; }
  .resume-document.ats-classic .resume-skills { gap: 4px; }
  .resume-document.ats-classic .resume-skills li { border: 0; border-radius: 0; padding: 0; }
  .resume-document.ats-classic .resume-skills li:not(:last-child)::after { content: ","; }
  @page { size: A4; margin: 0; }
  @media print {
    body { background: #ffffff; }
    .resume-document { width: 210mm; min-height: 297mm; box-shadow: none; }
  }
`;

function splitLines(value) {
  return String(value || '')
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitSkills(value) {
  return String(value || '')
    .split(/,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fileSafeName(value) {
  return String(value || 'resume')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'resume';
}

function buildResumeSections(answers) {
  return [
    { key: 'summary', label: 'Professional Summary', type: 'paragraph', value: answers.summary },
    { key: 'skills', label: 'Skills', type: 'skills', value: splitSkills(answers.skills) },
    { key: 'experience', label: 'Work Experience', type: 'list', value: splitLines(answers.experience) },
    { key: 'projects', label: 'Projects', type: 'list', value: splitLines(answers.projects) },
    { key: 'education', label: 'Education', type: 'paragraph', value: answers.education },
    { key: 'certifications', label: 'Certifications', type: 'list', value: splitLines(answers.certifications) },
  ].filter((section) => (Array.isArray(section.value) ? section.value.length > 0 : Boolean(String(section.value || '').trim())));
}

function ResumeDocument({ answers, template }) {
  const sections = buildResumeSections(answers);

  return (
    <article className={`resume-document ${template.id}`}>
      <div className="resume-inner">
        <header className="resume-header">
          <h1 className="resume-name">{answers.fullName || 'Your Name'}</h1>
          <div className="resume-role">{answers.targetRole || 'Target Role'}</div>
          {answers.contactInfo && <div className="resume-contact">{answers.contactInfo}</div>}
        </header>

        <main className="resume-main">
          {sections.map((section) => (
            <section className="resume-section" key={section.key}>
              <h2>{section.label}</h2>
              {section.type === 'skills' ? (
                <ul className="resume-skills">
                  {section.value.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : section.type === 'list' ? (
                <ul className="resume-list">
                  {section.value.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{section.value}</p>
              )}
            </section>
          ))}
        </main>
      </div>
    </article>
  );
}

function buildResumeHtml(answers, template) {
  const sectionHtml = buildResumeSections(answers)
    .map((section) => {
      if (section.type === 'skills') {
        return `<section class="resume-section"><h2>${escapeHtml(section.label)}</h2><ul class="resume-skills">${section.value
          .map((skill) => `<li>${escapeHtml(skill)}</li>`)
          .join('')}</ul></section>`;
      }

      if (section.type === 'list') {
        return `<section class="resume-section"><h2>${escapeHtml(section.label)}</h2><ul class="resume-list">${section.value
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join('')}</ul></section>`;
      }

      return `<section class="resume-section"><h2>${escapeHtml(section.label)}</h2><p>${escapeHtml(section.value)}</p></section>`;
    })
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(answers.fullName || 'Resume')}</title>
    <style>
      body { margin: 0; background: #eef2f7; color: #172033; font-family: Arial, Helvetica, sans-serif; }
      ${printableResumeStyles}
    </style>
  </head>
  <body>
    <article class="resume-document ${escapeHtml(template.id)}">
      <div class="resume-inner">
        <header class="resume-header">
          <h1 class="resume-name">${escapeHtml(answers.fullName || 'Your Name')}</h1>
          <div class="resume-role">${escapeHtml(answers.targetRole || 'Target Role')}</div>
          ${answers.contactInfo ? `<div class="resume-contact">${escapeHtml(answers.contactInfo)}</div>` : ''}
        </header>
        <main class="resume-main">${sectionHtml}</main>
      </div>
    </article>
  </body>
</html>`;
}

function downloadFile(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ResumeCreatorPage() {
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [createdResume, setCreatedResume] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(resumeTemplates[0]);
  const [creatorStep, setCreatorStep] = useState('style');
  const [resumeReady, setResumeReady] = useState(false);
  const [creatorAnswers, setCreatorAnswers] = useState(
    creatorQuestions.reduce((acc, question) => ({ ...acc, [question.key]: '' }), {})
  );
  const [error, setError] = useState('');
  const generatedFileName = useMemo(() => fileSafeName(creatorAnswers.fullName), [creatorAnswers.fullName]);

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

      setCreatedResume(response.data.resume || '');
      setResumeReady(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating resume');
    } finally {
      setCreatorLoading(false);
    }
  };

  const handleDownloadHtml = () => {
    downloadFile(`${generatedFileName}-resume.html`, 'text/html;charset=utf-8', buildResumeHtml(creatorAnswers, selectedTemplate));
  };

  const handleDownloadWord = () => {
    downloadFile(`${generatedFileName}-resume.doc`, 'application/msword;charset=utf-8', buildResumeHtml(creatorAnswers, selectedTemplate));
  };

  const handlePrintPdf = () => {
    const printFrame = document.createElement('iframe');
    printFrame.title = 'Resume PDF Export';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    printFrame.style.opacity = '0';

    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDocument = printFrame.contentDocument || frameWindow?.document;

    if (!frameWindow || !frameDocument) {
      printFrame.remove();
      setError('Unable to prepare the resume PDF. Please try downloading Word or HTML instead.');
      return;
    }

    frameDocument.open();
    frameDocument.write(buildResumeHtml(creatorAnswers, selectedTemplate));
    frameDocument.close();

    const cleanupPrintFrame = () => {
      setTimeout(() => {
        printFrame.remove();
      }, 500);
    };

    frameWindow.onafterprint = cleanupPrintFrame;

    setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
      setTimeout(cleanupPrintFrame, 1500);
    }, 250);
  };

  return (
    <Container fluid className="page-shell theme-resume">
      <style>{printableResumeStyles}</style>

      <div className="page-head page-head-compact">
        <div className="page-icon">
          <FiEdit3 size={20} />
        </div>
        <h1 className="display-6 fw-bold mb-2">Resume Creator</h1>
        <p>Choose a resume style first, add your details, then download the finished resume.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {creatorStep === 'style' && (
          <Col xs={12}>
            <Card className="glass-card">
              <Card.Body>
                <Card.Title className="h5 d-flex align-items-center gap-2 mb-3">
                  <FiLayers />
                  Choose Resume Style
                </Card.Title>
                <Row className="g-3">
                  {resumeTemplates.map((template) => (
                    <Col md={4} key={template.id}>
                      <label className={`template-card h-100 ${selectedTemplate.id === template.id ? 'active' : ''}`}>
                        <Form.Check
                          type="radio"
                          name="resumeTemplate"
                          checked={selectedTemplate.id === template.id}
                          onChange={() => setSelectedTemplate(template)}
                          label={
                            <span>
                              <strong>{template.name}</strong>
                              <span className="d-block text-soft">{template.description}</span>
                            </span>
                          }
                        />
                      </label>
                    </Col>
                  ))}
                </Row>
                <Button type="button" className="btn-brand mt-3" onClick={() => setCreatorStep('details')}>
                  Continue To Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}

        {creatorStep === 'details' && (
          <Col xs={12}>
            <Card className="glass-card">
              <Card.Body>
                <div className="resume-creator-head">
                  <Card.Title className="h5 d-flex align-items-center gap-2 mb-0">
                    <FiPenTool />
                    Candidate Details
                  </Card.Title>
                  <Button type="button" variant="outline-light" onClick={() => setCreatorStep('style')}>
                    <FiArrowLeft className="me-2" />
                    Change Style
                  </Button>
                </div>
                <div className="text-soft mb-3">Selected style: {selectedTemplate.name}</div>

                <Form onSubmit={handleCreateResume}>
                  <Row className="g-3">
                    {creatorQuestions.map((question) => (
                      <Col md={question.key === 'fullName' || question.key === 'targetRole' ? 6 : 12} key={question.key}>
                        <Form.Group>
                          <Form.Label>{question.label}</Form.Label>
                          <Form.Control
                            as={question.key === 'fullName' || question.key === 'targetRole' ? 'input' : 'textarea'}
                            rows={question.key === 'projects' || question.key === 'experience' ? 4 : 2}
                            className="glass-input"
                            name={question.key}
                            value={creatorAnswers[question.key]}
                            onChange={handleCreatorChange}
                            placeholder={question.placeholder}
                            spellCheck={false}
                          />
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>

                  <Button type="submit" className="btn-brand mt-3" disabled={creatorLoading}>
                    {creatorLoading && <Spinner animation="border" size="sm" className="me-2" />}
                    {creatorLoading ? 'Creating Resume...' : 'Create Downloadable Resume'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {resumeReady && (
        <Card className="glass-card mt-4">
          <Card.Body>
            <div className="resume-output-head">
              <Card.Title className="h5 mb-0 d-flex align-items-center gap-2">
                <FiFileText />
                Downloadable Resume
              </Card.Title>
              <div className="resume-download-actions">
                <Button type="button" variant="outline-light" onClick={handlePrintPdf}>
                  <FiPrinter className="me-2" />
                  Save As PDF
                </Button>
                <Button type="button" className="btn-brand" onClick={handleDownloadWord}>
                  <FiDownload className="me-2" />
                  Download Word
                </Button>
                <Button type="button" variant="outline-light" onClick={handleDownloadHtml}>
                  <FiDownload className="me-2" />
                  Download HTML
                </Button>
              </div>
            </div>

            <div className="resume-preview-shell">
              <ResumeDocument answers={creatorAnswers} template={selectedTemplate} />
            </div>

            {createdResume && (
              <details className="ai-polish-details mt-3">
                <summary>View AI-written resume content</summary>
                <div className="glass-panel p-3 result-block mt-2">
                  <StructuredAiRenderer content={createdResume} />
                </div>
              </details>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
