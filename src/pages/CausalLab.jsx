import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  GitBranch,
  Play,
  RefreshCw,
  ShieldCheck,
  Info,
  ArrowRight,
} from "lucide-react";

import {
  getCausalAnalysis,
  analyzeCausal,
  getTeams,
} from "../lib/api";

export default function CausalLab() {
  const [teams, setTeams] =
    useState([]);

  const [teamId, setTeamId] =
    useState("atlas");

  const [causal, setCausal] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          teamsData,
          causalData,
        ] = await Promise.all([
          getTeams(),
          getCausalAnalysis(
            "atlas"
          ),
        ]);

        setTeams(
          teamsData?.teams || []
        );

        setCausal(
          causalData
        );
      } catch (err) {
        console.error(
          "Causal Lab load error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load causal analysis."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function loadTeam(
    nextTeam
  ) {
    setTeamId(nextTeam);
    setLoading(true);
    setError("");

    try {
      const data =
        await getCausalAnalysis(
          nextTeam
        );

      setCausal(data);
    } catch (err) {
      console.error(
        "Causal analysis error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load causal analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setError("");

    try {
      const data =
        await analyzeCausal(
          teamId,
          [
            "Workload",
            "Project pressure",
          ]
        );

      setCausal(data);
    } catch (err) {
      console.error(
        "Causal analysis failed:",
        err
      );

      setError(
        err?.message ||
          "Causal analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const effect =
    Number(
      causal?.estimatedEffect ??
        causal?.estimated_effect
    );

  const standardError =
    Number(
      causal?.standardError ??
        causal?.standard_error
    );

  const uncertainty =
    Number(
      causal?.uncertainty ?? 0
    );

  const confidenceInterval =
    Array.isArray(
      causal?.confidenceInterval
    )
      ? causal.confidenceInterval
      : [
          causal?.ci_lower,
          causal?.ci_upper,
        ];

  const ciLower =
    Number(
      confidenceInterval?.[0]
    );

  const ciUpper =
    Number(
      confidenceInterval?.[1]
    );

  const sampleSize =
    Number(
      causal?.sampleSize ??
        causal?.sample_size
    );

  const selectedTeam =
    useMemo(
      () =>
        teams.find(
          (team) =>
            team.id === teamId
        ),
      [teams, teamId]
    );

  return (
    <section
      className="causal-page"
      aria-label="LUMEN Causal Lab"
    >
      <div className="page-header">
        <div>
          <div className="eyebrow">
            CAUSAL INTELLIGENCE
          </div>

          <h1>
            Causal Lab
          </h1>

          <p>
            Test whether a workplace
            condition may be contributing
            to an observed team-level
            outcome instead of treating
            correlation as causation.
          </p>
        </div>

        <div className="overview-status">
          <span className="status-dot is-live" />

          <span>
            Synthetic causal model
          </span>
        </div>
      </div>

      <div className="overview-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              ANALYSIS CONFIGURATION
            </span>

            <h2>
              Define the causal question
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: "16px",
          }}
        >
          <div className="metric-card">
            <span className="metric-label">
              Team
            </span>

            <select
              value={teamId}
              onChange={(event) =>
                loadTeam(
                  event.target.value
                )
              }
              style={{
                marginTop: "10px",
                width: "100%",
                border:
                  "1px solid #d9dde5",
                borderRadius: "10px",
                padding:
                  "10px 12px",
                background:
                  "#ffffff",
                fontSize: "14px",
              }}
            >
              {teams.map(
                (team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="metric-card">
            <span className="metric-label">
              Treatment
            </span>

            <strong className="metric-value">
              {causal?.treatment ||
                "Meeting load"}
            </strong>
          </div>

          <div className="metric-card">
            <span className="metric-label">
              Outcome
            </span>

            <strong className="metric-value">
              {causal?.outcome ||
                "Recovery"}
            </strong>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="overview-panel"
          style={{
            border:
              "1px solid #fecdca",
            background:
              "#fff8f7",
          }}
        >
          <strong
            style={{
              color: "#b42318",
            }}
          >
            {error}
          </strong>
        </div>
      )}

      <div className="overview-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              CAUSAL GRAPH
            </span>

            <h2>
              Hypothesized relationship
            </h2>
          </div>

          <GitBranch
            size={20}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 90px 1fr",
            alignItems: "center",
            gap: "20px",
            minHeight: "180px",
          }}
        >
          <div
            className="flow-node"
            style={{
              padding: "28px",
              border:
                "1px solid #dce1e8",
              borderRadius: "18px",
              background:
                "#ffffff",
            }}
          >
            <small>
              TREATMENT
            </small>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "8px",
                fontSize:
                  "20px",
              }}
            >
              Meeting load
            </strong>

            <span
              style={{
                display:
                  "block",
                marginTop:
                  "8px",
                color:
                  "#667085",
              }}
            >
              Synchronous meeting
              density
            </span>
          </div>

          <div
            style={{
              textAlign:
                "center",
              fontSize:
                "30px",
              color:
                "#667085",
            }}
          >
            →
          </div>

          <div
            className="flow-node"
            style={{
              padding: "28px",
              border:
                "1px solid #dce1e8",
              borderRadius: "18px",
              background:
                "#ffffff",
            }}
          >
            <small>
              OUTCOME
            </small>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "8px",
                fontSize:
                  "20px",
              }}
            >
              Recovery
            </strong>

            <span
              style={{
                display:
                  "block",
                marginTop:
                  "8px",
                color:
                  "#667085",
              }}
            >
              Team recovery
              capacity
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop:
              "20px",
            padding:
              "14px 16px",
            borderRadius:
              "12px",
            background:
              "#f7f8fa",
            color:
              "#667085",
            fontSize:
              "13px",
          }}
        >
          <strong>
            Adjustment variables:
          </strong>{" "}
          Workload and Project
          pressure
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">
            Estimated Effect
          </span>

          <strong className="metric-value">
            {Number.isFinite(
              effect
            )
              ? `${
                  effect > 0
                    ? "+"
                    : ""
                }${effect.toFixed(
                  4
                )}`
              : "—"}
          </strong>

          <span className="metric-meta">
            Recovery points per
            additional meeting hour
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            95% Confidence Interval
          </span>

          <strong
            className="metric-value"
            style={{
              fontSize:
                "22px",
            }}
          >
            {Number.isFinite(
              ciLower
            ) &&
            Number.isFinite(
              ciUpper
            )
              ? `[${ciLower.toFixed(
                  4
                )}, ${ciUpper.toFixed(
                  4
                )}]`
              : "—"}
          </strong>

          <span className="metric-meta">
            Estimated uncertainty
            range
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Standard Error
          </span>

          <strong className="metric-value">
            {Number.isFinite(
              standardError
            )
              ? standardError.toFixed(
                  4
                )
              : "—"}
          </strong>

          <span className="metric-meta">
            Regression estimate
            uncertainty
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">
            Sample Size
          </span>

          <strong className="metric-value">
            {Number.isFinite(
              sampleSize
            )
              ? sampleSize
              : "—"}
          </strong>

          <span className="metric-meta">
            Synthetic observations
          </span>
        </div>
      </div>

      <div className="overview-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              MODEL OUTPUT
            </span>

            <h2>
              What the model is saying
            </h2>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={
              runAnalysis
            }
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <RefreshCw
                  size={15}
                  className="spin"
                />
                Running...
              </>
            ) : (
              <>
                <Play
                  size={15}
                />
                Run analysis
              </>
            )}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems:
                "flex-start",
            }}
          >
            <Info
              size={18}
            />

            <p
              style={{
                margin: 0,
                color:
                  "#475467",
                lineHeight:
                  1.7,
              }}
            >
              For{" "}
              <strong>
                {selectedTeam?.name ||
                  "Atlas"}
              </strong>
              , the model estimates
              the relationship between
              meeting load and recovery
              after adjustment for
              workload and project
              pressure.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems:
                "flex-start",
            }}
          >
            <ShieldCheck
              size={18}
            />

            <p
              style={{
                margin: 0,
                color:
                  "#475467",
                lineHeight:
                  1.7,
              }}
            >
              This is a synthetic
              demonstration. The
              estimate does not diagnose
              individuals and does not
              prove that changing meeting
              load will produce the
              estimated outcome in a real
              organization.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}