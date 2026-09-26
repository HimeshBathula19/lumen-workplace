import { useEffect, useState } from "react";

const DURATION = 10000;

export default function IntroAnimation({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame;

    const animate = (time) => {
      const value = Math.min((time - start) / DURATION, 1);

      setProgress(value);

      if (value < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          onComplete?.();
        }, 700);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  const phase =
    progress < 0.28
      ? "observe"
      : progress < 0.53
        ? "protect"
        : progress < 0.78
          ? "understand"
          : "resolve";

  return (
    <div className={`lumen-film lumen-film-${phase}`}>
      <div className="film-vignette" />

      <header className="film-header">
        <div className="film-brand">
          <span className="film-mark">L</span>
          <span>LUMEN</span>
        </div>

        <span>WORKPLACE CAUSAL INTELLIGENCE</span>
      </header>

      <main className="film-stage">
        {/* WORKPLACE ACTIVITY */}
        <svg
          className="film-activity"
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <g className="activity-wave wave-1">
            <path d="M40 250 C180 130 250 350 390 245 S650 150 960 250" />
          </g>

          <g className="activity-wave wave-2">
            <path d="M40 270 C190 180 280 380 430 260 S700 180 960 280" />
          </g>

          <g className="activity-wave wave-3">
            <path d="M40 290 C170 230 290 400 450 280 S720 220 960 300" />
          </g>

          <g className="activity-points">
            <circle cx="145" cy="202" r="4" />
            <circle cx="270" cy="292" r="4" />
            <circle cx="390" cy="245" r="4" />
            <circle cx="525" cy="211" r="4" />
            <circle cx="670" cy="246" r="4" />
            <circle cx="805" cy="270" r="4" />
          </g>

          <circle
            className="activity-focus"
            cx="500"
            cy="250"
            r="76"
          />

          <circle
            className="activity-focus-inner"
            cx="500"
            cy="250"
            r="30"
          />
        </svg>

        {/* PRIVACY TRANSFORMATION */}
        <div className="film-privacy">
          <div className="privacy-stream stream-left">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="privacy-aperture-main">
            <div className="aperture-ring ring-a" />
            <div className="aperture-ring ring-b" />
            <span>PRIVATE</span>
          </div>

          <div className="privacy-stream stream-right">
            <i />
            <i />
            <i />
          </div>
        </div>

        {/* CAUSAL MODEL */}
        <div className="film-causal">
          <div className="causal-point point-a">
            <span>MEETINGS</span>
          </div>

          <div className="causal-point point-b">
            <span>WORKLOAD</span>
          </div>

          <div className="causal-point point-c">
            <span>AFTER-HOURS</span>
          </div>

          <div className="causal-point point-d">
            <span>RECOVERY</span>
          </div>

          <div className="causal-core">
            <span />
          </div>

          <div className="causal-connection connection-a" />
          <div className="causal-connection connection-b" />
          <div className="causal-connection connection-c" />
          <div className="causal-connection connection-d" />
        </div>

        {/* FINAL RESOLUTION */}
        <div className="film-resolve">
          <div className="film-resolve-mark">L</div>

          <div className="film-resolve-name">
            LUMEN
          </div>

          <div className="film-resolve-line" />

          <span>
            UNDERSTAND THE SYSTEM.
          </span>
        </div>
      </main>

      <div className="film-caption">
        <div className="caption-observe">
          <small>01</small>
          <strong>Observe the pattern.</strong>
        </div>

        <div className="caption-protect">
          <small>02</small>
          <strong>Protect the individual.</strong>
        </div>

        <div className="caption-understand">
          <small>03</small>
          <strong>Understand what may cause change.</strong>
        </div>

        <div className="caption-resolve">
          <small>04</small>
          <strong>Ask what could change.</strong>
        </div>
      </div>

      <footer className="film-footer">
        <span>PRIVATE BY DESIGN</span>

        <div className="film-progress">
          <i
            style={{
              transform: `scaleX(${progress})`,
            }}
          />
        </div>

        <span>2026</span>
      </footer>
    </div>
  );
}