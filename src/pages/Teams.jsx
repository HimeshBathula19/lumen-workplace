import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  Lock,
  ChevronRight,
  Users,
  Activity,
  Clock3,
} from "lucide-react";
import { useLumen } from "../context/LumenContext";

export default function Teams() {
  const {
    teams = [],
    loading,
    error,
  } = useLumen();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = teams.filter((team) => {
      const matchesSearch =
        !query ||
        team.name?.toLowerCase().includes(query) ||
        team.department?.toLowerCase().includes(query) ||
        team.signal?.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "All" ||
        team.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });

    return [...filtered].sort((a, b) => {
      const aValue = a?.[sortBy];
      const bValue = b?.[sortBy];

      if (typeof aValue === "string") {
        return sortAsc
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortAsc
        ? Number(aValue ?? 0) - Number(bValue ?? 0)
        : Number(bValue ?? 0) - Number(aValue ?? 0);
    });
  }, [teams, search, severityFilter, sortBy, sortAsc]);

  const totalMembers = teams.reduce(
    (sum, team) => sum + Number(team.members || 0),
    0
  );

  const activeSignals = teams.filter(
    (team) =>
      team.severity &&
      team.severity !== "Stable" &&
      !team.is_suppressed
  ).length;

  const suppressedCount = teams.filter(
    (team) => team.is_suppressed
  ).length;

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortAsc((current) => !current);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const connectionLabel = loading
    ? "Syncing workspace"
    : error
      ? "Partial connection"
      : "Live";

  return (
    <section className="teams-page" aria-label="Teams Intelligence Directory">
      <div className="page-header">
        <div>
          <div className="eyebrow">WORKSPACE</div>
          <h1>Teams</h1>
          <p>
            Investigate team-level conditions across communication,
            meetings, workload, recovery, and after-hours activity.
          </p>
        </div>

        <div className="overview-status">
          <span
            className={`status-dot ${
              loading
                ? ""
                : error
                  ? "is-offline"
                  : "is-live"
            }`}
          />
          <span>{connectionLabel}</span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Monitored Teams</span>
          <strong className="metric-value">
            {loading ? "…" : teams.length}
          </strong>
          <span className="metric-meta">Aggregated organizational units</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Headcount</span>
          <strong className="metric-value">
            {loading ? "…" : totalMembers}
          </strong>
          <span className="metric-meta">No individual scoring</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Active Signals</span>
          <strong className="metric-value">
            {loading ? "…" : activeSignals}
          </strong>
          <span className="metric-meta">Requires human review</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Privacy State</span>
          <strong className="metric-value">
            {suppressedCount > 0
              ? `${suppressedCount} Suppressed`
              : "Protected"}
          </strong>
          <span className="metric-meta">
            Server-enforced aggregation boundary
          </span>
        </div>
      </div>

      <div className="overview-panel teams-directory">
        <div className="table-controls-bar">
          <div className="teams-search">
            <Search size={16} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teams, departments, or signals"
              aria-label="Search teams"
            />
          </div>

          <div className="table-filters-group">
            <div className="filter-select-wrap">
              <Filter size={14} />
              <select
                value={severityFilter}
                onChange={(event) =>
                  setSeverityFilter(event.target.value)
                }
                aria-label="Filter severity"
              >
                <option value="All">All severities</option>
                <option value="Moderate">Moderate</option>
                <option value="Watch">Watch</option>
                <option value="Stable">Stable</option>
              </select>
            </div>

            <div className="filter-select-wrap">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort teams"
              >
                <option value="name">Name</option>
                <option value="members">Members</option>
                <option value="communication">Communication</option>
                <option value="meetings">Meeting load</option>
                <option value="workload">Workload</option>
                <option value="recovery">Recovery</option>
              </select>
            </div>

            <button
              type="button"
              className="row-action-btn"
              onClick={() => setSortAsc((current) => !current)}
              aria-label="Toggle sort direction"
              title={sortAsc ? "Ascending" : "Descending"}
            >
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>

        <div className="teams-table-wrap">
          {loading ? (
            <div className="table-empty-state">
              <Activity size={20} />
              <strong>Loading workspace telemetry</strong>
              <span>
                Synchronizing aggregated team conditions…
              </span>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="table-empty-state">
              <Search size={20} />
              <strong>No matching teams</strong>
              <span>
                Adjust the search or severity filter.
              </span>
            </div>
          ) : (
            <table className="lumen-table">
              <thead>
                <tr>
                  <th
                    onClick={() => toggleSort("name")}
                    className="sortable"
                  >
                    Team <ArrowUpDown size={12} />
                  </th>
                  <th>Department</th>
                  <th
                    onClick={() => toggleSort("members")}
                    className="sortable"
                  >
                    Members <ArrowUpDown size={12} />
                  </th>
                  <th
                    onClick={() => toggleSort("communication")}
                    className="sortable"
                  >
                    Comm.
                  </th>
                  <th
                    onClick={() => toggleSort("meetings")}
                    className="sortable"
                  >
                    Meetings
                  </th>
                  <th
                    onClick={() => toggleSort("workload")}
                    className="sortable"
                  >
                    Workload
                  </th>
                  <th
                    onClick={() => toggleSort("recovery")}
                    className="sortable"
                  >
                    Recovery
                  </th>
                  <th>After-hours</th>
                  <th>Signal</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredTeams.map((team) => {
                  const selected = selectedTeam?.id === team.id;

                  return (
                    <tr
                      key={team.id}
                      className={`team-table-row ${
                        selected ? "is-selected" : ""
                      } ${
                        team.is_suppressed ? "is-suppressed" : ""
                      }`}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <td className="team-cell-name">
                        <span className="team-table-avatar">
                          {team.name?.charAt(0)}
                        </span>
                        <strong>{team.name}</strong>
                      </td>

                      <td>{team.department}</td>

                      <td>
                        <span className="members-chip">
                          {team.members}
                        </span>
                      </td>

                      {team.is_suppressed ? (
                        <td colSpan={5}>
                          <span className="suppressed-badge">
                            <Lock size={12} />
                            Detailed telemetry suppressed
                          </span>
                        </td>
                      ) : (
                        <>
                          <td>{team.communication}%</td>
                          <td>{team.meetings}%</td>
                          <td>{team.workload}%</td>
                          <td>
                            <strong
                              className={
                                Number(team.recovery) < 60
                                  ? "stat-warning"
                                  : "stat-normal"
                              }
                            >
                              {team.recovery}%
                            </strong>
                          </td>
                          <td>{team.after_hours}%</td>
                        </>
                      )}

                      <td>
                        <span className="signal-cell-text">
                          {team.signal}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`severity severity-${(
                            team.severity || ""
                          ).toLowerCase()}`}
                        >
                          {team.severity}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="row-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTeam(team);
                          }}
                          aria-label={`Inspect ${team.name}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedTeam && (
        <div className="overview-panel team-inspection">
          <div className="team-inspection-header">
            <div>
              <div className="eyebrow">TEAM INSPECTION</div>
              <h2>{selectedTeam.name}</h2>
              <p>{selectedTeam.department}</p>
            </div>

            <button
              type="button"
              className="row-action-btn"
              onClick={() => setSelectedTeam(null)}
              aria-label="Close team inspection"
            >
              ×
            </button>
          </div>

          <div className="team-inspection-grid">
            <div>
              <span>Communication</span>
              <strong>{selectedTeam.communication}%</strong>
            </div>
            <div>
              <span>Meeting load</span>
              <strong>{selectedTeam.meetings}%</strong>
            </div>
            <div>
              <span>Workload</span>
              <strong>{selectedTeam.workload}%</strong>
            </div>
            <div>
              <span>Recovery</span>
              <strong>{selectedTeam.recovery}%</strong>
            </div>
            <div>
              <span>After-hours</span>
              <strong>{selectedTeam.after_hours}%</strong>
            </div>
            <div>
              <span>Observed signal</span>
              <strong>{selectedTeam.signal}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck size={18} />
        </div>

        <div>
          <strong>Privacy boundary enforced</strong>
          <p>
            LUMEN operates on aggregated team conditions. It does not
            expose individual messages, individual burnout scores, or
            employee rankings.
          </p>
        </div>
      </div>
    </section>
  );
}
