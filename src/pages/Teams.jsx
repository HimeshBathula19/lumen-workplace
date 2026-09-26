import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Users,
  Activity,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  Lock,
  ChevronRight,
} from "lucide-react";

import { useLumen } from "../context/LumenContext";
import { getTeams } from "../lib/api";

export default function Teams() {
  const {
    openTeam,
    setSelectedTeam,
    apiStatus,
  } = useLumen();

  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("name");

  const [sortAsc, setSortAsc] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTeams() {
      try {
        setLoading(true);
        setError("");

        const data = await getTeams();

        if (!mounted) return;

        const rawTeams = Array.isArray(data)
          ? data
          : data?.teams ||
            data?.data?.teams ||
            data?.items ||
            [];

        const normalizedTeams =
          rawTeams.map((team) => ({
            ...team,

            id:
              team.id ??
              team.team_id,

            name:
              team.name ??
              team.team_name ??
              "Unnamed Team",

            department:
              team.department ??
              "Organization",

            members: Number(
              team.members ??
              team.member_count ??
              0
            ),

            communication: Number(
              team.communication ?? 0
            ),

            meetings: Number(
              team.meetings ?? 0
            ),

            recovery: Number(
              team.recovery ?? 0
            ),

            workload: Number(
              team.workload ?? 0
            ),

            after_hours: Number(
              team.after_hours ??
              team.afterHours ??
              0
            ),

            signal:
              team.signal ??
              "No active signal",

            severity:
              team.severity ??
              "Stable",

            is_suppressed:
              Boolean(
                team.is_suppressed ??
                team.isSuppressed ??
                false
              ),
          }));

        setTeams(normalizedTeams);
      } catch (err) {
        console.error(
          "Teams API error:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load teams."
          );

          setTeams([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTeams();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTeams = useMemo(() => {
    let list = [...teams];

    const query = search
      .toLowerCase()
      .trim();

    if (query) {
      list = list.filter((team) => {
        const name =
          String(team.name)
            .toLowerCase();

        const department =
          String(team.department)
            .toLowerCase();

        const signal =
          String(team.signal)
            .toLowerCase();

        return (
          name.includes(query) ||
          department.includes(query) ||
          signal.includes(query)
        );
      });
    }

    if (
      severityFilter !== "All"
    ) {
      list = list.filter(
        (team) =>
          team.severity ===
          severityFilter
      );
    }

    list.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (
        typeof valueA === "string" ||
        typeof valueB === "string"
      ) {
        return sortAsc
          ? String(valueA).localeCompare(
              String(valueB)
            )
          : String(valueB).localeCompare(
              String(valueA)
            );
      }

      const numberA =
        Number(valueA) || 0;

      const numberB =
        Number(valueB) || 0;

      return sortAsc
        ? numberA - numberB
        : numberB - numberA;
    });

    return list;
  }, [
    teams,
    search,
    severityFilter,
    sortBy,
    sortAsc,
  ]);

  const totalMembers =
    teams.reduce(
      (sum, team) =>
        sum +
        (Number(team.members) || 0),
      0
    );

  const activeSignals =
    teams.filter(
      (team) =>
        team.severity !==
          "Stable" &&
        !team.is_suppressed
    ).length;

  const suppressedCount =
    teams.filter(
      (team) =>
        team.is_suppressed
    ).length;

  function handleTeamClick(
    teamId
  ) {
    setSelectedTeam(teamId);
    openTeam(teamId);
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setSortAsc(
        (current) => !current
      );
      return;
    }

    setSortBy(field);
    setSortAsc(true);
  }

  return (
    <section
      className="teams-page"
      aria-label="Teams Intelligence Directory"
    >
      <div className="page-header">
        <div>
          <div className="eyebrow">
            WORKSPACE
          </div>

          <h1>Teams</h1>

          <p>
            Investigate team-level
            conditions across
            communication rhythms,
            meeting load, workload,
            recovery, and
            after-hours activity.
          </p>
        </div>

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
              : "Connecting"}
          </span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">
            Monitored Teams
          </span>

          <strong className="metric-value">
            {loading
              ? "—"
              : teams.length}
          </strong>

          <span className="metric-meta">
            Aggregated units
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Total Headcount
          </span>

          <strong className="metric-value">
            {loading
              ? "—"
              : totalMembers}
          </strong>

          <span className="metric-meta">
            Zero individual
            tracking
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Active Signals
          </span>

          <strong className="metric-value">
            {loading
              ? "—"
              : activeSignals}
          </strong>

          <span className="metric-meta">
            Warrants review
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Privacy State
          </span>

          <strong className="metric-value">
            {suppressedCount > 0
              ? `${suppressedCount} Suppressed`
              : "Protected"}
          </strong>

          <span className="metric-meta">
            Server-side threshold
          </span>
        </div>
      </div>

      <div className="overview-panel">
        <div className="table-controls-bar">
          <div className="teams-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search team, department, or signal..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label="Search teams"
            />
          </div>

          <div className="table-filters-group">
            <div className="filter-select-wrap">
              <Filter size={14} />

              <select
                value={
                  severityFilter
                }
                onChange={(event) =>
                  setSeverityFilter(
                    event.target.value
                  )
                }
              >
                <option value="All">
                  All Severities
                </option>

                <option value="Moderate">
                  Moderate
                </option>

                <option value="Watch">
                  Watch
                </option>

                <option value="Stable">
                  Stable
                </option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <ArrowUpDown size={14} />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="name">
                  Sort by Name
                </option>

                <option value="members">
                  Sort by Members
                </option>

                <option value="recovery">
                  Sort by Recovery
                </option>

                <option value="meetings">
                  Sort by Meeting Load
                </option>

                <option value="workload">
                  Sort by Workload
                </option>
              </select>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() =>
                toggleSort(sortBy)
              }
              title="Reverse sort"
            >
              <ArrowUpDown
                size={15}
              />
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              margin: "0 0 16px",
              padding: "14px 16px",
              borderRadius: "12px",
              border:
                "1px solid #fecdca",
              background: "#fff5f5",
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            Loading teams...
          </div>
        ) : filteredTeams.length ===
          0 ? (
          <div className="empty-state">
            <strong>
              No teams found
            </strong>

            <p>
              Try changing your
              search or filters.
            </p>
          </div>
        ) : (
          <div className="team-list">
            {filteredTeams.map(
              (team) => (
                <div
                  className="team-row clickable"
                  key={team.id}
                  onClick={() =>
                    handleTeamClick(
                      team.id
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(
                    event
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      handleTeamClick(
                        team.id
                      );
                    }
                  }}
                >
                  <div className="team-identity">
                    <div className="team-avatar">
                      {String(
                        team.name
                      ).charAt(0)}
                    </div>

                    <div>
                      <strong>
                        {team.name}
                      </strong>

                      <span>
                        {
                          team.department
                        }
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
                      team.severity
                    ).toLowerCase()}`}
                  >
                    {
                      team.severity
                    }
                  </div>

                  <ChevronRight
                    size={16}
                    className="team-row-arrow"
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck
            size={20}
          />
        </div>

        <div>
          <strong>
            Privacy Boundary Active
          </strong>

          <p>
            LUMEN operates on
            aggregated team-level
            signals. Raw message
            content, individual
            burnout scores, and
            employee rankings are
            excluded by architecture.
          </p>
        </div>
      </div>
    </section>
  );
}