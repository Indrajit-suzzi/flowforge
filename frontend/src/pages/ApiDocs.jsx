import { useState, useEffect } from 'react';
import { Book, Copy, Check, Download, ChevronRight, Search, Terminal, Key, ExternalLink, AlertCircle, Info, Menu, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import PageShell from '../components/PageShell';

const CodeBlock = ({ code, language, id, copied, onCopy }) => {
  const lines = code.split('\n');
  return (
    <div style={{ background: 'rgba(8, 5, 17, 0.6)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.03)' }}>
        <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{language}</span>
        <button onClick={() => onCopy(code, id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', color: copied === id ? '#34d399' : '#64748b', cursor: 'pointer', padding: '4px 10px', fontSize: '11px', borderRadius: '6px', transition: 'all 0.2s' }}>
          {copied === id ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
          {copied === id ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', lineHeight: '1.7', color: '#e2e8f0' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex' }}>
            <span style={{ width: '40px', flexShrink: 0, textAlign: 'right', paddingRight: '16px', color: '#475569', userSelect: 'none', fontSize: '12px' }}>{i + 1}</span>
            <span style={{ whiteSpace: 'pre', color: line.trim().startsWith('//') ? '#475569' : line.includes('import') || line.includes('const ') || line.includes('function ') || line.includes('return') ? '#60a5fa' : line.includes('"') || line.includes("'") || line.includes('`') ? '#34d399' : line.includes('}') || line.includes('{') || line.includes('[') || line.includes(']') || line.includes('(') || line.includes(')') ? '#c084fc' : '#e2e8f0' }}>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

const EndpointCard = ({ method, path, desc, response, params, body, id, copied, onCopy }) => {
  const methodColors = { GET: '#3b82f6', POST: '#10b981', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8, 5, 17, 0.3)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ padding: '3px 10px', borderRadius: '6px', background: methodColors[method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '55px', textAlign: 'center', letterSpacing: '0.5px' }}>{method}</span>
        <code style={{ fontSize: '13px', color: '#60a5fa', fontFamily: 'monospace', flex: 1 }}>{path}</code>
        <span style={{ fontSize: '12px', color: '#64748b', flexShrink: 0 }}>{desc}</span>
        <ChevronRight style={{ width: '16px', height: '16px', color: '#475569', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          {params && params.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Query Parameters</p>
              <div style={{ background: 'rgba(8, 5, 17, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                {params.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 14px', borderBottom: i < params.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <code style={{ fontSize: '12px', color: '#ff7e5f', fontFamily: 'monospace', minWidth: '80px' }}>{p.name}</code>
                    <span style={{ fontSize: '11px', color: '#64748b', flex: 1 }}>{p.desc}</span>
                    {p.required && <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontWeight: '600' }}>Required</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {body && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Request Body</p>
              <CodeBlock code={body} language="JSON" id={`${id}-req`} copied={copied} onCopy={onCopy} />
            </div>
          )}

          {response && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Response (200)</p>
              <CodeBlock code={response} language="JSON" id={`${id}-res`} copied={copied} onCopy={onCopy} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ApiDocs() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [activeSection, setActiveSection] = useState('getting-started');
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/api/v1/docs')
      .then(r => { setDocs(r.data); setLoading(false); })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to load API docs');
        setLoading(false);
      });
  }, []);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadMarkdown = () => {
    api.get('/api/v1/docs/markdown').then(r => {
      const blob = new Blob([r.data], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowforge-api-docs.md';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(err => {
      toast.error(err.response?.data?.error || 'Failed to download documentation');
    });
  };

  if (loading) return (
    <PageShell title="API Documentation" subtitle="Complete reference for the FlowForge API" icon={<Book style={{ width: '22px', height: '22px' }} />} loading />
  );

  if (error) return (
    <PageShell title="API Documentation" subtitle="Complete reference for the FlowForge API" icon={<Book style={{ width: '22px', height: '22px' }} />} error={error} />
  );

  if (!docs?.contentTypes?.length) return (
    <PageShell title="API Documentation" subtitle="Complete reference for the FlowForge API" icon={<Book style={{ width: '22px', height: '22px' }} />} maxWidth="800px">
      <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
          <Book style={{ width: '24px', height: '24px', color: '#ff7e5f' }} />
        </div>
        <p style={{ color: '#64748b', fontSize: '14px' }}>No content types yet. Create one first to see API docs.</p>
      </div>
    </PageShell>
  );

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: Terminal },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'graphql', label: 'GraphQL', icon: Terminal },
    { id: 'content-routes', label: 'Content Routes', icon: Book },
    { id: 'api-key-routes', label: 'API Key Routes', icon: Key },
    { id: 'media-routes', label: 'Media Routes', icon: Book },
    { id: 'analytics-routes', label: 'Analytics & Audit', icon: Book },
    { id: 'user-routes', label: 'User Routes', icon: Book },
    { id: 'webhook-routes', label: 'Webhook Routes', icon: Book },
    { id: 'sitemap', label: 'Sitemap', icon: Book },
  ];

  const filteredSections = sections.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const jsQuickCode = `const API_KEY = 'flow_xxxxx...';
const BASE_URL = '${docs.baseUrl}';

// Fetch all entries
const response = await fetch(\`\${BASE_URL}/dynamic/blog\`, {
  headers: { 'X-API-Key': API_KEY }
});
const posts = await response.json();`;

  const axiosCode = `import axios from 'axios';

const client = axios.create({
  baseURL: '${docs.baseUrl}',
  headers: { 'X-API-Key': 'your-api-key' }
});

const posts = await client.get('/dynamic/blog');`;

  const curlCode = `curl -H "X-API-Key: your-api-key" \\
  ${docs.baseUrl}/dynamic/blog`;

  const reactCode = `function BlogPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('${docs.baseUrl}/dynamic/blog', {
      headers: { 'X-API-Key': API_KEY }
    })
    .then(r => r.json())
    .then(setPosts);
  }, []);

  return (
    <div>
      {posts.map(post => (
        <article key={post._id}>
          <h2>{post.title}</h2>
          <div>{post.content}</div>
        </article>
      ))}
    </div>
  );
}`;

  return (
    <>
    <PageShell
      title="API Documentation"
      subtitle="Complete reference for the FlowForge API"
      icon={<Book style={{ width: '22px', height: '22px' }} />}
      maxWidth="1200px"
      actions={
        <button onClick={downloadMarkdown} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 20px' }}>
          <Download style={{ width: '14px', height: '14px' }} /> Download Markdown
        </button>
      }
    >
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div className={`api-docs-sidebar${sidebarOpen ? ' open' : ''}`} style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '100px', alignSelf: 'start' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', padding: '0 4px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Navigation</p>
              <div className="search-wrapper" style={{ marginBottom: '8px' }}>
                <Search className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search sections..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input" 
                  style={{ fontSize: '12px', padding: '6px 10px 6px 30px' }}
                />
              </div>
            </div>
            {filteredSections.map(s => {
              const isActive = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)} 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', textAlign: 'left', padding: '8px 10px',
                    fontSize: '13px', 
                    color: isActive ? '#f8fafc' : '#64748b',
                    background: isActive ? 'rgba(255,126,95,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(255,126,95,0.15)' : '1px solid transparent',
                    borderRadius: '10px', cursor: 'pointer', marginBottom: '2px',
                    fontFamily: "var(--font-body)", fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                >
                  <ChevronRight style={{ width: '10px', height: '10px', transform: isActive ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: isActive ? '#ff7e5f' : 'transparent' }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="api-docs-content" style={{ flex: 1, minWidth: 0 }}>
          <button 
            className="api-docs-mobile-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ 
              position: 'sticky', top: '0', zIndex: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,126,95,0.1)', border: '1px solid rgba(255,126,95,0.2)',
              color: '#ff7e5f', cursor: 'pointer', marginBottom: '12px'
            }}
          >
            {sidebarOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
          </button>
          {/* Getting Started */}
          {activeSection === 'getting-started' && (
            <div>
              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '16px', fontSize: '18px' }}>
                  <Terminal style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> Base URL
                </h2>
                <div style={{ background: 'rgba(8, 5, 17, 0.6)', borderRadius: '10px', padding: '14px 18px', border: '1px solid rgba(255, 126, 95, 0.12)' }}>
                  <code style={{ fontSize: '14px', color: '#ff7e5f', fontFamily: 'monospace', fontWeight: '500' }}>{docs.baseUrl}</code>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>All API endpoints are relative to this base URL.</p>
              </div>

              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                  <Terminal style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> Quick Start
                </h2>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#080511' }}>1</div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>Get your API Key</h3>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginLeft: '36px' }}>Go to <strong style={{ color: '#ff7e5f' }}>API Keys</strong> → click <strong style={{ color: '#f8fafc' }}>New API Key</strong> → copy the key (shown only once)</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#080511' }}>2</div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>Use in JavaScript</h3>
                  </div>
                  <div style={{ marginLeft: '36px' }}>
                    <CodeBlock code={jsQuickCode} language="JavaScript" id="js-quick" copied={copied} onCopy={copyToClipboard} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#080511' }}>3</div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>Use with Axios</h3>
                  </div>
                  <div style={{ marginLeft: '36px' }}>
                    <CodeBlock code={axiosCode} language="JavaScript" id="axios-quick" copied={copied} onCopy={copyToClipboard} />
                  </div>
                </div>

                <div style={{ marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff7e5f, #feb47b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#080511' }}>4</div>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>Use with cURL</h3>
                  </div>
                  <div style={{ marginLeft: '36px' }}>
                    <CodeBlock code={curlCode} language="Bash" id="curl-quick" copied={copied} onCopy={copyToClipboard} />
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '20px', fontSize: '18px' }}>
                  <ExternalLink style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> React Example
                </h2>
                <CodeBlock code={reactCode} language="JSX" id="react-example" copied={copied} onCopy={copyToClipboard} />
              </div>

              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '16px', fontSize: '18px' }}>
                  <Terminal style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> GraphQL API
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                  FlowForge also exposes a GraphQL endpoint for flexible data queries. Open the playground at your browser:
                </p>
                <div style={{ background: 'rgba(8, 5, 17, 0.6)', borderRadius: '10px', padding: '14px 18px', border: '1px solid rgba(255, 126, 95, 0.12)', marginBottom: '12px' }}>
                  <code style={{ fontSize: '14px', color: '#ff7e5f', fontFamily: 'monospace', fontWeight: '500' }}>{docs.baseUrl}/graphql</code>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  All GraphQL requests require the same authentication headers as REST. Use the Playground at <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#60a5fa' }}>{docs.baseUrl}/graphql</code> in your browser to explore the schema.
                </p>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#60a5fa', display: 'flex', gap: '10px', alignItems: 'start' }}>
                <Info style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong style={{ color: '#60a5fa' }}>Note:</strong> All responses include a <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>status</code> field (<code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>"success"</code> or <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>"error"</code>) and an optional <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>message</code> field.
                </div>
              </div>
            </div>
          )}

          {/* Authentication */}
          {activeSection === 'authentication' && (
            <div>
              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                  <Key style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> Authentication Methods
                </h2>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '10px', fontWeight: '700', letterSpacing: '0.3px' }}>RECOMMENDED</div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>Method 1: API Key</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Best for frontend apps, static sites, and server-to-server calls. Use the <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#ff7e5f' }}>X-API-Key</code> header.</p>
                  <CodeBlock code="X-API-Key: flow_xxxxx..." language="Header" id="auth-apikey" copied={copied} onCopy={copyToClipboard} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' }}>Method 2: JWT Token</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>For dashboard/admin use. Use the <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#ff7e5f' }}>Authorization: Bearer</code> header with your app JWT.</p>
                  <CodeBlock code="Authorization: Bearer eyJhbGci..." language="Header" id="auth-jwt" copied={copied} onCopy={copyToClipboard} />
                </div>

                <div style={{ background: 'rgba(255, 126, 95, 0.06)', border: '1px solid rgba(255, 126, 95, 0.15)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#feb47b' }}>
                  <strong style={{ color: '#ff7e5f' }}>Tip:</strong> API keys are scoped to your tenant and configured with specific permissions (read/write/delete) per content type.
                </div>
              </div>

              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '16px', fontSize: '18px' }}>
                  <AlertCircle style={{ width: '18px', height: '18px', color: '#f59e0b' }} /> Error Responses
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { code: '400', label: 'Bad Request', desc: 'Invalid request body or missing fields' },
                    { code: '401', label: 'Unauthorized', desc: 'Missing or invalid API key / token' },
                    { code: '403', label: 'Forbidden', desc: 'Insufficient permissions for this action' },
                    { code: '404', label: 'Not Found', desc: 'Resource does not exist' },
                    { code: '422', label: 'Validation Error', desc: 'Request body failed schema validation' },
                    { code: '500', label: 'Server Error', desc: 'Internal server error' },
                  ].map(err => (
                    <div key={err.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(8, 5, 17, 0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '5px', background: err.code.startsWith('4') ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: err.code.startsWith('4') ? '#fca5a5' : '#fbbf24', fontSize: '11px', fontWeight: '700', minWidth: '35px', textAlign: 'center' }}>{err.code}</span>
                      <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500', minWidth: '120px' }}>{err.label}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{err.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GraphQL */}
          {activeSection === 'graphql' && (
            <div>
              <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
                <h2 className="section-heading" style={{ marginBottom: '16px', fontSize: '18px' }}>
                  <Terminal style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> GraphQL API
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                  FlowForge provides a GraphQL endpoint for flexible queries. Visit the Playground in your browser to explore the schema.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' }}>Endpoint</h3>
                  <div style={{ background: 'rgba(8, 5, 17, 0.6)', borderRadius: '10px', padding: '14px 18px', border: '1px solid rgba(255, 126, 95, 0.12)' }}>
                    <code style={{ fontSize: '14px', color: '#ff7e5f', fontFamily: 'monospace' }}>{docs.baseUrl}/graphql</code>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' }}>Example Query</h3>
                  <CodeBlock code={`query {
  contentTypes {
    name
    slug
    fields { name type }
  }
  entries(contentTypeSlug: "blog") {
    _id
    status
    createdAt
  }
}`} language="GraphQL" id="gql-example" copied={copied} onCopy={copyToClipboard} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '8px' }}>Example Mutation</h3>
                  <CodeBlock code={`mutation {
  createEntry(contentTypeSlug: "blog", data: {
    title: "Hello from GraphQL"
    content: "This entry was created via the GraphQL API"
    status: "draft"
  }) {
    _id
    status
    createdAt
  }
}`} language="GraphQL" id="gql-mutation" copied={copied} onCopy={copyToClipboard} />
                </div>

                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#60a5fa', display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <Info style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <strong style={{ color: '#60a5fa' }}>Auth:</strong> GraphQL requests use the same authentication as REST. Include <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Authorization: Bearer</code> or <code style={{ background: 'rgba(8,5,17,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>X-API-Key</code> headers. The Playground will prompt for auth — paste your token or API key there.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Routes */}
          {activeSection === 'content-routes' && (
            <div>
              {docs.contentTypes.map((ct) => (
                <div key={ct.slug} className="glass-card" style={{ marginBottom: '20px', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
                      <Book style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{ct.name}</h2>
                      <code style={{ fontSize: '12px', color: '#ff7e5f', fontFamily: 'monospace' }}>/{ct.slug}</code>
                    </div>
                  </div>

                  <div style={{ padding: '20px 24px' }}>
                    <h3 className="section-heading" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>Fields</h3>
                    <div style={{ background: 'rgba(8, 5, 17, 0.4)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', marginBottom: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '10px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span>Name</span><span>Type</span><span>Required</span>
                      </div>
                      {ct.fields.map((f, i) => (
                        <div key={f.name} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', padding: '8px 14px', borderBottom: i < ct.fields.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: '13px' }}>
                          <span style={{ color: '#f8fafc', fontWeight: '500' }}>{f.name}</span>
                          <span style={{ color: '#64748b', fontSize: '12px' }}>{f.type}</span>
                          <span style={{ color: f.required ? '#ff7e5f' : '#475569', fontSize: '12px' }}>{f.required ? 'Yes' : 'No'}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className="section-heading" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>Endpoints</h3>

                    <EndpointCard
                      method="GET" path={`/dynamic/${ct.slug}`} desc="List all entries" id={`${ct.slug}-list`}
                      params={[
                        { name: 'status', desc: 'Filter by draft/published' },
                        { name: 'search', desc: 'Search across all fields' },
                        { name: 'sort', desc: 'Sort field name' },
                        { name: 'order', desc: 'asc or desc' },
                      ]}
                      response={`{
  "status": "success",
  "count": 2,
  "data": [
    {
      "_id": "673f8b9e11c4",
      "status": "published",
      ${ct.fields.map(f => `"${f.name}": ...`).join(',\n      ')}
    }
  ]
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="POST" path={`/dynamic/${ct.slug}`} desc="Create entry" id={`${ct.slug}-create`}
                      body={`{
  "status": "draft",
  ${ct.fields.map(f => `"${f.name}": ...`).join(',\n  ')}
}`}
                      response={`{
  "status": "success",
  "data": {
    "_id": "673f8b9e11c4",
    "status": "draft",
    ${ct.fields.map(f => `"${f.name}": ...`).join(',\n    ')}
  }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="GET" path={`/dynamic/${ct.slug}/:id`} desc="Get single entry" id={`${ct.slug}-get`}
                      response={`{
  "status": "success",
  "data": {
    "_id": "673f8b9e11c4",
    "status": "published",
    ${ct.fields.map(f => `"${f.name}": ...`).join(',\n    ')}
  }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="PUT" path={`/dynamic/${ct.slug}/:id`} desc="Update entry" id={`${ct.slug}-update`}
                      body={`{
  ${ct.fields.map(f => `"${f.name}": ...`).join(',\n  ')}
}`}
                      response={`{
  "status": "success",
  "data": {
    "_id": "673f8b9e11c4",
    ${ct.fields.map(f => `"${f.name}": ...`).join(',\n    ')}
  }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="DELETE" path={`/dynamic/${ct.slug}/:id`} desc="Delete entry" id={`${ct.slug}-delete`}
                      response={`{
  "status": "success",
  "message": "Entry deleted"
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="PATCH" path={`/dynamic/${ct.slug}/:id/publish`} desc="Publish entry" id={`${ct.slug}-publish`}
                      response={`{
  "status": "success",
  "data": {
    "_id": "673f8b9e11c4",
    "status": "published"
  }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="PATCH" path={`/dynamic/${ct.slug}/:id/unpublish`} desc="Unpublish entry" id={`${ct.slug}-unpublish`}
                      response={`{
  "status": "success",
  "data": {
    "_id": "673f8b9e11c4",
    "status": "draft"
  }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="GET" path={`/dynamic/${ct.slug}/export/json`} desc="Export as JSON" id={`${ct.slug}-json`}
                      response={`[
  {
    "_id": "673f8b9e11c4",
    ${ct.fields.map(f => `"${f.name}": ...`).join(',\n    ')}
  }
]`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="GET" path={`/dynamic/${ct.slug}/export/csv`} desc="Export as CSV" id={`${ct.slug}-csv`}
                      response={`_id,status,${ct.fields.map(f => f.name).join(',')}\n673f8b9e11c4,published,...`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="GET" path={`/dynamic/${ct.slug}/:id/versions`} desc="List all versions" id={`${ct.slug}-versions`}
                      response={`{
  "status": "success",
  "count": 3,
  "data": [
    {
      "_id": "...",
      "version": 3,
      "changeDescription": "Updated",
      "status": "draft",
      "createdAt": "2026-05-22T12:00:00Z"
    }
  ]
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="GET" path={`/dynamic/${ct.slug}/:id/versions/:versionId`} desc="Get specific version" id={`${ct.slug}-version-get`}
                      response={`{
  "status": "success",
  "data": {
    "_id": "...",
    "version": 2,
    "changeDescription": "Updated title",
    "data": { ... full entry snapshot ... },
    "status": "draft",
    "createdAt": "2026-05-22T11:00:00Z"
  }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />

                    <EndpointCard
                      method="POST" path={`/dynamic/${ct.slug}/:id/rollback/:versionId`} desc="Rollback to version" id={`${ct.slug}-rollback`}
                      response={`{
  "status": "success",
  "message": "Rolled back to version 2",
  "data": { ... restored entry ... }
}`}
                      copied={copied} onCopy={copyToClipboard}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API Key Routes */}
          {activeSection === 'api-key-routes' && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                <Key style={{ width: '18px', height: '18px', color: '#ff7e5f' }} /> API Key Management
              </h2>

              <EndpointCard
                method="POST" path="/api/v1/api-keys" desc="Create API key" id="apikey-create"
                body={`{
  "name": "Production App"
}`}
                response={`{
  "status": "success",
  "key": "flow_xxxxxxxxxxxxxxxxxxxx",
  "name": "Production App",
  "isActive": true,
  "createdAt": "2026-05-21T12:00:00Z"
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/api-keys" desc="List all keys" id="apikey-list"
                response={`{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "name": "Production App",
      "keyPreview": "flow_abc...xyz",
      "isActive": true,
      "createdAt": "2026-05-21T12:00:00Z"
    }
  ]
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="DELETE" path="/api/v1/api-keys/:id" desc="Revoke a key" id="apikey-delete"
                response={`{
  "status": "success",
  "message": "API key revoked"
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <div style={{ marginTop: '20px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#fca5a5', display: 'flex', gap: '10px', alignItems: 'start' }}>
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong style={{ color: '#fca5a5' }}>Warning:</strong> The full API key is only shown once at creation time. Store it securely — it cannot be retrieved later.
                </div>
              </div>
            </div>
          )}

          {/* Media Routes */}
          {activeSection === 'media-routes' && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                Media Library
              </h2>

              <EndpointCard
                method="POST" path="/api/v1/media" desc="Upload file" id="media-upload"
                body={`// multipart/form-data
// Field: "file" (binary)`}
                response={`{
  "status": "success",
  "data": {
    "_id": "...",
    "originalName": "photo.jpg",
    "url": "/api/v1/media/photo.jpg",
    "type": "image",
    "size": 245678,
    "createdAt": "2026-05-21T12:00:00Z"
  }
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/media" desc="List all files" id="media-list"
                params={[
                  { name: 'type', desc: 'Filter: image, document, video, audio' },
                ]}
                response={`{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "originalName": "photo.jpg",
      "url": "/api/v1/media/photo.jpg",
      "type": "image",
      "size": 245678
    }
  ]
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="DELETE" path="/api/v1/media/:id" desc="Delete a file" id="media-delete"
                response={`{
  "status": "success",
  "message": "File deleted"
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/media/:fileName" desc="Serve file" id="media-serve"
                response={`// Returns the raw file binary with appropriate Content-Type`}
                copied={copied} onCopy={copyToClipboard}
              />
            </div>
          )}

          {/* Analytics Routes */}
          {activeSection === 'analytics-routes' && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                Analytics & Audit Logs
              </h2>

              <EndpointCard
                method="GET" path="/api/v1/analytics" desc="Get usage stats" id="analytics-get"
                params={[
                  { name: 'period', desc: 'Time range: 24h, 7d, 30d, 90d' },
                ]}
                response={`{
  "status": "success",
  "totalRequests": 1250,
  "successfulRequests": 1180,
  "failedRequests": 70,
  "avgResponseTime": 45,
  "requestsByDay": [
    { "_id": "2026-05-20", "count": 150 }
  ],
  "requestsByMethod": [
    { "_id": "GET", "count": 900 },
    { "_id": "POST", "count": 350 }
  ],
  "requestsByEndpoint": [
    { "_id": "/dynamic/blog", "count": 500 }
  ],
  "recentRequests": [...]
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/analytics/top-endpoints" desc="Top endpoints" id="analytics-top"
                response={`{
  "status": "success",
  "data": [
    { "endpoint": "/dynamic/blog", "count": 500 },
    { "endpoint": "/dynamic/products", "count": 320 }
  ]
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/audit-logs" desc="Get audit logs" id="audit-logs"
                params={[
                  { name: 'page', desc: 'Page number (default: 1)' },
                  { name: 'limit', desc: 'Items per page (default: 50)' },
                  { name: 'action', desc: 'Filter: create, update, delete, etc.' },
                  { name: 'entityType', desc: 'Filter: entry, contentType, apiKey' },
                ]}
                response={`{
  "status": "success",
  "logs": [
    {
      "_id": "...",
      "action": "create",
      "entityType": "entry",
      "entityName": "Blog Post #1",
      "createdAt": "2026-05-21T12:00:00Z",
      "ipAddress": "127.0.0.1"
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/audit-logs/stats" desc="Log statistics" id="audit-stats"
                response={`{
  "status": "success",
  "data": [
    { "_id": "create", "count": 45 },
    { "_id": "update", "count": 30 },
    { "_id": "delete", "count": 12 }
  ]
}`}
                copied={copied} onCopy={copyToClipboard}
              />
            </div>
          )}

          {/* User Routes */}
          {activeSection === 'user-routes' && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                User Management
              </h2>

              <EndpointCard
                method="GET" path="/api/v1/users/me" desc="Get current user" id="user-me"
                response={`{
  "status": "success",
  "_id": "...",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "member",
  "isActive": true,
  "createdAt": "2026-05-21T12:00:00Z"
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/users" desc="List all users" id="user-list"
                response={`{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "member",
      "isActive": true
    }
  ]
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="POST" path="/api/v1/users" desc="Create user" id="user-create"
                body={`{
  "username": "new_user",
  "email": "new@example.com",
  "password": "secure123",
  "role": "member"
}`}
                response={`{
  "status": "success",
  "data": {
    "_id": "...",
    "username": "new_user",
    "email": "new@example.com",
    "role": "member",
    "isActive": true
  }
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="PUT" path="/api/v1/users/:id" desc="Update user" id="user-update"
                body={`{
  "role": "admin",
  "isActive": true
}`}
                response={`{
  "status": "success",
  "data": {
    "_id": "...",
    "username": "john_doe",
    "role": "admin",
    "isActive": true
  }
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="DELETE" path="/api/v1/users/:id" desc="Delete user" id="user-delete"
                response={`{
  "status": "success",
  "message": "User deleted"
}`}
                copied={copied} onCopy={copyToClipboard}
              />
            </div>
          )}

          {/* Webhook Routes */}
          {activeSection === 'webhook-routes' && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                Webhooks
              </h2>

              <EndpointCard
                method="POST" path="/api/v1/webhooks" desc="Create webhook" id="webhook-create"
                body={`{
  "name": "Deploy Hook",
  "url": "https://example.com/webhook",
  "events": ["content.create", "content.update"],
  "contentType": "blog"
}`}
                response={`{
  "status": "success",
  "data": {
    "_id": "...",
    "name": "Deploy Hook",
    "url": "https://example.com/webhook",
    "events": ["content.create", "content.update"],
    "isActive": true,
    "createdAt": "2026-05-21T12:00:00Z"
  }
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="GET" path="/api/v1/webhooks" desc="List webhooks" id="webhook-list"
                response={`{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "name": "Deploy Hook",
      "url": "https://example.com/webhook",
      "events": ["content.create", "content.update"],
      "isActive": true,
      "lastTriggered": "2026-05-21T12:00:00Z",
      "lastStatus": "success"
    }
  ]
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="PUT" path="/api/v1/webhooks/:id" desc="Update webhook" id="webhook-update"
                body={`{
  "name": "Updated Hook",
  "isActive": false
}`}
                response={`{
  "status": "success",
  "data": {
    "_id": "...",
    "name": "Updated Hook",
    "isActive": false
  }
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <EndpointCard
                method="DELETE" path="/api/v1/webhooks/:id" desc="Delete webhook" id="webhook-delete"
                response={`{
  "status": "success",
  "message": "Webhook deleted"
}`}
                copied={copied} onCopy={copyToClipboard}
              />

              <div style={{ marginTop: '24px' }}>
                <h3 className="section-heading" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
                  Available Events
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['content.create', 'content.update', 'content.delete', 'content.publish', 'content.unpublish'].map(e => (
                    <span key={e} style={{ padding: '5px 12px', background: 'rgba(255, 126, 95, 0.08)', borderRadius: '8px', fontSize: '12px', color: '#ff7e5f', border: '1px solid rgba(255, 126, 95, 0.12)' }}>{e}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3 className="section-heading" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
                  Webhook Payload
                </h3>
                <CodeBlock code={`{
  "event": "content.create",
  "contentType": "blog",
  "data": {
    "_id": "673f8b9e11c4",
    "title": "New Post",
    "status": "draft"
  },
  "timestamp": "2026-05-21T12:00:00Z"
}`} language="JSON" id="webhook-payload" copied={copied} onCopy={copyToClipboard} />
              </div>
            </div>
          )}

          {/* Sitemap */}
          {activeSection === 'sitemap' && (
            <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <h2 className="section-heading" style={{ marginBottom: '24px', fontSize: '18px' }}>
                Sitemap
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.7' }}>
                Generate an XML sitemap of all published entries for SEO. The sitemap includes all content types
                and their published entries with last-modified dates.
              </p>
              <EndpointCard
                method="GET" path="/api/v1/sitemap.xml?tenant={tenantId}" desc="Generate sitemap XML" id="sitemap"
                response={`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://flowforge.app/</loc><priority>1.0</priority></url>
  <url><loc>https://flowforge.app/blog/123</loc><lastmod>2026-05-21</lastmod><priority>0.8</priority></url>
</urlset>`}
                params={[{ name: 'tenant', type: 'query', desc: 'Tenant ID (or pass X-Tenant-Id header)' }]}
                copied={copied} onCopy={copyToClipboard}
              />
            </div>
          )}
        </div>
      </div>
    </PageShell>
      <style>{`
@media (max-width: 768px) {
  .api-docs-sidebar { display: none; }
  .api-docs-sidebar.open { display: block; position: fixed; left: 0; top: 70px; bottom: 0; width: 260px; z-index: 50; background: rgba(8,5,17,0.98); overflow-y: auto; padding: 20px; border-right: 1px solid rgba(255,255,255,0.08); }
  .api-docs-mobile-toggle { display: flex !important; }
  .api-docs-content { margin-left: 0 !important; }
}
.api-docs-mobile-toggle { display: none; }
      `}</style>
    </>
  );
}
