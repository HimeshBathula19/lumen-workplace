import csv
import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from server.data import (
    INITIAL_SIGNALS,
    INITIAL_TEAMS,
    generate_synthetic_causal_dataset,
    generate_team_timeseries,
    get_signal_by_id,
    get_team_by_id,
)

# ============================================================
# LUMEN API
# ============================================================

app = FastAPI(
    title="LUMEN API",
    description="Workplace Causal Intelligence",
    version="1.0.0",
)

FRONTEND_URL = os.getenv("LUMEN_FRONTEND_URL", "").strip().rstrip("/")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
]

if FRONTEND_URL:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STORAGE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"

STORAGE_DIR.mkdir(exist_ok=True)

EXPERIMENTS_FILE = STORAGE_DIR / "experiments.json"
SETTINGS_FILE = STORAGE_DIR / "settings.json"


def read_json(path: Path, default):
    if not path.exists():
        return default

    try:
        return json.loads(
            path.read_text(encoding="utf-8")
        )
    except (OSError, json.JSONDecodeError):
        return default


def write_json(path: Path, value) -> None:
    path.write_text(
        json.dumps(value, indent=2),
        encoding="utf-8",
    )


# ============================================================
# DEFAULT SETTINGS
# ============================================================

DEFAULT_SETTINGS = {
    "workspaceName": "LUMEN Workspace",
    "timezone": "Asia/Kolkata",
    "signalAlerts": True,
    "weeklyReports": True,
    "syntheticMode": True,
    "teamAggregation": True,
    "minimumTeamSize": 5,
    "autoRefreshSeconds": 10,
}


def get_settings_data() -> dict:
    stored = read_json(
        SETTINGS_FILE,
        {},
    )

    return {
        **DEFAULT_SETTINGS,
        **stored,
    }


# ============================================================
# SYNTHETIC CAUSAL DATA
# ============================================================

CAUSAL_DATA = generate_synthetic_causal_dataset(
    n_samples=320,
    seed=42,
)


# ============================================================
# HELPERS
# ============================================================

def now_iso() -> str:
    return datetime.now(
        timezone.utc
    ).isoformat()


def find_team(team_id: str) -> dict:
    team = get_team_by_id(team_id)

    if team is None:
        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    return team


def privacy_allows(team: dict) -> bool:
    settings = get_settings_data()

    minimum_size = int(
        settings["minimumTeamSize"]
    )

    return team["members"] >= minimum_size


def public_team(team: dict) -> dict:
    if privacy_allows(team):
        return dict(team)

    return {
        "id": team["id"],
        "name": team["name"],
        "department": team["department"],
        "members": team["members"],
        "privacySuppressed": True,
        "message": (
            "Detailed metrics suppressed "
            "for privacy."
        ),
    }


# ============================================================
# CAUSAL ESTIMATION
# ============================================================

