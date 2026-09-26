from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd

# ============================================================
# LUMEN — SYNTHETIC TEAM DATA
# ============================================================

INITIAL_TEAMS = [
    {
        "id": "atlas",
        "name": "Atlas",
        "department": "Product Engineering",
        "members": 18,
        "communication": 72.0,
        "meetings": 64.0,
        "recovery": 58.0,
        "workload": 74.0,
        "after_hours": 31.0,
        "signal": "Recovery disruption",
        "severity": "Moderate",
    },
    {
        "id": "northstar",
        "name": "Northstar",
        "department": "Data & Intelligence",
        "members": 14,
        "communication": 81.0,
        "meetings": 71.0,
        "recovery": 54.0,
        "workload": 78.0,
        "after_hours": 36.0,
        "signal": "Communication burst",
        "severity": "Moderate",
    },
    {
        "id": "vector",
        "name": "Vector",
        "department": "Platform",
        "members": 22,
        "communication": 67.0,
        "meetings": 59.0,
        "recovery": 63.0,
        "workload": 69.0,
        "after_hours": 22.0,
        "signal": "Workload intensity",
        "severity": "Watch",
    },
    {
        "id": "orbit",
        "name": "Orbit",
        "department": "Design Systems",
        "members": 11,
        "communication": 51.0,
        "meetings": 43.0,
        "recovery": 76.0,
        "workload": 48.0,
        "after_hours": 12.0,
        "signal": "Stable",
        "severity": "Stable",
    },
    {
        "id": "meridian",
        "name": "Meridian",
        "department": "Customer Operations",
        "members": 26,
        "communication": 74.0,
        "meetings": 68.0,
        "recovery": 61.0,
        "workload": 72.0,
        "after_hours": 29.0,
        "signal": "Meeting concentration",
        "severity": "Watch",
    },
    {
        "id": "vertex",
        "name": "Vertex",
        "department": "Security",
        "members": 9,
        "communication": 46.0,
        "meetings": 38.0,
        "recovery": 82.0,
        "workload": 43.0,
        "after_hours": 9.0,
        "signal": "Stable",
        "severity": "Stable",
    },
    {
        "id": "harbor",
        "name": "Harbor",
        "department": "Operations",
        "members": 17,
        "communication": 59.0,
        "meetings": 52.0,
        "recovery": 69.0,
        "workload": 57.0,
        "after_hours": 17.0,
        "signal": "Recovery improving",
        "severity": "Stable",
    },
    {
        "id": "summit",
        "name": "Summit",
        "department": "Research",
        "members": 13,
        "communication": 63.0,
        "meetings": 48.0,
        "recovery": 71.0,
        "workload": 54.0,
        "after_hours": 15.0,
        "signal": "Focus disruption",
        "severity": "Watch",
    },
]


INITIAL_SIGNALS = [
    {
        "id": "SIG-104",
        "team": "Atlas",
        "team_id": "atlas",
        "type": "Recovery disruption",
        "metric": "Recovery",
        "value": -14.0,
        "severity": "Moderate",
    },
    {
        "id": "SIG-103",
        "team": "Northstar",
        "team_id": "northstar",
        "type": "After-hours communication",
        "metric": "Communication",
        "value": 31.0,
        "severity": "Moderate",
    },
    {
        "id": "SIG-102",
        "team": "Vector",
        "team_id": "vector",
        "type": "Workload intensity",
        "metric": "Workload",
        "value": 18.0,
        "severity": "Watch",
    },
    {
        "id": "SIG-101",
        "team": "Meridian",
        "team_id": "meridian",
        "type": "Meeting concentration",
        "metric": "Meetings",
        "value": 16.0,
        "severity": "Watch",
    },
]


# ============================================================
# SYNTHETIC CAUSAL DATASET
# ============================================================

