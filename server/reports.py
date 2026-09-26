import csv
import io
import json
from typing import Any, Dict
from server.causal import get_causal_analysis
from server.data import INITIAL_SIGNALS, INITIAL_TEAMS
from server.experiments import get_all_experiments
from server.privacy import get_privacy_metadata, sanitize_teams_list
from server.settings import load_settings
from server.simulator import simulate_counterfactual


def build_live_report(team_id: str = "atlas") -> Dict[str, Any]:
    """
    Builds a complete, multi-section decision document from current application state.
    """
    settings = load_settings()
    sanitized_teams = sanitize_teams_list(INITIAL_TEAMS)
    experiments = get_all_experiments()
    privacy = get_privacy_metadata()
    causal = get_causal_analysis(team_name="Atlas")
    what_if = simulate_counterfactual(team_id="atlas", proposed_meeting_hours=14.0)

    # Calculate workspace averages
    valid_teams = [t for t in sanitized_teams if not t.is_suppressed]
    avg_comm = round(sum(t.communication for t in valid_teams) / len(valid_teams), 1) if valid_teams else 0
    avg_meet = round(sum(t.meetings for t in valid_teams) / len(valid_teams), 1) if valid_teams else 0
    avg_rec = round(sum(t.recovery for t in valid_teams) / len(valid_teams), 1) if valid_teams else 0
    avg_work = round(sum(t.workload for t in valid_teams) / len(valid_teams), 1) if valid_teams else 0

    return {
        "title": "LUMEN Workplace Causal Intelligence Report",
        "period": "Rolling 30-Day Workplace Assessment (Synthetic Demonstration)",
        "generated_at": "2026-09-26T20:00:00Z",
        "workspace": settings.workspace_name,
        "executive_summary": (
            f"Analysis across {len(sanitized_teams)} workspace teams reveals a team-level recovery disruption "
            f"concentrated in Atlas (Recovery at 58%, -14% vs 30-day baseline). Rather than attributing this to individual "
            f"burnout, causal regression adjustment identifies synchronous meeting concentration (18.4h/wk) as the "
            f"primary actionable condition. Counterfactual simulation indicates capping meeting load to 14.0h/wk "
            f"is estimated to restore recovery to 63.5% (95% CI: [62.8%, 64.2%]). Experiment EXP-001 is actively monitoring "
            f"intervention adherence."
        ),
        "workspace_metrics": {
            "teams_analyzed": len(sanitized_teams),
            "active_signals": len(INITIAL_SIGNALS),
            "average_communication": avg_comm,
            "average_meetings": avg_meet,
            "average_recovery": avg_rec,
            "average_workload": avg_work,
            "privacy_threshold": settings.minimum_team_size,
        },
        "top_signals": INITIAL_SIGNALS,
        "selected_team": {
            "team_id": "atlas",
            "name": "Atlas",
            "department": "Product Engineering",
            "members": 18,
            "signal": "Recovery disruption",
            "baseline_recovery": 58.0,
            "baseline_meetings": 18.4,
        },
        "causal_intelligence": {
            "treatment": causal.treatment,
            "outcome": causal.outcome,
            "controls": causal.control_variables,
            "estimated_effect": causal.estimated_effect,
            "ci_95": [causal.ci_lower, causal.ci_upper],
            "unadjusted_correlation": causal.unadjusted_effect,
            "r_squared": causal.r_squared,
            "interpretation": causal.interpretation,
            "assumptions": causal.assumptions,
            "sensitivity": causal.sensitivity,
        },
        "counterfactual_scenario": {
            "baseline_hours": what_if.baseline_treatment,
            "scenario_hours": what_if.scenario_treatment,
            "baseline_recovery": what_if.baseline_outcome,
            "estimated_recovery": what_if.estimated_outcome,
            "difference": what_if.difference,
            "ci_bounds": [what_if.ci_lower, what_if.ci_upper],
            "disclaimer": what_if.disclaimer,
        },
        "active_experiments": [exp.model_dump() for exp in experiments],
        "privacy_guarantee": {
            "privacy_mode": privacy.privacy_mode,
            "raw_messages_stored": False,
            "individual_burnout_scores": False,
            "individual_ranking": False,
            "minimum_team_size_enforced": privacy.minimum_team_size,
            "statement": (
                "LUMEN architectural boundaries guarantee that no raw private messages, individual psychological scores, "
                "or employee rankings enter the analytical pipeline. Groups below the configured minimum size are suppressed."
            ),
        },
        "limitations": [
            "Data is generated from a synthetic reproducible causal DAG (seed=42) for demonstration purposes.",
            "Real-world enterprise deployment requires organizational consent, data governance, and empirical calibration.",
            "Causal unconfoundedness assumes no unmeasured confounders beyond Workload and Project Pressure.",
            "Model outputs are decision support tools for human leadership, not autonomous employment actions.",
        ],
        "disclaimer": "SYNTHETIC CAUSAL DEMONSTRATION — For organizational evaluation purposes only.",
    }


def generate_report_json(team_id: str = "atlas") -> str:
    report_dict = build_live_report(team_id)
    return json.dumps(report_dict, indent=2)


def generate_report_csv(team_id: str = "atlas") -> str:
    """
    Generates a consolidated CSV file containing team aggregates and experiments.
    """
    report = build_live_report(team_id)
    output = io.StringIO()
    writer = csv.writer(output)

    # Section 1: Metadata
    writer.writerow(["# LUMEN Workplace Intelligence Export"])
    writer.writerow(["Title", report["title"]])
    writer.writerow(["Period", report["period"]])
    writer.writerow(["Generated At", report["generated_at"]])
    writer.writerow(["Privacy Mode", report["privacy_guarantee"]["privacy_mode"]])
    writer.writerow([])

    # Section 2: Teams
    writer.writerow(["# TEAMS SUMMARY"])
    writer.writerow([
        "Team ID", "Team Name", "Department", "Members",
        "Communication", "Meetings", "Workload", "Recovery",
        "After Hours", "Signal", "Severity", "Suppressed",
    ])
    for team in sanitize_teams_list(INITIAL_TEAMS):
        writer.writerow([
            team.id,
            team.name,
            team.department,
            team.members,
            team.communication if not team.is_suppressed else "SUPPRESSED",
            team.meetings if not team.is_suppressed else "SUPPRESSED",
            team.workload if not team.is_suppressed else "SUPPRESSED",
            team.recovery if not team.is_suppressed else "SUPPRESSED",
            team.after_hours if not team.is_suppressed else "SUPPRESSED",
            team.signal,
            team.severity,
            team.is_suppressed,
        ])
    writer.writerow([])

    # Section 3: Signals
    writer.writerow(["# ACTIVE SIGNALS"])
    writer.writerow(["Signal ID", "Team", "Pattern", "Metric", "Magnitude", "Severity", "Hypothesis"])
    for sig in INITIAL_SIGNALS:
        writer.writerow([
            sig["id"],
            sig["team"],
            sig["pattern"],
            sig["metric"],
            f"{sig['magnitude']}%",
            sig["severity"],
            sig["hypothesis"],
        ])
    writer.writerow([])

    # Section 4: Experiments
    writer.writerow(["# CONTROLLED EXPERIMENTS"])
    writer.writerow(["ID", "Name", "Team", "Hypothesis", "Baseline", "Target", "Status", "Progress"])
    for exp in get_all_experiments():
        writer.writerow([
            exp.id,
            exp.name,
            exp.team,
            exp.hypothesis,
            exp.baseline,
            exp.target,
            exp.status,
            f"{exp.progress}%",
        ])

    return output.getvalue()
