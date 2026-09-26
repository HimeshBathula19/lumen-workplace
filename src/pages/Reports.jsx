import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileJson,
  FileText,
  Printer,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useLumen } from "../context/LumenContext";
import {
  getExportCsvUrl,
  getExportJsonUrl,
  getReportSummary,
  generateReport,
} from "../lib/api";

const css = `
.report-live-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px 0 70px;
  color: #1d1d1f;
}

.report-live-page,
.report-live-page * {
  box-sizing: border-box;
}

.report-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 22px;
}

.report-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  color: #8e8e93;
  margin-bottom: 8px;
}

.report-title {
  margin: 0;
  font-size: 45px;
  line-height: 1;
  letter-spacing: -.05em;
}

.report-subtitle {
  margin: 10px 0 0;
  max-width: 760px;
  color: #6e6e73;
  font-size: 15px;
  line-height: 1.6;
}

.report-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.report-btn {
  min-height: 40px;
  border: 1px solid #d2d2d7;
  border-radius: 10px;
  background: #fff;
  color: #1d1d1f;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.report-btn:hover {
  border-color: #b8b8bd;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
}

.report-btn.primary {
  color: #fff;
  background: #0071e3;
  border-color: #0071e3;
  box-shadow: 0 7px 20px rgba(0,113,227,.2);
}

.report-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 11px 13px;
  border: 1px solid #e5e5e7;
  background: rgba(255,255,255,.86);
  border-radius: 14px;
  margin-bottom: 16px;
}

.report-select {
  height: 38px;
  border: 1px solid #d2d2d7;
  border-radius: 9px;
  background: #fff;
  padding: 0 12px;
  color: #1d1d1f;
  font-size: 13px;
}

.report-live-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6e6e73;
  font-size: 12px;
}

.report-live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ebc5a;
  box-shadow: 0 0 0 4px rgba(46,188,90,.11);
}

.report-paper {
  background: #fff;
  border: 1px solid #e5e5e7;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0,0,0,.055);
}

.report-paper-top {
  padding: 28px 32px;
  border-bottom: 1px solid #e5e5e7;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.report-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: #1d1d1f;
  color: #fff;
  font-weight: 700;
}

.report-brand strong {
  display: block;
  font-size: 14px;
}

.report-brand span {
  display: block;
  margin-top: 3px;
  color: #6e6e73;
  font-size: 11px;
}

.report-meta {
  text-align: right;
  color: #6e6e73;
  font-size: 11px;
  line-height: 1.65;
}

.report-meta strong {
  color: #1d1d1f;
}

.report-body {
  padding: 32px;
}

.report-hero {
  padding-bottom: 28px;
  border-bottom: 1px solid #e5e5e7;
}

.report-kicker {
  color: #0071e3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .15em;
}

.report-hero h2 {
  margin: 9px 0;
  font-size: 31px;
  letter-spacing: -.035em;
}

.report-hero p {
  margin: 0;
  max-width: 850px;
  color: #6e6e73;
  font-size: 14px;
  line-height: 1.75;
}

.report-section {
  padding: 28px 0;
  border-bottom: 1px solid #e5e5e7;
}

.report-section:last-child {
  border-bottom: 0;
}

.report-section-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 17px;
}

.report-section-number {
  color: #8e8e93;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .12em;
  padding-top: 4px;
}

.report-section-title h3 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -.025em;
}

.report-section-title p {
  margin: 5px 0 0;
  color: #6e6e73;
  font-size: 12px;
  line-height: 1.55;
}

.report-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
}

.report-metric {
  background: #f5f5f7;
  border: 1px solid #ebebee;
  border-radius: 12px;
  padding: 15px;
}

.report-metric span {
  display: block;
  color: #6e6e73;
  font-size: 11px;
  margin-bottom: 8px;
}

.report-metric strong {
  font-size: 26px;
  letter-spacing: -.035em;
}

.report-metric small {
  display: block;
  margin-top: 6px;
  color: #8e8e93;
  font-size: 10px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.report-table th {
  text-align: left;
  color: #8e8e93;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: 10px;
  border-bottom: 1px solid #e5e5e7;
}

.report-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f0f0f2;
  vertical-align: top;
}

.report-table tr:last-child td {
  border-bottom: 0;
}

.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.report-card {
  border: 1px solid #e5e5e7;
  border-radius: 14px;
  padding: 17px;
  background: #fff;
}

.report-card-label {
  font-size: 10px;
  font-weight: 800;
  color: #8e8e93;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.report-card h4 {
  margin: 8px 0 6px;
  font-size: 16px;
}

.report-card p {
  margin: 0;
  color: #6e6e73;
  font-size: 12px;
  line-height: 1.65;
}

.report-number {
  margin-top: 11px;
  font-size: 34px;
  font-weight: 750;
  letter-spacing: -.045em;
}

.report-number.negative {
  color: #b3261e;
}

.report-number.positive {
  color: #248a3d;
}

.report-pill {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f2f2f5;
  font-size: 10px;
  font-weight: 700;
}

.report-pill.moderate {
  background: #fff3dc;
  color: #965b00;
}

.report-pill.watch {
  background: #edf5ff;
  color: #0066c0;
}

.report-pill.stable {
  background: #edf8ef;
  color: #24763a;
}

.report-plan {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.report-plan-item {
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 14px;
}

.report-plan-item b {
  color: #0071e3;
  font-size: 10px;
}

.report-plan-item strong {
  display: block;
  margin-top: 7px;
  font-size: 12px;
}

.report-plan-item span {
  display: block;
  margin-top: 6px;
  color: #6e6e73;
  font-size: 11px;
  line-height: 1.5;
}

.report-callout {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #dcebdc;
  background: #f5faf5;
  color: #37533b;
  font-size: 12px;
  line-height: 1.6;
}

.report-limitations {
  display: grid;
  gap: 8px;
}

.report-limitation {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  color: #5c5c63;
  font-size: 12px;
}

.report-empty {
  padding: 80px 30px;
  text-align: center;
  color: #6e6e73;
}

.report-empty strong {
  display: block;
  margin-top: 10px;
  color: #1d1d1f;
  font-size: 18px;
}

.report-empty p {
  max-width: 500px;
  margin: 8px auto 0;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .report-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .report-actions {
    justify-content: flex-start;
  }

  .report-metrics,
  .report-plan {
    grid-template-columns: 1fr 1fr;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .report-body,
  .report-paper-top {
    padding: 20px;
  }

  .report-metrics,
  .report-plan {
    grid-template-columns: 1fr;
  }

  .report-paper-top {
    flex-direction: column;
  }

  .report-meta {
    text-align: left;
  }
}

@media print {
  .topbar,
  .sidebar,
  .report-head,
  .report-toolbar,
  .report-actions {
    display: none !important;
  }

  .page-content {
    padding: 0 !important;
  }

  .report-live-page {
    max-width: none;
    padding: 0;
  }

  .report-paper {
    border: 0;
    box-shadow: none;
  }
}
`;

