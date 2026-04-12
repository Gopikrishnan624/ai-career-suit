import { Badge, Card, ListGroup } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function toTitleCase(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (match) => match.toUpperCase());
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function renderPrimitive(value) {
  if (typeof value === 'string') {
    return (
      <div className="analysis-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

function renderArray(items) {
  if (items.length === 0) {
    return <span className="text-light opacity-75">No details provided.</span>;
  }

  const primitiveItems = items.every((item) => !isPlainObject(item) && !Array.isArray(item));

  if (primitiveItems) {
    return (
      <div className="d-flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge bg="dark" key={`${String(item)}-${index}`} className="structured-badge">
            {String(item)}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {items.map((item, index) => (
        <div key={index} className="glass-panel p-3">
          <StructuredAiRenderer content={item} />
        </div>
      ))}
    </div>
  );
}

export default function StructuredAiRenderer({ content }) {
  if (content == null) {
    return <span className="text-light opacity-75">No details provided.</span>;
  }

  if (!isPlainObject(content) && !Array.isArray(content)) {
    return renderPrimitive(content);
  }

  if (Array.isArray(content)) {
    return renderArray(content);
  }

  if (typeof content.text === 'string' && Object.keys(content).length === 1) {
    return renderPrimitive(content.text);
  }

  return (
    <ListGroup variant="flush" className="structured-list">
      {Object.entries(content).map(([key, value]) => (
        <ListGroup.Item key={key} className="bg-transparent text-light border-secondary-subtle px-0">
          <Card className="glass-panel structured-card">
            <Card.Body>
              <div className="structured-label">{toTitleCase(key)}</div>
              <div className="structured-value">
                <StructuredAiRenderer content={value} />
              </div>
            </Card.Body>
          </Card>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
