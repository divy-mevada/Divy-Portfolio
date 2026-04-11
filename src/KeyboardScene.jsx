import { useEffect, useRef, useState } from 'react';
import './KeyboardScene.css';

/* ─── Config ─────────────────────────────────────────────── */
const MAX_VIDEO_TIME = 6; // stop video at 6 seconds

/* ─── 3 text stages, keyed to video progress (0 → 1) ────── */
const STAGES = [
  {
    eyebrow: 'Welcome',
    headline: 'Divy Mevada',
    body: 'Developer.  Designer.  Builder.\nCrafting experiences at the intersection\nof design and engineering.',
  },
  {
    eyebrow: 'Philosophy',
    headline: 'Built with\nprecision.',
    body: 'Every project engineered for performance,\nclarity, and purposeful interaction.',
  },
  {
    eyebrow: "Let's connect",
    headline: 'Open to\nopportunities.',
    body: 'Collaborations, full-stack projects,\nand bold ideas — let\'s build something real.',
  },
];

export default function KeyboardScene() {
  const outerRef      = useRef(null);
  const videoRef      = useRef(null);
  const rafRef        = useRef(null);
  const playingRef    = useRef(false);

  const [stageIdx,      setStageIdx]      = useState(0);
  const [hintOpacity,   setHintOpacity]   = useState(1);
  const [panelOpacity,  setPanelOpacity]  = useState(1);
  const [completed,     setCompleted]     = useState(false);

  /* ── Intro hint fades as user scrolls away from intro ── */
  useEffect(() => {
    const onScroll = () =>
      setHintOpacity(Math.max(0, 1 - window.scrollY / window.innerHeight));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── On video complete → fade panel → scroll to portfolio ── */
  useEffect(() => {
    if (!completed) return;
    setPanelOpacity(0);
    const t = setTimeout(() => {
      if (outerRef.current) {
        const end = outerRef.current.offsetTop + outerRef.current.offsetHeight;
        window.scrollTo({ top: end, behavior: 'smooth' });
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [completed]);

  /* ── Core: video autoplay + stage tracking ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted       = true;
    video.preload     = 'auto';
    video.playsInline = true;

    /* rAF: cap at MAX_VIDEO_TIME, update stage, detect end */
    const tick = () => {
      if (video.duration) {
        // Hard-stop at 6 seconds
        if (video.currentTime >= MAX_VIDEO_TIME) {
          video.pause();
          video.currentTime = MAX_VIDEO_TIME;
          setCompleted(true);
        }

        // Update text stage based on playback progress
        const p = video.currentTime / MAX_VIDEO_TIME;
        const idx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
        setStageIdx(idx);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    /* ─── Play/pause helpers ─────────────────────────────── */
    const play = () => {
      if (!playingRef.current && video.currentTime < MAX_VIDEO_TIME) {
        playingRef.current = true;
        video.currentTime  = 0;
        video.play().catch(() => { playingRef.current = false; });
      }
    };
    const pause = () => {
      if (playingRef.current) {
        playingRef.current = false;
        video.pause();
      }
    };

    /* ─── IntersectionObserver ───────────────────────────────
       threshold: 0  →  fires the moment any pixel of the
       200vh outer div enters the viewport.
       (The old bug was threshold: 0.55 on 200vh = impossible.)
    ──────────────────────────────────────────────────────── */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else pause();
      },
      { threshold: 0 }
    );
    if (outerRef.current) io.observe(outerRef.current);

    /* ─── Scroll fallback ────────────────────────────────────
       Handles trackpad / scrollbar edge cases where the
       observer fires but .play() is blocked initially.
    ──────────────────────────────────────────────────────── */
    const onScroll = () => {
      if (!outerRef.current) return;
      const { top, bottom } = outerRef.current.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 0) play();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stage = STAGES[stageIdx];

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          PHASE 1 — Black intro screen (100 vh)
          User sees this on load; one scroll → keyboard view.
      ══════════════════════════════════════════════════════ */}
      <div className="ks-intro">
        <p className="ks-intro-title">Divy Mevada</p>
        <div className="ks-intro-hint" style={{ opacity: hintOpacity }}>
          <span className="ks-arrow-icon">↓</span>
          <span className="ks-arrow-label">Scroll to explore</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PHASE 2 — Keyboard video (sticky, 200 vh outer)
          Video autoplays on intersection; one scroll triggers it.
          After 6 s, panel fades and page scrolls to portfolio.
      ══════════════════════════════════════════════════════ */}
      <div className="ks-outer" ref={outerRef}>
        <div
          className="ks-sticky"
          style={{
            opacity: panelOpacity,
            transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: completed ? 'none' : 'auto',
          }}
        >
          <video
            ref={videoRef}
            className="ks-video"
            src="/keyboard.mp4"
            playsInline
            muted
            preload="auto"
          />
          <div className="ks-vignette" />

          {/* Single bottom-left text block — content crossfades between stages */}
          <div className="ks-text-block">
            <p className="ks-eyebrow" key={`ey-${stageIdx}`}>{stage.eyebrow}</p>
            <h2 className="ks-head" key={`hd-${stageIdx}`}>
              {stage.headline.split('\n').map((line, i) => (
                <span key={i}>{line}{i < stage.headline.split('\n').length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="ks-body" key={`bd-${stageIdx}`}>
              {stage.body.split('\n').map((line, i) => (
                <span key={i}>{line}{i < stage.body.split('\n').length - 1 && <br />}</span>
              ))}
            </p>
          </div>

          {/* Thin gold progress bar at bottom */}
          <div className="ks-progress-track">
            <div
              className="ks-progress-fill"
              style={{
                width: videoRef.current?.duration
                  ? `${Math.min(videoRef.current.currentTime / MAX_VIDEO_TIME, 1) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