export default function Reports() {
  const { teams = [] } = useLumen();

  const [selectedTeam, setSelectedTeam] = useState("atlas");
  const [report, setReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const selectedTeamName = useMemo(() => {
    return (
      teams.find((team) => team.id === selectedTeam)?.name ||
      selectedTeam
    );
  }, [teams, selectedTeam]);

  async function loadReport(teamId = selectedTeam) {
    setLoading(true);
    setError("");

    try {
      const [summaryData, reportData] = await Promise.all([
        getReportSummary(teamId),
        generateReport(teamId),
      ]);

      setSummary(summaryData);
      setReport(reportData);
    } catch (err) {
      console.error("LUMEN report load failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the report."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport(selectedTeam);
  }, [selectedTeam]);

  async function regenerate() {
    setGenerating(true);
    setError("");

    try {
      const data = await generateReport(selectedTeam);
      setReport(data);

      const freshSummary = await getReportSummary(selectedTeam);
      setSummary(freshSummary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Report generation failed."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function downloadFile(url, filename) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export request failed.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Export failed."
      );
    }
  }

  const selected = report?.selectedTeam || {};
  const causal = report?.causalAnalysis || {};
  const whatIf = report?.whatIf || {};
  const privacy = report?.privacy || {};
  const signals = report?.signals || [];
  const issues = report?.issuesDetected || [];
  const experiments = report?.experiments || [];
  const recommendations =
    report?.responsePlan?.recommendations || [];
  const changes =
    report?.changeAnalysis?.recentVsEarly || {};
  const limitations = report?.limitations || [];

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <section className="report-live-page">
          <div className="report-empty">
            <RefreshCw size={30} />
            <strong>Preparing live workspace report...</strong>
            <p>
              LUMEN is assembling the current team conditions,
              detected issues, causal analysis, What-If scenario,
              experiments and privacy controls.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>

      <section className="report-live-page">
        <header className="report-head">
          <div>
            <div className="report-eyebrow">
              DECISION DOCUMENTS
            </div>

            <h1 className="report-title">Reports</h1>

            <p className="report-subtitle">
              A live, structured investigation of workplace
              conditions from observed change to causal reasoning,
              counterfactual simulation, intervention and measurement.
            </p>
          </div>

          <div className="report-actions">
            <button
              className="report-btn"
              onClick={() =>
                downloadFile(
                  getExportJsonUrl(selectedTeam),
                  `lumen-${selectedTeam}-report.json`
                )
              }
            >
              <FileJson size={15} />
              Export JSON
            </button>

            <button
              className="report-btn"
              onClick={() =>
                downloadFile(
                  getExportCsvUrl(selectedTeam),
                  `lumen-${selectedTeam}-report.csv`
                )
              }
            >
              <Download size={15} />
              Export CSV
            </button>

            <button
              className="report-btn"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Save PDF
            </button>

            <button
              className="report-btn primary"
              disabled={generating}
              onClick={regenerate}
            >
              <RefreshCw size={15} />
              {generating ? "Generating..." : "Regenerate"}
            </button>
          </div>
        </header>

        {error && (
          <div className="report-callout" style={{ marginBottom: 16 }}>
            <CheckCircle2 size={17} />
            <div>{error}</div>
          </div>
        )}

        <div className="report-toolbar">
          <select
            className="report-select"
            value={selectedTeam}
            onChange={(event) =>
              setSelectedTeam(event.target.value)
            }
          >
            {teams.length ? (
              teams.map((team) => (
                <option key={team.id} value={team.id}>
                  Focus: {team.name} ({team.department})
                </option>
              ))
            ) : (
              <option value="atlas">Focus: Atlas</option>
            )}
          </select>

          <div className="report-live-state">
            <span className="report-live-dot" />
            <span>
              Live snapshot
              {report?.generatedAt
                ? ` · ${new Date(
                    report.generatedAt
                  ).toLocaleString()}`
                : ""}
            </span>
          </div>
        </div>

        {report ? (
          <article className="report-paper">
            <div className="report-paper-top">
              <div className="report-brand">
                <div className="report-mark">L</div>
                <div>
                  <strong>LUMEN</strong>
                  <span>
                    Workplace Causal Intelligence
                  </span>
                </div>
              </div>

              <div className="report-meta">
                <div>
                  <strong>{report.title}</strong>
                </div>
                <div>{report.period}</div>
                <div>
                  Generated:{" "}
                  {new Date(report.generatedAt).toLocaleString()}
                </div>
                <div>
                  Data mode:{" "}
                  <strong>{report.dataMode}</strong>
                </div>
              </div>
            </div>

            <div className="report-body">
              <section className="report-hero">
                <div className="report-kicker">
                  EXECUTIVE INTERPRETATION
                </div>

                <h2>
                  {selected.name || selectedTeamName} workplace
                  conditions
                </h2>

                <p>
                  This report examines team-level communication,
                  meeting load, workload, recovery and after-hours
                  activity. LUMEN separates observed changes from
                  causal interpretation and keeps analysis at the
                  organizational-condition level.
                </p>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">01</div>
                  <div>
                    <h3>Live workspace snapshot</h3>
                    <p>
                      Current state of the LUMEN analytical workspace.
                    </p>
                  </div>
                </div>

                <div className="report-metrics">
                  <div className="report-metric">
                    <span>Teams analyzed</span>
                    <strong>
                      {report.summary?.teamsAnalyzed ??
                        summary?.teams ??
                        0}
                    </strong>
                    <small>Aggregated units</small>
                  </div>

                  <div className="report-metric">
                    <span>Signals detected</span>
                    <strong>
                      {report.summary?.signalsDetected ??
                        summary?.signals ??
                        0}
                    </strong>
                    <small>Current registry</small>
                  </div>

                  <div className="report-metric">
                    <span>Attention teams</span>
                    <strong>
                      {report.summary
                        ?.teamsRequiringAttention ?? 0}
                    </strong>
                    <small>Non-stable conditions</small>
                  </div>

                  <div className="report-metric">
                    <span>Experiments tracked</span>
                    <strong>
                      {report.summary
                        ?.experimentsTracked ??
                        summary?.experiments ??
                        0}
                    </strong>
                    <small>Persistent registry</small>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">02</div>
                  <div>
                    <h3>Selected team conditions</h3>
                    <p>
                      Team-level indicators only; no individual
                      employee scores are represented.
                    </p>
                  </div>
                </div>

                <div className="report-metrics">
                  <div className="report-metric">
                    <span>Communication</span>
                    <strong>
                      {selected.communication ?? "—"}%
                    </strong>
                  </div>

                  <div className="report-metric">
                    <span>Meeting load</span>
                    <strong>
                      {selected.meetings ?? "—"}%
                    </strong>
                  </div>

                  <div className="report-metric">
                    <span>Workload</span>
                    <strong>
                      {selected.workload ?? "—"}%
                    </strong>
                  </div>

                  <div className="report-metric">
                    <span>Recovery</span>
                    <strong>
                      {selected.recovery ?? "—"}%
                    </strong>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">03</div>
                  <div>
                    <h3>What changed?</h3>
                    <p>
                      Recent 7-day averages compared with the early
                      7-day observation window.
                    </p>
                  </div>
                </div>

                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Condition</th>
                      <th>Early average</th>
                      <th>Recent average</th>
                      <th>Change</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(changes).map(
                      ([key, item]) => (
                        <tr key={key}>
                          <td>
                            <strong>{item.label}</strong>
                          </td>
                          <td>{item.earlyAverage}</td>
                          <td>{item.recentAverage}</td>
                          <td>
                            {item.delta > 0 ? (
                              <TrendingUp size={13} />
                            ) : item.delta < 0 ? (
                              <TrendingDown size={13} />
                            ) : null}{" "}
                            {item.delta > 0 ? "+" : ""}
                            {item.delta}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">04</div>
                  <div>
                    <h3>Issues detected</h3>
                    <p>
                      Workplace-condition signals requiring human
                      review, not diagnoses.
                    </p>
                  </div>
                </div>

                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Issue</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>

                  <tbody>
                    {issues.map((issue, index) => (
                      <tr key={`${issue.title}-${index}`}>
                        <td>{issue.type}</td>
                        <td>
                          <span
                            className={`report-pill ${String(
                              issue.severity
                            ).toLowerCase()}`}
                          >
                            {issue.severity}
                          </span>
                        </td>
                        <td>
                          <strong>{issue.title}</strong>
                        </td>
                        <td>{issue.evidence}</td>
                      </tr>
                    ))}

                    {!issues.length && (
                      <tr>
                        <td colSpan="4">
                          No additional issues were generated.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">05</div>
                  <div>
                    <h3>Active signal registry</h3>
                  </div>
                </div>

                <table className="report-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Team</th>
                      <th>Pattern</th>
                      <th>Metric</th>
                      <th>Change</th>
                      <th>Severity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {signals.map((signal) => (
                      <tr key={signal.id}>
                        <td><strong>{signal.id}</strong></td>
                        <td>{signal.team}</td>
                        <td>{signal.type}</td>
                        <td>{signal.metric}</td>
                        <td>
                          {signal.value > 0 ? "+" : ""}
                          {signal.value}%
                        </td>
                        <td>
                          <span
                            className={`report-pill ${String(
                              signal.severity
                            ).toLowerCase()}`}
                          >
                            {signal.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">06</div>
                  <div>
                    <h3>Causal investigation</h3>
                    <p>
                      Treatment, outcome, adjustment variables and
                      uncertainty are shown explicitly.
                    </p>
                  </div>
                </div>

                <div className="report-grid">
                  <div className="report-card">
                    <div className="report-card-label">
                      Treatment
                    </div>

                    <h4>{causal.treatment || "Meeting load"}</h4>

                    <p>
                      Actionable workplace condition under the
                      causal model.
                    </p>

                    <div
                      className={`report-number ${
                        Number(causal.estimatedEffect) < 0
                          ? "negative"
                          : "positive"
                      }`}
                    >
                      {causal.estimatedEffect ?? "—"}
                    </div>

                    <p>Estimated effect per treatment unit</p>
                  </div>

                  <div className="report-card">
                    <div className="report-card-label">
                      Outcome
                    </div>

                    <h4>{causal.outcome || "Recovery"}</h4>

                    <p>
                      Team-level outcome used by the causal
                      demonstration.
                    </p>

                    <div className="report-number">
                      {causal.confidenceInterval
                        ? `[${causal.confidenceInterval[0]}, ${causal.confidenceInterval[1]}]`
                        : "—"}
                    </div>

                    <p>95% confidence interval</p>
                  </div>
                </div>

                <div
                  className="report-card"
                  style={{ marginTop: 12 }}
                >
                  <div className="report-card-label">
                    Adjustment variables
                  </div>

                  <p style={{ marginTop: 10 }}>
                    {(causal.adjustmentVariables || []).join(
                      "  ·  "
                    ) || "None"}
                  </p>

                  <p style={{ marginTop: 10 }}>
                    Sample size:{" "}
                    <strong>{causal.sampleSize ?? "—"}</strong>
                  </p>

                  <p style={{ marginTop: 6 }}>
                    Method:{" "}
                    <strong>{causal.method ?? "—"}</strong>
                  </p>
                </div>

                <div className="report-callout">
                  <ShieldCheck size={17} />
                  <div>
                    The causal estimate is a synthetic demonstration
                    dependent on the stated assumptions. It is not
                    evidence of individual burnout or proof of
                    causation in a real organization.
                  </div>
                </div>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">07</div>
                  <div>
                    <h3>What-If counterfactual</h3>
                    <p>
                      Explore a workplace intervention before testing it.
                    </p>
                  </div>
                </div>

                <div className="report-grid">
                  <div className="report-card">
                    <div className="report-card-label">
                      Baseline
                    </div>

                    <h4>
                      {whatIf.baselineMeetingHours ?? "—"} h/week
                    </h4>

                    <p>Current modeled meeting load</p>

                    <div className="report-number">
                      {whatIf.baselineRecovery ?? "—"}%
                    </div>

                    <p>Recovery baseline</p>
                  </div>

                  <div className="report-card">
                    <div className="report-card-label">
                      Scenario
                    </div>

                    <h4>
                      {whatIf.proposedMeetingHours ?? "—"} h/week
                    </h4>

                    <p>Proposed modeled intervention</p>

                    <div className="report-number positive">
                      {whatIf.estimatedRecovery ?? "—"}%
                    </div>

                    <p>
                      Estimated change:{" "}
                      {whatIf.delta > 0 ? "+" : ""}
                      {whatIf.delta ?? "—"} points
                    </p>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">08</div>
                  <div>
                    <h3>How LUMEN responds</h3>
                    <p>
                      Detect, understand, simulate, test and measure.
                    </p>
                  </div>
                </div>

                <div className="report-plan">
                  {[
                    ["01", "Detect", "Identify the condition shift."],
                    [
                      "02",
                      "Understand",
                      "Test the causal hypothesis and confounders.",
                    ],
                    [
                      "03",
                      "Simulate",
                      "Explore the intervention in What-If.",
                    ],
                    [
                      "04",
                      "Measure",
                      "Run a controlled experiment and compare outcomes.",
                    ],
                  ].map(([number, title, text]) => (
                    <div
                      className="report-plan-item"
                      key={number}
                    >
                      <b>{number}</b>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {recommendations.map((item) => (
                  <div
                    className="report-card"
                    style={{ marginTop: 9 }}
                    key={item.action}
                  >
                    <Target size={16} />
                    <h4>{item.action}</h4>
                    <p>{item.reason}</p>
                    <p style={{ marginTop: 6 }}>
                      <strong>Measure:</strong> {item.measure}
                    </p>
                  </div>
                ))}
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">09</div>
                  <div>
                    <h3>Experiment registry</h3>
                  </div>
                </div>

                <table className="report-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Experiment</th>
                      <th>Team</th>
                      <th>Baseline</th>
                      <th>Target</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {experiments.map((experiment) => (
                      <tr key={experiment.id}>
                        <td>{experiment.id}</td>
                        <td>
                          <strong>{experiment.name}</strong>
                        </td>
                        <td>{experiment.team}</td>
                        <td>{experiment.baseline}</td>
                        <td>{experiment.target}</td>
                        <td>{experiment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">10</div>
                  <div>
                    <h3>Privacy & governance</h3>
                  </div>
                </div>

                <div className="report-grid">
                  <div className="report-card">
                    <div className="report-card-label">
                      Architectural boundary
                    </div>
                    <h4>Team-level only</h4>
                    <p>
                      Raw messages stored:{" "}
                      <strong>
                        {privacy.rawMessagesStored ? "Yes" : "No"}
                      </strong>
                    </p>
                    <p style={{ marginTop: 7 }}>
                      Individual burnout scores:{" "}
                      <strong>
                        {privacy.individualBurnoutScores
                          ? "Yes"
                          : "No"}
                      </strong>
                    </p>
                    <p style={{ marginTop: 7 }}>
                      Individual ranking:{" "}
                      <strong>
                        {privacy.individualRanking
                          ? "Yes"
                          : "No"}
                      </strong>
                    </p>
                  </div>

                  <div className="report-card">
                    <div className="report-card-label">
                      Aggregation threshold
                    </div>
                    <div className="report-number">
                      {privacy.minimumTeamSize ?? "—"}
                    </div>
                    <p>
                      Teams below this threshold have detailed
                      telemetry suppressed.
                    </p>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <div className="report-section-title">
                  <div className="report-section-number">11</div>
                  <div>
                    <h3>Interpretation boundaries</h3>
                  </div>
                </div>

                <div className="report-limitations">
                  {limitations.map((item) => (
                    <div
                      className="report-limitation"
                      key={item}
                    >
                      <CheckCircle2 size={15} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="report-section">
                <div className="report-callout">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>
                      LUMEN analyzes workplace conditions, not people.
                    </strong>{" "}
                    This report is organizational decision support.
                    It does not diagnose mental health, assign
                    individual burnout risk, or make employment
                    decisions.
                  </div>
                </div>
              </section>
            </div>
          </article>
        ) : (
          <div className="report-paper">
            <div className="report-empty">
              <FileText size={32} />
              <strong>Report unavailable</strong>
              <p>
                Generate a fresh report from the current LUMEN
                workspace.
              </p>
              <button
                className="report-btn primary"
                onClick={regenerate}
                style={{ marginTop: 14 }}
              >
                Generate report
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
