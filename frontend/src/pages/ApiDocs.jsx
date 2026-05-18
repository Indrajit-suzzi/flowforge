import { useState, useEffect } from 'react';
import { Book, Copy, Check, Download, Code, Globe, Key, ExternalLink, Terminal } from 'lucide-react';
import api from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';

const CodeBlock = ({ code, language, id, copied, onCopy }) => {
  const lines = code.split('\n');
  return (
    <div style={{ background: '#0a0f1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #1e293b', background: '#111827' }}>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase' }}>{language}</span>
        <button onClick={() => onCopy(code, id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: copied === id ? '#34d399' : '#64748b', cursor: 'pointer', padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}>
          {copied === id ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
          {copied === id ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '13px', lineHeight: '1.6', color: '#e2e8f0' }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex' }}>
            <span style={{ width: '40px', flexShrink: 0, textAlign: 'right', paddingRight: '16px', color: '#475569', userSelect: 'none', fontSize: '12px' }}>{i + 1}</span>
            <span style={{ whiteSpace: 'pre' }}>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default function ApiDocs() {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [activeSection, setActiveSection] = useState('getting-started');

  useEffect(() => {
    api.get('/api/v1/docs').then(r => { setDocs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadMarkdown = () => {
    api.get('/api/v1/docs/markdown').then(r => {
      const blob = new Blob([r.data], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowforge-api-docs.md';
      a.click();
    });
  };

  if (loading) return <LoadingScreen message="Loading API docs" />;
  if (!docs?.contentTypes?.length) return <div style={{ padding: '32px', color: '#64748b' }}>No content types found. Create one first.</div>;

  const methodColors = { GET: '#3b82f6', POST: '#10b981', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };

  const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'content-routes', label: 'Content Routes' },
    { id: 'api-key-routes', label: 'API Key Routes' },
    { id: 'media-routes', label: 'Media Routes' },
    { id: 'analytics-routes', label: 'Analytics & Audit' },
    { id: 'user-routes', label: 'User Routes' },
    { id: 'webhook-routes', label: 'Webhook Routes' },
  ];

  const jsQuickCode = `const API_KEY = 'flow_xxxxx...';
const BASE_URL = 'http://localhost:3000/api/v1';

// Fetch all blog posts
const response = await fetch(\`\${BASE_URL}/dynamic/blog\`, {
  headers: { 'X-API-Key': API_KEY }
});
const posts = await response.json();`;

  const axiosCode = `import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: { 'X-API-Key': 'your-api-key' }
});

const posts = await client.get('/dynamic/blog');`;

  const curlCode = `curl -H "X-API-Key: your-api-key" \\
  http://localhost:3000/api/v1/dynamic/blog`;

  const reactCode = `function BlogPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/dynamic/blog', {
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
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      ))}
    </div>
  );
}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '24px' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0, position: 'sticky', top: '80px', alignSelf: 'start' }}>
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', marginBottom: '12px' }}>Navigation</h3>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', fontSize: '13px', color: activeSection === s.id ? '#f1f5f9' : '#64748b', background: activeSection === s.id ? '#1e293b' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '2px' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Book style={{ width: '24px', height: '24px', color: '#64748b' }} /> API Documentation
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Complete reference for FlowForge API</p>
          </div>
          <button onClick={downloadMarkdown} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', color: '#e2e8f0', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>
            <Download style={{ width: '14px', height: '14px' }} /> Download MD
          </button>
        </div>

        {/* Getting Started */}
        {activeSection === 'getting-started' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px' }}>Base URL</h2>
              <code style={{ fontSize: '14px', color: '#60a5fa', fontFamily: 'monospace' }}>{docs.baseUrl}</code>
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Quick Start - Using API Key in Your Project</h2>
              
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>Step 1: Get your API Key</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Go to <strong style={{ color: '#f1f5f9' }}>API Keys</strong> page → Click <strong style={{ color: '#f1f5f9' }}>New API Key</strong> → Copy the key (shown only once)</p>

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>Step 2: Use in JavaScript/Frontend</h3>
              <div style={{ marginBottom: '16px' }}>
                <CodeBlock code={jsQuickCode} language="JavaScript" id="js-quick" copied={copied} onCopy={copyToClipboard} />
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>Step 3: Use with Axios</h3>
              <div style={{ marginBottom: '16px' }}>
                <CodeBlock code={axiosCode} language="JavaScript" id="axios-quick" copied={copied} onCopy={copyToClipboard} />
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>Step 4: Use with cURL</h3>
              <CodeBlock code={curlCode} language="Bash" id="curl-quick" copied={copied} onCopy={copyToClipboard} />
            </div>

            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>React Example - Display Content</h2>
              <CodeBlock code={reactCode} language="JSX" id="react-example" copied={copied} onCopy={copyToClipboard} />
            </div>
          </div>
        )}

        {/* Authentication */}
        {activeSection === 'authentication' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key style={{ width: '18px', height: '18px', color: '#64748b' }} /> Authentication Methods
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#60a5fa', marginBottom: '8px' }}>Method 1: API Key (Recommended for external projects)</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Use the <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>X-API-Key</code> header. Best for frontend apps, static sites, and server-to-server calls.</p>
                <CodeBlock code="X-API-Key: flow_xxxxx..." language="Header" id="auth-apikey" copied={copied} onCopy={copyToClipboard} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#60a5fa', marginBottom: '8px' }}>Method 2: JWT Token (For dashboard/admin)</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Use the <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Authorization: Bearer</code> header. Get token from <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>POST /api/auth/login</code>.</p>
                <CodeBlock code="Authorization: Bearer eyJhbGci..." language="Header" id="auth-jwt" copied={copied} onCopy={copyToClipboard} />
              </div>

              <div style={{ background: '#1e3a5f', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#60a5fa' }}>
                <strong>Tip:</strong> API keys are scoped to your tenant. They can only access your own content. Each key has permissions (read/write/delete) configured when created.
              </div>
            </div>
          </div>
        )}

        {/* Content Routes */}
        {activeSection === 'content-routes' && (
          <div>
            {docs.contentTypes.map(ct => (
              <div key={ct.slug} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>{ct.name}</h2>
                  <code style={{ fontSize: '12px', color: '#60a5fa', fontFamily: 'monospace' }}>/{ct.slug}</code>
                </div>

                <div style={{ padding: '16px 20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>Fields</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                    {ct.fields.map(f => (
                      <div key={f.name} style={{ padding: '8px 12px', background: '#0a0f1e', borderRadius: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#f1f5f9' }}>{f.name}</span>
                        <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '6px' }}>{f.type}</span>
                        {f.required && <span style={{ fontSize: '10px', color: '#f59e0b', marginLeft: '4px' }}>*</span>}
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px' }}>Endpoints</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Object.entries(ct.endpoints).map(([key, ep]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#0a0f1e', borderRadius: '6px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: methodColors[ep.method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '50px', textAlign: 'center' }}>{ep.method}</span>
                        <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', flex: 1 }}>{ep.path}</code>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.description}</span>
                        <button onClick={() => copyToClipboard(`${ep.method} ${docs.baseUrl}${ep.path}`, `${ct.slug}-${key}`)} style={{ background: 'transparent', border: 'none', color: copied === `${ct.slug}-${key}` ? '#34d399' : '#64748b', cursor: 'pointer' }}>
                          {copied === `${ct.slug}-${key}` ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Key Routes */}
        {activeSection === 'api-key-routes' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>API Key Management</h2>
              {[
                { method: 'POST', path: '/api/v1/api-keys', desc: 'Create new API key', body: '{ "name": "My Key", "scopes": [{ "contentType": "*", "permissions": ["read", "write", "delete"] }] }' },
                { method: 'GET', path: '/api/v1/api-keys', desc: 'List all API keys' },
                { method: 'DELETE', path: '/api/v1/api-keys/:id', desc: 'Revoke an API key' },
              ].map((ep, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#0a0f1e', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: methodColors[ep.method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '50px', textAlign: 'center' }}>{ep.method}</span>
                  <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', flex: 1 }}>{ep.path}</code>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.desc}</span>
                  <button onClick={() => copyToClipboard(`${ep.method} ${docs.baseUrl}${ep.path}`, `apikey-${i}`)} style={{ background: 'transparent', border: 'none', color: copied === `apikey-${i}` ? '#34d399' : '#64748b', cursor: 'pointer' }}>
                    {copied === `apikey-${i}` ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Routes */}
        {activeSection === 'media-routes' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Media Library</h2>
              {[
                { method: 'POST', path: '/api/v1/media', desc: 'Upload file (multipart/form-data)' },
                { method: 'GET', path: '/api/v1/media', desc: 'List all media files' },
                { method: 'GET', path: '/api/v1/media?{type=image}', desc: 'Filter by type' },
                { method: 'DELETE', path: '/api/v1/media/:id', desc: 'Delete a file' },
                { method: 'GET', path: '/api/v1/media/:fileName', desc: 'Serve file directly' },
              ].map((ep, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#0a0f1e', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: methodColors[ep.method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '50px', textAlign: 'center' }}>{ep.method}</span>
                  <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', flex: 1 }}>{ep.path}</code>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.desc}</span>
                  <button onClick={() => copyToClipboard(`${ep.method} ${docs.baseUrl}${ep.path}`, `media-${i}`)} style={{ background: 'transparent', border: 'none', color: copied === `media-${i}` ? '#34d399' : '#64748b', cursor: 'pointer' }}>
                    {copied === `media-${i}` ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Routes */}
        {activeSection === 'analytics-routes' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Analytics & Audit Logs</h2>
              {[
                { method: 'GET', path: '/api/v1/analytics', desc: 'Get API usage stats' },
                { method: 'GET', path: '/api/v1/analytics?{period=7d}', desc: 'Filter by period (24h, 7d, 30d, 90d)' },
                { method: 'GET', path: '/api/v1/analytics/top-endpoints', desc: 'Top used endpoints' },
                { method: 'GET', path: '/api/v1/audit-logs', desc: 'Get audit logs' },
                { method: 'GET', path: '/api/v1/audit-logs?{page=1&limit=50}', desc: 'Paginated audit logs' },
                { method: 'GET', path: '/api/v1/audit-logs/stats', desc: 'Audit log statistics' },
              ].map((ep, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#0a0f1e', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: methodColors[ep.method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '50px', textAlign: 'center' }}>{ep.method}</span>
                  <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', flex: 1 }}>{ep.path}</code>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.desc}</span>
                  <button onClick={() => copyToClipboard(`${ep.method} ${docs.baseUrl}${ep.path}`, `analytics-${i}`)} style={{ background: 'transparent', border: 'none', color: copied === `analytics-${i}` ? '#34d399' : '#64748b', cursor: 'pointer' }}>
                    {copied === `analytics-${i}` ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Routes */}
        {activeSection === 'user-routes' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>User Management</h2>
              {[
                { method: 'GET', path: '/api/v1/users/me', desc: 'Get current user' },
                { method: 'GET', path: '/api/v1/users', desc: 'List all users (admin only)' },
                { method: 'POST', path: '/api/v1/users', desc: 'Create user (admin only)' },
                { method: 'PUT', path: '/api/v1/users/:id', desc: 'Update user role/permissions' },
                { method: 'DELETE', path: '/api/v1/users/:id', desc: 'Delete user (admin only)' },
              ].map((ep, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#0a0f1e', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: methodColors[ep.method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '50px', textAlign: 'center' }}>{ep.method}</span>
                  <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', flex: 1 }}>{ep.path}</code>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.desc}</span>
                  <button onClick={() => copyToClipboard(`${ep.method} ${docs.baseUrl}${ep.path}`, `user-${i}`)} style={{ background: 'transparent', border: 'none', color: copied === `user-${i}` ? '#34d399' : '#64748b', cursor: 'pointer' }}>
                    {copied === `user-${i}` ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Webhook Routes */}
        {activeSection === 'webhook-routes' && (
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Webhooks</h2>
              {[
                { method: 'POST', path: '/api/v1/webhooks', desc: 'Create webhook' },
                { method: 'GET', path: '/api/v1/webhooks', desc: 'List webhooks' },
                { method: 'PUT', path: '/api/v1/webhooks/:id', desc: 'Update webhook' },
                { method: 'DELETE', path: '/api/v1/webhooks/:id', desc: 'Delete webhook' },
              ].map((ep, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#0a0f1e', borderRadius: '6px', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: methodColors[ep.method], color: 'white', fontSize: '10px', fontWeight: '700', minWidth: '50px', textAlign: 'center' }}>{ep.method}</span>
                  <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'monospace', flex: 1 }}>{ep.path}</code>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{ep.desc}</span>
                  <button onClick={() => copyToClipboard(`${ep.method} ${docs.baseUrl}${ep.path}`, `webhook-${i}`)} style={{ background: 'transparent', border: 'none', color: copied === `webhook-${i}` ? '#34d399' : '#64748b', cursor: 'pointer' }}>
                    {copied === `webhook-${i}` ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                  </button>
                </div>
              ))}

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginTop: '20px', marginBottom: '12px' }}>Available Events</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['content.create', 'content.update', 'content.delete', 'content.publish', 'content.unpublish'].map(e => (
                  <span key={e} style={{ padding: '4px 10px', background: '#1e293b', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>{e}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}