import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
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

import {
  getOverview,
  getTeams,
  getTeam,
  getCausalAnalysis,
} from "../lib/api";

export default function Overview() {
  const navigate = useNavigate();

  const {
    openTeam,
    setSelectedTeam,
    apiStatus,
  } = useLumen();

  const [overview, setOverview] = useState(null);
  const [teams, setTeams] = useState([]);
  const [atlas, setAtlas] = useState(null);
  const [causal, setCausal] = useState(null);

  const [rangeDays, setRangeDays] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [
          overviewData,
          teamsData,
          atlasData,
          causalData,
        ] = await Promise.all([
          getOverview(rangeDays),
          getTeams(),
          getTeam("atlas"),
          getCausalAnalysis("atlas"),
        ]);

        if (!mounted) return;

        setOverview(overviewData);
        setTeams(teamsData?.teams || []);
        setAtlas(atlasData);
        setCausal(causalData);
      } catch (error) {
        console.error("Overview data load error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    const interval = setInterval(loadData, 12000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [rangeDays]);

  /*
   * Backend compatibility layer.
   * Supports both the current API names and the previous names.
   */
  const activeSignals =
    overview?.activeSignals ??
    overview?.active_signals_count ??
    overview?.activeSignalsCount ??
    4;

  const communication =
    overview?.communication ??
    atlas?.communication ??
    72;

  const meetings =
    overview?.meetings ??
    atlas?.meetings ??
    64;

  const recovery =
    overview?.recovery ??
    atlas?.recovery ??
    58;

  const telemetry =
    atlas?.timeseries ??
    atlas?.time_series ??
    overview?.timeseries ??
    overview?.time_series ??
    [];

  const chartData = useMemo(() => {
    if (!Array.isArray(telemetry)) return [];

    return telemetry.map((item) => ({
      date:
        item.date ??
        item.day ??
        item.timestamp ??
        "",

      recovery: Number(item.recovery ?? 0),

      meetings: Number(
        item.meetings ??
        item.meeting_hours ??
        item.meeting_load ??
        0
      ),

      workload: Number(item.workload ?? 0),

      communication: Number(item.communication ?? 0),
    }));
  }, [telemetry]);

  const causalEffect =
    causal?.estimatedEffect ??
    causal?.estimated_effect ??
    -1.3756;

  const causalCI =
    causal?.confidenceInterval ??
    causal?.confidence_interval ??
    [
      causal?.ci_lower ?? -2.2707,
      causal?.ci_upper ?? -0.4805,
    ];

  const causalConfidence =
    causal?.confidence ??
    causal?.modelConfidence ??
    0.95;

  const leadTeams = teams.slice(0, 4);

  const metrics = [
    {
      label: "Communication",
      value: `${communication}%`,
      meta: "Workspace aggregate index",
    },
    {
      label: "Meeting load",
      value: `${meetings}%`,
      meta: "Synchronous schedule density",
    },
    {
      label: "Recovery",
      value: `${recovery}%`,
      meta: "Downtime capacity index",
    },
    {
      label: "Active signals",
      value: activeSignals,
      meta: "Requires human review",
    },
  ];

  function handleAttentionClick() {
    setSelectedTeam("atlas");
    openTeam("atlas");
  }

  function handleCausalClick() {
    setSelectedTeam("atlas");
    navigate("/causal-lab");
  }

  return (
    <section
      className="overview-page"
      aria-label="LUMEN Overview Command Center"
    >

      {/* HEADER */}
      <div className="page-header">

        <div>
          <div className="eyebrow">
            COMMAND CENTER
          </div>

          <h1>
            Overview
          </h1>

          <p>
            Understand what is changing across teams without exposing
            individual messages or employee scores.
          </p>
        </div>

        <div className="overview-status-group">

          <div className="overview-status">
            <span
              className={`status-dot ${
                apiStatus === "live"
                  ? "is-live"
                  : "is-offline"
              }`}
            />

            <span>
              {apiStatus === "live"
                ? "Backend connected"
                : "Backend offline"}
            </span>
          </div>

          <span className="overview-stream-tag">
            Synthetic demonstration stream
          </span>

          {overview?.dataUpdatedAt && (
            <span className="overview-last-update">
              Updated: {overview.dataUpdatedAt}
            </span>
          )}

        </div>
      </div>


      {/* KPI CARDS */}

      <div className="metric-grid">

        {metrics.map((metric) => (
          <div
            className="metric-card"
            key={metric.label}
          >
            <span className="metric-label">
              {metric.label}
            </span>

            <strong className="metric-value">
              {metric.value}
            </strong>

            <span className="metric-meta">
              {metric.meta}
            </span>
          </div>
        ))}

      </div>


      {/* MAIN GRAPH */}

      <div className="overview-panel time-series-panel">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              LONGITUDINAL TELEMETRY
            </span>

            <h2>
              Workspace Conditions Over Time
            </h2>
          </div>

          <div
            className="range-controls"
            role="group"
            aria-label="Select trend duration"
          >

            {["7d", "14d", "30d"].map((range) => (
              <button
                key={range}
                type="button"
                className={`range-pill ${
                  rangeDays === range
                    ? "is-active"
                    : ""
                }`}
                onClick={() => setRangeDays(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}

          </div>

        </div>


        <div className="chart-wrapper">

          {loading ? (

            <div className="chart-loading">
              Loading telemetry...
            </div>

          ) : chartData.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{
                    stroke: "rgba(0,0,0,0.08)",
                  }}
                  tick={{
                    fontSize: 11,
                    fill: "#6e6e73",
                  }}
                />

                <YAxis
                  domain={[20, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: "#6e6e73",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "rgba(255,255,255,0.96)",
                    border:
                      "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "10px",
                    boxShadow:
                      "0 8px 30px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="recovery"
                  name="Recovery"
                  stroke="#248a3d"
                  strokeWidth={2.5}
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
                  strokeWidth={1.5}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          ) : (

            <div className="chart-loading">
              No telemetry available.
            </div>

          )}

        </div>


        {/* GRAPH LEGEND */}

        <div className="chart-legend-row">

          <span className="legend-chip">
            <span className="dot dot-recovery" />
            Recovery
          </span>

          <span className="legend-chip">
            <span className="dot dot-meetings" />
            Meeting Load
          </span>

          <span className="legend-chip">
            <span className="dot dot-workload" />
            Workload
          </span>

          <span className="legend-chip">
            <span className="dot dot-communication" />
            Communication
          </span>

        </div>

      </div>


      {/* ATTENTION + CAUSAL */}

      <div className="overview-grid">


        {/* ATTENTION */}

        <div className="overview-panel attention-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                ATTENTION
              </span>

              <h2>
                Team-level change detected
              </h2>
            </div>

            <Activity size={18} />

          </div>


          <div
            className="attention-card"
            onClick={handleAttentionClick}
            role="button"
            tabIndex={0}
          >

            <div className="attention-icon">
              <TrendingDown size={22} />
            </div>

            <div className="attention-content">

              <div className="attention-headline">

                <strong>
                  Atlas
                </strong>

                <span className="signal-badge">
                  Recovery disruption
                </span>

              </div>

              <p>
                Recovery capacity sits at{" "}
                <strong>58%</strong>{" "}
                (-14% vs rolling 30-day baseline),
                coinciding with elevated meeting
                concentration.
              </p>

              <div className="attention-meta">

                <span>
                  18 members
                </span>

                <span>
                  ·
                </span>

                <span>
                  Click to inspect team conditions
                </span>

              </div>

            </div>


            <div className="attention-value">

              <span>
                -14%
              </span>

              <small>
                Recovery
              </small>

            </div>

          </div>


          <div className="panel-footer">

            <Clock3 size={15} />

            <span>
              Signal stream updates automatically
              every 12 seconds
            </span>

          </div>

        </div>


        {/* CAUSAL */}

        <div className="overview-panel causal-preview-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                CAUSAL INTELLIGENCE
              </span>

              <h2>
                Hypothesized Relationship
              </h2>

            </div>

            <button
              type="button"
              className="text-action-link"
              onClick={handleCausalClick}
            >
              Open Lab
              <ArrowRight size={13} />
            </button>

          </div>


          {causal ? (

            <div className="causal-summary">

              <div className="causal-flow-inline">

                <div className="flow-node treatment">

                  <small>
                    Treatment
                  </small>

                  <strong>
                    {causal.treatment ??
                      "Meeting load"}
                  </strong>

                </div>

                <span className="flow-arrow">
                  →
                </span>

                <div className="flow-node outcome">

                  <small>
                    Outcome
                  </small>

                  <strong>
                    {causal.outcome ??
                      "Recovery"}
                  </strong>

                </div>

              </div>


              <div className="causal-stats-grid">

                <div>

                  <small>
                    Estimated Effect
                  </small>

                  <strong className="stat-highlight">
                    {Number(causalEffect) > 0
                      ? "+"
                      : ""}
                    {Number(causalEffect).toFixed(2)}
                    {" "}pts/hr
                  </strong>

                </div>


                <div>

                  <small>
                    95% Confidence Interval
                  </small>

                  <strong>
                    [
                    {Number(causalCI[0]).toFixed(2)}
                    ,{" "}
                    {Number(causalCI[1]).toFixed(2)}
                    ]
                  </strong>

                </div>


                <div>

                  <small>
                    Model Confidence
                  </small>

                  <strong>
                    {Math.round(
                      Number(causalConfidence) <= 1
                        ? Number(causalConfidence) * 100
                        : Number(causalConfidence)
                    )}
                    %
                  </strong>

                </div>

              </div>


              <p className="causal-note">
                Synthetic regression adjustment using
                workload and project pressure as
                adjustment variables.
              </p>

            </div>

          ) : (

            <div className="empty-state">
              Loading causal analysis...
            </div>

          )}

        </div>

      </div>


      {/* TEAM SNAPSHOT */}

      <div className="overview-panel teams-panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              TEAM SNAPSHOT
            </span>

            <h2>
              Active Organizational Groups
            </h2>

          </div>

          <button
            type="button"
            className="text-action-link"
            onClick={() => navigate("/teams")}
          >
            View all {teams.length || 8} teams
            <ChevronRight size={14} />
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

                <div className="team-avatar">
                  {team.name?.charAt(0)}
                </div>

                <div>

                  <strong>
                    {team.name}
                  </strong>

                  <span>
                    {team.department}
                  </span>

                </div>

              </div>


              <div className="team-snapshot-metrics">

                <div>

                  <small>
                    Recovery
                  </small>

                  <strong>
                    {team.is_suppressed
                      ? "—"
                      : `${team.recovery}%`}
                  </strong>

                </div>


                <div>

                  <small>
                    Workload
                  </small>

                  <strong>
                    {team.is_suppressed
                      ? "—"
                      : `${team.workload}%`}
                  </strong>

                </div>


                <div>

                  <small>
                    Headcount
                  </small>

                  <span>
                    {team.members}
                  </span>

                </div>

              </div>


              <div className="team-signal">
                <span>
                  {team.signal}
                </span>
              </div>


              <div
                className={`severity severity-${String(
                  team.severity || "watch"
                ).toLowerCase()}`}
              >
                {team.severity}
              </div>

            </div>

          ))}

        </div>

      </div>


      {/* PRIVACY */}

      <div className="privacy-strip">

        <div className="privacy-strip-icon">
          <ShieldCheck size={20} />
        </div>

        <div>

          <strong>
            Privacy Boundary Active
          </strong>

          <p>
            LUMEN operates on aggregated team-level
            signals. Raw message content, individual
            burnout scores, and employee rankings are
            excluded by architecture.
          </p>

        </div>

      </div>

    </section>
  );
}