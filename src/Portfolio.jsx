import { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './portfolio.css';
import KeyboardScene from './KeyboardScene';

const SECTIONS = [
  { id: 's-home', label: 'Home', icon: '⌂' },
  { id: 's-summary', label: 'About', icon: '◎' },
  { id: 's-experience-new', label: 'Experience', icon: '⌚' },
  { id: 's-projects', label: 'Projects', icon: '◈' },
  { id: 's-skills', label: 'Skills', icon: '⟨/⟩' },
  { id: 's-achievements', label: 'Awards', icon: '★' },
  { id: 's-contact', label: 'Contact', icon: '✉' },
];

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('s-home');
  const [showSkills, setShowSkills] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const sectionRefs = useRef({});

  // Intersection Observer: track which section is in view → update active nav
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            if (entry.target.id === 's-skills') {
              setShowSkills(true);
            }
          }
        });
      },
      { threshold: 0, rootMargin: '-5% 0px -60% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  // Show nav once home section is in view (after keyboard scroll)
  useEffect(() => {
    const homeEl = sectionRefs.current['s-home'];
    if (!homeEl) return;
    const navIO = new IntersectionObserver(
      ([entry]) => setShowNav(entry.isIntersecting || entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    navIO.observe(homeEl);
    return () => navIO.disconnect();
  }, []);

  // Fade-in animation for .glass cards on scroll
  useEffect(() => {
    const fadeIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0) scale(1)';
          }
        });
      },
      { threshold: 0.06 }
    );

    document.querySelectorAll('.glass').forEach((el, i) => {
      // Home section cards pop from behind the keyboard; About section also pops nicely
      const inHome = !!el.closest('#s-home');
      const inAbout = !!el.closest('#s-summary');
      el.style.opacity = '0';

      if (inHome || inAbout) {
        el.style.transform = 'translateY(80px) scale(0.88)';
        el.style.transition = `opacity 0.7s ease ${i * 55}ms, transform 1s cubic-bezier(0.34, 1.4, 0.64, 1) ${i * 55}ms`;
      } else {
        el.style.transform = 'translateY(24px) scale(1)';
        el.style.transition = `opacity 0.6s ease ${i * 40}ms, transform 0.6s ease ${i * 40}ms`;
      }
      fadeIO.observe(el);
    });

    return () => fadeIO.disconnect();
  }, []);



  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      { 
        from_name: form.name, 
        from_email: form.email, 
        message: form.message, 
        to_email: 'divymevada.work@gmail.com' 
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    ).then(() => {
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    }).catch(() => alert('Failed to send. Please try again.')).finally(() => setSending(false));
  };

  const handleNav = (id) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <div className="ambient"></div>
      <div className="ambient-mid"></div>

      {/* KEYBOARD 3D SCENE — welcome landing, user sees this first */}
      <KeyboardScene />

      <div className="wrapper wrapper-top">

        {/* HOME */}
        <div
          className="section"
          id="s-home"
          ref={(el) => (sectionRefs.current['s-home'] = el)}
        >
          <div className="glass hero-card">
            <div className="hero-glow"></div>
            <a href="https://drive.google.com/file/d/1dpzh3uJmrf1zaOSKVrzfgSyUknuHWB85/view?usp=sharing" className="download-btn" target="_blank" rel="noopener noreferrer">↓ Resume</a>
            <div className="hero-content">
              <div className="status-badge">
                <div className="status-dot"></div>
                Open to Work
              </div>
              <div className="hero-role">Software Engineer · Full-Stack · AI/ML  & Web3 Developer </div>
              <div className="hero-name">Divy<br />Mevada</div>
              <p className="hero-desc">
                Building blockchain systems, AI platforms &amp; smart-city analytics. Hackathon winner. Deep problem solver. Currently at Nirma University, shaping ideas into products.
              </p>
              <div className="hero-contacts">
                <a href="https://www.linkedin.com/in/divy-mevada-4230332bb/" target="_blank" rel="noopener noreferrer" className="contact-item">in LinkedIn</a>
                <a href="https://github.com/divy-mevada" target="_blank" rel="noopener noreferrer" className="contact-item">⌥ GitHub</a>
                <span className="contact-item">◎ Ahmedabad, IN</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="avatar-wrap">
                <div className="avatar-ring"></div>
                <div className="avatar-inner">DM</div>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="glass stat-card">
              <div className="stat-num">2+</div>
              <div className="stat-label">Years of experience</div>
            </div>
            <div className="glass stat-card">
              <div className="stat-num">10+</div>
              <div className="stat-label">Real-world projects</div>
            </div>
            <div className="glass stat-card">
              <div className="stat-num">3+</div>
              <div className="stat-label">Hackathon Awards</div>
            </div>
          </div>
        </div>

      </div>{/* /wrapper-top */}


      <div className="wrapper wrapper-lower">

        {/* ABOUT */}
        <div
          className="section"
          id="s-summary"
          ref={(el) => (sectionRefs.current['s-summary'] = el)}
        >
          <div className="summary-grid">
            <div className="glass summary-main">
              <div className="section-label">About Me</div>
              <div className="section-title">Building the <span className="highlight">future</span><br />one commit at a time</div>
              <p className="body-text">
                B.Tech Computer Science student at Nirma University (graduating May 2028, CGPA 8.7). Passionate about full-stack development, blockchain technology, and artificial intelligence. I thrive in competitive environments — hackathons, coding contests, research — turning complex problems into elegant, scalable solutions.
                <br /><br />
                My work spans blockchain-based credential systems, smart-city analytics, and ESG sustainability platforms. I believe in shipping fast, iterating continuously, and always keeping the end user at the center of every design decision.
              </p>
            </div>
            <div className="glass edu-card">
              <div className="section-label">Education</div>
              <div className="edu-school">Nirma University</div>
              <div className="edu-degree">B.Tech — Computer Science &amp; Engineering<br />Ahmedabad, Gujarat · May 2028</div>
              <div className="edu-badge">CGPA: 8.7 / 10.0</div>
              <div style={{ marginTop: '20px' }}>
                <div className="section-label" style={{ marginTop: '4px' }}>Coursework</div>
                <div className="tag-grid">
                  <span className="tag">DSA</span>
                  <span className="tag">OOP</span>
                  <span className="tag">OS</span>
                  <span className="tag">DBMS</span>
                  <span className="tag">AI</span>
                  <span className="tag">Machine Learning</span>
                </div>
              </div>
            </div>
            <div className="glass interests-card">
              <div className="section-label">Interests</div>
              <div className="section-title" style={{ fontSize: '22px' }}>What drives me</div>
              <div className="tag-grid">
                <span className="tag">Artificial Intelligence</span>
                <span className="tag">Generative AI</span>
                <span className="tag">Machine Learning</span>
                <span className="tag">Blockchain Systems</span>
                <span className="tag">Full-Stack Dev</span>
                <span className="tag">Competitive Programming</span>
                <span className="tag">Smart Cities</span>
                <span className="tag">Open Source</span>
                <span className="tag">Agentic AI</span>
                <span className="tag">AI Agents</span>
              </div>
            </div>
          </div>
        </div>

        {/* EXPERIENCE */}
        <div
          className="section"
          id="s-experience-new"
          ref={(el) => (sectionRefs.current['s-experience-new'] = el)}
        >
          <div className="glass projects-intro">
            <div className="section-label">Career Journey</div>
            <div className="section-title">Experience &amp; <span className="highlight">Achievements</span></div>
          </div>
          <div className="timeline">
            {[
              {
                role: '2nd Runner-Up',
                organization: 'National Hackathon · IIT Gandhinagar',
                period: '2024',
                description: 'Developed DHRUVA, a blockchain-based credential verification system. Won ₹30,000 and competed against top talent nationwide.',
                type: 'Award'
              },
              {
                role: 'Executive Member',
                organization: 'CSI Nirma University',
                period: '2023 - Present',
                description: 'Organizing workshops, technical sessions, and hackathons for the student community at Nirma University.',
                type: 'Leadership'
              },
              {
                role: 'Top 10 Finalist',
                organization: 'Ingenious 7.0 Hackathon',
                period: '2024',
                description: 'Built a smart-city analytics platform (City View) and ranked in the top 10 out of 120+ teams.',
                type: 'Achievement'
              }
            ].map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content glass">
                  <div className="exp-header">
                    <span className="exp-type">{exp.type}</span>
                    <span className="exp-period">{exp.period}</span>
                  </div>
                  <h3 className="exp-role">{exp.role}</h3>
                  <h4 className="exp-org">{exp.organization}</h4>
                  <p className="exp-desc">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROJECTS */}
        <div
          className="section"
          id="s-projects"
          ref={(el) => (sectionRefs.current['s-projects'] = el)}
        >
          <div className="glass projects-intro">
            <div className="section-label">Featured Work</div>
            <div className="section-title">Projects that <span className="highlight">matter</span></div>
            <p className="body-text">Award-winning builds from national hackathons — real problems, real impact.</p>
          </div>
          <div className="projects-list">
            <div className="glass project-card">
              <div className="project-header">
                <div className="project-number">01 — NATIONAL HACKATHON · IIT GANDHINAGAR</div>
                <div className="project-badge">2nd Runner-Up</div>
              </div>
              <div className="project-title">DHRUVA</div>
              <div className="project-sub">Blockchain Credential Verification Platform</div>
              <ul className="project-bullets">
                <li>Built a blockchain-based platform enabling tamper-proof credential issuance and instant verification at national scale.</li>
                <li>Implemented secure credential storage with QR-based credential sharing for seamless identity management.</li>
                <li>Designed an intuitive UI abstracting blockchain complexity for non-technical users.</li>
              </ul>
              <div className="project-achievement">₹30,000 Prize — Competed nationally</div>
              <div className="project-actions">
                <a href="https://github.com/divy-mevada/DHRUVA_" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>⌥</span> GitHub
                </a>
                <a href="https://dhruva-8.netlify.app/" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>◎</span> Live Demo
                </a>
              </div>
            </div>

            <div className="glass project-card">
              <div className="project-header">
                <div className="project-number">02 — INGENIOUS 7.0 HACKATHON</div>
                <div className="project-badge">Top 10 / 120+ Teams</div>
              </div>
              <div className="project-title">CITY VIEW</div>
              <div className="project-sub">Integrated Urban Intelligence Platform</div>
              <ul className="project-bullets">
                <li>Developed a smart-city analytics platform integrating air quality monitoring, traffic analytics, and infrastructure insights.</li>
                <li>Built real-time dashboards enabling data-driven urban planning for civic administrators.</li>
                <li>Processed live sensor streams and presented actionable visualizations for city-scale decisions.</li>
              </ul>
              <div className="project-achievement">Top 10 among 120+ competing teams</div>
              <div className="project-actions">
                <a href="https://github.com/divy-mevada/Delighful_Derek" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>⌥</span> GitHub
                </a>
              </div>
            </div>

            <div className="glass project-card">
              <div className="project-header">
                <div className="project-number">03 — GDG GANDHINAGAR HACKATHON</div>
                <div className="project-badge">Top 15 / 700+ Teams</div>
              </div>
              <div className="project-title">ESGresolve</div>
              <div className="project-sub">ESG Analytics Platform</div>
              <ul className="project-bullets">
                <li>Built a full-stack platform converting complex ESG datasets into actionable sustainability insights for organizations.</li>
                <li>Designed dashboards for ESG evaluation, risk detection, and compliance tracking across sectors.</li>
                <li>Qualified for offline finals from a pool of 700+ competing teams nationwide.</li>
              </ul>
              <div className="project-achievement">Qualified Offline Finals — 700+ teams</div>
              <div className="project-actions">
                <a href="https://github.com/divy-mevada/ESGresolve" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>⌥</span> GitHub
                </a>
                <a href="https://esg-resolve-067.vercel.app/" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>◎</span> Live Demo
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div
          className="section"
          id="s-skills"
          ref={(el) => (sectionRefs.current['s-skills'] = el)}
        >
          <div className="skills-grid">
            <div className="glass skill-group">
              <div className="skill-group-title"><div className="sg-icon">⟨/⟩</div>Languages</div>
              {[
                { name: 'Python', pct: 90 },
                { name: 'JavaScript / TypeScript', pct: 85 },
                { name: 'C++', pct: 80 },
                { name: 'SQL', pct: 75 },
                { name: 'Java', pct: 65 },
              ].map((s) => (
                <div className="skill-item" key={s.name}>
                  <div className="skill-header">
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-pct">{s.pct}%</span>
                  </div>
                  <div className="skill-bar">
                    <div className="skill-fill" style={{ width: showSkills ? `${s.pct}%` : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass skill-group">
              <div className="skill-group-title"><div className="sg-icon">◈</div>Frameworks</div>
              {[
                { name: 'React.js / Next.js', pct: 88 },
                { name: 'Node.js / Express.js', pct: 82 },
                { name: 'TensorFlow / Flask', pct: 70 },
              ].map((s) => (
                <div className="skill-item" key={s.name}>
                  <div className="skill-header">
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-pct">{s.pct}%</span>
                  </div>
                  <div className="skill-bar">
                    <div className="skill-fill teal" style={{ width: showSkills ? `${s.pct}%` : '0%' }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass tools-card">
              <div className="section-label">Tools &amp; Platforms</div>
              <div className="tools-grid">
                {[
                  { label: 'Git / GitHub', teal: false },
                  { label: 'Docker', teal: false },
                  { label: 'Vercel', teal: false },
                  { label: 'Linux', teal: false },
                  { label: 'Firebase', teal: false },
                  { label: 'MongoDB', teal: false },
                  { label: 'MySQL', teal: false },
                  { label: 'Jupyter Notebook', teal: true },
                  { label: 'Kaggle', teal: true },
                  { label: 'CVAT', teal: true },
                  { label: 'Socket.io', teal: true },
                  { label: 'REST APIs', teal: true },
                  { label: 'TailwindCSS', teal: false },
                  { label: 'VS Code', teal: false },
                ].map((t) => (
                  <div className="tool-chip" key={t.label}>
                    <div className={`tool-dot${t.teal ? ' teal' : ''}`}></div>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div
          className="section"
          id="s-achievements"
          ref={(el) => (sectionRefs.current['s-achievements'] = el)}
        >
          <div className="glass" style={{ padding: '40px 44px', marginBottom: '20px' }}>
            <div className="section-label">Recognition</div>
            <div className="section-title">Milestones &amp; <span className="highlight">Achievements</span></div>
          </div>
          <div className="achieve-grid">
            <div className="glass achieve-card">
              <div className="achieve-rank">2nd</div>
              <div className="achieve-title">Runner-Up — National Hackathon</div>
              <div className="achieve-sub">IIT Gandhinagar · ₹30,000 Prize · Competed against top engineering talent nationwide</div>
            </div>
            <div className="glass achieve-card">
              <div className="achieve-rank">T10</div>
              <div className="achieve-title">Top 10 — Ingenious 7.0</div>
              <div className="achieve-sub">Ranked in the top 10 out of 120+ competing teams at this prestigious hackathon</div>
            </div>
            <div className="glass achieve-card">
              <div className="achieve-rank">T15</div>
              <div className="achieve-title">Top 15 — GDG Gandhinagar</div>
              <div className="achieve-sub">Qualified for offline finals from 700+ teams with the ESGresolve sustainability platform</div>
            </div>
            <div className="glass achieve-card">
              <div className="achieve-rank" style={{ fontSize: '36px', marginBottom: '8px' }}>Exec.</div>
              <div className="achieve-title">CSI Executive Member</div>
              <div className="achieve-sub">Computer Society of India, Nirma University — organizing workshops, hackathons &amp; tech events</div>
            </div>
            <div className="glass codeforces-card">
              <div className="cf-number">150+</div>
              <div className="cf-text">
                <h3>Codeforces Problem Solver</h3>
                <p>Solved 150+ algorithmic problems demonstrating consistent and rigorous problem-solving ability across data structures, dynamic programming, graph theory, and combinatorics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div
          className="section"
          id="s-contact"
          ref={(el) => (sectionRefs.current['s-contact'] = el)}
        >
          <div className="glass contact-card">
            <div className="section-label">Get In Touch</div>
            <div className="section-title">Let's <span className="highlight">Connect</span></div>
            <p className="contact-subtitle">Have a project in mind or just want to say hi? My inbox is always open.</p>

            <div className="contact-grid">
              <div className="contact-info">
                <div className="info-item">
                  <span className="info-icon">✉️</span>
                  <div>
                    <h4>Email</h4>
                    <p>divymevada.work@gmail.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div>
                    <h4>Location</h4>
                    <p>Ahmedabad, IN</p>
                  </div>
                </div>
                <div className="social-links">
                  <a href="https://www.linkedin.com/in/divy-mevada-4230332bb/" target="_blank" rel="noopener noreferrer" className="social-icon">in</a>
                  <a href="https://github.com/divy-mevada" target="_blank" rel="noopener noreferrer" className="social-icon">gh</a>
                </div>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required></textarea>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={sending}>
                  {sending ? 'Sending...' : sent ? '✓ Message Sent!' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="footer-container">
        <div className="wrapper" style={{ padding: '0 32px' }}>
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">Divy Mevada</div>
              <p className="footer-tagline">Building the future, one commit at a time.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Navigation</h4>
                <button onClick={() => handleNav('s-home')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Home</button><br />
                <button onClick={() => handleNav('s-summary')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>About</button><br />
                <button onClick={() => handleNav('s-skills')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Skills</button><br />
                <button onClick={() => handleNav('s-projects')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '12px', fontSize: '14px', fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Projects</button>
              </div>
              <div className="link-group">
                <h4>Social</h4>
                <a href="https://www.linkedin.com/in/divy-mevada-4230332bb/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://github.com/divy-mevada" target="_blank" rel="noopener noreferrer">GitHub</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Divy Mevada. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* NAV */}
      <nav className={`nav-bar${showNav ? ' nav-visible' : ''}`}>
        {SECTIONS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`nav-btn ${activeSection === id ? 'active' : ''}`}
            onClick={() => handleNav(id)}
          >
            <span>{icon}</span><span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