def estimate_effect(
    team_id: str | None = None,
) -> dict:

    data = CAUSAL_DATA

    if team_id:
        data = data[
            data["team_id"] == team_id
        ]

    if len(data) < 20:
        raise HTTPException(
            status_code=400,
            detail=(
                "Not enough observations "
                "for causal demonstration."
            ),
        )

    treatment = data[
        "meeting_hours"
    ].to_numpy(dtype=float)

    workload = data[
        "workload"
    ].to_numpy(dtype=float)

    pressure = data[
        "project_pressure"
    ].to_numpy(dtype=float)

    outcome = data[
        "recovery"
    ].to_numpy(dtype=float)

    design = np.column_stack(
        [
            np.ones(len(data)),
            treatment,
            workload,
            pressure,
        ]
    )

    coefficients, _, _, _ = np.linalg.lstsq(
        design,
        outcome,
        rcond=None,
    )

    predictions = design @ coefficients

    residuals = outcome - predictions

    n = len(outcome)
    parameters = design.shape[1]

    degrees_of_freedom = max(
        n - parameters,
        1,
    )

    residual_variance = (
        np.sum(residuals**2)
        / degrees_of_freedom
    )

    covariance = (
        residual_variance
        * np.linalg.pinv(
            design.T @ design
        )
    )

    standard_error = float(
        np.sqrt(
            max(
                covariance[1, 1],
                0,
            )
        )
    )

    effect = float(
        coefficients[1]
    )

    margin = 1.96 * standard_error

    lower = effect - margin
    upper = effect + margin

    return {
        "team": (
            find_team(team_id)["name"]
            if team_id
            else "Workspace"
        ),
        "teamId": team_id,
        "treatment": "Meeting load",
        "treatmentVariable": "meeting_hours",
        "outcome": "Recovery",
        "outcomeVariable": "recovery",
        "estimatedEffect": round(
            effect,
            4,
        ),
        "standardError": round(
            standard_error,
            4,
        ),
        "uncertainty": round(
            margin,
            4,
        ),
        "confidenceInterval": [
            round(lower, 4),
            round(upper, 4),
        ],
        "sampleSize": n,
        "adjustmentVariables": [
            "Workload",
            "Project pressure",
        ],
        "assumptions": [
            "Treatment precedes outcome",
            "Workload is adequately controlled",
            "Project pressure is adequately controlled",
            "Analysis uses team-level aggregation",
            "No major unobserved confounder is assumed",
        ],
        "method": (
            "Synthetic regression adjustment"
        ),
        "status": (
            "Synthetic causal demonstration"
        ),
    }


# ============================================================
# WHAT-IF
# ============================================================

def simulate_counterfactual(
    team_id: str,
    meeting_hours: float,
) -> dict:

    team = find_team(team_id)

    if not privacy_allows(team):
        return {
            "team": team["name"],
            "teamId": team_id,
            "privacySuppressed": True,
            "message": (
                "Counterfactual detail "
                "suppressed for privacy."
            ),
        }

    data = CAUSAL_DATA[
        CAUSAL_DATA["team_id"] == team_id
    ]

    if data.empty:
        raise HTTPException(
            status_code=404,
            detail=(
                "No causal observations "
                "available for this team."
            ),
        )

    treatment = data[
        "meeting_hours"
    ].to_numpy(dtype=float)

    workload = data[
        "workload"
    ].to_numpy(dtype=float)

    pressure = data[
        "project_pressure"
    ].to_numpy(dtype=float)

    outcome = data[
        "recovery"
    ].to_numpy(dtype=float)

    design = np.column_stack(
        [
            np.ones(len(data)),
            treatment,
            workload,
            pressure,
        ]
    )

    coefficients, _, _, _ = np.linalg.lstsq(
        design,
        outcome,
        rcond=None,
    )

    mean_workload = float(
        np.mean(workload)
    )

    mean_pressure = float(
        np.mean(pressure)
    )

    baseline_meeting_hours = float(
        np.mean(treatment)
    )

    baseline_recovery = float(
        coefficients[0]
        + coefficients[1]
        * baseline_meeting_hours
        + coefficients[2]
        * mean_workload
        + coefficients[3]
        * mean_pressure
    )

    scenario_recovery = float(
        coefficients[0]
        + coefficients[1]
        * meeting_hours
        + coefficients[2]
        * mean_workload
        + coefficients[3]
        * mean_pressure
    )

    return {
        "team": team["name"],
        "teamId": team_id,
        "baselineMeetingHours": round(
            baseline_meeting_hours,
            2,
        ),
        "proposedMeetingHours": round(
            float(meeting_hours),
            2,
        ),
        "baselineRecovery": round(
            float(
                np.clip(
                    baseline_recovery,
                    0,
                    100,
                )
            ),
            2,
        ),
        "estimatedRecovery": round(
            float(
                np.clip(
                    scenario_recovery,
                    0,
                    100,
                )
            ),
            2,
        ),
        "delta": round(
            scenario_recovery
            - baseline_recovery,
            2,
        ),
        "model": {
            "method": (
                "Synthetic regression "
                "counterfactual"
            ),
            "adjustmentVariables": [
                "Workload",
                "Project pressure",
            ],
        },
        "status": (
            "Synthetic counterfactual demonstration"
        ),
    }


