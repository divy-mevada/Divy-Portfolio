import { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './portfolio.css';
import KeyboardScene from './KeyboardScene';
import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiPython, SiDjango, SiNodedotjs, SiMongodb } from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiPython />, title: "Python", href: "https://python.org" },
  { node: <SiDjango />, title: "Django", href: "https://djangoproject.com" },
  { node: <SiNodedotjs />, title: "Node.js", href: "https://nodejs.org" },
  { node: <SiMongodb />, title: "MongoDB", href: "https://mongodb.com" },
];

const SERVICES_DATA = [
  {
    id: 1,
    title: "Full Stack Web Apps",
    icon: "</>",
    desc: "End-to-end development using React, Django, and Node.js for robust, scalable applications.",
    img: "https://placehold.co/800x450/1a1a1a/gold?text=Full+Stack+Apps"
  },
  {
    id: 2,
    title: "ERP Systems",
    icon: "◈",
    desc: "Comprehensive Enterprise Resource Planning systems to manage operations and workflows efficiently.",
    img: "https://placehold.co/800x450/1a1a1a/teal?text=ERP+Systems",
    video: "/ProjectVideo/ERP.mp4"
  },
  {
    id: 3,
    title: "REST API Design",
    icon: "⟐",
    desc: "Building secure, documented, and high-performance backend systems and microservices.",
    img: "https://placehold.co/800x450/1a1a1a/gold?text=REST+APIs"
  },
  {
    id: 4,
    title: "AI Integration",
    icon: "⚡",
    desc: "Implementing LLM pipelines, agentic workflows, and machine learning models into products.",
    img: "https://placehold.co/800x450/1a1a1a/teal?text=AI+Integration"
  },
  {
    id: 5,
    title: "Auth & Security",
    icon: "🔐",
    desc: "Secure JWT, OAuth, role-based access control, and Web3 wallet authentication.",
    img: "https://placehold.co/800x450/1a1a1a/gold?text=Auth+&+Security",
    video: "/ProjectVideo/blockchain.mp4"
  },
  {
    id: 6,
    title: "Deployment & DevOps",
    icon: "☁",
    desc: "CI/CD pipelines, Docker containerization, and hosting on platforms like Vercel and AWS.",
    img: "https://placehold.co/800x450/1a1a1a/teal?text=DevOps"
  }
];

