import React, { useEffect, useState } from "react";
import { X, Users, Activity, ArrowRight, ShieldCheck, Clock3, AlertCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLumen } from "../context/LumenContext";
import { getTeamDetail } from "../lib/api";

export default function TeamDrawer() {
  const { selectedTeam, activeDrawer, closeDrawer, setSelectedTeam } = useLumen();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isOpen = activeDrawer === "team" && Boolean(selectedTeam);

  useEffect(() => {
    if (!isOpen || !selectedTeam) return;

    let mounted = true;
    setLoading(true);

    getTeamDetail(selectedTeam)
      .then((data) => {
        if (mounted) setTeamData(data);
      })
      .catch((err) => {
        console.error("Error fetching team detail:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, selectedTeam]);

  if (!isOpen) return null;

  const team = teamData?.team;
  const isSuppressed = team?.is_suppressed;

  const handleGoToWhatIf = () => {
    setSelectedTeam(selectedTeam);
    closeDrawer();
    navigate("/what-if");
  };

  const handleGoToCausalLab = () => {
    setSelectedTeam(selectedTeam);
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
        aria-label="Team detail"
      >
        <div className="drawer-header">
          <div>
            <span className="drawer-eyebrow">TEAM PROFILE</span>
            <h2>{team?.name || selectedTeam.toUpperCase()}</h2>
            <p>{team?.department || "Workspace team"}</p>
          </div>
          <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {loading ? (
            <div className="drawer-loading">Loading team intelligence…</div>
          ) : isSuppressed ? (
            <div className="drawer-suppressed">
              <div className="suppression-banner">
                <AlertCircle size={22} className="suppression-icon" />
                <div>
                  <strong>Metrics Suppressed for Privacy</strong>
                  <p>{team?.suppression_reason}</p>
                </div>
              </div>
              <div className="privacy-card">
                <ShieldCheck size={18} />
                <span>
                  LUMEN enforces a strict minimum group threshold. To protect individual employees from
                  re-identification, analytics are disabled for teams with fewer than the configured headcount.
                </span>
              </div>
            </div>
          ) : team ? (
            <>
              {/* Metrics Grid */}
              <div className="drawer-metrics-grid">
                <div className="drawer-metric-item">
                  <span className="drawer-metric-label">Headcount</span>
                  <strong className="drawer-metric-value">{team.members}</strong>
                  <small>Aggregated only</small>
                </div>
                <div className="drawer-metric-item">
                  <span className="drawer-metric-label">Recovery</span>
                  <strong className="drawer-metric-value">{team.recovery}%</strong>
                  <small>Downtime index</small>
                </div>
                <div className="drawer-metric-item">
                  <span className="drawer-metric-label">Meetings</span>
                  <strong className="drawer-metric-value">{team.meetings}%</strong>
                  <small>Schedule density</small>
                </div>
                <div className="drawer-metric-item">
                  <span className="drawer-metric-label">Workload</span>
                  <strong className="drawer-metric-value">{team.workload}%</strong>
                  <small>Sprint intensity</small>
                </div>
              </div>

              {/* Attention / Signal Card */}
              {team.signal !== "Stable" && (
                <div className="drawer-signal-card">
                  <div className="drawer-signal-header">
                    <span className="signal-id">{team.severity} signal</span>
                    <strong>{team.signal}</strong>
                  </div>
                  <p>{teamData?.causal_focus?.hypothesis}</p>
                  <div className="drawer-actions-row">
                    <button type="button" className="secondary-action small" onClick={handleGoToCausalLab}>
                      Causal Lab
                      <ArrowRight size={13} />
                    </button>
                    <button type="button" className="primary-action small" onClick={handleGoToWhatIf}>
                      <Sparkles size={13} />
                      Simulate What-If
                    </button>
                  </div>
                </div>
              )}

              {/* 14-Day Trend */}
              {teamData?.time_series && teamData.time_series.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <Clock3 size={15} />
                    <span>14-Day Recovery Trend</span>
                  </div>
                  <div className="drawer-trend-bars">
                    {teamData.time_series.map((pt, i) => (
                      <div key={i} className="trend-bar-col" title={`${pt.date}: Recovery ${pt.recovery}%`}>
                        <div
                          className="trend-bar-fill"
                          style={{
                            height: `${Math.max(15, pt.recovery * 0.9)}%`,
                            backgroundColor: pt.recovery < 60 ? "var(--warning)" : "var(--accent)",
                          }}
                        />
                        <span className="trend-bar-date">{pt.date.split(" ")[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Experiments */}
              {teamData?.experiments && teamData.experiments.length > 0 && (
                <div className="drawer-section">
                  <div className="drawer-section-title">
                    <Activity size={15} />
                    <span>Active Controlled Trials ({teamData.experiments.length})</span>
                  </div>
                  {teamData.experiments.map((exp) => (
                    <div key={exp.id} className="drawer-exp-item">
                      <div className="exp-item-top">
                        <span className="signal-id">{exp.id}</span>
                        <span className={`experiment-status experiment-status-${exp.status.toLowerCase()}`}>
                          {exp.status}
                        </span>
                      </div>
                      <strong>{exp.name}</strong>
                      <p>{exp.intervention}</p>
                      <div className="exp-progress-wrap">
                        <div className="exp-progress-fill" style={{ width: `${exp.progress}%` }} />
                        <span>{exp.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Privacy Footer */}
              <div className="drawer-privacy-footer">
                <ShieldCheck size={16} />
                <span>Team-level aggregate metadata. No employee messages or individual rankings are stored.</span>
              </div>
            </>
          ) : (
            <div className="empty-state">No team details available.</div>
          )}
        </div>
      </aside>
    </div>
  );
}
