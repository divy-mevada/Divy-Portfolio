import { useEffect, useRef, useState } from 'react';
import './KeyboardScene.css';

/* ─── Beat definitions (video-time % ranges) ────────────────
   Beats are keyed to video.currentTime / video.duration (0→1)
   so they're entirely independent of scroll — the video plays
   at natural speed, text just follows the playhead.
──────────────────────────────────────────────────────────── */
const BEATS = [
  { from: 0,    to: 0.22, pos: 'center' },
  { from: 0.22, to: 0.46, pos: 'left'   },
  { from: 0.46, to: 0.70, pos: 'right'  },
  { from: 0.70, to: 0.88, pos: 'center' },
  { from: 0.88, to: 1.00, pos: 'center' },
];

const FADE = 0.05; // fraction of duration for fade in/out

function opacityAt(beat, p) {
  if (p < beat.from || p > beat.to) return 0;
  return Math.min(
    (p - beat.from)  / FADE,
    (beat.to - p)    / FADE,
    1
  );
}

export default function KeyboardScene() {
  const videoRef    = useRef(null);
  const outerRef    = useRef(null);
  const rafRef      = useRef(null);
  const [beats, setBeats]           = useState([0, 0, 0, 0, 0]);
  const [hintOpacity, setHintOpacity] = useState(1);

  /* ── Scroll hint fades as intro scrolls away ── */
  useEffect(() => {
    const onScroll = () => {
      const ratio = Math.max(0, 1 - window.scrollY / window.innerHeight);
      setHintOpacity(ratio);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Video + beat sync ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted       = true;
    video.preload     = 'auto';
    video.playsInline = true;

    /* rAF: read video.currentTime every frame → drive beat opacities */
    const tick = () => {
      if (video.duration) {
        const p = video.currentTime / video.duration;
        setBeats(BEATS.map(b => opacityAt(b, p)));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    /* ── Play/pause helpers ── */
    let isPlaying = false;

    const tryPlay = () => {
      if (!isPlaying) {
        isPlaying = true;
        video.play().catch(() => { isPlaying = false; });
      }
    };

    const tryPause = () => {
      if (isPlaying) {
        isPlaying = false;
        video.pause();
      }
    };

    /* ── IntersectionObserver: fires as soon as 1px of outer div is visible.
       threshold: 0  ← the outer div is 200vh; 0.55 is mathematically
       unreachable in a 100vh viewport (max ratio = 100/200 = 0.5).     ── */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.currentTime = 0;
          tryPlay();
        } else {
          tryPause();
        }
      },
      { threshold: 0 }           // ← was 0.55 — that was the bug
    );
    if (outerRef.current) io.observe(outerRef.current);

    /* ── Scroll fallback: if observer missed the entry, play while sticky ── */
    const onScroll = () => {
      if (!outerRef.current) return;
      const { top, bottom } = outerRef.current.getBoundingClientRect();
      const inStickyZone = top <= 0 && bottom > 0;
      if (inStickyZone) {
        tryPlay();
      } else if (bottom <= 0) {
        tryPause();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════════════
          PHASE 1 — Black intro screen (100 vh)
          User sees this first; scroll hint invites them in.
      ════════════════════════════════════════════════════ */}
      <div className="ks-intro">
        <p className="ks-intro-title">Divy Mevada</p>
        <div className="ks-intro-hint" style={{ opacity: hintOpacity }}>
          <span className="ks-arrow-icon">↓</span>
          <span className="ks-arrow-label">Scroll to explore</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          PHASE 2 — Keyboard video panel (sticky, 200 vh outer)
          Video autoplays when in viewport; beats sync to time.
      ════════════════════════════════════════════════════ */}
      <div className="ks-outer" ref={outerRef}>
        <div className="ks-sticky">

          <video
            ref={videoRef}
            className="ks-video"
            src="/keyboard.mp4"
            playsInline
            muted
            preload="auto"
          />
          <div className="ks-vignette" />

          {/* ── BEAT 1 — Welcome (0–22%) ── */}
          <div className="ks-beat ks-beat--center"
            style={{ opacity: beats[0], transform: `translateY(${(1 - beats[0]) * 22}px)` }}>
            <p className="ks-eyebrow">Welcome</p>
            <h1 className="ks-head">Divy Mevada</h1>
            <p className="ks-sub">Developer.&nbsp;&nbsp;Designer.&nbsp;&nbsp;Builder.</p>
            <p className="ks-body">
              Crafting experiences that live at the intersection<br />
              of design and engineering.
            </p>
          </div>

          {/* ── BEAT 2 — Precision (22–46%) ── */}
          <div className="ks-beat ks-beat--left"
            style={{ opacity: beats[1], transform: `translateY(${(1 - beats[1]) * 22}px)` }}>
            <p className="ks-eyebrow">Philosophy</p>
            <h2 className="ks-head">Built with<br />precision.</h2>
            <p className="ks-body">
              Every project is engineered for performance,<br />
              clarity, and purposeful interaction.
            </p>
            <p className="ks-body ks-body--muted">
              From concept to deployment — clean code,<br />
              thoughtful architecture, real results.
            </p>
          </div>

          {/* ── BEAT 3 — Interaction (46–70%) ── */}
          <div className="ks-beat ks-beat--right"
            style={{ opacity: beats[2], transform: `translateY(${(1 - beats[2]) * 22}px)` }}>
            <p className="ks-eyebrow">Craft</p>
            <h2 className="ks-head">Interaction,<br />redefined.</h2>
            <ul className="ks-list">
              <li>Scroll-driven storytelling and motion design.</li>
              <li>Interfaces that feel as good as they look.</li>
              <li>UI/UX grounded in real user behavior.</li>
            </ul>
          </div>

          {/* ── BEAT 4 — Portfolio (70–88%) ── */}
          <div className="ks-beat ks-beat--center"
            style={{ opacity: beats[3], transform: `translateY(${(1 - beats[3]) * 22}px)` }}>
            <p className="ks-eyebrow">Portfolio</p>
            <h2 className="ks-head">Projects that<br />speak for themselves.</h2>
            <p className="ks-body">
              From full-stack apps to creative frontends —<br />
              a portfolio built for impact.
            </p>
          </div>

          {/* ── BEAT 5 — CTA (88–100%) ── */}
          <div className="ks-beat ks-beat--center ks-beat--cta"
            style={{ opacity: beats[4], transform: `translateY(${(1 - beats[4]) * 22}px)` }}>
            <h2 className="ks-head ks-head--xl">Let's build something<br />exceptional.</h2>
            <p className="ks-sub ks-sub--sm">
              Open to opportunities, collaborations, and bold ideas.
            </p>
            <div className="ks-cta-row">
              <a href="#s-experience" className="ks-btn ks-btn--gold">View My Work</a>
              <a href="#s-home"       className="ks-btn ks-btn--ghost">Get in Touch</a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