const SECTIONS = [
  { id: 's-home', label: 'Home', icon: '⌂' },
  { id: 's-summary', label: 'About', icon: '◎' },
  { id: 's-services', label: 'Services', icon: '❖' },
  { id: 's-process', label: 'Process', icon: '⟐' },
  { id: 's-projects', label: 'Projects', icon: '◈' },
  { id: 's-skills', label: 'Skills', icon: '⟨/⟩' },
  { id: 's-contact', label: 'Contact', icon: '✉' },
];

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState('s-home');
  const [showSkills, setShowSkills] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const sectionRefs = useRef({});

  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isServiceHovered, setIsServiceHovered] = useState(false);

  useEffect(() => {
    if (isServiceHovered) return;
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % SERVICES_DATA.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isServiceHovered]);

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
                Available for freelance & internships
              </div>
              <div className="hero-role">Full Stack Engineer & Product Developer</div>
              <div className="hero-name">Divy<br />Mevada</div>
              <p className="hero-desc">
                Building scalable web platforms, SaaS dashboards, and AI-powered products. I help turn ideas into scalable digital products using React, Django, and modern tooling.
              </p>
              <div className="hero-contacts">
                <button onClick={() => handleNav('s-projects')} className="action-btn" style={{ background: 'var(--gold)', color: '#080b0f', borderColor: 'var(--gold)', fontWeight: 700 }}>View Projects</button>
                <button onClick={() => handleNav('s-contact')} className="action-btn" style={{ fontWeight: 600 }}>Let's Work Together</button>
                <div style={{ width: '100%', height: '8px' }}></div>
                <a href="https://www.linkedin.com/in/divy-mevada-4230332bb/" target="_blank" rel="noopener noreferrer" className="contact-item">in LinkedIn</a>
                <a href="https://github.com/divy-mevada" target="_blank" rel="noopener noreferrer" className="contact-item">⌥ GitHub</a>
                <span className="contact-item">◎ Ahmedabad, IN</span>
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

        {/* SERVICES */}
        <div
          className="section"
          id="s-services"
          ref={(el) => (sectionRefs.current['s-services'] = el)}
        >
          <div className="glass projects-intro">
            <div className="section-label">What I Do</div>
            <div className="section-title">End-to-End <span className="highlight">Product Development</span></div>
            <p className="body-text">I bring ideas from concept to production with a focus on scalable architecture and premium user experience.</p>
          </div>
          <div
            className="service-slider-container"
            onMouseEnter={() => setIsServiceHovered(true)}
            onMouseLeave={() => setIsServiceHovered(false)}
          >
            <div
              className="service-slider-track"
              style={{ transform: `translateX(-${currentServiceIndex * 100}%)` }}
            >
              {SERVICES_DATA.map((service, idx) => (
                <div className="service-slide glass" key={service.id}>
                  <div className="service-slide-content">
                    <div className="service-icon">{service.icon}</div>
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-desc">{service.desc}</p>
                  </div>
                  <div className="service-slide-image">
                    {service.video ? (
                      <video src={service.video} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={service.img} alt={service.title} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="service-slider-dots">
              {SERVICES_DATA.map((_, idx) => (
                <button
                  key={idx}
                  className={`slider-dot ${idx === currentServiceIndex ? 'active' : ''}`}
                  onClick={() => setCurrentServiceIndex(idx)}
                />
              ))}
            </div>
          </div>

          <div style={{ height: '120px', marginTop: '60px', position: 'relative', overflow: 'hidden', width: '100vw', left: '50%', transform: 'translateX(-50%)' }}>
            <LogoLoop
              logos={techLogos}
              speed={100}
              direction="left"
              logoHeight={40}
              gap={60}
              pauseOnHover={true}
              scaleOnHover={true}
              fadeOut={true}
              fadeOutColor="transparent"
              ariaLabel="Technology partners"
            />
          </div>
        </div>

        {/* PROCESS */}
        <div
          className="section"
          id="s-process"
          ref={(el) => (sectionRefs.current['s-process'] = el)}
        >
          <div className="glass projects-intro" style={{ marginBottom: '40px' }}>
            <div className="section-label">How I Work</div>
            <div className="section-title">The Development <span className="highlight">Process</span></div>
          </div>
          <div className="process-steps">
            <div className="glass process-step">
              <div className="step-num">01</div>
              <h4 className="step-title">Discover</h4>
              <p className="step-desc">Requirements gathering, architecture planning, and feasibility analysis.</p>
            </div>
            <div className="glass process-step">
              <div className="step-num">02</div>
              <h4 className="step-title">Design</h4>
              <p className="step-desc">System design, database modeling, and UI wireframing.</p>
            </div>
            <div className="glass process-step">
              <div className="step-num">03</div>
              <h4 className="step-title">Build</h4>
              <p className="step-desc">Iterative, clean-code development with regular milestone reviews.</p>
            </div>
            <div className="glass process-step">
              <div className="step-num">04</div>
              <h4 className="step-title">Test</h4>
              <p className="step-desc">Rigorous QA, performance profiling, and accessibility checks.</p>
            </div>
            <div className="glass process-step">
              <div className="step-num">05</div>
              <h4 className="step-title">Deploy</h4>
              <p className="step-desc">Automated CI/CD deployment, monitoring setup, and smooth handoff.</p>
            </div>
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
            <div className="section-title">Case Studies & <span className="highlight">Projects</span></div>
            <p className="body-text">Award-winning products built for scale, performance, and impact.</p>
          </div>
          <div className="projects-list">
            <div className="glass project-card case-study">
              <div className="project-header">
                <div className="project-number">01 — BLOCKCHAIN PLATFORM</div>
                <div className="project-badge">2nd Runner-Up (National)</div>
              </div>
              <div className="project-title">DHRUVA</div>
              <div className="project-sub">Credential Verification System</div>

              <div className="project-narrative">
                <p><strong>Problem:</strong> Credential fraud and slow verification processes at the national level.</p>
                <p><strong>Solution:</strong> Built a tamper-proof blockchain platform for instant issuance and QR-based verification, abstracting blockchain complexity into an intuitive UI.</p>
              </div>

              <div className="project-stack">
                <span>React</span><span>Web3</span><span>Solidity</span><span>Node.js</span>
              </div>

              <div className="project-actions" style={{ marginTop: '24px' }}>
                <a href="https://github.com/divy-mevada/DHRUVA_" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>⌥</span> GitHub
                </a>
                <a href="https://dhruva-8.netlify.app/" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ background: 'var(--gold)', color: '#080b0f', borderColor: 'var(--gold)' }}>
                  <span>◎</span> Live Demo
                </a>
              </div>
            </div>

            <div className="glass project-card case-study">
              <div className="project-header">
                <div className="project-number">02 — SMART CITY ANALYTICS</div>
                <div className="project-badge">Top 10 / 120+ Teams</div>
              </div>
              <div className="project-title">CITY VIEW</div>
              <div className="project-sub">Integrated Urban Intelligence Dashboard</div>

              <div className="project-narrative">
                <p><strong>Problem:</strong> Civic administrators lacked real-time, actionable data on urban infrastructure.</p>
                <p><strong>Solution:</strong> Developed a dashboard that ingests live sensor streams to visualize air quality and traffic analytics for data-driven urban planning.</p>
              </div>

              <div className="project-stack">
                <span>React</span><span>Python</span><span>IoT Streams</span><span>Data Viz</span>
              </div>

              <div className="project-actions" style={{ marginTop: '24px' }}>
                <a href="https://github.com/divy-mevada/Delighful_Derek" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>⌥</span> GitHub
                </a>
              </div>
            </div>

            <div className="glass project-card case-study">
              <div className="project-header">
                <div className="project-number">03 — ESG COMPLIANCE</div>
                <div className="project-badge">Top 15 / 700+ Teams</div>
              </div>
              <div className="project-title">ESGresolve</div>
              <div className="project-sub">Sustainability Analytics Platform</div>

              <div className="project-narrative">
                <p><strong>Problem:</strong> Organizations struggle to convert complex ESG datasets into actionable compliance insights.</p>
                <p><strong>Solution:</strong> Built a full-stack platform for ESG evaluation and risk detection, qualifying for the offline finals among 700+ competing teams.</p>
              </div>

              <div className="project-stack">
                <span>React</span><span>Express</span><span>MongoDB</span><span>Analytics</span>
              </div>

              <div className="project-actions" style={{ marginTop: '24px' }}>
                <a href="https://github.com/divy-mevada/ESGresolve" target="_blank" rel="noopener noreferrer" className="action-btn">
                  <span>⌥</span> GitHub
                </a>
                <a href="https://esg-resolve-067.vercel.app/" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ background: 'var(--gold)', color: '#080b0f', borderColor: 'var(--gold)' }}>
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
            <div className="section-title">Let's build something <span className="highlight">impactful</span></div>
            <p className="contact-subtitle">I typically respond within 24 hours. Open to freelance, internships, and product collaborations.</p>

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
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '8px' }}>Secure contact form via EmailJS.</p>
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
