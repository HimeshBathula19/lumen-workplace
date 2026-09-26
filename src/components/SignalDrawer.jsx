import React from "react";
import { X, ArrowRight, ShieldCheck, Activity, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLumen } from "../context/LumenContext";

export default function SignalDrawer() {
  const { selectedSignal, activeDrawer, closeDrawer, setSelectedTeam } = useLumen();
  const navigate = useNavigate();

  const isOpen = activeDrawer === "signal" && Boolean(selectedSignal);

  if (!isOpen || !selectedSignal) return null;

  const isPositive = selectedSignal.magnitude > 0;

  const handleTestInWhatIf = () => {
    if (selectedSignal.team) {
      setSelectedTeam(selectedSignal.team.toLowerCase());
    }
    closeDrawer();
    navigate("/what-if");
  };

  const handleOpenCausalLab = () => {
    if (selectedSignal.team) {
      setSelectedTeam(selectedSignal.team.toLowerCase());
    }
    closeDrawer();
    navigate("/causal-lab");
  };

  return (
    <div className="drawer-overlay" onClick={closeDrawer}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Signal detail"
      >
        <div className="drawer-header">
          <div>
            <span className="drawer-eyebrow">SIGNAL INTELLIGENCE</span>
            <h2>{selectedSignal.id}</h2>
            <p>
              {selectedSignal.team} · {selectedSignal.pattern}
            </p>
          </div>
          <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Signal Hero Card */}
          <div className="signal-detail-hero">
            <div className="signal-detail-badge">
              <span className={`severity severity-${selectedSignal.severity.toLowerCase()}`}>
                {selectedSignal.severity}
              </span>
              <span className="signal-detail-time">{selectedSignal.detected}</span>
            </div>

            <div className="signal-detail-metric">
              <div>
                <small>Observed Change</small>
                <strong>
                  {selectedSignal.metric}{" "}
                  <span className={isPositive ? "delta-pos" : "delta-neg"}>
                    {isPositive ? "+" : ""}
                    {selectedSignal.magnitude}%
                  </span>
                </strong>
              </div>
              <div className="signal-persistence">
                <small>Persistence</small>
                <span>{selectedSignal.persistence}</span>
              </div>
            </div>
          </div>

          {/* Current Evidence */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <Activity size={15} />
              <span>Current Evidence</span>
            </div>
            <p className="drawer-text-block">{selectedSignal.current_evidence}</p>
          </div>

          {/* Causal Hypothesis */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <Sparkles size={15} />
              <span>Causal Hypothesis</span>
            </div>
            <p className="drawer-text-block">{selectedSignal.hypothesis}</p>
          </div>

          {/* Potential Contributors */}
          {selectedSignal.potential_contributors && selectedSignal.potential_contributors.length > 0 && (
            <div className="drawer-section">
              <div className="drawer-section-title">
                <CheckCircle2 size={15} />
                <span>Potential Systemic Contributors</span>
              </div>
              <ul className="drawer-contributors-list">
                {selectedSignal.potential_contributors.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Analytical Step */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <span>Next Analytical Step</span>
            </div>
            <p className="drawer-text-block">{selectedSignal.next_analytical_step}</p>
          </div>

          {/* Action CTAs */}
          <div className="drawer-actions-row">
            <button type="button" className="secondary-action" onClick={handleOpenCausalLab}>
              Open in Causal Lab
              <ArrowRight size={14} />
            </button>
            <button type="button" className="primary-action" onClick={handleTestInWhatIf}>
              <Sparkles size={14} />
              Test in What-If
            </button>
          </div>

          {/* Responsible AI Disclaimer & Privacy */}
          <div className="drawer-privacy-footer">
            <ShieldCheck size={16} />
            <div>
              <strong>Responsible Signal Assessment</strong>
              <p>
                This is a team-level signal that may warrant further analysis. It is not an individual burnout score,
                medical diagnosis, or employee performance evaluation.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