# ============================================================
# EXPERIMENT MODELS
# ============================================================

class ExperimentCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=120,
    )
    team: str = "Unassigned"
    teamId: str | None = None
    hypothesis: str = ""
    intervention: str = (
        "Define intervention"
    )
    baseline: str = "Ã¢â‚¬â€"
    target: str = "Ã¢â‚¬â€"
    observationWindow: str = "14 days"
    primaryOutcome: str = "Recovery"
    notes: str = ""


class ExperimentUpdate(BaseModel):
    name: str | None = None
    team: str | None = None
    teamId: str | None = None
    hypothesis: str | None = None
    intervention: str | None = None
    baseline: str | None = None
    target: str | None = None
    observationWindow: str | None = None
    primaryOutcome: str | None = None
    notes: str | None = None
    status: str | None = None
    progress: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )


# ============================================================
# EXPERIMENT STORAGE
# ============================================================

def default_experiments() -> list[dict]:
    return [
        {
            "id": "EXP-001",
            "name": "Meeting Load Reduction",
            "team": "Atlas",
            "teamId": "atlas",
            "hypothesis": (
                "Reducing meeting load may "
                "improve team recovery."
            ),
            "intervention": (
                "Reduce weekly meeting hours"
            ),
            "baseline": "18.4h",
            "target": "14.0h",
            "observationWindow": "28 days",
            "primaryOutcome": "Recovery",
            "status": "Running",
            "progress": 68,
            "notes": "",
            "createdAt": now_iso(),
        },
        {
            "id": "EXP-002",
            "name": "Focus Block Trial",
            "team": "Northstar",
            "teamId": "northstar",
            "hypothesis": (
                "Protected focus periods may "
                "reduce communication overload."
            ),
            "intervention": (
                "Protected morning focus window"
            ),
            "baseline": "31%",
            "target": "20%",
            "observationWindow": "21 days",
            "primaryOutcome": "Communication",
            "status": "Planned",
            "progress": 0,
            "notes": "",
            "createdAt": now_iso(),
        },
        {
            "id": "EXP-003",
            "name": "Recovery Window Pilot",
            "team": "Vector",
            "teamId": "vector",
            "hypothesis": (
                "Reducing after-hours "
                "communication may support recovery."
            ),
            "intervention": (
                "Reduce after-hours communication"
            ),
            "baseline": "22%",
            "target": "15%",
            "observationWindow": "28 days",
            "primaryOutcome": "Recovery",
            "status": "Completed",
            "progress": 100,
            "notes": "",
            "createdAt": now_iso(),
        },
    ]


def get_experiments() -> list[dict]:
    return read_json(
        EXPERIMENTS_FILE,
        default_experiments(),
    )


def save_experiments(
    experiments: list[dict],
) -> None:
    write_json(
        EXPERIMENTS_FILE,
        experiments,
    )


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "LUMEN API",
        "version": "1.0.0",
        "environment": "synthetic-demo",
        "timestamp": now_iso(),
    }


# ============================================================
# OVERVIEW
# ============================================================

@app.get("/api/overview")
def overview() -> dict:
    communication = round(
        float(
            np.mean(
                [
                    team["communication"]
                    for team in INITIAL_TEAMS
                ]
            )
        )
    )

    meetings = round(
        float(
            np.mean(
                [
                    team["meetings"]
                    for team in INITIAL_TEAMS
                ]
            )
        )
    )

    recovery = round(
        float(
            np.mean(
                [
                    team["recovery"]
                    for team in INITIAL_TEAMS
                ]
            )
        )
    )

    return {
        "communication": communication,
        "meetings": meetings,
        "recovery": recovery,
        "teams": len(INITIAL_TEAMS),
        "activeSignals": len(
            INITIAL_SIGNALS
        ),
        "synthetic": True,
        "dataUpdatedAt": now_iso(),
    }


