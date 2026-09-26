import React, { useEffect, useState, useMemo } from "react";
import {
  Beaker,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Plus,
  ShieldCheck,
  Play,
  Pause,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Check,
  Calendar,
  Layers,
} from "lucide-react";
import { useLumen } from "../context/LumenContext";
import { getExperiments, updateExperiment, deleteExperiment } from "../lib/api";
import ExperimentModal from "../components/ExperimentModal";

const TIMELINE_STEPS = ["Created", "Planned", "Started", "Observation", "Analysis", "Completed"];

export default function Experiments() {
  const { addToast, apiStatus, reloadExperiments } = useLumen();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expandedId, setExpandedId] = useState("EXP-001");

  const loadData = async () => {
    try {
      const res = await getExperiments();
      setExperiments(res.experiments || []);
    } catch (err) {
      console.error("Failed to load experiments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (exp, newStatus) => {
    try {
      const updated = await updateExperiment(exp.id, { status: newStatus });
      addToast(
        "Experiment Status Updated",
        `${exp.id} transitioned to ${newStatus}.`,
        "success"
      );
      await loadData();
      await reloadExperiments();
    } catch (err) {
      addToast("Failed to Update Status", err.message, "danger");
    }
  };

  const handleDelete = async (expId) => {
    if (!window.confirm(`Are you sure you want to delete trial ${expId}?`)) return;

    try {
      await deleteExperiment(expId);
      addToast("Experiment Deleted", `${expId} removed from workspace registry.`, "info");
      await loadData();
      await reloadExperiments();
    } catch (err) {
      addToast("Failed to Delete", err.message, "danger");
    }
  };

  const handleEdit = (exp) => {
    setEditingExp(exp);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingExp(null);
    setIsModalOpen(true);
  };

  const filteredExperiments = useMemo(() => {
    let list = [...experiments];
    const q = search.toLowerCase().trim();

    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.team.toLowerCase().includes(q) ||
          e.hypothesis.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      list = list.filter((e) => e.status === statusFilter);
    }

    return list;
  }, [experiments, search, statusFilter]);

  const runningCount = experiments.filter((e) => e.status === "Running").length;
  const completedCount = experiments.filter((e) => e.status === "Completed").length;
  const plannedCount = experiments.filter((e) => e.status === "Planned").length;

  return (
    <section className="experiments-page" aria-label="LUMEN Experimentation Center">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">CONTROLLED INTERVENTIONS</div>
          <h1>Experiments</h1>
          <p>
            Turn causal hypotheses into structured, team-level trials with explicit baselines, targets, and pre/post tracking.
          </p>
        </div>

        <div className="page-header-actions">
          <div className="overview-status">
            <span className={`status-dot ${apiStatus === "live" ? "is-live" : "is-offline"}`} />
            <span>{apiStatus === "live" ? "Registry live" : "Connecting"}</span>
          </div>
          <button type="button" className="primary-action" onClick={handleCreate}>
            <Plus size={16} />
            New Experiment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Total Trials</span>
          <strong className="metric-value">{experiments.length}</strong>
          <span className="metric-meta">Persistent registry</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Active / Running</span>
          <strong className="metric-value">{runningCount}</strong>
          <span className="metric-meta">Collecting weekly data</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Planned / Draft</span>
          <strong className="metric-value">{plannedCount}</strong>
          <span className="metric-meta">Awaiting start window</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Completed Trials</span>
          <strong className="metric-value">{completedCount}</strong>
          <span className="metric-meta">Measured outcome logged</span>
        </div>
      </div>

      {/* Toolbar / Search / Filters */}
      <div className="overview-panel">
        <div className="table-controls-bar">
          <div className="teams-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search experiments by name, team, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search experiments"
            />
          </div>

          <div className="table-filters-group">
            <div className="filter-select-wrap">
              <Filter size={14} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by trial status"
              >
                <option value="All">All Statuses</option>
                <option value="Running">Running</option>
                <option value="Planned">Planned</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Experiment Cards / List */}
        <div className="experiment-list">
          {filteredExperiments.map((exp) => {
            const isExpanded = expandedId === exp.id;

            return (
              <article className="experiment-card-full" key={exp.id}>
                <div
                  className="experiment-card-header"
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="experiment-header-left">
                    <div className="experiment-status-icon">
                      {exp.status === "Completed" ? (
                        <CheckCircle2 size={20} className="icon-completed" />
                      ) : (
                        <Beaker size={20} className="icon-running" />
                      )}
                    </div>
                    <div>
                      <div className="experiment-meta-row">
                        <span className="signal-id">{exp.id}</span>
                        <span className="team-pill">{exp.team}</span>
                        <span className={`experiment-status experiment-status-${exp.status.toLowerCase()}`}>
                          {exp.status}
                        </span>
                      </div>
                      <h3>{exp.name}</h3>
                    </div>
                  </div>

                  <div className="experiment-header-right">
                    <div className="experiment-header-metrics">
                      <div>
                        <small>Baseline</small>
                        <strong>{exp.baseline}</strong>
                      </div>
                      <div className="exp-arrow">→</div>
                      <div>
                        <small>Target</small>
                        <strong>{exp.target}</strong>
                      </div>
                    </div>

                    <div className="experiment-card-chevron">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="experiment-card-progress">
                  <div className="exp-progress-bar-bg">
                    <div
                      className="exp-progress-bar-fill"
                      style={{
                        width: `${exp.progress}%`,
                        backgroundColor:
                          exp.status === "Completed" ? "var(--success)" : "var(--accent)",
                      }}
                    />
                  </div>
                  <div className="exp-progress-meta">
                    <span>{exp.progress}% Progress</span>
                    <span>{exp.observation_window}</span>
                  </div>
                </div>

                {/* Expanded Detail View (Requirement 26) */}
                {isExpanded && (
                  <div className="experiment-card-detail">
                    {/* Six-Stage Lifecycle Timeline */}
                    <div className="experiment-timeline-section">
                      <span className="detail-section-title">Lifecycle Protocol</span>
                      <div className="timeline-strip">
                        {TIMELINE_STEPS.map((step, idx) => {
                          let isStepDone = false;
                          let isStepCurrent = false;

                          if (exp.status === "Completed") {
                            isStepDone = true;
                          } else if (exp.status === "Running") {
                            isStepDone = idx < 3;
                            isStepCurrent = idx === 3;
                          } else if (exp.status === "Planned") {
                            isStepDone = idx < 1;
                            isStepCurrent = idx === 1;
                          } else {
                            isStepCurrent = idx === 0;
                          }

                          return (
                            <div
                              key={step}
                              className={`timeline-step ${isStepDone ? "is-done" : ""} ${
                                isStepCurrent ? "is-current" : ""
                              }`}
                            >
                              <div className="timeline-node">
                                {isStepDone ? <Check size={12} /> : <span>{idx + 1}</span>}
                              </div>
                              <span className="timeline-label">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hypothesis & Protocol Details */}
                    <div className="experiment-details-grid">
                      <div className="detail-item">
                        <small>Causal Hypothesis</small>
                        <p>{exp.hypothesis}</p>
                      </div>

                      <div className="detail-item">
                        <small>Intervention Protocol</small>
                        <p>{exp.intervention}</p>
                      </div>

                      <div className="detail-item">
                        <small>Primary Outcome & Target</small>
                        <p>
                          <strong>{exp.primary_outcome}</strong>: Shift from {exp.baseline} to {exp.target}
                        </p>
                      </div>

                      <div className="detail-item">
                        <small>Adherence & Notes</small>
                        <p>{exp.notes || "No additional notes recorded."}</p>
                      </div>
                    </div>

                    {/* Action Bar (Lifecycle controls & CRUD) */}
                    <div className="experiment-actions-bar">
                      <div className="lifecycle-buttons">
                        {exp.status === "Planned" && (
                          <button
                            type="button"
                            className="primary-action small"
                            onClick={() => handleStatusChange(exp, "Running")}
                          >
                            <Play size={14} /> Start Trial
                          </button>
                        )}

                        {exp.status === "Running" && (
                          <>
                            <button
                              type="button"
                              className="secondary-action small"
                              onClick={() => handleStatusChange(exp, "Paused")}
                            >
                              <Pause size={14} /> Pause
                            </button>
                            <button
                              type="button"
                              className="primary-action small"
                              onClick={() => handleStatusChange(exp, "Completed")}
                            >
                              <CheckCircle2 size={14} /> Complete Trial
                            </button>
                          </>
                        )}

                        {exp.status === "Paused" && (
                          <button
                            type="button"
                            className="primary-action small"
                            onClick={() => handleStatusChange(exp, "Running")}
                          >
                            <Play size={14} /> Resume Trial
                          </button>
                        )}
                      </div>

                      <div className="crud-buttons">
                        <button
                          type="button"
                          className="icon-action-btn"
                          onClick={() => handleEdit(exp)}
                          title="Edit trial parameters"
                          aria-label="Edit experiment"
                        >
                          <Edit2 size={15} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="icon-action-btn danger"
                          onClick={() => handleDelete(exp.id)}
                          title="Delete trial"
                          aria-label="Delete experiment"
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {filteredExperiments.length === 0 && (
            <div className="empty-state">
              No controlled experiments found matching your filter criteria. Click "New Experiment" to register a trial.
            </div>
          )}
        </div>
      </div>

      {/* Creation / Edit Modal */}
      <ExperimentModal
        isOpen={isModalOpen}
        initialData={editingExp}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
      />

      {/* Privacy strip */}
      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck size={18} />
        </div>
        <div>
          <strong>Organizational Experiment Boundary</strong>
          <p>
            Experiments assess the systemic impact of policy changes (meeting caps, quiet blocks) on aggregated team outcomes.
            Individual employee compliance or personal performance scores are not part of trial tracking.
          </p>
        </div>
      </div>
    </section>
  );
}