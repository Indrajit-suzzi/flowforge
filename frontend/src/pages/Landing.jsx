import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Code, Key, Layers, Shield, LayoutDashboard, Server, Globe } from 'lucide-react';

const features = [
  { icon: Layers, title: 'Dynamic Content Types', desc: 'Define schemas with custom fields in real-time.', color: '#3b82f6' },
  { icon: Key, title: 'Scoped API Keys', desc: 'Generate keys with granular read/write/delete permissions.', color: '#8b5cf6' },
  { icon: Shield, title: 'Multi-Tenant Security', desc: 'Automatic tenant isolation on every request.', color: '#06b6d4' },
  { icon: Code, title: 'RESTful API', desc: 'Clean REST endpoints for any frontend framework.', color: '#10b981' },
  { icon: LayoutDashboard, title: 'Admin Dashboard', desc: 'Full UI for managing content and API keys.', color: '#f59e0b' },
  { icon: Server, title: 'Self-Hosted', desc: 'Deploy with Docker. Your data stays on your server.', color: '#ec4899' },
];

const steps = [
  { num: '01', title: 'Define your schema', desc: 'Create content types with custom fields.' },
  { num: '02', title: 'Manage content', desc: 'Add, edit, and delete entries.' },
  { num: '03', title: 'Integrate anywhere', desc: 'Generate API keys and connect your apps.' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#050810' }}>
      {/* NAV */}
      <header style={{ background: '#0a0f1e', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '14px', height: '14px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>FlowForge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" style={{ padding: '8px 14px', fontSize: '14px', fontWeight: '500', color: '#94a3b8', textDecoration: 'none', borderRadius: '6px' }}>Login</Link>
            <Link to="/register" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '6px', textDecoration: 'none' }}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-200px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(30,58,95,0.5)', borderRadius: '6px', marginBottom: '24px' }}>
            <Globe style={{ width: '12px', height: '12px', color: '#60a5fa' }} />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Multi-tenant headless CMS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '800', lineHeight: '1.1', color: '#f1f5f9', marginBottom: '20px' }}>
            Build your CMS.
            <br />
            <span style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ship in minutes.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '600px', marginBottom: '32px', lineHeight: '1.6' }}>
            A production-ready headless CMS with dynamic schemas, multi-tenant isolation, scoped API keys, and an admin dashboard.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', textDecoration: 'none' }}>
              Start building <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
            <a href="#features" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '500', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', textDecoration: 'none' }}>Explore features</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#0a0f1e', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[['100+', 'Concurrent Tenants'], ['<200ms', 'Avg Response'], ['99.9%', 'Uptime'], ['Zero', 'Data Leaks']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>{v}</div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>Everything you need</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '48px', maxWidth: '600px' }}>A complete headless CMS platform from schema design to production API.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: `${f.color}20` }}>
                  <f.icon style={{ width: '20px', height: '20px', color: f.color }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: '#0a0f1e', borderTop: '1px solid #1e293b', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>How it works</h2>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '48px' }}>Three steps to go from zero to a live content API.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                  {s.num}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE + CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '60px', alignItems: 'center', marginBottom: '80px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', marginBottom: '16px' }}>
                Powerful API, <span style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>simple to use</span>
              </h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
                Define content types through the dashboard, then create and manage entries via the API. Every endpoint is automatically scoped to your tenant.
              </p>
              <ul style={{ listStyle: 'none' }}>
                {['Automatic tenant isolation on every request', 'Runtime schema generation', 'Scoped API keys with permissions', 'Full CRUD with pagination'].map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#94a3b8' }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <pre style={{ padding: '16px', fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', overflowX: 'auto' }}>
                <code>
                  <span style={{ color: '#64748b' }}>// Create blog post</span>{'\n'}
                  <span style={{ color: '#f59e0b' }}>POST</span> /api/v1/dynamic/blog{'\n'}
                  {'\n'}
                  <span style={{ color: '#cbd5e1' }}>{'{'}</span>{'\n'}
                  {'  '}<span style={{ color: '#60a5fa' }}>"title"</span>: <span style={{ color: '#34d399' }}>"Hello World"</span>,{'\n'}
                  {'  '}<span style={{ color: '#60a5fa' }}>"content"</span>: <span style={{ color: '#34d399' }}>"CMS made easy"</span>{'\n'}
                  <span style={{ color: '#cbd5e1' }}>{'}'}</span>
                </code>
              </pre>
            </div>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2e1065)', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', marginBottom: '12px' }}>Ready to build?</h2>
            <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '24px' }}>Create your account and get a production-ready CMS in under a minute.</p>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '600', color: 'white', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '8px', textDecoration: 'none' }}>
              Create your account <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a0f1e', borderTop: '1px solid #1e293b', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '10px', height: '10px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9' }}>FlowForge</span>
          </div>
          <span style={{ fontSize: '12px', color: '#475569' }}>© 2026 FlowForge. MIT License.</span>
          <a href="https://github.com/Indrajit-suzzi/flowforge" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', textDecoration: 'none' }}>
            <Code style={{ width: '12px', height: '12px' }} /> GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}