def generate_synthetic_causal_dataset(
    n_samples: int = 320,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate reproducible synthetic workplace observations.

    Causal structure used by the demonstration:

        Workload ----------> Meeting Load
            |                    |
            |                    v
            +---------------> Recovery

        Project Pressure ----> Meeting Load
        Project Pressure ----> Recovery

    This is synthetic demonstration data only.
    """

    rng = np.random.default_rng(seed)

    team_ids = [
        team["id"]
        for team in INITIAL_TEAMS
    ]

    team_id = rng.choice(
        team_ids,
        size=n_samples,
    )

    workload = np.clip(
        rng.normal(68, 12, n_samples),
        20,
        100,
    )

    project_pressure = np.clip(
        rng.normal(58, 14, n_samples),
        10,
        100,
    )

    meeting_hours = np.clip(
        8.5
        + 0.075 * workload
        + 0.055 * project_pressure
        + rng.normal(0, 1.8, n_samples),
        6,
        26,
    )

    communication_volume = np.clip(
        25
        + 0.65 * workload
        + 0.20 * project_pressure
        + rng.normal(0, 10, n_samples),
        5,
        120,
    )

    after_hours_communication = np.clip(
        4
        + 0.22 * project_pressure
        + 0.12 * workload
        + rng.normal(0, 4, n_samples),
        0,
        100,
    )

    recovery = np.clip(
        97
        - 1.15 * meeting_hours
        - 0.24 * workload
        - 0.16 * project_pressure
        + rng.normal(0, 4.5, n_samples),
        0,
        100,
    )

    now = datetime.now(timezone.utc)

    timestamps = [
        now - timedelta(days=int(n_samples - index))
        for index in range(n_samples)
    ]

    return pd.DataFrame(
        {
            "team_id": team_id,
            "timestamp": timestamps,
            "meeting_hours": meeting_hours,
            "workload": workload,
            "project_pressure": project_pressure,
            "communication_volume": communication_volume,
            "after_hours_communication": after_hours_communication,
            "recovery": recovery,
        }
    )


# ============================================================
# TEAM TIME SERIES
# ============================================================

def generate_team_timeseries(
    team_id: str,
    days: int = 30,
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate a clean team-level time series for visualization.
    """

    team = next(
        (
            item
            for item in INITIAL_TEAMS
            if item["id"] == team_id
        ),
        None,
    )

    if team is None:
        raise ValueError(
            f"Unknown team: {team_id}"
        )

    rng = np.random.default_rng(
        seed + sum(ord(char) for char in team_id)
    )

    dates = pd.date_range(
        end=datetime.now(timezone.utc),
        periods=days,
        freq="D",
    )

    base_meetings = team["meetings"] / 3.5
    base_workload = team["workload"]
    base_recovery = team["recovery"]
    base_communication = team["communication"]

    meetings = np.clip(
        base_meetings
        + np.sin(np.linspace(0, 3.8, days)) * 1.8
        + rng.normal(0, 0.6, days),
        3,
        30,
    )

    workload = np.clip(
        base_workload
        + np.sin(np.linspace(0, 4.5, days)) * 5
        + rng.normal(0, 2.2, days),
        0,
        100,
    )

    communication = np.clip(
        base_communication
        + np.cos(np.linspace(0, 4, days)) * 6
        + rng.normal(0, 2.5, days),
        0,
        100,
    )

    recovery = np.clip(
        base_recovery
        - 0.7 * (meetings - base_meetings)
        - 0.12 * (workload - base_workload)
        + rng.normal(0, 1.8, days),
        0,
        100,
    )

    return pd.DataFrame(
        {
            "date": dates,
            "communication": np.round(
                communication,
                1,
            ),
            "meetings": np.round(
                meetings,
                1,
            ),
            "workload": np.round(
                workload,
                1,
            ),
            "recovery": np.round(
                recovery,
                1,
            ),
        }
    )


# ============================================================
# DATA ACCESS HELPERS
# ============================================================

def get_initial_teams() -> list[dict]:
    return [
        dict(team)
        for team in INITIAL_TEAMS
    ]


def get_initial_signals() -> list[dict]:
    return [
        dict(signal)
        for signal in INITIAL_SIGNALS
    ]


def get_team_by_id(
    team_id: str,
) -> dict | None:
    return next(
        (
            team
            for team in INITIAL_TEAMS
            if team["id"] == team_id
        ),
        None,
    )


def get_signal_by_id(
    signal_id: str,
) -> dict | None:
    normalized = signal_id.lower()

    return next(
        (
            signal
            for signal in INITIAL_SIGNALS
            if signal["id"].lower()
            == normalized
        ),
        None,
    )