import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  ArrowRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLumen } from "../context/LumenContext";
import { getCausalAnalysis, analyzeCausal } from "../lib/api";
import CausalGraph from "../components/CausalGraph";

const AVAILABLE_CONTROLS = ["Workload", "Project pressure", "After-hours sync"];

export default function CausalLab() {
  const navigate = useNavigate();
  const { selectedTeam, setSelectedTeam, addToast, apiStatus } = useLumen();

  const [analysis, setAnalysis] = useState(null);
  const [selectedControls, setSelectedControls] = useState(["Workload", "Project pressure"]);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState("meeting_hours");

  useEffect(() => {
    let mounted = true;
    getCausalAnalysis(selectedTeam)
      .then((data) => {
        if (mounted) setAnalysis(data);
      })
      .catch((err) => console.error("Error fetching causal analysis:", err));

    return () => {
      mounted = false;
    };
  }, [selectedTeam]);

  const handleControlToggle = (ctrl) => {
    setSelectedControls((prev) =>
      prev.includes(ctrl) ? prev.filter((c) => c !== ctrl) : [...prev, ctrl]
    );
  };

  const handleRunEstimation = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeCausal(selectedTeam, selectedControls);
      setAnalysis(result);
      addToast(
        "Causal Model Recalculated",
        `Fitted OLS with ${selectedControls.length} adjustment variables.`,
        "success"
      );
    } catch (err) {
      addToast("Estimation Error", err.message, "danger");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGoToWhatIf = () => {
    navigate("/what-if");
  };

  const isUnadjusted = selectedControls.length === 0;

  return (
    <section className="causal-page" aria-label="LUMEN Causal Intelligence Laboratory">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow">SCIENTIFIC INSTRUMENTATION</div>
          <h1>Causal Lab</h1>
          <p>
            Separate observed correlation from plausible causal effects using explicit DAG structural identification
            and regression adjustment.
          </p>
        </div>

        <div className="overview-status-group">
          <div className="overview-status">
            <span className={`status-dot ${apiStatus === "live" ? "is-live" : "is-offline"}`} />
            <span>{apiStatus === "live" ? "Model engine online" : "Connecting"}</span>
          </div>
          <span className="analysis-badge">SYNTHETIC CAUSAL DEMONSTRATION</span>
        </div>
      </div>

      {/* Control Strip / Parameter Bar */}
      <div className="overview-panel causal-toolbar">
        <div className="toolbar-row">
          <div className="toolbar-field">
            <span>Target Team</span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              aria-label="Select team for causal analysis"
            >
              <option value="atlas">Atlas (Product Engineering)</option>
              <option value="northstar">Northstar (Data & Intel)</option>
              <option value="vector">Vector (Platform)</option>
              <option value="orbit">Orbit (Design Systems)</option>
              <option value="meridian">Meridian (Operations)</option>
              <option value="vertex">Vertex (Security)</option>
              <option value="harbor">Harbor (Operations)</option>
              <option value="summit">Summit (Research)</option>
            </select>
          </div>

          <div className="toolbar-field">
            <span>Treatment Exposure (X)</span>
            <div className="fixed-pill treatment">Meeting load (weekly hours)</div>
          </div>

          <div className="toolbar-field">
            <span>Target Outcome (Y)</span>
            <div className="fixed-pill outcome">Recovery index (0–100%)</div>
          </div>

          <div className="toolbar-controls-selector">
            <span>Adjustment Controls (Z)</span>
            <div className="controls-checkbox-group">
              {AVAILABLE_CONTROLS.map((ctrl) => (
                <label key={ctrl} className="control-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedControls.includes(ctrl)}
                    onChange={() => handleControlToggle(ctrl)}
                  />
                  <span>{ctrl}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="primary-action"
            onClick={handleRunEstimation}
            disabled={analyzing}
          >
            {analyzing ? "Estimating…" : "Re-estimate Effect"}
          </button>
        </div>
      </div>

      {/* Unadjusted Confounding Warning */}
      {isUnadjusted && (
        <div className="confounding-warning-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Confounding Backdoor Paths Left Open</strong>
            <p>
              Without controlling for Workload and Project Pressure, the model attributes background sprint pressure
              directly to Meeting Load, resulting in an inflated effect estimate.
            </p>
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      {analysis && (
        <div className="metric-grid">
          <div className="metric-card">
            <span className="metric-label">Estimated Effect (β)</span>
            <strong className="metric-value">
              {analysis.estimated_effect > 0 ? "+" : ""}
              {analysis.estimated_effect} pts/hr
            </strong>
            <span className="metric-meta">OLS regression slope</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">95% Bootstrap CI</span>
            <strong className="metric-value">
              [{analysis.ci_lower}, {analysis.ci_upper}]
            </strong>
            <span className="metric-meta">1,000 resamples</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Unadjusted Baseline</span>
            <strong className="metric-value">
              {analysis.unadjusted_effect} pts/hr
            </strong>
            <span className="metric-meta">Raw naive correlation</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Sample Support (N)</span>
            <strong className="metric-value">{analysis.sample_size} team-weeks</strong>
            <span className="metric-meta">R² = {analysis.r_squared}</span>
          </div>
        </div>
      )}

      {/* Causal Graph Stage */}
      <div className="overview-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">STRUCTURAL CAUSAL MODEL</span>
            <h2>Directed Acyclic Graph (DAG)</h2>
          </div>
          <span className="graph-subhead-badge">Non-parametric backdoor criterion</span>
        </div>

        <CausalGraph
          nodes={analysis?.nodes || []}
          selectedNodeId={activeNodeId}
          onSelectNode={setActiveNodeId}
        />
      </div>

      {/* Scientific Analysis Grid */}
      {analysis && (
        <div className="overview-grid">
          {/* Effect Interpretation & Diagnostics */}
          <div className="overview-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">STATISTICAL DIAGNOSTICS</span>
                <h2>Effect Interpretation</h2>
              </div>
              <FlaskConical size={18} />
            </div>

            <p className="causal-interpretation-text">{analysis.interpretation}</p>

            <div className="comparison-table-wrap">
              <table className="lumen-mini-table">
                <thead>
                  <tr>
                    <th>Model Specification</th>
                    <th>Estimate (β)</th>
                    <th>Standard Error</th>
                    <th>Backdoor Paths</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Naïve Correlation (Unadjusted)</td>
                    <td>{analysis.unadjusted_effect} pts/hr</td>
                    <td>±0.082</td>
                    <td><span className="badge-warning">Confounded</span></td>
                  </tr>
                  <tr className="row-highlighted">
                    <td><strong>Adjusted Causal Model</strong></td>
                    <td><strong>{analysis.estimated_effect} pts/hr</strong></td>
                    <td><strong>±{analysis.std_error}</strong></td>
                    <td><span className="badge-success">Blocked</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="sensitivity-callout">
              <strong>Sensitivity to Unobserved Confounders</strong>
              <p>{analysis.sensitivity}</p>
            </div>

            <div className="panel-cta-row">
              <button type="button" className="primary-action" onClick={handleGoToWhatIf}>
                <Sparkles size={15} />
                Simulate Intervention in What-If
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Stated Assumptions Checklist */}
          <div className="overview-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">CAUSAL IDENTIFICATION</span>
                <h2>What Must Be True</h2>
              </div>
              <HelpCircle size={18} />
            </div>

            <div className="assumption-list">
              {analysis.assumptions.map((assumption, index) => (
                <div className="assumption-row" key={index}>
                  <span className="assumption-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="assumption-content">
                    <p>{assumption}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="assumptions-footer">
              <Info size={14} />
              <span>
                If conditional ignorability is violated by an unobserved corporate reorganization or external shock,
                effect estimates will absorb residual bias. Human oversight remains mandatory.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Strip */}
      <div className="privacy-strip">
        <div className="privacy-strip-icon">
          <ShieldCheck size={18} />
        </div>
        <div>
          <strong>Privacy Preserved by Design</strong>
          <p>
            Causal identification is performed exclusively over aggregated team condition vectors.
            No individual employee messages, sentiment scores, or medical diagnostics enter the estimation pipeline.
          </p>
        </div>
      </div>
    </section>
  );
}