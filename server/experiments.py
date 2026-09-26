import json
import os
from typing import Dict, List, Optional
from server.models import Experiment, ExperimentCreate, ExperimentUpdate

EXPERIMENTS_FILE = os.path.join(os.path.dirname(__file__), "data", "experiments.json")

INITIAL_EXPERIMENTS: List[Dict] = [
    {
        "id": "EXP-001",
        "name": "Meeting Load Reduction",
        "team": "Atlas",
        "hypothesis": "Reducing meeting load from 18.4h to 14.0h may improve team recovery capacity without impacting sprint delivery.",
        "treatment": "Weekly meeting hours",
        "intervention": "Cap recurring synchronous meetings to 14.0 hours per week and introduce asynchronous status updates.",
        "baseline": "18.4h",
        "target": "14.0h",
        "observation_window": "14 days remaining",
        "start_date": "2026-09-12",
        "end_date": "2026-10-10",
        "primary_outcome": "Recovery",
        "status": "Running",
        "progress": 68,
        "notes": "Atlas team transitioned sprint retrospective and daily check-ins to async threads. Early indicators show stabilized recovery.",
        "created_at": "2026-09-10",
    },
    {
        "id": "EXP-002",
        "name": "Focus Block Trial",
        "team": "Northstar",
        "hypothesis": "Protecting uninterrupted morning focus blocks reduces fragmented after-hours messaging.",
        "treatment": "Focus block reservation",
        "intervention": "Reserve 09:00 - 12:00 as meeting-free deep work blocks across all team calendars.",
        "baseline": "31%",
        "target": "20%",
        "observation_window": "Starts Monday",
        "start_date": "2026-09-29",
        "end_date": "2026-10-27",
        "primary_outcome": "Communication",
        "status": "Planned",
        "progress": 0,
        "notes": "Team charter signed. Calendar protection automation configured in workspace integration.",
        "created_at": "2026-09-22",
    },
    {
        "id": "EXP-003",
        "name": "Recovery Window Pilot",
        "team": "Vector",
        "hypothesis": "Restricting non-critical production alerts outside working hours accelerates weekend cognitive recovery.",
        "treatment": "Off-hours notification routing",
        "intervention": "Route non-P0 infrastructure notifications to morning queue rather than real-time mobile pinging.",
        "baseline": "22%",
        "target": "15%",
        "observation_window": "Completed 3 days ago",
        "start_date": "2026-08-15",
        "end_date": "2026-09-23",
        "primary_outcome": "Workload",
        "status": "Completed",
        "progress": 100,
        "notes": "Trial concluded successfully. Measured off-hours communication dropped 7 points; recovery index improved from 58% to 63%.",
        "created_at": "2026-08-12",
    },
]


def load_experiments() -> List[Dict]:
    if not os.path.exists(EXPERIMENTS_FILE):
        save_experiments(INITIAL_EXPERIMENTS)
        return INITIAL_EXPERIMENTS

    try:
        with open(EXPERIMENTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                return INITIAL_EXPERIMENTS
            return data
    except Exception:
        return INITIAL_EXPERIMENTS


def save_experiments(experiments: List[Dict]) -> None:
    os.makedirs(os.path.dirname(EXPERIMENTS_FILE), exist_ok=True)
    with open(EXPERIMENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(experiments, f, indent=2)


def get_all_experiments() -> List[Experiment]:
    data = load_experiments()
    return [Experiment(**item) for item in data]


def get_experiment_by_id(experiment_id: str) -> Optional[Experiment]:
    data = load_experiments()
    target = experiment_id.strip().upper()
    for item in data:
        if item["id"].upper() == target:
            return Experiment(**item)
    return None


def create_experiment(exp_in: ExperimentCreate) -> Experiment:
    data = load_experiments()
    # Compute next EXP-xxx ID
    max_num = 0
    for item in data:
        cid = item.get("id", "")
        if cid.startswith("EXP-"):
            try:
                num = int(cid.split("-")[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass

    new_id = f"EXP-{str(max_num + 1).zfill(3)}"

    new_exp = {
        "id": new_id,
        "name": exp_in.name,
        "team": exp_in.team,
        "hypothesis": exp_in.hypothesis,
        "treatment": exp_in.treatment,
        "intervention": exp_in.intervention,
        "baseline": exp_in.baseline,
        "target": exp_in.target,
        "observation_window": exp_in.observation_window,
        "start_date": "2026-09-26",
        "end_date": "2026-10-24",
        "primary_outcome": exp_in.primary_outcome,
        "status": "Planned",
        "progress": 0,
        "notes": exp_in.notes or "",
        "created_at": "2026-09-26",
    }

    data.insert(0, new_exp)
    save_experiments(data)
    return Experiment(**new_exp)


def update_experiment(experiment_id: str, exp_update: ExperimentUpdate) -> Optional[Experiment]:
    data = load_experiments()
    target = experiment_id.strip().upper()

    for idx, item in enumerate(data):
        if item["id"].upper() == target:
            update_data = exp_update.model_dump(exclude_unset=True)
            for k, v in update_data.items():
                if v is not None:
                    item[k] = v

            # Auto-progress if status changes
            if "status" in update_data:
                st = update_data["status"]
                if st == "Completed":
                    item["progress"] = 100
                elif st == "Draft":
                    item["progress"] = 0
                elif st == "Planned" and item["progress"] == 0:
                    item["progress"] = 0
                elif st == "Running" and item["progress"] == 0:
                    item["progress"] = 15

            data[idx] = item
            save_experiments(data)
            return Experiment(**item)

    return None


def delete_experiment(experiment_id: str) -> bool:
    data = load_experiments()
    target = experiment_id.strip().upper()
    initial_len = len(data)
    data = [item for item in data if item["id"].upper() != target]

    if len(data) < initial_len:
        save_experiments(data)
        return True
    return False
