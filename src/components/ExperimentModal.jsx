import React, { useState, useEffect } from "react";
import { X, FlaskConical, Beaker, Check } from "lucide-react";
import { useLumen } from "../context/LumenContext";
import { createExperiment, updateExperiment } from "../lib/api";

const TEAMS_LIST = ["Atlas", "Northstar", "Vector", "Orbit", "Meridian", "Vertex", "Harbor", "Summit"];
const OUTCOMES = ["Recovery", "Communication", "Meetings", "Workload", "After-hours sync"];

export default function ExperimentModal({ isOpen, onClose, initialData = null, onSaved }) {
  const { addToast, reloadExperiments, prefilledExperiment, setPrefilledExperiment } = useLumen();

  const [formData, setFormData] = useState({
    name: "",
    team: "Atlas",
    hypothesis: "",
    treatment: "Weekly meeting hours",
    intervention: "",
    baseline: "18.4h",
    target: "14.0h",
    observation_window: "21 days",
    primary_outcome: "Recovery",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        team: initialData.team || "Atlas",
        hypothesis: initialData.hypothesis || "",
        treatment: initialData.treatment || "Weekly meeting hours",
        intervention: initialData.intervention || "",
        baseline: initialData.baseline || "",
        target: initialData.target || "",
        observation_window: initialData.observation_window || "21 days",
        primary_outcome: initialData.primary_outcome || "Recovery",
        notes: initialData.notes || "",
        status: initialData.status || "Planned",
      });
    } else if (prefilledExperiment) {
      setFormData((prev) => ({
        ...prev,
        ...prefilledExperiment,
      }));
    } else {
      setFormData({
        name: "Meeting Load Reduction Trial",
        team: "Atlas",
        hypothesis: "Reducing synchronous meeting hours may improve team recovery capacity.",
        treatment: "Weekly meeting hours",
        intervention: "Cap recurring meetings to 14.0h/wk and introduce async check-ins.",
        baseline: "18.4h",
        target: "14.0h",
        observation_window: "14 days",
        primary_outcome: "Recovery",
        notes: "Formulated from What-If counterfactual scenario.",
      });
    }
  }, [initialData, prefilledExperiment, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (initialData?.id) {
        await updateExperiment(initialData.id, formData);
        addToast("Experiment Updated", `Changes saved for ${initialData.id}`, "success");
      } else {
        const created = await createExperiment(formData);
        addToast("Experiment Created", `${created.id} registered in workspace registry.`, "success");
      }
      setPrefilledExperiment(null);
      await reloadExperiments();
      onSaved?.();
      onClose();
    } catch (err) {
      addToast("Failed to Save Experiment", err.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Experiment setup"
      >
        <div className="modal-header">
          <div className="modal-header-icon">
            <Beaker size={20} />
          </div>
          <div>
            <h3>{initialData?.id ? `Edit ${initialData.id}` : "Design Team Experiment"}</h3>
            <p>Turn a causal hypothesis into an active, measurable organizational trial.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <label className="form-field full-width">
              <span>Trial Name</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Focus Block Reservation Pilot"
                required
              />
            </label>
          </div>

          <div className="form-row two-cols">
            <label className="form-field">
              <span>Target Team</span>
              <select name="team" value={formData.team} onChange={handleChange}>
                {TEAMS_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Primary Outcome</span>
              <select name="primary_outcome" value={formData.primary_outcome} onChange={handleChange}>
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="form-field full-width">
              <span>Causal Hypothesis</span>
              <textarea
                name="hypothesis"
                rows={2}
                value={formData.hypothesis}
                onChange={handleChange}
                placeholder="What condition are you testing and why will it shift the outcome?"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field full-width">
              <span>Intervention Specification</span>
              <textarea
                name="intervention"
                rows={2}
                value={formData.intervention}
                onChange={handleChange}
                placeholder="Specific operational change applied to team routines"
                required
              />
            </label>
          </div>

          <div className="form-row three-cols">
            <label className="form-field">
              <span>Baseline Condition</span>
              <input
                name="baseline"
                value={formData.baseline}
                onChange={handleChange}
                placeholder="e.g. 18.4h / 58%"
                required
              />
            </label>

            <label className="form-field">
              <span>Target Condition</span>
              <input
                name="target"
                value={formData.target}
                onChange={handleChange}
                placeholder="e.g. 14.0h / 64%"
                required
              />
            </label>

            <label className="form-field">
              <span>Observation Window</span>
              <input
                name="observation_window"
                value={formData.observation_window}
                onChange={handleChange}
                placeholder="e.g. 14 days"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field full-width">
              <span>Notes & Adherence Protocol</span>
              <input
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Leadership sponsor, retrospective checkpoints, async tooling"
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-action" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? "Saving…" : initialData?.id ? "Update Trial" : "Register Trial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
