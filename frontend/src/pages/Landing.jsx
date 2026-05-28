import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLocalAuth } from '../contexts/useLocalAuth';
import { 
  ArrowRight, CheckCircle, Zap, Code, Key, Layers, 
  Shield, LayoutDashboard, Server, Terminal, 
  Sparkles, Database, ArrowUpRight, Star, Quote,
  Menu, X, Globe, Cpu
} from 'lucide-react';
import './Landing.css';

// -------------------------------------------------------------
// SUB-COMPONENT: Interactive 3D Canvas Orb
// -------------------------------------------------------------
function InteractiveOrb() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.width = 450;
    let height = canvas.height = 450;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Generate 3D sphere points (Fibonacci Lattice)
    const points = [];
    const pointCount = 130;
    for (let i = 0; i < pointCount; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / pointCount);
      const phi = Math.sqrt(pointCount * Math.PI) * theta;
      points.push({
        x: Math.sin(theta) * Math.cos(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(theta),
        baseSize: Math.random() * 1.5 + 1
      });
    }

    // Floating dust particles
    const dustParticles = [];
    for (let i = 0; i < 40; i++) {
      dustParticles.push({
        x: (Math.random() - 0.5) * 2.5,
        y: (Math.random() - 0.5) * 2.5,
        z: (Math.random() - 0.5) * 2.5,
        speed: Math.random() * 0.002 + 0.001
      });
    }

    let time = 0;

    // Track local mouse movement over canvas
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Normalize to -1 to 1
      mouseRef.current.targetX = (clientX / width - 0.5) * 2;
      mouseRef.current.targetY = (clientY / height - 0.5) * 2;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Damp mouse coordinates
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      time += 0.008;

      // Rotation angles (combining mouse tracking + automatic time rotation)
      const ry = mouseRef.current.x * 0.8 + time * 0.3;
      const rx = mouseRef.current.y * -0.8 + time * 0.2;

      // 3D projection parameters
      const perspective = 320;
      const distance = 2.4;
      // Center coordinates
      const cx = width / 2;
      const cy = height / 2;

      // Draw background glow inside canvas
      const bgGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 200);
      bgGlow.addColorStop(0, 'rgba(255, 126, 95, 0.05)');
      bgGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Sort points by rotated Z depth (painter's algorithm)
      const rotatedPoints = points.map(p => {
        // Rotate around Y-axis
        let x1 = p.x * Math.cos(ry) - p.z * Math.sin(ry);
        let z1 = p.x * Math.sin(ry) + p.z * Math.cos(ry);
        // Rotate around X-axis
        let y2 = p.y * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = p.y * Math.sin(rx) + z1 * Math.cos(rx);

        return { x3d: x1, y3d: y2, z3d: z2, baseSize: p.baseSize };
      });

      rotatedPoints.sort((a, b) => b.z3d - a.z3d);

      // Render dust particles
      dustParticles.forEach(dp => {
        dp.z += dp.speed;
        if (dp.z > 1.2) dp.z = -1.2;

        let x1 = dp.x * Math.cos(ry) - dp.z * Math.sin(ry);
        let z1 = dp.x * Math.sin(ry) + dp.z * Math.cos(ry);
        let y2 = dp.y * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = dp.y * Math.sin(rx) + z1 * Math.cos(rx);

        const sz = perspective / (z2 + distance);
        const px = x1 * sz + cx;
        const py = y2 * sz + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.max(0, Math.min(0.3, (z2 + 1.2) / 2.4));
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 180, 123, ${alpha})`;
          ctx.fill();
        }
      });

      // Render sphere points & connection lines
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < rotatedPoints.length; i++) {
        const p = rotatedPoints[i];
        
        // Depth-based scaling
        const sz = perspective / (p.z3d + distance);
        const px = p.x3d * sz + cx;
        const py = p.y3d * sz + cy;

        // Visual mapping: front points are glowing peach, back points are dim indigo
        const isFront = p.z3d < 0;
        const ratio = (p.z3d + 1) / 2; // 0 (front-most) to 1 (back-most)
        const alpha = Math.max(0.08, 1 - ratio * 0.85);
        
        // Render glowing points
        ctx.beginPath();
        const ptSize = p.baseSize * (isFront ? 1.8 : 1.0);
        ctx.arc(px, py, ptSize, 0, Math.PI * 2);
        
        if (isFront) {
          ctx.fillStyle = `rgba(255, 126, 95, ${alpha * 0.95})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ff7e5f';
        } else {
          ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.65})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Dynamic lines to nearest neighbors to build the 3D grid feeling
        for (let j = i + 1; j < rotatedPoints.length; j++) {
          const p2 = rotatedPoints[j];
          const distSq = Math.pow(p.x3d - p2.x3d, 2) + Math.pow(p.y3d - p2.y3d, 2) + Math.pow(p.z3d - p2.z3d, 2);
          
          if (distSq < 0.15) { // threshold for linking
            const p2x = p2.x3d * (perspective / (p2.z3d + distance)) + cx;
            const p2y = p2.y3d * (perspective / (p2.z3d + distance)) + cy;
            
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p2x, p2y);
            
            const lineAlpha = (1 - (distSq / 0.15)) * 0.12 * alpha;
            ctx.strokeStyle = `rgba(254, 180, 123, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="interactive-orb">
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'grab' }} />
      <div className="orb-ring orb-ring-dashed" style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        border: '1px dashed rgba(255, 126, 95, 0.15)',
        pointerEvents: 'none',
        animation: 'spin 40s linear infinite'
      }} />
      <div className="orb-ring orb-ring-solid" style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%) rotate(45deg)',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        border: '1px solid rgba(139, 92, 246, 0.08)',
        pointerEvents: 'none',
        animation: 'spin-reverse 60s linear infinite'
      }} />
      <style>{`
        @keyframes spin { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes spin-reverse { 100% { transform: translate(-50%, -50%) rotate(-360deg); } }
      `}</style>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: 3D Tilt Card
// -------------------------------------------------------------
function TiltCard({ children, className = '', style = {} }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const tiltX = isHovered ? -coords.y * 15 : 0;
  const tiltY = isHovered ? coords.x * 15 : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glass-card tilt-card ${className}`}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${isHovered ? 1.025 : 1}, ${isHovered ? 1.025 : 1}, 1)`,
        transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.5s ease, box-shadow 0.3s ease',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(255, 126, 95, 0.18), 0 0 35px rgba(139, 92, 246, 0.1)'
          : '0 10px 30px -15px rgba(0, 0, 0, 0.4)',
      }}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: Animated Count Up
// -------------------------------------------------------------
function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const start = performance.now();
        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const TECH_STACK = [
  { name: 'MongoDB', icon: Database, color: '#10b981', desc: 'Document database with auto-scaling replica sets' },
  { name: 'Express', icon: Server, color: '#fbbf24', desc: 'Lightweight REST framework with middleware pipeline' },
  { name: 'React 19', icon: Cpu, color: '#60a5fa', desc: 'Client dashboard with route-level code splitting' },
  { name: 'Node.js 20', icon: Terminal, color: '#34d399', desc: 'ESM runtime with cluster mode and graceful shutdown' },
  { name: 'OAuth Auth', icon: Shield, color: '#a78bfa', desc: 'Google and GitHub sign-in with backend-issued JWT sessions' },
  { name: 'Docker', icon: Globe, color: '#38bdf8', desc: 'Multi-stage alpine builds with health-check probes' },
];

const TESTIMONIALS = [
  { quote: 'FlowForge cut our content API setup from weeks to hours. The auto-generated schemas and tenant isolation are game-changers.', name: 'Alex Chen', role: 'CTO, Stellar Labs', rating: 5 },
  { quote: 'The OAuth sign-in and JWT sessions made onboarding painless. Our team was productive in under a day.', name: 'Sarah Mitchell', role: 'Lead Developer, Northwind Digital', rating: 5 },
  { quote: 'We evaluated Strapi, Sanity, and Directus. FlowForge won on simplicity — no plugins, no config nightmares, just works.', name: 'James Okonkwo', role: 'Founder, Webflow Studios', rating: 5 },
];

// -------------------------------------------------------------
// MAIN COMPONENT: Landing Page
// -------------------------------------------------------------
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('schema');
  const [mouseGlowPos, setMouseGlowPos] = useState({ x: 0, y: 0 });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const featureSectionRef = useRef(null);
  const { user } = useLocalAuth();
  const isLoggedIn = !!user;

  // Parallax background blobs
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200], { clamp: false });
  const y2 = useTransform(scrollY, [0, 1000], [0, -150], { clamp: false });
  const y3 = useTransform(scrollY, [0, 2000], [0, 300], { clamp: false });

  const gridRotateX = useTransform(scrollY, [0, 1000], [75, 82]);
  const orbScale = useTransform(scrollY, [0, 800], [1, 1.15]);
  const orbRotate = useTransform(scrollY, [0, 800], [0, 10]);

  // Track page scroll to toggle header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track mouse coordinates over feature section to feed the ambient glow
  const handleFeatureMouseMove = (e) => {
    if (!featureSectionRef.current) return;
    const rect = featureSectionRef.current.getBoundingClientRect();
    setMouseGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const features = [
    { 
      icon: Layers, 
      title: 'Dynamic Content Schemas', 
      desc: 'Define custom database content types on the fly. No migrations, no restarts, instant schema endpoints.', 
      color: '#ff7e5f' 
    },
    { 
      icon: Key, 
      title: 'Scoped API Access', 
      desc: 'Generate individual developer API keys with strictly scoped read, write, or delete permissions.', 
      color: '#8b5cf6' 
    },
    { 
      icon: Shield, 
      title: 'Automatic Tenant Isolation', 
      desc: 'Database calls are auto-scoped per tenant identifier. Total security and zero leakage between users.', 
      color: '#4f46e5' 
    },
    { 
      icon: Database, 
      title: 'Draft / Publish Versioning', 
      desc: 'Work on drafts, compare changes, and publish when ready with built-in version state tracking.', 
      color: '#ec4899' 
    },
    { 
      icon: LayoutDashboard, 
      title: 'Admin Control Hub', 
      desc: 'A gorgeous workspace to inspect content entries, monitor endpoints, audit usage logs, and trace requests.', 
      color: '#f59e0b' 
    },
    { 
      icon: Server, 
      title: 'Self-Hosted & Isolated', 
      desc: 'Full docker-compose stack. Run it completely in your own secure cloud instance or local node server.', 
      color: '#10b981' 
    },
  ];

  return (
    <div className="landing-container">
      {/* Decorative Blur Blobs */}
      <motion.div className="glow-blob glow-peach" style={{ top: '10%', left: '5%', width: '400px', height: '400px', y: y1 }} />
      <motion.div className="glow-blob glow-purple" style={{ top: '25%', right: '5%', width: '450px', height: '450px', y: y2 }} />
      <motion.div className="glow-blob glow-peach" style={{ bottom: '20%', left: '15%', width: '500px', height: '500px', y: y3 }} />
      
      {/* Background grids */}
      <div className="grid-overlay" />
      <motion.div className="grid-3d-floor" style={{ rotateX: gridRotateX }} />

      {/* HEADER NAVIGATION */}
      <header className={`glass-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff7e5f, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(255, 126, 95, 0.4)' }}>
              <Zap style={{ width: '18px', height: '18px', color: '#080511' }} />
            </div>
            <span className="landing-font-heading" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FlowForge
            </span>
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#playground" className="nav-link">Playground</a>
            <a href="#tech-stack" className="nav-link">Tech Stack</a>
            <a href="#how-it-works" className="nav-link">Workflow</a>
            <a href="https://github.com/Indrajit-suzzi/flowforge" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Docs <ArrowUpRight style={{ width: '12px', height: '12px' }} />
            </a>
          </nav>

          <div className="landing-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-primary-peach" style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Dashboard <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            ) : (
              <Link to="/sign-in" className="btn-primary-peach" style={{ padding: '10px 22px', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Sign In <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            )}
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="mobile-nav-toggle" aria-label="Toggle navigation">
              {mobileNavOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '70px', left: 0, right: 0, zIndex: 99,
              background: 'rgba(8, 5, 17, 0.98)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}
          >
            {[
              { label: 'Features', href: '#features' },
              { label: 'Playground', href: '#playground' },
              { label: 'Tech Stack', href: '#tech-stack' },
              { label: 'Workflow', href: '#how-it-works' },
            ].map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileNavOpen(false)} className="nav-link" style={{ fontSize: '16px', padding: '10px 0' }}>
                {link.label}
              </a>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {isLoggedIn ? (
                <Link to="/dashboard" onClick={() => setMobileNavOpen(false)} className="btn-primary-peach" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Dashboard <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              ) : (
                <Link to="/sign-in" onClick={() => setMobileNavOpen(false)} className="btn-primary-peach" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  Sign In <ArrowRight style={{ width: '14px', height: '14px' }} />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="hero-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div className="section-container" style={{ width: '100%' }}>
          <div className="hero-grid">
            
            {/* Left Column: Copy */}
            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255, 126, 95, 0.08)', border: '1px solid rgba(255, 126, 95, 0.2)', borderRadius: '30px', marginBottom: '24px' }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#ff7e5f' }} />
                <span className="landing-font-heading" style={{ fontSize: '12px', fontWeight: '700', color: '#ff7e5f', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Revolutionary Headless CMS
                </span>
              </div>
              
              <h1 className="landing-heading-huge" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#fff', marginBottom: '24px' }}>
                Generate schemas.
                <br />
                <span className="gradient-text-peach">Build your API.</span>
                <br />
                <span className="gradient-text-purple">Scale instantly.</span>
              </h1>
              
              <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '600px', marginBottom: '40px' }}>
                An elegant, multi-tenant headless CMS that auto-generates schemas, manages secure scoped API keys, and streams content securely to any application.
              </p>
              
              <div className="hero-actions" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <Link to={isLoggedIn ? '/dashboard' : '/sign-in'} className="btn-primary-peach" style={{ padding: '16px 32px', fontSize: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isLoggedIn ? 'Go to Dashboard' : 'Deploy Workspace'} <ArrowRight style={{ width: '18px', height: '18px' }} />
                </Link>
                <a href="#features" className="btn-secondary-outline" style={{ padding: '16px 32px', fontSize: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Explore features
                </a>
              </div>
            </motion.div>

            {/* Right Column: Interactive 3D Canvas */}
            <motion.div
              className="hero-orb-wrap"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                position: 'relative',
                scale: orbScale,
                rotate: orbRotate
              }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div style={{ position: 'absolute', top: '10%', left: '15%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
              <InteractiveOrb />
            </motion.div>

          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="scroll-indicator">
          <span>Scroll down</span>
          <div className="scroll-indicator-mouse">
            <div className="scroll-indicator-wheel" />
          </div>
        </div>
      </section>

      {/* STATS CAPSULES BAR */}
      <section className="stats-section" style={{ borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', background: 'rgba(8, 5, 17, 0.4)', position: 'relative', zIndex: 10 }}>
        <div className="section-container">
          <div className="stats-grid">
            {[
              { val: 100, suffix: '%', label: 'Data Isolation' },
              { val: 15, suffix: 'ms', label: 'Schema Generation', prefix: '<' },
              { val: 5, suffix: '', label: 'Role-Based RBAC' },
              { val: 1, suffix: '', label: 'Docker Command Deploy', prefix: '1 ' }
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div className="landing-font-heading" style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(135deg, #fff, #ff7e5f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stat.prefix || ''}<CountUp end={stat.val} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (3D TILT CARDS + CURSOR GLOW EFFECT) */}
      <section id="features" ref={featureSectionRef} onMouseMove={handleFeatureMouseMove} className="features-section" style={{ position: 'relative', overflow: 'hidden', zIndex: 10 }}>
        <div className="mouse-glow-bg" style={{ left: mouseGlowPos.x, top: mouseGlowPos.y }} />
        
        <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="landing-font-heading" style={{ fontSize: '12px', fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(139, 92, 246, 0.08)', padding: '6px 14px', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '20px' }}>
              Engineered Excellence
            </span>
            <h2 className="landing-heading-large" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', marginTop: '16px', marginBottom: '20px' }}>
              High performance headless utility
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              No bloat. Built with security-first multi-tenancy and rapid runtime structures to let you ship faster.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 50, rotateX: 10, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <TiltCard style={{ padding: '40px 30px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="tilt-card-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', border: `1px solid ${feat.color}30` }}>
                      <feat.icon style={{ width: '22px', height: '22px', color: feat.color }} />
                    </div>
                    <h3 className="landing-font-heading" style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', flexGrow: 1 }}>
                      {feat.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK SECTION */}
      <section id="tech-stack" className="features-section" style={{ background: 'rgba(8, 5, 17, 0.4)', borderTop: '1px solid var(--border-glass)', position: 'relative', zIndex: 10 }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="landing-font-heading" style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(56, 189, 248, 0.08)', padding: '6px 14px', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '20px' }}>
              Built With
            </span>
            <h2 className="landing-heading-large" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', marginTop: '16px', marginBottom: '20px' }}>
              Modern open-source stack
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Every component chosen for performance, security, and developer experience.
            </p>
          </div>

          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {TECH_STACK.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
              >
                <div className="glass-card-sm" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', background: 'rgba(8,5,17,0.3)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${tech.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${tech.color}25`, flexShrink: 0 }}>
                    <tech.icon style={{ width: '20px', height: '20px', color: tech.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>{tech.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{tech.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAYGROUND SHOWCASE (LIVE API PREVIEW TERMINAL) */}
      <section id="playground" className="playground-section" style={{ position: 'relative', zIndex: 10 }}>
        <div className="section-container">
          <div className="playground-grid">
            
            {/* Left: Terminal Description */}
            <motion.div
              initial={{ opacity: 0, x: -30, rotateX: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <span className="landing-font-heading" style={{ fontSize: '12px', fontWeight: '700', color: '#ff7e5f', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(255, 126, 95, 0.08)', padding: '6px 14px', border: '1px solid rgba(255, 126, 95, 0.2)', borderRadius: '20px' }}>
                Instant API Integration
              </span>
              <h2 className="landing-heading-large" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', marginTop: '16px', marginBottom: '24px' }}>
                A dynamic developer playground
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '32px' }}>
                Create structured tables, custom models, and link assets. Read and write content with secure RESTful endpoints automatically formatted to your schema configurations.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { text: 'Automatic body checks against your custom schema structure', icon: CheckCircle },
                  { text: 'Isolates tenant tables completely inside standard MongoDB scope', icon: CheckCircle },
                  { text: 'Returns query analytics instantly in the dashboard logs', icon: CheckCircle }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <item.icon style={{ width: '18px', height: '18px', color: '#ff7e5f', marginTop: '3px', flexShrink: 0 }} />
                    <span style={{ fontSize: '15px', color: '#e2e8f0' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Premium Interactive Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotateX: 10, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <span className="terminal-dot red" />
                    <span className="terminal-dot yellow" />
                    <span className="terminal-dot green" />
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['schema', 'query', 'response'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          background: activeTab === tab ? 'rgba(255, 126, 95, 0.15)' : 'transparent',
                          color: activeTab === tab ? '#ff7e5f' : 'var(--color-text-secondary)',
                          border: activeTab === tab ? '1px solid rgba(255, 126, 95, 0.3)' : '1px solid transparent',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="terminal-tab">
                    <Terminal style={{ width: '14px', height: '14px' }} />
                    <span>REST-Client</span>
                  </div>
                </div>
                <div className="terminal-body" style={{ minHeight: '260px', overflowX: 'auto' }}>
                  <AnimatePresence mode="wait">
                    <motion.pre
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      style={{ margin: 0, fontFamily: "'Fira Code', 'Courier New', monospace", whiteSpace: 'pre-wrap' }}
                    >
                      {activeTab === 'schema' && (
                        <code>
                          <span style={{ color: '#64748b' }}>// 1. Create a Dynamic Content Schema</span>{"\n"}
                          <span style={{ color: '#ff7e5f', fontWeight: 'bold' }}>POST</span> <span style={{ color: '#f8fafc' }}>/api/v1/schemas</span>{"\n"}
                          <span style={{ color: '#a78bfa' }}>Headers:</span> <span style={{ color: '#38bdf8' }}>{`{ "Authorization": "Bearer KEY_XXXX" }`}</span>{"\n"}
                          <span style={{ color: '#e2e8f0' }}>Body:</span> {"{"}{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"name"</span>: <span style={{ color: '#34d399' }}>"Product"</span>,{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"fields"</span>: [{"\n"}
                          {"    "}{"{"} <span style={{ color: '#feb47b' }}>"name"</span>: <span style={{ color: '#34d399' }}>"title"</span>, <span style={{ color: '#feb47b' }}>"type"</span>: <span style={{ color: '#34d399' }}>"String"</span>, <span style={{ color: '#feb47b' }}>"required"</span>: <span style={{ color: '#6366f1' }}>true</span> {"}"},{"\n"}
                          {"    "}{"{"} <span style={{ color: '#feb47b' }}>"name"</span>: <span style={{ color: '#34d399' }}>"price"</span>, <span style={{ color: '#feb47b' }}>"type"</span>: <span style={{ color: '#34d399' }}>"Number"</span>, <span style={{ color: '#feb47b' }}>"required"</span>: <span style={{ color: '#6366f1' }}>true</span> {"}"},{"\n"}
                          {"    "}{"{"} <span style={{ color: '#feb47b' }}>"name"</span>: <span style={{ color: '#34d399' }}>"category"</span>, <span style={{ color: '#feb47b' }}>"type"</span>: <span style={{ color: '#34d399' }}>"String"</span> {"}"},{"\n"}
                          {"    "}{"{"} <span style={{ color: '#feb47b' }}>"name"</span>: <span style={{ color: '#34d399' }}>"inStock"</span>, <span style={{ color: '#feb47b' }}>"type"</span>: <span style={{ color: '#34d399' }}>"Boolean"</span>, <span style={{ color: '#feb47b' }}>"default"</span>: <span style={{ color: '#6366f1' }}>true</span> {"}"}{"\n"}
                          {"  "}]{"\n"}
                          {"}"}
                        </code>
                      )}
                      
                      {activeTab === 'query' && (
                        <code>
                          <span style={{ color: '#64748b' }}>// 2. Query Content Instantly</span>{"\n"}
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>GET</span> <span style={{ color: '#f8fafc' }}>/api/v1/dynamic/product?category=gadgets</span>{"\n"}
                          <span style={{ color: '#a78bfa' }}>Headers:</span> {"{"}{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"Authorization"</span>: <span style={{ color: '#38bdf8' }}>"Bearer KEY_XXXX"</span>,{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"X-Tenant-ID"</span>: <span style={{ color: '#38bdf8' }}>"tenant_workspace_01"</span>{"\n"}
                          {"}"}
                        </code>
                      )}

                      {activeTab === 'response' && (
                        <code>
                          <span style={{ color: '#64748b' }}>// 3. Response JSON (Auto-isolated & Validated)</span>{"\n"}
                          {"{"}{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"status"</span>: <span style={{ color: '#34d399' }}>"success"</span>,{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"results"</span>: <span style={{ color: '#f59e0b' }}>1</span>,{"\n"}
                          {"  "}<span style={{ color: '#feb47b' }}>"data"</span>: [{"\n"}
                          {"    "}{"{"}{"\n"}
                          {"      "}<span style={{ color: '#feb47b' }}>"_id"</span>: <span style={{ color: '#34d399' }}>"673f8b9e11c4"</span>,{"\n"}
                          {"      "}<span style={{ color: '#feb47b' }}>"title"</span>: <span style={{ color: '#34d399' }}>"Sonic Wireless Headset"</span>,{"\n"}
                          {"      "}<span style={{ color: '#feb47b' }}>"price"</span>: <span style={{ color: '#f59e0b' }}>129.99</span>,{"\n"}
                          {"      "}<span style={{ color: '#feb47b' }}>"category"</span>: <span style={{ color: '#34d399' }}>"gadgets"</span>,{"\n"}
                          {"      "}<span style={{ color: '#feb47b' }}>"inStock"</span>: <span style={{ color: '#6366f1' }}>true</span>,{"\n"}
                          {"      "}<span style={{ color: '#feb47b' }}>"createdAt"</span>: <span style={{ color: '#34d399' }}>"2026-05-21T12:00:00Z"</span>{"\n"}
                          {"    "}{"}"}{"\n"}
                          {"  "}]{"\n"}
                          {"}"}
                        </code>
                      )}
                    </motion.pre>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="how-it-works-section" style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(8, 5, 17, 0.4)', position: 'relative', zIndex: 10 }}>
        <div className="section-container">
          
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span className="landing-font-heading" style={{ fontSize: '12px', fontWeight: '700', color: '#ff7e5f', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(255, 126, 95, 0.08)', padding: '6px 14px', border: '1px solid rgba(255, 126, 95, 0.2)', borderRadius: '20px' }}>
              Simplified Deployment
            </span>
            <h2 className="landing-heading-large" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', marginTop: '16px', marginBottom: '20px' }}>
              Three steps to a live content API
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Build a scalable database setup without writing complex backend routes.
            </p>
          </div>

          <div className="how-it-works-grid">
            {[
              { step: '01', title: 'Define Content Schema', desc: 'Create tables, assign validation types (string, numbers, arrays, booleans) right inside our dashboard interface.' },
              { step: '02', title: 'Input Content Entries', desc: 'Use our rich content editor to populate rows, publish drafts, and attach media resources directly.' },
              { step: '03', title: 'Connect Securely', desc: 'Issue granular API access tokens, input the tenant workspace headers, and consume content in your frontend app.' }
            ].map((workflow, idx) => (
              <motion.div
                key={workflow.step}
                initial={{ opacity: 0, y: 50, rotateX: 10, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                style={{ position: 'relative' }}
              >
                <div style={{ padding: '40px 30px', background: 'rgba(18, 11, 28, 0.3)', border: '1px solid var(--border-glass)', borderRadius: '24px' }}>
                  <div className="landing-font-heading" style={{ fontSize: '48px', fontWeight: '900', color: 'rgba(255, 126, 95, 0.15)', position: 'absolute', top: '24px', right: '32px' }}>
                    {workflow.step}
                  </div>
                  <h3 className="landing-font-heading" style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                    {workflow.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    {workflow.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="how-it-works-section" style={{ position: 'relative', zIndex: 10 }}>
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="landing-font-heading" style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(251, 191, 36, 0.08)', padding: '6px 14px', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '20px' }}>
              Testimonials
            </span>
            <h2 className="landing-heading-large" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: '#fff', marginTop: '16px', marginBottom: '20px' }}>
              Loved by developers
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              See what teams are saying about their experience.
            </p>
          </div>

          <div className="how-it-works-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="glass-card-sm" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', background: 'rgba(8,5,17,0.3)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Quote style={{ width: '24px', height: '24px', color: 'rgba(255,126,95,0.3)', marginBottom: '16px' }} />
                  <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.6', flexGrow: 1, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{t.name}</p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>{t.role}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} style={{ width: '14px', height: '14px', fill: '#fbbf24', color: '#fbbf24' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section" style={{ position: 'relative', zIndex: 10 }}>
        <div className="section-container" style={{ maxWidth: '1200px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="cta-box"
            style={{ textAlign: 'center' }}
          >
            <h2 className="landing-heading-large" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#fff', marginBottom: '18px' }}>
              Launch your headless workspace.
            </h2>
            <p style={{ fontSize: '17px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto', marginBottom: '40px', lineHeight: '1.6' }}>
              Create an account now and spin up a complete CMS service for your mobile app, website, or blog within seconds.
            </p>
            <Link to={isLoggedIn ? '/dashboard' : '/sign-in'} className="btn-primary-peach" style={{ padding: '16px 36px', fontSize: '16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started for Free'} <ArrowRight style={{ width: '18px', height: '18px' }} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-section" style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(8, 5, 17, 0.75)', position: 'relative', zIndex: 10 }}>
        <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #ff7e5f, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: '14px', height: '14px', color: '#080511' }} />
            </div>
            <span className="landing-font-heading" style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>FlowForge</span>
          </div>
          
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            © 2026 FlowForge Headless. Released under the MIT License.
          </span>
          
          <a href="https://github.com/Indrajit-suzzi/flowforge" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            <Code style={{ width: '14px', height: '14px' }} /> GitHub
          </a>
        </div>
      </footer>

    </div>
  );
}
