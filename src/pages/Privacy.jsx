import { useEffect, useState } from "react";
import {
  ShieldCheck,
  EyeOff,
  Users,
  Database,
  Lock,
  Check,
  Layers,
  Settings as SettingsIcon,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLumen } from "../context/LumenContext";
import { getPrivacy } from "../lib/api";

export default function Privacy() {
  const navigate = useNavigate();
  const { settings, apiStatus } = useLumen();

  const [privacy, setPrivacy] = useState(null);
  const [simulatedSize, setSimulatedSize] = useState(4);

  useEffect(() => {
    let mounted = true;

    getPrivacy()
      .then((data) => {
        if (mounted) setPrivacy(data);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const threshold = Number(settings?.minimumTeamSize || 5);
  const suppressed = simulatedSize < threshold;

  const controls = [
    {
      icon: EyeOff,
      title: "Raw messages",
      value: "Excluded",
      text: "Message bodies and communication content are excluded from the analytical layer.",
    },
    {
      icon: Users,
      title: "Individual scoring",
      value: "Disabled",
      text: "LUMEN does not create individual burnout, stress, or employee risk scores.",
    },
    {
      icon: Users,
      title: "Employee ranking",
      value: "Disabled",
      text: "No individual productivity leaderboard or employee risk ranking is generated.",
    },
    {
      icon: Database,
      title: "Team aggregation",
      value: "Enabled",
      text: "Analytics operate on aggregated team-level workplace conditions.",
    },
    {
      icon: Lock,
      title: "Minimum team size",
      value: `${threshold} members`,
      text: `Detailed telemetry is suppressed below the configured ${threshold}-member threshold.`,
    },
    {
      icon: Layers,
      title: "Current data mode",
      value: "Synthetic demo",
      text: "Current telemetry is synthetic and isolated from live enterprise communication systems.",
    },
  ];

  return (
    <section className="privacy-page">

      <header className="privacy-header">
        <div>
          <span className="eyebrow">GOVERNANCE & TRUST</span>
          <h1>Privacy Center</h1>
          <p>
            LUMEN analyzes workplace conditions at team level while keeping
            individual communication outside the analytical boundary.
          </p>
        </div>

        <div className="privacy-status">
          <span className={apiStatus === "live" ? "status-dot is-live" : "status-dot"} />
          {apiStatus === "live" ? "Privacy layer active" : "Connecting"}
        </div>
      </header>

      <div className="privacy-hero">
        <div className="privacy-hero-icon">
          <ShieldCheck size={25} />
        </div>

        <div className="privacy-hero-content">
          <span className="panel-kicker">ARCHITECTURAL BOUNDARY</span>
          <h2>Conditions, not people.</h2>
          <p>
            LUMEN transforms workplace telemetry into team-level intelligence.
            Raw communication content, individual burnout scores, and employee
            rankings remain outside the analytical model.
          </p>
        </div>

        <div className="privacy-threshold">
          <span>Minimum team size</span>
          <strong>{threshold} members</strong>
          <button type="button" onClick={() => navigate("/settings")}>
            Configure
            <SettingsIcon size={13} />
          </button>
        </div>
      </div>

      <section className="privacy-section">
        <div className="privacy-section-heading">
          <div>
            <span className="panel-kicker">DATA FLOW</span>
            <h2>Privacy transformation</h2>
          </div>

          <span className="privacy-badge">
            <ShieldCheck size={13} />
            Enforced
          </span>
        </div>

        <div className="privacy-flow">

          <div className="privacy-flow-step">
            <span className="flow-number">01</span>
            <div className="flow-icon">
              <Database size={18} />
            </div>
            <h3>Source</h3>
            <p>
              Workplace metadata and aggregate activity signals enter the
              ingestion boundary.
            </p>
            <strong>Raw messages excluded</strong>
          </div>

          <ArrowRight className="privacy-flow-arrow" size={20} />

          <div className="privacy-flow-step">
            <span className="flow-number">02</span>
            <div className="flow-icon">
              <Lock size={18} />
            </div>
            <h3>Privacy filter</h3>
            <p>
              Data is aggregated and small teams are protected before
              analytical processing.
            </p>
            <strong>{threshold}+ members required</strong>
          </div>

          <ArrowRight className="privacy-flow-arrow" size={20} />

          <div className="privacy-flow-step">
            <span className="flow-number">03</span>
            <div className="flow-icon">
              <ShieldCheck size={18} />
            </div>
            <h3>LUMEN intelligence</h3>
            <p>
              Signals, causal analysis, What-If simulations, and experiments
              operate on team-level conditions.
            </p>
            <strong>Team-level outputs</strong>
          </div>

        </div>
      </section>

      <section className="privacy-section">
        <div className="privacy-section-heading">
          <div>
            <span className="panel-kicker">CONTROL ENFORCEMENT</span>
            <h2>Privacy controls</h2>
          </div>
        </div>

        <div className="privacy-control-grid">
          {controls.map((control) => {
            const Icon = control.icon;

            return (
              <article className="privacy-control-card" key={control.title}>
                <div className="privacy-control-top">
                  <div className="privacy-control-icon">
                    <Icon size={17} />
                  </div>

                  <span className="privacy-control-state">
                    <Check size={11} />
                    {control.value}
                  </span>
                </div>

                <h3>{control.title}</h3>
                <p>{control.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="privacy-section privacy-simulator">
        <div className="privacy-section-heading">
          <div>
            <span className="panel-kicker">INTERACTIVE CONTROL</span>
            <h2>Small-team protection</h2>
            <p>
              Test what LUMEN does when a team falls below the privacy threshold.
            </p>
          </div>

          <span className="privacy-badge">Live simulator</span>
        </div>

        <div className="privacy-simulator-main">

          <div className="privacy-slider-area">
            <div className="privacy-slider-heading">
              <span>Simulated team size</span>
              <strong>{simulatedSize} members</strong>
            </div>

            <input
              type="range"
              min="2"
              max="20"
              value={simulatedSize}
              onChange={(event) =>
                setSimulatedSize(Number(event.target.value))
              }
              aria-label="Simulated team size"
            />

            <div className="privacy-slider-scale">
              <span>2</span>
              <span>Threshold: {threshold}</span>
              <span>20</span>
            </div>
          </div>

          <div className={suppressed ? "privacy-verdict is-blocked" : "privacy-verdict is-allowed"}>
            <div className="privacy-verdict-icon">
              {suppressed ? <Lock size={19} /> : <Check size={19} />}
            </div>

            <div>
              <strong>
                {suppressed
                  ? "Metrics suppressed"
                  : "Aggregated telemetry allowed"}
              </strong>

              <p>
                {suppressed
                  ? `The simulated team has ${simulatedSize} members, below the ${threshold}-member threshold. Detailed telemetry remains hidden.`
                  : `The simulated team has ${simulatedSize} members and satisfies the ${threshold}-member minimum for aggregated telemetry.`}
              </p>
            </div>
          </div>

        </div>
      </section>

      <div className="privacy-footer-note">
        <ShieldCheck size={17} />
        <div>
          <strong>Privacy is an architectural boundary.</strong>
          <span>
            {privacy
              ? "Current backend privacy configuration is loaded."
              : "Loading backend privacy configuration..."}
          </span>
        </div>
      </div>

    </section>
  );
}
