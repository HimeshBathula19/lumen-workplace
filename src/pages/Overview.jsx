import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  Clock3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useLumen } from "../context/LumenContext";
import { getOverview, getTeams, getTeam, getCausalAnalysis } from "../lib/api";

export default function Overview() {
  const navigate = useNavigate();
  const { openTeam, openSignal, setSelectedTeam, apiStatus } = useLumen();

  const [overview, setOverview] = useState(null);
  const [teams, setTeams] = useState([]);
  const [causal, setCausal] = useState(null);
  const [rangeDays, setRangeDays] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [overviewData, teamsData, atlasData, causalData] = await Promise.all([
          getOverview(rangeDays),
          getTeams(),
          getTeam("atlas"),
          getCausalAnalysis("atlas"),
        ]);

        if (!mounted) return;
        const workspaceTeams = teamsData.teams || [];
        
        const days = Number.parseInt(rangeDays, 10) || 30;

        setOverview({
          ...overviewData,
          timeseries: (atlasData?.timeseries || []).slice(-days),
        });
        setTeams(workspaceTeams);
        setCausal(causalData);
      } catch (error) {
        console.error("Overview data load error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [rangeDays]);

  const metrics = useMemo(
    () => [
      {
        label: "Communication",
        value: overview ? `${overview.communication}%` : "â€”",
        meta: "Workspace aggregate index",
      },
      {
        label: "Meeting load",
        value: overview ? `${overview.meetings}%` : "â€”",
        meta: "Synchronous schedule density",
      },
      {
        label: "Recovery",
        value: overview ? `${overview.recovery}%` : "â€”",
        meta: "Downtime capacity index",
      },
      {
        label: "Active signals",
        value: overview ? overview.activeSignals : "â€”",
        meta: "Requires human review",
      },
    ],
    [overview]
  );

  const leadTeams = teams.slice(0, 4);

  const handleAttentionClick = () => {
    setSelectedTeam("atlas");
    openTeam("atlas");
  };

  const handleCausalClick = () => {
    setSelectedTeam("atlas");
    navigate("/causal-lab");
  };

  return (
    <section className="overview-page" aria-label="LUMEN Overview Command Center">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">COMMAND CENTER</div>
          <h1>Overview</h1>
          <p>
            Understand what is changing across teams without exposing individual messages or employee scores.
          </p>
        </div>

        <div className="overview-status-group">
          <div className="overview-status">
            <span className={`status-dot ${apiStatus === "live" ? "is-live" : "is-offline"}`} />
            <span>{apiStatus === "live" ? "Backend connected" : "Backend offline"}</span>
          </div>
          <span className="overview-stream-tag">Synthetic demonstration stream</span>
          {overview?.dataUpdatedAt && (
            <span className="overview-last-update">Updated: {overview.last_update}</span>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <span className="metric-label">{metric.label}</span>
            <strong className="metric-value">{metric.value}</strong>
            <span className="metric-meta">{metric.meta}</span>
          </div>
        ))}
      </div>

      {/* Large Intelligence Area: Time-Series Trend */}
      <div className="overview-panel time-series-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">LONGITUDINAL TELEMETRY</span>
            <h2>Workspace Conditions Over Time</h2>
          </div>

          <div className="range-controls" role="group" aria-label="Select trend duration">
            {["7d", "14d", "30d"].map((r) => (
              <button
                key={r}
                type="button"
                className={`range-pill ${rangeDays === r ? "is-active" : ""}`}
                onClick={() => setRangeDays(r)}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-wrapper">
          {overview?.timeseries ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overview.timeseries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                  tick={{ fontSize: 11, fill: "#6e6e73" }}
                />
                <YAxis
                  domain={[20, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6e6e73" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="recovery"
                  name="Recovery"
                  stroke="#248a3d"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  name="Meeting Load"
                  stroke="#0071e3"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="workload"
                  name="Workload"
                  stroke="#b26a00"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="communication"
                  name="Communication"
                  stroke="#6e6e73"
                  strokeWidth={1.4}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-loading">Loading telemetry seriesâ€¦</div>
          )}
        </div>

        <div className="chart-legend-row">
          <span className="legend-chip">
            <span className="dot dot-recovery" /> Recovery
          </span>
          <span className="legend-chip">
            <span className="dot dot-meetings" /> Meeting Load
          </span>
          <span className="legend-chip">
            <span className="dot dot-workload" /> Workload (Confounder)
          </span>
          <span className="legend-chip">
            <span className="dot dot-communication" /> Communication
          </span>
        </div>
      </div>

      {/* Attention & Causal Intelligence Split */}
      <div className="overview-grid">
        {/* ATTENTION CARD */}
        <div className="overview-panel attention-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">ATTENTION</span>
              <h2>Team-level change detected</h2>
            </div>
            <Activity size={18} />
          </div>

          <div className="attention-card" onClick={handleAttentionClick} role="button" tabIndex={0}>
            <div className="attention-icon">
              <TrendingDown size={22} />
            </div>

            <div className="attention-content">
              <div className="attention-headline">
                <strong>Atlas</strong>
                <span className="signal-badge">Recovery disruption</span>
              </div>
              <p>
                Recovery capacity sits at <strong>58%</strong> (-14% vs rolling 30-day baseline),
                coinciding with elevated meeting concentration.
              </p>
              <div className="attention-meta">
                <span>18 members</span>
                <span>Â·</span>
                <span>Click to inspect team conditions</span>
              </div>
            </div>

            <div className="attention-value">
              <span>-14%</span>
              <small>Recovery</small>
            </div>
          </div>

          <div className="panel-footer">
            <Clock3 size={15} />
            <span>Signal stream updates automatically every 12 seconds</span>
          </div>
        </div>

        {/* CAUSAL INTELLIGENCE PREVIEW */}
        <div className="overview-panel causal-preview-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">CAUSAL INTELLIGENCE</span>
              <h2>Hypothesized Relationship</h2>
            </div>
            <button
              type="button"
              className="text-action-link"
              onClick={handleCausalClick}
            >
              Open Lab <ArrowRight size={13} />
            </button>
          </div>

          {causal ? (
            <div className="causal-summary">
              <div className="causal-flow-inline">
                <div className="flow-node treatment">
                  <small>Treatment</small>
                  <strong>{causal.treatment}</strong>
                </div>
                <span className="flow-arrow">â†’</span>
                <div className="flow-node outcome">
                  <small>Outcome</small>
                  <strong>{causal.outcome}</strong>
                </div>
              </div>

              <div className="causal-stats-grid">
                <div>
                  <small>Estimated Effect</small>
                  <strong className="stat-highlight">
                    {causal.estimatedEffect > 0 ? "+" : ""}
                    {causal.estimatedEffect} pts/hr
                  </strong>
                </div>
                <div>
                  <small>95% Bootstrap CI</small>
                  <strong>[{causal.confidenceInterval?.[0]}, {causal.confidenceInterval?.[1]}]</strong>
                </div>
                <div>
                  <small>Model Confidence</small>
                  <strong>{Math.round(causal.confidence * 100)}%</strong>
                </div>
              </div>

              <p className="causal-note">
                OLS regression adjustment isolating meeting density effect from background workload and sprint pressure.
              </p>
            </div>
          ) : (
            <div className="empty-state">Loading causal analysisâ€¦</div>
          )}
        </div>
      </div>

      {/* TEAM SNAPSHOT ROWS */}
      <div className="overview-panel teams-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">TEAM SNAPSHOT</span>
            <h2>Active Organizational Groups</h2>
          </div>
          <button
            type="button"
            className="text-action-link"
            onClick={() => navigate("/teams")}
          >
            View all 8 teams <ChevronRight size={14} />
          </button>
        </div>

        <div className="team-list">
          {leadTeams.map((team) => (
            <div
              className="team-row clickable"
              key={team.id}
              onClick={() => {
                setSelectedTeam(team.id);
                openTeam(team.id);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="team-identity">
                <div className="team-avatar">{team.name.charAt(0)}</div>
                <div>
                  <strong>{team.name}</strong>
                  <span>{team.department}</span>
                </div>
              </div>

              <div className="team-snapshot-metrics">
                <div>
                  <small>Recovery</small>
                  <strong>{team.is_suppressed ? "â€”" : `${team.recovery}%`}</strong>
                </div>
                <div>
                  <small>Workload</small>
                  <strong>{team.is_suppressed ? "â€”" : `${team.workload}%`}</strong>
                </div>
                <div>
                  <small>Headcount</small>
                  <span>{team.members}</span>
                </div>
              </div>

              <div className="team-signal">
                <span>{team.signal}</span>
              </div>

              <div className={`severity severity-${team.severity.toLowerCase()}`}>
                {team.severity}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Privacy Boundary Strip */}
      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <strong>Privacy Boundary Active</strong>
          <p>
            LUMEN operates on aggregated team-level signals. Raw message content, individual burnout scores,
            and employee rankings are excluded by architecture.
          </p>
        </div>
      </div>
    </section>
  );
}


