import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Filter,
  Search,
  ArrowUpDown,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { useLumen } from "../context/LumenContext";
import { getSignals } from "../lib/api";

export default function Signals() {
  const { openSignal, setSelectedTeam, apiStatus } = useLumen();
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSignals()
      .then((data) => {
        if (mounted) setSignals(data.signals || []);
      })
      .catch((err) => console.error("Failed to load signals:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSignals = useMemo(() => {
    let list = [...signals];
    const q = search.toLowerCase().trim();

    if (q) {
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.team.toLowerCase().includes(q) ||
          s.type.toLowerCase().includes(q) ||
          s.metric.toLowerCase().includes(q)
      );
    }

    if (filter !== "All") {
      list = list.filter((s) => s.severity === filter);
    }

    list.sort((a, b) => {
      if (sortBy === "magnitude") {
        return Math.abs(b.magnitude) - Math.abs(a.magnitude);
      }
      if (sortBy === "team") {
        return a.team.localeCompare(b.team);
      }
      return a.id.localeCompare(b.id);
    });

    return list;
  }, [signals, filter, search, sortBy]);

  const moderateCount = signals.filter((s) => s.severity === "Moderate").length;
  const watchCount = signals.filter((s) => s.severity === "Watch").length;

  const handleSignalClick = (signal) => {
    if (signal.team) {
      setSelectedTeam(signal.team_id || signal.team.toLowerCase());
    }
    openSignal(signal);
  };

  return (
    <section className="signals-page" aria-label="Signal Intelligence Registry">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">INTELLIGENCE</div>
          <h1>Signals</h1>
          <p>
            Detect meaningful team-level condition shifts without exposing individual communication content.
          </p>
        </div>

        <div className="overview-status">
          <span className={`status-dot ${apiStatus === "live" ? "is-live" : "is-offline"}`} />
          <span>{apiStatus === "live" ? "Signal monitor live" : "Connecting"}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Active Signals</span>
          <strong className="metric-value">{signals.length}</strong>
          <span className="metric-meta">Workspace total</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Moderate Severity</span>
          <strong className="metric-value">{moderateCount}</strong>
          <span className="metric-meta">Warrants causal investigation</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Watch Severity</span>
          <strong className="metric-value">{watchCount}</strong>
          <span className="metric-meta">Track baseline stability</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Analytical Unit</span>
          <strong className="metric-value">Team-level</strong>
          <span className="metric-meta">Zero individual risk scoring</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="overview-panel">
        <div className="table-controls-bar">
          <div className="teams-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by signal ID, team, or pattern..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search signals"
            />
          </div>

          <div className="table-filters-group">
            <div className="filter-select-wrap">
              <Filter size={14} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter signals by severity"
              >
                <option value="All">All Severities</option>
                <option value="Moderate">Moderate</option>
                <option value="Watch">Watch</option>
                <option value="Stable">Stable</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort signals"
              >
                <option value="id">Sort by Signal ID</option>
                <option value="magnitude">Sort by Magnitude</option>
                <option value="team">Sort by Team</option>
              </select>
            </div>
          </div>
        </div>

        {/* Signals List */}
        <div className="signal-list">
          {filteredSignals.map((signal) => {
            const isPositive = Number(signal.value) > 0;

            return (
              <article
                className="signal-row clickable"
                key={signal.id}
                onClick={() => handleSignalClick(signal)}
                role="button"
                tabIndex={0}
              >
                <div className="signal-icon">
                  {isPositive ? <ArrowUpRight size={19} /> : <ArrowDownRight size={19} />}
                </div>

                <div className="signal-main">
                  <div className="signal-heading">
                    <span className="signal-id">{signal.id}</span>
                    <span className={`severity severity-${signal.severity.toLowerCase()}`}>
                      {signal.severity}
                    </span>
                    <span className="signal-team-chip">{signal.team}</span>
                  </div>

                  <h3>{signal.pattern}</h3>

                  <p>
                    {signal.metric} changed by{" "}
                    <strong>
                      {isPositive ? "+" : ""}
                      {Number(signal.value || 0)}%
                    </strong>{" "}
                    | Team-level aggregated signal
                  </p>
                </div>

                <div className="signal-right-meta">
                  <span className="signal-detected-time">{signal.detected}</span>
                  <div className="signal-arrow-indicator">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </article>
            );
          })}

          {filteredSignals.length === 0 && (
            <div className="empty-state">No workplace signals match your search or filter.</div>
          )}
        </div>

        <div className="panel-footer">
          <Clock3 size={15} />
          <span>Signals are computed from aggregated team telemetry over a rolling 14-day baseline.</span>
        </div>
      </div>

      {/* Privacy strip */}
      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck size={18} />
        </div>
        <div>
          <strong>Responsible Signal Architecture</strong>
          <p>
            Signals flag team-level communication and scheduling patterns that may warrant further analysis.
            LUMEN never scores, diagnoses, or ranks individual employees.
          </p>
        </div>
      </div>
    </section>
  );
}