# ============================================================
# TEAMS
# ============================================================

@app.get("/api/teams")
def teams() -> dict:
    return {
        "teams": [
            public_team(team)
            for team in INITIAL_TEAMS
        ],
        "count": len(INITIAL_TEAMS),
    }


@app.get("/api/teams/{team_id}")
def team_detail(
    team_id: str,
) -> dict:

    team = find_team(team_id)

    if not privacy_allows(team):
        return public_team(team)

    team_signals = [
        signal
        for signal in INITIAL_SIGNALS
        if signal["team_id"] == team_id
    ]

    timeseries = generate_team_timeseries(
        team_id,
        days=30,
        seed=42,
    )

    causal = estimate_effect(team_id)

    return {
        **team,
        "signals": team_signals,
        "timeseries": timeseries.to_dict(
            orient="records"
        ),
        "causal": causal,
        "privacySuppressed": False,
    }


# ============================================================
# SIGNALS
# ============================================================

@app.get("/api/signals")
def signals() -> dict:
    return {
        "signals": INITIAL_SIGNALS,
        "count": len(INITIAL_SIGNALS),
    }


@app.get("/api/signals/{signal_id}")
def signal_detail(
    signal_id: str,
) -> dict:

    signal = get_signal_by_id(
        signal_id
    )

    if signal is None:
        raise HTTPException(
            status_code=404,
            detail="Signal not found.",
        )

    return {
        **signal,
        "status": (
            "Observed team-level signal"
        ),
        "description": (
            f"{signal['team']} shows a "
            f"change in "
            f"{signal['metric'].lower()}."
        ),
        "interpretation": (
            "This is an observed team-level "
            "pattern and is not a diagnosis."
        ),
    }


# ============================================================
# CAUSAL
# ============================================================

@app.get("/api/causal")
def causal() -> dict:
    return estimate_effect(
        "atlas"
    )


@app.post("/api/causal/analyze")
def causal_analyze(
    payload: dict,
) -> dict:

    team_id = payload.get(
        "teamId",
        "atlas",
    )

    return estimate_effect(
        team_id
    )


# ============================================================
# WHAT-IF
# ============================================================

@app.get("/api/what-if")
def what_if() -> dict:
    team = find_team("atlas")

    baseline = float(
        team["meetings"]
    )

    return simulate_counterfactual(
        "atlas",
        baseline,
    )


@app.post("/api/what-if/simulate")
def what_if_simulate(
    payload: dict,
) -> dict:

    team_id = payload.get(
        "teamId",
        "atlas",
    )

    meeting_hours = float(
        payload.get(
            "meetingHours",
            14.0,
        )
    )

    meeting_hours = float(
        np.clip(
            meeting_hours,
            8.0,
            24.0,
        )
    )

    return simulate_counterfactual(
        team_id,
        meeting_hours,
    )


# ============================================================
# EXPERIMENTS
# ============================================================

@app.get("/api/experiments")
def experiments_list() -> dict:
    items = get_experiments()

    return {
        "experiments": items,
        "count": len(items),
    }


@app.post("/api/experiments")
def experiments_create(
    payload: ExperimentCreate,
) -> dict:

    items = get_experiments()

    next_number = len(items) + 1

    experiment = {
        "id": (
            f"EXP-{next_number:03d}"
        ),
        "name": payload.name,
        "team": payload.team,
        "teamId": payload.teamId,
        "hypothesis": payload.hypothesis,
        "intervention": payload.intervention,
        "baseline": payload.baseline,
        "target": payload.target,
        "observationWindow": (
            payload.observationWindow
        ),
        "primaryOutcome": (
            payload.primaryOutcome
        ),
        "status": "Draft",
        "progress": 0,
        "notes": payload.notes,
        "createdAt": now_iso(),
    }

    items.insert(
        0,
        experiment,
    )

    save_experiments(items)

    return experiment


