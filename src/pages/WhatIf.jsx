import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Beaker,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  getTeams,
  getWhatIf,
  simulateWhatIf,
  createExperiment,
} from "../lib/api";

export default function WhatIf() {
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("atlas");
  const [baseline, setBaseline] = useState(18.4);
  const [proposed, setProposed] = useState(14);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [teamData, whatIfData] = await Promise.all([
          getTeams(),
          getWhatIf("atlas"),
        ]);

        if (!active) return;

        setTeams(teamData?.teams || teamData || []);

        const current =
          whatIfData?.baselineTreatment ??
          whatIfData?.baselineMeetingHours ??
          whatIfData?.baseline ??
          18.4;

        setBaseline(Number(current));
        setProposed(Number(current));
      } catch (error) {
        if (active) {
          setMessage(error.message || "Unable to load What-If data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  async function handleTeamChange(event) {
    const nextTeam = event.target.value;

    setTeamId(nextTeam);
    setResult(null);
    setMessage("");

    try {
      const data = await getWhatIf(nextTeam);

      const current =
        data?.baselineTreatment ??
        data?.baselineMeetingHours ??
        data?.baseline ??
        18.4;

      setBaseline(Number(current));
      setProposed(Number(current));
    } catch (error) {
      setMessage(error.message || "Unable to load team scenario.");
    }
  }

  async function runSimulation() {
    setSimulating(true);
    setMessage("");

    try {
      const data = await simulateWhatIf({
        team_id: teamId,
        proposed_meeting_hours: proposed,
      });

      setResult(data);
    } catch (error) {
      setMessage(error.message || "Simulation failed.");
    } finally {
      setSimulating(false);
    }
  }

  function resetScenario() {
    setProposed(baseline);
    setResult(null);
    setMessage("");
  }

  async function registerExperiment() {
    if (!result) {
      setMessage("Run the simulation before creating an experiment.");
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      await createExperiment({
        name: "What-If Intervention Trial",
        team:
          teams.find(
            (team) =>
              String(team.id).toLowerCase() ===
              String(teamId).toLowerCase()
          )?.name || teamId,
        hypothesis:
          "Reducing meeting load may improve team recovery.",
        treatment: "Weekly meeting hours",
        intervention:
          `Reduce weekly meeting load from ${baseline}h to ${proposed}h.`,
        baseline: `${baseline}h`,
        target: `${proposed}h`,
        observation_window: "14 days",
        primary_outcome: "Recovery",
        notes:
          "Experiment generated from the LUMEN What-If counterfactual simulation.",
      });

      setMessage("Experiment registered successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to create experiment.");
    } finally {
      setCreating(false);
    }
  }

  const selectedTeam = useMemo(
    () =>
      teams.find(
        (team) =>
          String(team.id).toLowerCase() === String(teamId).toLowerCase()
      ),
    [teams, teamId]
  );

  const estimatedRecovery =
    result?.estimatedRecovery ??
    result?.estimated_recovery ??
    result?.counterfactualRecovery ??
    result?.estimatedOutcome ??
    null;

  const baselineRecovery =
    result?.baselineRecovery ??
    result?.baseline_recovery ??
    result?.baselineOutcome ??
    null;

  const delta =
    result?.delta ??
    result?.change ??
    (estimatedRecovery !== null && baselineRecovery !== null
      ? Number(estimatedRecovery) - Number(baselineRecovery)
      : null);

  const confidenceInterval =
    result?.confidenceInterval ??
    result?.confidence_interval ??
    null;

  if (loading) {
    return (
      <section className="whatif-page">
        <div className="whatif-loading">Loading What-If engine...</div>
      </section>
    );
  }

  return (
    <section className="whatif-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">COUNTERFACTUAL ANALYSIS</span>
          <h1>What-If</h1>
          <p>
            Change a workplace condition and estimate how the team-level
            outcome could respond.
          </p>
        </div>
      </header>

      <div className="whatif-layout">
        <main>
          <section className="whatif-panel">
            <div className="whatif-panel-header">
              <div>
                <span className="panel-kicker">SCENARIO</span>
                <h2>Meeting load → Recovery</h2>
                <p>
                  Explore a hypothetical intervention without changing the
                  underlying team data.
                </p>
              </div>

              <div className="whatif-icon">
                <SlidersHorizontal size={20} />
              </div>
            </div>

            <div className="whatif-controls">
              <label className="whatif-field">
                <span>Target team</span>
                <select value={teamId} onChange={handleTeamChange}>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name || team.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="whatif-team-context">
                <span>Current team</span>
                <strong>{selectedTeam?.name || "Atlas"}</strong>
                <small>
                  {selectedTeam?.members
                    ? `${selectedTeam.members} members`
                    : "Team-level analysis"}
                </small>
              </div>
            </div>

            <div className="whatif-slider-section">
              <div className="whatif-slider-heading">
                <div>
                  <span>Proposed weekly meeting load</span>
                  <strong>{proposed.toFixed(1)}h</strong>
                </div>

                <span className="whatif-baseline">
                  Baseline {baseline.toFixed(1)}h
                </span>
              </div>

              <input
                type="range"
                min="4"
                max="30"
                step="0.5"
                value={proposed}
                onChange={(event) => {
                  setProposed(Number(event.target.value));
                  setResult(null);
                  setMessage("");
                }}
              />

              <div className="whatif-range">
                <span>4h</span>
                <span>15h</span>
                <span>30h</span>
              </div>
            </div>

            <div className="whatif-change">
              <div>
                <span>Baseline</span>
                <strong>{baseline.toFixed(1)}h</strong>
              </div>

              <ArrowRight size={19} />

              <div>
                <span>Proposed</span>
                <strong>{proposed.toFixed(1)}h</strong>
              </div>

              <div className="whatif-change-percent">
                {baseline
                  ? `${(((proposed - baseline) / baseline) * 100).toFixed(0)}%`
                  : "—"}
              </div>
            </div>

            <div className="whatif-actions">
              <button
                type="button"
                className="secondary-action"
                onClick={resetScenario}
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <button
                type="button"
                className="primary-action"
                onClick={runSimulation}
                disabled={simulating}
              >
                <Sparkles size={15} />
                {simulating ? "Simulating..." : "Run simulation"}
              </button>
            </div>
          </section>

          {message && (
            <div className="whatif-message">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <section className="whatif-result-panel">
            <div className="whatif-panel-header">
              <div>
                <span className="panel-kicker">MODEL OUTPUT</span>
                <h2>Counterfactual estimate</h2>
              </div>

              {result && (
                <span className="whatif-live-badge">
                  <span />
                  Simulation complete
                </span>
              )}
            </div>

            {!result ? (
              <div className="whatif-empty">
                <Beaker size={24} />
                <strong>No scenario calculated yet</strong>
                <p>
                  Adjust the meeting load and run the simulation to see the
                  estimated team-level recovery response.
                </p>
              </div>
            ) : (
              <>
                <div className="whatif-results-grid">
                  <div className="whatif-result-card">
                    <span>Baseline recovery</span>
                    <strong>
                      {baselineRecovery !== null
                        ? `${Number(baselineRecovery).toFixed(1)}`
                        : "—"}
                    </strong>
                  </div>

                  <div className="whatif-result-card">
                    <span>Estimated recovery</span>
                    <strong>
                      {estimatedRecovery !== null
                        ? `${Number(estimatedRecovery).toFixed(1)}`
                        : "—"}
                    </strong>
                  </div>

                  <div className="whatif-result-card">
                    <span>Estimated change</span>
                    <strong>
                      {delta !== null
                        ? `${Number(delta) >= 0 ? "+" : ""}${Number(delta).toFixed(2)}`
                        : "—"}
                    </strong>
                  </div>
                </div>

                <div className="whatif-confidence">
                  <div>
                    <span>Uncertainty</span>
                    <strong>
                      {confidenceInterval
                        ? `[${confidenceInterval[0]}, ${confidenceInterval[1]}]`
                        : "See model output"}
                    </strong>
                  </div>

                  <p>
                    This is a counterfactual estimate from the current
                    synthetic causal model. It is not a prediction of an
                    individual employee's health or behavior.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-action"
                  onClick={registerExperiment}
                  disabled={creating}
                >
                  <Beaker size={15} />
                  {creating
                    ? "Registering..."
                    : "Turn this scenario into an experiment"}
                </button>
              </>
            )}
          </section>
        </main>

        <aside className="whatif-sidebar">
          <div className="whatif-side-card">
            <div className="whatif-side-icon">
              <ShieldCheck size={19} />
            </div>

            <span className="panel-kicker">PRIVACY BOUNDARY</span>
            <h2>Team-level only</h2>
            <p>
              What-If operates on aggregated workplace conditions. It does not
              expose messages, calculate individual burnout scores, or rank
              employees.
            </p>

            <div className="whatif-check">
              <CheckCircle2 size={14} />
              No individual profiles
            </div>

            <div className="whatif-check">
              <CheckCircle2 size={14} />
              No raw messages
            </div>

            <div className="whatif-check">
              <CheckCircle2 size={14} />
              Explicit uncertainty
            </div>
          </div>

          <div className="whatif-side-card">
            <span className="panel-kicker">WORKFLOW</span>
            <h2>From hypothesis to test</h2>

            <div className="whatif-workflow-step">
              <span>01</span>
              <p>Detect a team-level signal</p>
            </div>

            <div className="whatif-workflow-step">
              <span>02</span>
              <p>Estimate the counterfactual</p>
            </div>

            <div className="whatif-workflow-step">
              <span>03</span>
              <p>Register an experiment</p>
            </div>

            <div className="whatif-workflow-step">
              <span>04</span>
              <p>Measure the outcome</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
