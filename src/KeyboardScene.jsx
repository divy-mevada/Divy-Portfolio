import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './KeyboardScene.css';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;
const FRAME_PATH = (index) => `/assets/frames/frame_${String(index).padStart(4, '0')}.webp`;

const STAGES = [
  {
    eyebrow: 'Welcome',
    headline: 'Divy Mevada',
    body: 'Developer. Designer. Builder.\nCrafting experiences at the intersection\nof design and engineering.',
  },
  {
    eyebrow: 'Philosophy',
    headline: 'Built with\nprecision.',
    body: 'Every project engineered for performance,\nclarity, and purposeful interaction.',
  },
  {
    eyebrow: "Let's connect",
    headline: 'Open to\nopportunities.',
    body: "Collaborations, full-stack projects,\nand bold ideas — let's build something real.",
  },
];

export default function KeyboardScene() {
  const outerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);

  const [hintOpacity, setHintOpacity] = useState(1);
  const [stageIdx, setStageIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const lastWidthRef = useRef(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Responsive DPR & Object-fit Cover Canvas Renderer
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const img = imagesRef.current[frameIndex] || imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background fill to blend seamless framing
    ctx.fillStyle = '#080b0f';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Object-fit calculation
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;

    let renderW, renderH, offX, offY;

    if (displayWidth < 768 && canvasRatio < imgRatio) {
      // Mobile portrait optimized framing: prevent extreme side-cropping
      renderW = Math.min(displayHeight * imgRatio, displayWidth * 1.35);
      renderH = renderW / imgRatio;
      offX = (displayWidth - renderW) / 2;
      offY = (displayHeight - renderH) / 2;
    } else if (canvasRatio > imgRatio) {
      renderW = displayWidth;
      renderH = displayWidth / imgRatio;
      offX = 0;
      offY = (displayHeight - renderH) / 2;
    } else {
      renderH = displayHeight;
      renderW = displayHeight * imgRatio;
      offX = (displayWidth - renderW) / 2;
      offY = 0;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, offX, offY, renderW, renderH);

    ctx.restore();
  }, []);

  // Preload frames silently in background
  useEffect(() => {
    const loadedImages = new Array(TOTAL_FRAMES);

    // Load first frame immediately and render
    const firstImg = new Image();
    firstImg.src = FRAME_PATH(1);
    firstImg.onload = () => {
      loadedImages[0] = firstImg;
      imagesRef.current[0] = firstImg;
      renderFrame(0);
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const idx = i - 1;
      img.src = FRAME_PATH(i);
      img.onload = () => {
        loadedImages[idx] = img;
      };
    }
    imagesRef.current = loadedImages;
  }, [renderFrame]);

  // Window resize handler — check width change to ignore mobile URL bar height shifts
  useEffect(() => {
    const handleResize = () => {
      if (Math.abs(window.innerWidth - lastWidthRef.current) > 5) {
        lastWidthRef.current = window.innerWidth;
        renderFrame(currentFrameRef.current);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame]);

  // Fade intro hint on scroll
  useEffect(() => {
    const onScroll = () => {
      setHintOpacity(Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.7)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lenis Smooth Momentum Scroll + GSAP ScrollTrigger Scrub
  useEffect(() => {
    const isTouchDevice = typeof window !== 'undefined' && (
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    );

    const lenis = new Lenis({
      duration: isTouchDevice ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: isTouchDevice ? 1.0 : 1.6,
      syncTouch: !isTouchDevice,
    });
    window.__lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    const frameObj = { frame: 0 };
    const outerEl = outerRef.current;

    const trigger = ScrollTrigger.create({
      trigger: outerEl,
      pin: outerEl.querySelector('.ks-sticky') || true,
      pinSpacing: false,
      start: 'top top',
      end: 'bottom bottom',
      scrub: isTouchDevice ? 0.15 : 0.4,
      animation: gsap.to(frameObj, {
        frame: TOTAL_FRAMES - 1,
        ease: 'none',
        duration: 1,
      }),
      onUpdate: (self) => {
        const frameIdx = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(frameObj.frame))
        );

        if (frameIdx !== currentFrameRef.current) {
          currentFrameRef.current = frameIdx;
          renderFrame(frameIdx);
        }

        const p = self.progress;
        setProgress(p);

        if (p >= 0.96) {
          setCompleted(true);
        } else {
          setCompleted(false);
          if (p < 0.33) {
            setStageIdx(0);
          } else if (p < 0.66) {
            setStageIdx(1);
          } else {
            setStageIdx(2);
          }
        }
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [renderFrame]);

  const stage = STAGES[stageIdx] || STAGES[0];

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
          PHASE 2 — Scrollable Keyboard Video Canvas (sticky)
          Clean, smooth bi-directional frame scrubbing on scroll.
      ══════════════════════════════════════════════════════ */}
      <div className="ks-outer" ref={outerRef}>
        <div className="ks-sticky">
          <canvas ref={canvasRef} className="ks-canvas" />
          <div className="ks-vignette" />

          {/* Single bottom-left text block / minimal greeting on completion */}
          {completed ? (
            <div className="ks-centered-wrapper ks-fade-in">
              <div className="ks-centered-text">
                <h2 className="ks-minimal-greet">hey, great to see you!</h2>
                <p className="ks-minimal-sub">scroll down to explore more about me</p>
              </div>
            </div>
          ) : (
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
          )}

          {/* Thin gold progress bar at bottom */}
          <div className="ks-progress-track">
            <div
              className="ks-progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