@app.get(
    "/api/experiments/{experiment_id}"
)
def experiment_detail(
    experiment_id: str,
) -> dict:

    items = get_experiments()

    experiment = next(
        (
            item
            for item in items
            if item["id"] == experiment_id
        ),
        None,
    )

    if experiment is None:
        raise HTTPException(
            status_code=404,
            detail="Experiment not found.",
        )

    return experiment


@app.patch(
    "/api/experiments/{experiment_id}"
)
def experiment_update(
    experiment_id: str,
    payload: ExperimentUpdate,
) -> dict:

    items = get_experiments()

    experiment = next(
        (
            item
            for item in items
            if item["id"] == experiment_id
        ),
        None,
    )

    if experiment is None:
        raise HTTPException(
            status_code=404,
            detail="Experiment not found.",
        )

    changes = payload.model_dump(
        exclude_none=True
    )

    experiment.update(changes)

    experiment["updatedAt"] = now_iso()

    save_experiments(items)

    return experiment


@app.delete(
    "/api/experiments/{experiment_id}"
)
def experiment_delete(
    experiment_id: str,
) -> dict:

    items = get_experiments()

    filtered = [
        item
        for item in items
        if item["id"] != experiment_id
    ]

    if len(filtered) == len(items):
        raise HTTPException(
            status_code=404,
            detail="Experiment not found.",
        )

    save_experiments(filtered)

    return {
        "status": "deleted",
        "id": experiment_id,
    }


# ============================================================
# PRIVACY
# ============================================================

@app.get("/api/privacy")
def privacy() -> dict:
    settings = get_settings_data()

    return {
        "privacyMode": "team-level",
        "rawMessagesStored": False,
        "individualBurnoutScores": False,
        "individualRanking": False,
        "aggregationRequired": True,
        "minimumTeamSize": settings[
            "minimumTeamSize"
        ],
        "syntheticDemoData": True,
        "privacySuppressionEnabled": True,
    }


# ============================================================
# SETTINGS
# ============================================================

@app.get("/api/settings")
def settings_get() -> dict:
    return get_settings_data()


@app.put("/api/settings")
def settings_update(
    payload: dict,
) -> dict:

    current = get_settings_data()

    for key, value in payload.items():
        if key in DEFAULT_SETTINGS:
            current[key] = value

    write_json(
        SETTINGS_FILE,
        current,
    )

    return current


# ============================================================
# REPORTS
# ============================================================

@app.get("/api/reports/summary")
def reports_summary() -> dict:
    return {
        "teams": len(INITIAL_TEAMS),
        "signals": len(INITIAL_SIGNALS),
        "experiments": len(
            get_experiments()
        ),
        "primaryTeam": "Atlas",
        "primarySignal": (
            "Recovery disruption"
        ),
        "privacyMode": "Team-level",
        "synthetic": True,
    }


@app.post("/api/reports/generate")
def reports_generate(
    payload: dict | None = None,
) -> dict:

    del payload

    return {
        "generatedAt": now_iso(),
        "title": (
            "LUMEN Workplace "
            "Intelligence Report"
        ),
        "period": (
            "Current synthetic "
            "demonstration period"
        ),
        "summary": {
            "teams": len(INITIAL_TEAMS),
            "signals": len(INITIAL_SIGNALS),
            "experiments": len(
                get_experiments()
            ),
        },
        "primarySignal": INITIAL_SIGNALS[0],
        "causalAnalysis": estimate_effect(
            "atlas"
        ),
        "whatIf": simulate_counterfactual(
            "atlas",
            14.0,
        ),
        "experiments": get_experiments(),
        "privacy": privacy(),
        "limitations": [
            "Synthetic demonstration data",
            "Illustrative causal model",
            "Requires real-world validation",
            "Not a clinical assessment",
        ],
    }


