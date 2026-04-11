import { useEffect, useRef, useState } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',     href: '#s-home'         },
  { label: 'About',    href: '#s-summary'       },
  { label: 'Projects', href: '#s-experience'    },
  { label: 'Skills',   href: '#s-skills'        },
  { label: 'Contact',  href: '#s-achievements'  },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [activeLink,  setActiveLink]  = useState('');
  const ticking = useRef(false);

  /* ── Scroll listener: glassmorphism threshold ── */
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close menu on resize to desktop ── */
  useEffect(() => {
    const close = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  /* ── Intersection observer: active link ── */
  useEffect(() => {
    const targets = NAV_LINKS.map(l => document.querySelector(l.href)).filter(Boolean);
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveLink(e.target.id);
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, []);

  const handleLink = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <nav
        className={`nb-nav${scrolled ? ' nb-nav--scrolled' : ''}${menuOpen ? ' nb-nav--open' : ''}`}
        aria-label="Main navigation"
      >
        {/* ── Left: Logo ── */}
        <a
          href="#s-home"
          className="nb-logo"
          onClick={e => handleLink(e, '#s-home')}
          aria-label="Go to top"
        >
          DM
        </a>

        {/* ── Center: Links (desktop) ── */}
        <ul className="nb-links" role="list">
          {NAV_LINKS.map(({ label, href }) => {
            const id = href.replace('#', '');
            return (
              <li key={href}>
                <a
                  href={href}
                  className={`nb-link${activeLink === id ? ' nb-link--active' : ''}`}
                  onClick={e => handleLink(e, href)}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── Right: CTA ── */}
        <a
          href="#s-home"
          className="nb-cta"
          onClick={e => handleLink(e, '#s-home')}
          id="navbar-hire-btn"
        >
          Hire Me
        </a>

        {/* ── Mobile hamburger ── */}
        <button
          className={`nb-hamburger${menuOpen ? ' nb-hamburger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className="nb-bar nb-bar--top"    />
          <span className="nb-bar nb-bar--mid"    />
          <span className="nb-bar nb-bar--bot"    />
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={`nb-drawer${menuOpen ? ' nb-drawer--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className="nb-drawer-links" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="nb-drawer-link"
                onClick={e => handleLink(e, href)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#s-home"
          className="nb-cta nb-drawer-cta"
          onClick={e => handleLink(e, '#s-home')}
        >
          Hire Me
        </a>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="nb-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
