import { useEffect, useRef } from "react";

const DURATION = 9000;

export default function MorphIntro({ onComplete }) {
  const introRef = useRef(null);

  useEffect(() => {
    const intro = introRef.current;

    if (!intro) {
      return;
    }

    const startTime = performance.now();
    let animationFrame;
    let completed = false;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      intro.style.setProperty("--progress", progress);

      let phase = "observe";

      if (progress < 0.20) {
        phase = "observe";
      } else if (progress < 0.40) {
        phase = "protect";
      } else if (progress < 0.62) {
        phase = "understand";
      } else if (progress < 0.82) {
        phase = "intervention";
      } else {
        phase = "resolve";
      }

      intro.dataset.phase = phase;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else if (!completed) {
        completed = true;

        intro.classList.add("is-complete");

        window.setTimeout(() => {
          onComplete?.();
        }, 700);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    const handleSkip = () => {
      cancelAnimationFrame(animationFrame);
      try {
        localStorage.setItem("lumen_intro_completed", "true");
      } catch (e) {
        // ignore
      }
      onComplete?.();
    };

    introRef.current._skip = handleSkip;

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onComplete]);

  const handleSkipClick = () => {
    try {
      localStorage.setItem("lumen_intro_completed", "true");
    } catch (e) {
      // ignore
    }
    onComplete?.();
  };

  return (
    <div
      ref={introRef}
      className="morph-intro"
      data-phase="observe"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="morph-topbar">
        <div className="morph-brand">
          <div className="morph-brand-mark">L</div>
          <span>LUMEN</span>
        </div>

        <div className="morph-topbar-right">
          <span className="morph-meta">
            WORKPLACE CAUSAL INTELLIGENCE
          </span>
          <button
            type="button"
            className="morph-skip-btn"
            onClick={handleSkipClick}
            aria-label="Skip animation"
          >
            Skip Intro
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN STAGE
      ===================================================== */}

      <main className="morph-stage">

        {/* ---------------------------------------------------
            AMBIENT FIELD
        --------------------------------------------------- */}

        <div className="morph-ambient">
          <span />
          <span />
          <span />
        </div>

        {/* ---------------------------------------------------
            OBSERVE — WORKPLACE SIGNALS
        --------------------------------------------------- */}

        <svg
          className="morph-signals"
          viewBox="0 0 1000 520"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="signalGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor="#d2d2d6"
              />

              <stop
                offset="50%"
                stopColor="#55555a"
              />

              <stop
                offset="100%"
                stopColor="#d2d2d6"
              />
            </linearGradient>
          </defs>

          <g className="signal-streams">
            <path
              d="M45 255 C165 140 250 370 375 255 S625 140 955 255"
            />

            <path
              d="M45 280 C170 180 260 410 390 280 S640 170 955 285"
            />

            <path
              d="M45 305 C175 225 265 440 395 305 S650 215 955 315"
            />

            <path
              d="M60 330 C180 275 270 465 405 330 S660 270 940 340"
            />
          </g>

          <g className="signal-nodes">
            <circle cx="155" cy="171" r="4" />
            <circle cx="275" cy="346" r="4" />
            <circle cx="395" cy="255" r="4" />
            <circle cx="525" cy="195" r="4" />
            <circle cx="665" cy="257" r="4" />
            <circle cx="805" cy="331" r="4" />
          </g>

          <circle
            className="signal-focus-ring"
            cx="500"
            cy="260"
            r="62"
          />

          <circle
            className="signal-focus-ring secondary"
            cx="500"
            cy="260"
            r="92"
          />

          <circle
            className="signal-focus-core"
            cx="500"
            cy="260"
            r="13"
          />
        </svg>

        {/* ---------------------------------------------------
            PROTECT — PRIVACY FILTER
        --------------------------------------------------- */}

        <div className="morph-protection">

          <div className="protection-panel protection-left">
            <span>WORKPLACE ACTIVITY</span>

            <div className="protection-lines">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>

            <small>
              Individual content remains outside
              the intelligence layer.
            </small>
          </div>

          <div className="protection-gate">

            <div className="gate-line gate-top" />
            <div className="gate-line gate-bottom" />

            <div className="gate-core">
              <div className="gate-ring ring-one" />
              <div className="gate-ring ring-two" />

              <span>PRIVATE</span>
            </div>

          </div>

          <div className="protection-panel protection-right">
            <span>AGGREGATED SIGNAL</span>

            <div className="aggregate-lines">
              <i />
              <i />
              <i />
            </div>

            <small>
              Team-level patterns remain.
            </small>
          </div>

        </div>

        {/* ---------------------------------------------------
            UNDERSTAND — CAUSAL STRUCTURE
        --------------------------------------------------- */}

        <div className="morph-causal">

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="causalArrow"
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
              >
                <path
                  d="M0 0 L7 3.5 L0 7 Z"
                />
              </marker>
            </defs>

            <g className="causal-paths">

              <path
                className="causal-path"
                d="M170 170 C285 170 350 220 430 255"
                markerEnd="url(#causalArrow)"
              />

              <path
                className="causal-path"
                d="M170 350 C285 350 350 300 430 265"
                markerEnd="url(#causalArrow)"
              />

              <path
                className="causal-path"
                d="M570 255 C650 220 715 170 830 170"
                markerEnd="url(#causalArrow)"
              />

              <path
                className="causal-path"
                d="M570 265 C650 300 715 350 830 350"
                markerEnd="url(#causalArrow)"
              />

            </g>

            <g className="causal-points">

              <circle
                cx="155"
                cy="170"
                r="8"
              />

              <circle
                cx="155"
                cy="350"
                r="8"
              />

              <circle
                cx="845"
                cy="170"
                r="8"
              />

              <circle
                cx="845"
                cy="350"
                r="8"
              />

            </g>

            <circle
              className="causal-core-ring"
              cx="500"
              cy="260"
              r="63"
            />

            <circle
              className="causal-core"
              cx="500"
              cy="260"
              r="16"
            />
          </svg>

          <div className="causal-label causal-left-top">
            MEETINGS
          </div>

          <div className="causal-label causal-left-bottom">
            WORKLOAD
          </div>

          <div className="causal-label causal-right-top">
            AFTER-HOURS
          </div>

          <div className="causal-label causal-right-bottom">
            RECOVERY
          </div>

          <div className="causal-center-label">
            CAUSAL MODEL
          </div>

        </div>

        {/* ---------------------------------------------------
            INTERVENTION — WHAT IF
        --------------------------------------------------- */}

        <div className="morph-intervention">

          <div className="intervention-card">

            <span>MEETING LOAD</span>

            <strong>18.4h</strong>

            <div className="intervention-track">
              <i />
            </div>

          </div>

          <div className="intervention-arrow">

            <span>WHAT-IF</span>

            <strong>→</strong>

          </div>

          <div className="intervention-card">

            <span>MODELED CHANGE</span>

            <strong>14.0h</strong>

            <div className="intervention-track">
              <i />
            </div>

          </div>

          <div className="intervention-outcome">

            <span>ESTIMATED RECOVERY</span>

            <strong>58 → 64%</strong>

          </div>

        </div>

        {/* ---------------------------------------------------
            FINAL LUMEN IDENTITY
        --------------------------------------------------- */}

        <div className="morph-final">

          <div className="final-aura aura-one" />
          <div className="final-aura aura-two" />

          <div className="final-logo">
            L
          </div>

          <div className="final-wordmark">
            LUMEN
          </div>

          <div className="final-divider" />

          <span>
            WORKPLACE CAUSAL INTELLIGENCE
          </span>

        </div>

      </main>

      {/* =====================================================
          NARRATIVE
      ===================================================== */}

      <section className="morph-narrative">

        <div className="morph-message message-observe">
          <span>01 — OBSERVE</span>
          <strong>Work leaves patterns.</strong>
        </div>

        <div className="morph-message message-protect">
          <span>02 — PROTECT</span>
          <strong>Patterns. Not people.</strong>
        </div>

        <div className="morph-message message-understand">
          <span>03 — UNDERSTAND</span>
          <strong>Correlation is not causation.</strong>
        </div>

        <div className="morph-message message-intervention">
          <span>04 — EXPLORE</span>
          <strong>Ask what could change.</strong>
        </div>

        <div className="morph-message message-resolve">
          <span>05 — LUMEN</span>
          <strong>Understand the system.</strong>
        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="morph-bottom">

        <span>
          PRIVATE BY DESIGN
        </span>

        <div className="morph-progress">
          <i />
        </div>

        <span>
          2026
        </span>

      </footer>
    </div>
  );
}