@app.get(
    "/api/reports/export/json"
)
def reports_export_json() -> dict:
    return reports_generate()


@app.get(
    "/api/reports/export/csv"
)
def reports_export_csv() -> PlainTextResponse:

    items = get_experiments()

    buffer = io.StringIO()

    writer = csv.writer(buffer)

    writer.writerow(
        [
            "id",
            "name",
            "team",
            "status",
            "baseline",
            "target",
            "primaryOutcome",
            "progress",
        ]
    )

    for item in items:
        writer.writerow(
            [
                item.get("id", ""),
                item.get("name", ""),
                item.get("team", ""),
                item.get("status", ""),
                item.get("baseline", ""),
                item.get("target", ""),
                item.get(
                    "primaryOutcome",
                    "",
                ),
                item.get(
                    "progress",
                    0,
                ),
            ]
        )

    return PlainTextResponse(
        buffer.getvalue(),
        media_type="text/csv",
    )
# ============================================================
# INTEGRATIONS
# ============================================================

INTEGRATIONS_FILE = STORAGE_DIR / "integrations.json"

DEFAULT_INTEGRATIONS = {
    "slack": {
        "provider": "Slack",
        "status": "disconnected",
        "connectionMode": "oauth",
        "workspace": None,
        "connectedAt": None,
        "lastSyncAt": None,
        "teamCount": 0,
        "message": "Connect Slack to ingest privacy-preserving team telemetry.",
    },
    "microsoft_teams": {
        "provider": "Microsoft Teams",
        "status": "disconnected",
        "connectionMode": "oauth",
        "workspace": None,
        "connectedAt": None,
        "lastSyncAt": None,
        "teamCount": 0,
        "message": "Connect Microsoft Teams to ingest privacy-preserving team telemetry.",
    },
}


def get_integrations_data() -> dict:
    stored = read_json(INTEGRATIONS_FILE, {})

    result = {}

    for key, default in DEFAULT_INTEGRATIONS.items():
        result[key] = {
            **default,
            **stored.get(key, {}),
        }

    return result


def save_integrations_data(data: dict) -> None:
    write_json(INTEGRATIONS_FILE, data)


@app.get("/api/integrations")
def integrations() -> dict:
    data = get_integrations_data()

    return {
        "integrations": data,
        "privacyBoundary": {
            "rawMessagesStored": False,
            "individualBurnoutScores": False,
            "employeeRanking": False,
            "minimumTeamSize": get_settings_data().get(
                "minimumTeamSize",
                5,
            ),
            "aggregationRequired": True,
        },
    }


@app.post("/api/integrations/{provider}/disconnect")
def disconnect_integration(provider: str) -> dict:
    provider = provider.lower()

    if provider not in DEFAULT_INTEGRATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Unsupported integration: {provider}",
        )

    data = get_integrations_data()

    data[provider] = {
        **data[provider],
        "status": "disconnected",
        "workspace": None,
        "connectedAt": None,
        "lastSyncAt": None,
        "teamCount": 0,
    }

    save_integrations_data(data)

    return {
        "success": True,
        "integration": data[provider],
    }


@app.post("/api/integrations/{provider}/sync")
def sync_integration(provider: str) -> dict:
    provider = provider.lower()

    if provider not in DEFAULT_INTEGRATIONS:
        raise HTTPException(
            status_code=404,
            detail=f"Unsupported integration: {provider}",
        )

    data = get_integrations_data()

    if data[provider]["status"] != "connected":
        raise HTTPException(
            status_code=400,
            detail=f"{data[provider]['provider']} is not connected.",
        )

    return {
        "success": True,
        "provider": data[provider]["provider"],
        "status": "sync_pending",
        "message": (
            "Connector is ready for OAuth-backed ingestion. "
            "Raw message content is not part of the analytics pipeline."
        ),
    }
