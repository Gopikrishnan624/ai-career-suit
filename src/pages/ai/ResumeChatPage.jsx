import { useState } from 'react';
import { Alert, Badge, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StructuredAiRenderer from '../../components/StructuredAiRenderer';
import { chatWithResume } from '../../services/aiService';
import { loadResumeWorkspace } from '../../utils/resumeWorkspace';

export default function ResumeChatPage() {
  const [workspace] = useState(() => loadResumeWorkspace());
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [error, setError] = useState('');

  const handleAskResume = async (e) => {
    e.preventDefault();
    if (!workspace.resumeText || !chatQuestion.trim()) {
      setError('Analyze a resume first from the Resume Analysis page, then ask your question.');
      return;
    }

    const nextMessages = [...chatMessages, { role: 'user', content: chatQuestion.trim() }];

    try {
      setChatLoading(true);
      setError('');
      const response = await chatWithResume({
        resumeText: workspace.resumeText,
        question: chatQuestion.trim(),
        messages: nextMessages,
      });

      setChatMessages([
        ...nextMessages,
        { role: 'assistant', content: response.data.reply },
      ]);
      setChatQuestion('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error chatting with resume coach');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Container fluid className="page-shell theme-resume">
      <div className="page-head page-head-compact">
        <div className="page-icon">
          <FiMessageSquare size={20} />
        </div>
        <h1 className="display-6 fw-bold mb-2">Resume Coach Chat</h1>
        <p>Ask targeted questions about your uploaded resume and get coaching in context.</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {!workspace.resumeText && (
        <Alert variant="warning">
          No analyzed resume found in your workspace yet. Start from Resume Analysis to unlock chat.
        </Alert>
      )}

      <Card className="glass-card">
        <Card.Body>
          <div className="chat-thread result-block">
            {chatMessages.length > 0 ? (
              chatMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}>
                  <Badge bg={message.role === 'user' ? 'info' : 'dark'} className="mb-2 text-capitalize">
                    {message.role}
                  </Badge>
                  {message.role === 'assistant' ? (
                    <StructuredAiRenderer content={message.content} />
                  ) : (
                    <div className="analysis-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state-panel">
                <strong>Suggested prompts</strong>
                <p className="mb-2 text-light opacity-75">Ask better, more focused questions to improve the resume faster.</p>
                <div className="d-flex flex-wrap gap-2">
                  {[
                    'Rewrite my summary for a frontend developer role',
                    'What skills are missing for a data analyst job?',
                    'Which experience bullets are weakest?',
                  ].map((prompt) => (
                    <Button key={prompt} variant="outline-light" size="sm" onClick={() => setChatQuestion(prompt)}>
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Form onSubmit={handleAskResume} className="mt-3">
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={4}
                className="glass-input"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Ask the resume coach a question..."
              />
            </Form.Group>
            <Button type="submit" className="btn-brand" disabled={chatLoading}>
              <FiSend className="me-2" />
              {chatLoading && <Spinner animation="border" size="sm" className="me-2" />}
              {chatLoading ? 'Thinking...' : 'Send Question'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
